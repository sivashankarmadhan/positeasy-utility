import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExtensionIcon from '@mui/icons-material/Extension';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  Box,
  Card,
  Checkbox,
  FormControl,
  Grid,
  List,
  ListItem,
  MenuItem,
  NativeSelect,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { filter, find, forEach, get, groupBy, isEmpty, lowerCase, map, some } from 'lodash';
import { useEffect, useState } from 'react';
import uuid from 'react-uuid';
import { useRecoilValue } from 'recoil';
import VegNonIcon from 'src/components/cart/VegNonIcon';
import { OrderTypeConstants, StatusConstants } from 'src/constants/AppConstants';
import { billingProducts } from 'src/global/recoilState';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import AddonBillingDialog from './AddonBillingDialog';
import DeleteCustomizationDialog from './DeleteCustomizationDialog';
import OverflowTruncate from './OverflowTruncate';
import ProductLoader from './ProductLoader';
import RepeatLastCustomizationDialog from './RepeatLastCustomizationDialog';
import PRODUCTS_API from 'src/services/products';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import S3ImageCaching from './S3ImageCaching';

export default function BillingProductList(props) {
  const theme = useTheme();
  const {
    item,
    addOrder,
    noStocks,
    setNoStocks,
    setaddOrder,
    isAddonMandatory,
    tableName,
    orderType,
    tableCategory,
  } = props;
  const [selectedProduct, setSelectedProduct] = useState(item);
  const allProductsWithUnits = useRecoilValue(billingProducts);
  const [openBillingAddonDialog, setOpenBillingAddonDialog] = useState(false);
  const [openAlreadyAddedAddonDialog, setOpenAlreadyAddedAddonDialog] = useState(false);
  const [addonListDialogData, setAddonListDialogData] = useState({});
  const [decrementOrderData, setDecrementOrderData] = useState([]);
  const [openDecrementDialog, setOpenDecrementDialog] = useState(false);
  const [incrementOrderData, setIncrementOrderData] = useState([]);
  const groupedIncrementData = groupBy(incrementOrderData, 'cartId');
  const [loading, setLoading] = useState(false);
  const [handleListClick, setHandleListClick] = useState(true);
  const isMobile = useMediaQuery('(max-width:600px)');
  const getPrice = (curr) => {
    if (!curr) return;
    const check = find(allProductsWithUnits, (e) => e.productId === curr);
    if (check) {
      const { withGstAmount, withoutGstAmount } = getTotalPriceAndGst({
        price: check?.offerPrice || check?.price,
        GSTPercent: check?.GSTPercent,
        GSTInc: check?.GSTInc,
        fullData: check,
        orderType,
      });
      return check.GSTPercent > 0 ? withGstAmount : withoutGstAmount;
    }
  };
  const getOrderDetailsById = (curr) => {
    const data = filter(addOrder, (e) => e.productId === curr);
    let orderLength = data.length;
    let withAddon = [];
    let withoutAddon = [];
    let quantity = 0;
    let totalPrice = 0;
    if (orderLength > 0) {
      forEach(data, (e) => {
        quantity += e.quantity;
        if (isEmpty(e.addOn)) {
          totalPrice += getPrice(e.productId) * e.quantity;
          withoutAddon.push(e);
        } else if (!isEmpty(e.addOn)) {
          let totalAddonPrice = 0;
          forEach(e.addOn, (d) => {
            totalAddonPrice += ((d.price * d.GSTPercent) / 100 + d.price) * d.quantity;
          });
          totalPrice +=
            getTotalPriceAndGst({
              price: e.price,
              GSTPercent: e.GSTPercent,
              GSTInc: e?.GSTInc,
              fullData: e,
              orderType,
            })?.withGstAmount * e.quantity;
          withAddon.push(e);
        }
      });
    }
    return {
      orderLength,
      withoutAddon,
      withAddon,
      data,
      quantity,
      totalPrice,
      productId: curr,
    };
  };
  const handleOpenNewCustomization = (e) => {
    try {
      const product = find(allProductsWithUnits, (d) => d.productId === e.productId);
      setAddonListDialogData({
        addOnData: get(product, 'addOn'),
        productData: { ...product, productAddons: get(product, 'addOn') },
      });
      setOpenAlreadyAddedAddonDialog(false);
      setOpenBillingAddonDialog(true);
    } catch (err) {
      console.log(err);
    }
  };

  const getUnits = (e) => {
    const units = filter(
      allProductsWithUnits,
      (d) =>
        get(d, 'shortCode') === get(e, 'shortCode') && get(d, 'status') === StatusConstants.ACTIVE
    );
    return units;
  };

  const getAddonByProductId = (e) => {
    const product = find(allProductsWithUnits, (d) => d.productId === e);
    return get(product, 'addOn', []);
  };

  const isOrdered = (curr) => {
    if (!curr) return;
    const check = some(addOrder, (e) => e.productId === curr);
    return check;
  };

  const isOrderedWithAddon = (curr) => {
    if (!curr) return;
    let result = false;
    const check = filter(addOrder, (e) => e.productId === curr);
    if (isEmpty(check)) result = false;
    forEach(check, (d) => {
      if (!isEmpty(d.addOn)) result = true;
    });
    return result;
  };

  const getOrdered = (curr) => {
    if (!curr) return;
    const check = find(addOrder, (e) => e.productId === curr);
    return check;
  };
  const getAvailabileStock = (curr) => {
    let availability = true;
    const orderData = getOrderDetailsById(curr);
    const productData = find(allProductsWithUnits, (e) => e.productId === curr);

    if (get(productData, 'stockMonitor')) {
      if (get(productData, 'stockQuantity') <= get(orderData, 'quantity')) availability = false;
    } else availability = true;
    return availability;
  };

  const isStockAvailable = (curr) => {
    if (isEmpty(noStocks)) return true;
    const findedData = find(noStocks, (e) => e.productId === curr.productId);
    if (!isEmpty(findedData) && get(findedData, 'quantity') <= -1) return false;
    if (isEmpty(findedData)) return true;
  };

  const handleUnitsChange = (e) => {
    e.stopPropagation();
    const data = find(allProductsWithUnits, (d) => get(d, 'productId') === e.target.value);
    setSelectedProduct(data);
  };

  const handleAddonNewOrder = (e) => {
    try {
      setLoading(true);
      const data = some(addOrder, (d) => d.productId === e.productId);
      if (data) {
        setaddOrder((prevState) => {
          const newData = filter(prevState, (d) => d.productId !== e.productId);
          return [...newData];
        });
      } else {
        const addon = getAddonByProductId(e.productId);
        if (addon?.length > 0 && isAddonMandatory) {
          setAddonListDialogData({
            addOnData: addon,
            productData: { ...e, productAddons: addon },
          });
          setOpenBillingAddonDialog(true);
        } else {
          handleAddOrder({ ...e, productAddons: addon });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddOrder = (e) => {
    const currentTimestamp = new Date().getTime();
    const cartId = `${uuid()}:${currentTimestamp}`;
    setaddOrder((prevState) => {
      return [
        ...prevState,
        {
          ...e,
          cartId: cartId,
          quantity: 1,
          addOn: e.addOn && isAddonMandatory ? e.addOn : [],
          productAddons: get(e, 'productAddons', []),
        },
      ];
    });
  };

  const handleDeleteByCartId = (e) => {
    setaddOrder((prevState) => {
      const newData = filter(prevState, (d) => e !== d.cartId);
      return [...newData];
    });
    setDecrementOrderData([]);
    setOpenDecrementDialog(false);
  };
  const handleCloseDeleteCustomization = () => {
    setOpenDecrementDialog(false);
    setDecrementOrderData([]);
  };
  const handleAddonDecision = (e) => {
    const data = getOrderDetailsById(get(e, 'productData.productId'));
    if (data.orderLength === 0) {
      if (isEmpty(e.selectedAddOn)) handleAddOrder({ ...e.productData, addOn: [] });
      if (!isEmpty(e.selectedAddOn))
        handleAddOrder({ ...e.productData, addOn: get(e, 'selectedAddOn') });
    }

    if (data.orderLength > 0) {
      if (isEmpty(e.selectedAddOn)) {
        if (data.withoutAddon.length === 0) handleAddOrder({ ...e.productData, addOn: [] });
        else
          handleIncrementOrder({
            ...e.productData,
            addOn: [],
            cartId: data.withoutAddon[0].cartId,
          });
      }

      if (!isEmpty(e.selectedAddOn))
        handleAddOrder({ ...e.productData, addOn: get(e, 'selectedAddOn') });
    }
    setAddonListDialogData({});
    setIncrementOrderData([]);
  };

  const handleIncrementOrder = (e) => {
    setaddOrder((prevState) => {
      const newData = filter(prevState, (d) => e.cartId !== d.cartId);
      const data = getOrderDetailsById(get(e, 'productId'));
      const findData = find(get(data, 'withAddon'), (f) => f.cartId === e.cartId);
      return [
        ...newData,
        {
          ...e,
          quantity: isEmpty(e.addOn)
            ? (!isAddonMandatory && !isEmpty(data.withAddon)
                ? data.withAddon[0].quantity
                : data.withoutAddon[0].quantity) + 1
            : findData.quantity
            ? findData.quantity + 1
            : e.quantity + 1,
          addOn: e.addOn ? e.addOn : [],
        },
      ];
    });
  };

  const handleDecrementOrder = (e) => {
    setaddOrder((prevState) => {
      const newData = filter(prevState, (d) => e.cartId !== d.cartId);
      const data = getOrderDetailsById(get(e, 'productId'));
      const findData = find(get(data, 'withAddon'), (f) => f.cartId === e.cartId);
      return (data.quantity ? data.quantity : e.quantity) > 1
        ? [
            ...newData,
            {
              ...e,
              quantity: isEmpty(e.addOn)
                ? (!isAddonMandatory && !isEmpty(data.withAddon)
                    ? data.withAddon[0].quantity
                    : data.withoutAddon[0].quantity) - 1
                : findData.quantity
                ? findData.quantity - 1
                : e.quantity + 1,
              addOn: e.addOn ? e.addOn : [],
            },
          ]
        : [...newData];
    });

    if (!isEmpty(noStocks)) {
      setNoStocks((prevState) => {
        const currentData = find(prevState, (d) => e.productId === d.productId);
        const newData = filter(prevState, (d) => e.productId !== d.productId);
        if (isEmpty(currentData)) return [...newData];
        return currentData.quantity < -1
          ? [
              ...newData,
              {
                ...currentData,
                quantity: currentData.quantity + 1,
              },
            ]
          : [...newData];
      });
    }
  };

  const handleAddonIncrement = async (e) => {
    try {
      const data = getOrderDetailsById(get(e, 'productId'));
      const addon = getAddonByProductId(e.productId);
      if (data.orderLength > 0 && addon.length > 0 && isAddonMandatory) {
        if (isEmpty(data.withAddon)) {
          setAddonListDialogData({
            addOnData: addon,
            productData: { ...e, productAddons: addon },
          });
          setOpenBillingAddonDialog(true);
        } else {
          setIncrementOrderData(data.withAddon);
          setOpenAlreadyAddedAddonDialog(true);
        }
      } else if (!isEmpty(addon) && isAddonMandatory) {
        handleOpenNewCustomization(e);
      } else if (!isEmpty(addon) && !isAddonMandatory && !isEmpty(data.withAddon)) {
        handleIncrementOrder({
          ...e,
          addOn: [],
          cartId: data.withAddon[0].cartId,
          productAddons: addon,
        });
      } else {
        handleIncrementOrder({
          ...e,
          addOn: [],
          cartId: data.withoutAddon[0].cartId,
          productAddons: addon,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDecrement = (e) => {
    const data = getOrderDetailsById(get(e, 'productId'));
    if (data.withAddon.length > 0) {
      setDecrementOrderData([...data.withAddon, ...data.withoutAddon]);
      setOpenDecrementDialog(true);
    } else {
      handleDecrementOrder(
        !isAddonMandatory && !isEmpty(data.withAddon) ? data.withAddon[0] : data.withoutAddon[0]
      );
    }
  };
  if (loading) return <ProductLoader width={50} />;
  return (
    <div>
      {isMobile ? (
        <Card
          sx={{
            cursor:
              selectedProduct.stockMonitor && selectedProduct.stockQuantity <= 0
                ? 'not-allowed'
                : 'pointer',
            borderRadius: 2,
            p: 1,
            border: 1.5,
            borderColor: isOrdered(selectedProduct.productId)
              ? isStockAvailable(selectedProduct)
                ? theme.palette.success.dark
                : theme.palette.error.main
              : '#fff',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            rowGap: 1,
            justifyContent: 'space-between',
            minHeight: '100px',
          }}
          key={selectedProduct.productId}
          onClick={(event) => {
            if (handleListClick) {
              if (selectedProduct.stockMonitor && selectedProduct.stockQuantity <= 0) return;
              event.stopPropagation();
              handleAddonNewOrder(selectedProduct);
            }
          }}
        >
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              overflow: 'hidden',
              mt: '10px',
            }}
          >
            <Stack>
              {!isEmpty(get(selectedProduct, 'attributes')) && (
                <VegNonIcon text={get(selectedProduct, 'attributes.isVeg')} />
              )}
            </Stack>
            <div>
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  // minWidth: 200,
                  fontWeight: 'bold',
                }}
              >
                {isOrdered(selectedProduct.productId) && (
                  <div
                    style={{
                      position: 'absolute',
                      right: -3,
                      top: -12,
                      backgroundColor: theme.palette.common.white,
                      display: 'flex',
                      borderRadius: 20,
                    }}
                  >
                    <CheckCircleIcon
                      sx={{
                        color: theme.palette.success.dark,
                        fontSize: '25px',
                      }}
                    />
                  </div>
                )}

                {selectedProduct.tag && (
                  <Typography
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      backgroundColor: theme.palette.error.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderTopLeftRadius: 12,
                      borderBottomRightRadius: 7,
                      fontSize: '10px',
                      px: 1.5,
                      pr: 1,
                    }}
                  >
                    {selectedProduct.tag}
                  </Typography>
                )}

                {selectedProduct.stockMonitor && selectedProduct.stockQuantity <= 0 && (
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: theme.palette.error.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderRadius: 10,
                      fontSize: '12px',
                      py: 1,
                      px: 2,
                      zIndex: 10,
                      textAlign: 'center',
                      width: '6.5rem',
                    }}
                  >
                    SOLD OUT
                  </Typography>
                )}
                {selectedProduct.stockMonitor && selectedProduct.stockQuantity < 5 && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      backgroundColor: theme.palette.info.main,
                      color: theme.palette.common.white,
                      borderBottomRightRadius: 13,
                      fontWeight: 'bold',
                      fontSize: '9px',
                      px: 0.5,
                      pr: 1,
                    }}
                  >
                    Hurry, Only {selectedProduct.stockQuantity} left
                  </Typography>
                )}
                {!isEmpty(selectedProduct.addOn) && isAddonMandatory && (
                  <div
                    style={{
                      position: 'absolute',
                      left: -2,
                      bottom: -3,
                      display: 'flex',
                    }}
                  >
                    <Tooltip title="AddOn">
                      <ExtensionIcon
                        sx={{
                          color: isOrderedWithAddon(selectedProduct.productId)
                            ? theme.palette.success.dark
                            : theme.palette.grey[500],
                          fontSize: '22px',
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
              </Stack>
            </div>
            <Stack>
              {/* name and units */}
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack
                  flexDirection={'row'}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    top: 10,
                  }}
                >
                  <Checkbox checked={isOrdered(selectedProduct.productId)} />

                  <Tooltip title={selectedProduct.name}>
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        textAlign: 'left',
                        fontSize: '13px',
                        ml: 0.5,
                        mr: 0.5,
                        mt: 1,
                        mb: 1,
                        width: '100%',
                        overflowWrap: 'break-word',
                      }}
                    >
                      <OverflowTruncate name={selectedProduct.name} />
                    </Typography>
                  </Tooltip>
                  <Stack
                    flexDirection={'row'}
                    sx={{
                      display: 'flex',
                      visibility: get(selectedProduct, 'unitsEnabled', false)
                        ? 'visible'
                        : 'hidden ',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'left', minWidth: 100 }}>
                      <Select
                        style={{ height: '16px', fontSize: '12px', borderRadius: 5 }}
                        defaultValue={get(selectedProduct, 'productId')}
                        value={get(selectedProduct, 'productId')}
                        autoWidth
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleUnitsChange}
                      >
                        {map(getUnits(selectedProduct), (e) => (
                          <MenuItem
                            sx={{ fontSize: '13px' }}
                            key={get(e, 'productId')}
                            value={get(e, 'productId')}
                          >
                            {get(e, 'unit')} {e.unitName}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Stack>
                </Stack>
              </Stack>
              <Stack flexDirection={'row'}>
                <Stack
                  sx={{
                    ml: '45px',
                    minWidth: 100,
                  }}
                >
                  {isOrdered(selectedProduct.productId) && (
                    <Stack
                      direction={'row'}
                      sx={{
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'space-between',
                        left: 4,
                        top: -1,
                      }}
                    >
                      <Stack
                        sx={{
                          backgroundColor: '#F4F5F6',
                          borderRadius: 2,
                          width: 25,
                          height: 25,
                          ...(getOrdered(selectedProduct.productId).quantity === 1
                            ? { backgroundColor: theme.palette.error.main, color: 'white' }
                            : {}),
                        }}
                        justifyContent="center"
                        alignItems="center"
                      >
                        {getOrdered(selectedProduct.productId).quantity > 1 ? (
                          <RemoveIcon
                            sx={{
                              color: theme.palette.error.main,
                              fontSize: '14px',
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDecrement(selectedProduct);
                            }}
                          />
                        ) : (
                          <DeleteOutlineIcon
                            sx={{
                              fontSize: '14px',
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDecrement(selectedProduct);
                            }}
                          />
                        )}
                      </Stack>

                      <Typography
                        sx={{
                          width: 20,
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px',
                        }}
                      >
                        {getOrderDetailsById(selectedProduct.productId).quantity}
                      </Typography>
                      <Stack
                        sx={{
                          backgroundColor: '#F4F5F6',
                          borderRadius: 2,
                          width: 25,
                          height: 25,
                        }}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <AddIcon
                          sx={
                            getAvailabileStock(selectedProduct.productId)
                              ? {
                                  color: theme.palette.success.dark,
                                  fontSize: '14px',
                                  '&:hover': { color: theme.palette.success.dark },
                                }
                              : {
                                  color: 'grey',
                                  fontSize: '14px',
                                  cursor: 'not-allowed',
                                }
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            const isAvailable = getAvailabileStock(selectedProduct.productId);
                            if (isAvailable) handleAddonIncrement(selectedProduct);
                            return;
                          }}
                        />
                      </Stack>
                    </Stack>
                  )}
                </Stack>
                <Stack
                  sx={{
                    margin: '0 100px',
                    display: 'flex',
                    justifyContent: 'right',
                    minWidth: 100,
                    mr: '1px',
                  }}
                >
                  <Stack
                    flexDirection={'row'}
                    sx={{
                      display: isOrdered(selectedProduct.productId) ? 'none' : 'flex',
                      alignItems: 'center',
                      bottom: 10,
                    }}
                  >
                    <Typography
                      sx={{
                        color: theme.palette.primary.main,
                        display:
                          isOrdered(selectedProduct.productId) && selectedProduct.offerPrice
                            ? 'none'
                            : 'inherit',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        ml: 0.5,
                        mr: 1,
                        bottom: -16,
                        whiteSpace: 'nowrap',
                        fontSize:
                          selectedProduct.offerPrice !== selectedProduct.price &&
                          selectedProduct.offerPrice > 0 &&
                          typeof selectedProduct.offerPrice !== 'object'
                            ? '12px'
                            : isOrdered(selectedProduct.productId)
                            ? '12px'
                            : '14px',
                        textDecorationLine:
                          selectedProduct.offerPrice !== selectedProduct.price &&
                          selectedProduct.offerPrice > 0 &&
                          typeof selectedProduct.offerPrice !== 'object'
                            ? 'line-through'
                            : '',
                        opacity:
                          selectedProduct.offerPrice !== selectedProduct.price &&
                          selectedProduct.offerPrice > 0 &&
                          typeof selectedProduct.offerPrice !== 'object'
                            ? 0.6
                            : 1,
                      }}
                    >
                      {fCurrency(selectedProduct.price)}
                    </Typography>

                    {selectedProduct.offerPrice !== selectedProduct.price &&
                      selectedProduct.offerPrice > 0 &&
                      typeof selectedProduct.offerPrice !== 'object' && (
                        <Typography
                          sx={{
                            color: theme.palette.primary.main,
                            fontWeight: 'bold',
                            pl: 1,
                            whiteSpace: 'nowrap',
                            fontSize: isOrdered(selectedProduct.productId) ? '14px' : '14px',
                          }}
                        >
                          {fCurrency(selectedProduct.offerPrice)}
                        </Typography>
                      )}
                    {!!selectedProduct?.GSTPercent && (
                      <Typography
                        sx={{
                          fontSize: '8px',
                          mt: !selectedProduct?.offerPrice ? 0.8 : 0,
                          fontWeight: 'bold',
                          color: theme.palette.primary.main,
                        }}
                      >
                        &nbsp;
                        {!get(selectedProduct, 'GSTInc')
                          ? ` + ( ₹ ${toFixedIfNecessary(
                              getTotalPriceAndGst({
                                price:
                                  get(selectedProduct, 'offerPrice') ||
                                  get(selectedProduct, 'price'),
                                GSTPercent: get(selectedProduct, 'GSTPercent'),
                                GSTInc: get(selectedProduct, 'GSTInc'),
                                fullData: selectedProduct,
                                orderType,
                              })?.gstPercentageValue,
                              2
                            )} GST) `
                          : ' (inc GST) '}
                      </Typography>
                    )}
                  </Stack>
                  <Typography
                    sx={{
                      display: isOrdered(selectedProduct.productId) ? 'block' : 'none',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: theme.palette.primary.main,
                      whiteSpace: 'nowrap',
                      justifyContent: 'left',
                      alignItems: 'left',
                    }}
                  >
                    {fCurrency(getOrderDetailsById(selectedProduct.productId).totalPrice)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      ) : (
        <Card
          sx={{
            cursor:
              selectedProduct.stockMonitor && selectedProduct.stockQuantity <= 0
                ? 'not-allowed'
                : 'pointer',
            borderRadius: 2,
            p: 1,
            border: 1.5,
            borderColor: isOrdered(selectedProduct.productId)
              ? isStockAvailable(selectedProduct)
                ? theme.palette.success.dark
                : theme.palette.error.main
              : '#fff',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            rowGap: 1,
            justifyContent: 'space-between',
          }}
          key={selectedProduct.productId}
          onClick={(event) => {
            if (handleListClick) {
              if (selectedProduct.stockMonitor && selectedProduct.stockQuantity <= 0) return;
              event.stopPropagation();
              handleAddonNewOrder(selectedProduct);
            }
          }}
        >
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              overflow: 'hidden',
            }}
          >
            <Checkbox checked={isOrdered(selectedProduct.productId)} />
            <Stack sx={{ width: '50%' }}>
              <S3ImageCaching
                style={{
                  borderRadius: 4,
                  objectFit: 'cover',
                  height: selectedProduct.productImage ? 40 : 40,
                  width: selectedProduct.productImage ? '100%' : 40,
                  filter:
                    selectedProduct.stockMonitor && selectedProduct.stockQuantity <= 0
                      ? 'blur(4px)'
                      : '',
                }}
                src={selectedProduct.productImage}
              />
            </Stack>

            <Tooltip title={selectedProduct.name}>
              <Typography
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  fontSize: '13px',
                  ml: 1,
                  mr: 0.5,
                  mt: 1,
                  mb: 1,
                  width: '100%',
                  overflowWrap: 'break-word',
                }}
              >
                <OverflowTruncate name={selectedProduct.name} />
              </Typography>
            </Tooltip>

            <Stack>
              {!isEmpty(get(selectedProduct, 'attributes')) && (
                <VegNonIcon text={get(selectedProduct, 'attributes.isVeg')} />
              )}
            </Stack>
            <div>
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  // minWidth: 200,
                  fontWeight: 'bold',
                }}
              >
                {isOrdered(selectedProduct.productId) && (
                  <div
                    style={{
                      position: 'absolute',
                      right: -3,
                      top: -12,
                      backgroundColor: theme.palette.common.white,
                      display: 'flex',
                      borderRadius: 20,
                    }}
                  >
                    <CheckCircleIcon
                      sx={{
                        color: theme.palette.success.dark,
                        fontSize: '25px',
                      }}
                    />
                  </div>
                )}

                {selectedProduct.tag && (
                  <Typography
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      backgroundColor: theme.palette.error.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderTopLeftRadius: 12,
                      borderBottomRightRadius: 7,
                      fontSize: '10px',
                      px: 1.5,
                      pr: 1,
                    }}
                  >
                    {selectedProduct.tag}
                  </Typography>
                )}

                {selectedProduct.stockMonitor && selectedProduct.stockQuantity <= 0 && (
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: theme.palette.error.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderRadius: 10,
                      fontSize: '12px',
                      py: 1,
                      px: 2,
                      zIndex: 10,
                      textAlign: 'center',
                      width: '6.5rem',
                    }}
                  >
                    SOLD OUT
                  </Typography>
                )}
                {selectedProduct.stockMonitor && selectedProduct.stockQuantity < 5 && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      backgroundColor: theme.palette.info.main,
                      color: theme.palette.common.white,
                      borderBottomRightRadius: 13,
                      fontWeight: 'bold',
                      fontSize: '9px',
                      px: 0.5,
                      pr: 1,
                    }}
                  >
                    Hurry, Only {selectedProduct.stockQuantity} left
                  </Typography>
                )}
                {!isEmpty(selectedProduct.addOn) && isAddonMandatory && (
                  <div
                    style={{
                      position: 'absolute',
                      left: -2,
                      bottom: -3,
                      display: 'flex',
                    }}
                  >
                    <Tooltip title="AddOn">
                      <ExtensionIcon
                        sx={{
                          color: isOrderedWithAddon(selectedProduct.productId)
                            ? theme.palette.success.dark
                            : theme.palette.grey[500],
                          fontSize: '22px',
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
              </Stack>
            </div>

            <Stack
              sx={{
                display: 'flex',
                visibility: get(selectedProduct, 'unitsEnabled', false) ? 'visible' : 'hidden ',
                justifyContent: 'right',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'left', minWidth: 100 }}>
                <Select
                  style={{ height: '16px', fontSize: '12px', borderRadius: 5 }}
                  defaultValue={get(selectedProduct, 'productId')}
                  value={get(selectedProduct, 'productId')}
                  autoWidth
                  onClick={(e) => e.stopPropagation()}
                  onChange={handleUnitsChange}
                >
                  {map(getUnits(selectedProduct), (e) => (
                    <MenuItem
                      sx={{ fontSize: '13px' }}
                      key={get(e, 'productId')}
                      value={get(e, 'productId')}
                    >
                      {get(e, 'unit')} {e.unitName}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </Stack>

            <Stack
              sx={{
                left: 10,
                minWidth: 100,
              }}
            >
              {isOrdered(selectedProduct.productId) && (
                <Stack
                  direction={'row'}
                  sx={{
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'space-between',
                    left: 4,
                    top: -1,
                  }}
                >
                  <Stack
                    sx={{
                      backgroundColor: '#F4F5F6',
                      borderRadius: 2,
                      width: 25,
                      height: 25,
                      ...(getOrdered(selectedProduct.productId).quantity === 1
                        ? { backgroundColor: theme.palette.error.main, color: 'white' }
                        : {}),
                    }}
                    justifyContent="center"
                    alignItems="center"
                  >
                    {getOrdered(selectedProduct.productId).quantity > 1 ? (
                      <RemoveIcon
                        sx={{
                          color: theme.palette.error.main,
                          fontSize: '14px',
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDecrement(selectedProduct);
                        }}
                      />
                    ) : (
                      <DeleteOutlineIcon
                        sx={{
                          fontSize: '14px',
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDecrement(selectedProduct);
                        }}
                      />
                    )}
                  </Stack>

                  <Typography
                    sx={{ width: 20, textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}
                  >
                    {getOrderDetailsById(selectedProduct.productId).quantity}
                  </Typography>
                  <Stack
                    sx={{
                      backgroundColor: '#F4F5F6',
                      borderRadius: 2,
                      width: 25,
                      height: 25,
                    }}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <AddIcon
                      sx={
                        getAvailabileStock(selectedProduct.productId)
                          ? {
                              color: theme.palette.success.dark,
                              fontSize: '14px',
                              '&:hover': { color: theme.palette.success.dark },
                            }
                          : {
                              color: 'grey',
                              fontSize: '14px',
                              cursor: 'not-allowed',
                            }
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        const isAvailable = getAvailabileStock(selectedProduct.productId);
                        if (isAvailable) handleAddonIncrement(selectedProduct);
                        return;
                      }}
                    />
                  </Stack>
                </Stack>
              )}
            </Stack>

            <div
              style={{ margin: '0 100px', display: 'flex', justifyContent: 'left', minWidth: 100 }}
            >
              <Stack flexDirection="column" alignItems="right">
                <Stack
                  flexDirection={'row'}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Stack
                    flexDirection={'row'}
                    sx={{
                      display: isOrdered(selectedProduct.productId) ? 'none' : 'flex',
                      alignItems: 'right',
                      bottom: 10,
                    }}
                  >
                    <Typography
                      sx={{
                        color: theme.palette.primary.main,
                        display:
                          isOrdered(selectedProduct.productId) && selectedProduct.offerPrice
                            ? 'none'
                            : 'inherit',
                        fontWeight: 'bold',
                        textAlign: 'right',
                        bottom: -16,
                        whiteSpace: 'nowrap',
                        fontSize:
                          selectedProduct.offerPrice !== selectedProduct.price &&
                          selectedProduct.offerPrice > 0 &&
                          typeof selectedProduct.offerPrice !== 'object'
                            ? '12px'
                            : isOrdered(selectedProduct.productId)
                            ? '12px'
                            : '12px',
                        textDecorationLine:
                          selectedProduct.offerPrice !== selectedProduct.price &&
                          selectedProduct.offerPrice > 0 &&
                          typeof selectedProduct.offerPrice !== 'object'
                            ? 'line-through'
                            : '',
                        opacity:
                          selectedProduct.offerPrice !== selectedProduct.price &&
                          selectedProduct.offerPrice > 0 &&
                          typeof selectedProduct.offerPrice !== 'object'
                            ? 0.6
                            : 1,
                      }}
                    >
                      {fCurrency(selectedProduct.price)}
                    </Typography>

                    {selectedProduct.offerPrice !== selectedProduct.price &&
                      selectedProduct.offerPrice > 0 &&
                      typeof selectedProduct.offerPrice !== 'object' && (
                        <Typography
                          sx={{
                            color: theme.palette.primary.main,
                            fontWeight: 'bold',
                            pl: 1,
                            whiteSpace: 'nowrap',
                            fontSize: isOrdered(selectedProduct.productId) ? '10px' : '12px',
                          }}
                        >
                          {fCurrency(selectedProduct.offerPrice)}
                        </Typography>
                      )}

                    {!!selectedProduct?.GSTPercent && (
                      <Typography
                        sx={{
                          width: '5rem',
                          fontSize: '8px',
                          mt: 0.8,
                          fontWeight: 'bold',
                          color: theme.palette.primary.main,
                        }}
                      >
                        &nbsp;
                        {!get(selectedProduct, 'GSTInc')
                          ? ` + ( ₹ ${toFixedIfNecessary(
                              getTotalPriceAndGst({
                                price:
                                  get(selectedProduct, 'offerPrice') ||
                                  get(selectedProduct, 'price'),
                                GSTPercent: get(selectedProduct, 'GSTPercent'),
                                GSTInc: get(selectedProduct, 'GSTInc'),
                                fullData: selectedProduct,
                                orderType,
                              })?.gstPercentageValue,
                              2
                            )} GST) `
                          : ' (inc GST) '}
                      </Typography>
                    )}
                  </Stack>
                </Stack>

                <Typography
                  sx={{
                    display: isOrdered(selectedProduct.productId) ? 'block' : 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: theme.palette.primary.main,
                    whiteSpace: 'nowrap',
                    justifyContent: 'left',
                    alignItems: 'left',
                  }}
                >
                  {fCurrency(getOrderDetailsById(selectedProduct.productId).totalPrice)}
                </Typography>
              </Stack>
            </div>
          </Stack>
        </Card>
      )}
      {!isEmpty(addonListDialogData) && (
        <AddonBillingDialog
          handleClose={handleAddonDecision}
          open={openBillingAddonDialog}
          data={addonListDialogData}
        />
      )}

      <RepeatLastCustomizationDialog
        open={openAlreadyAddedAddonDialog}
        incrementOrderData={incrementOrderData}
        groupedIncrementData={groupedIncrementData}
        handleIncrementOrder={handleIncrementOrder}
        setOpenAlreadyAddedAddonDialog={setOpenAlreadyAddedAddonDialog}
        handleOpenNewCustomization={handleOpenNewCustomization}
      />
      <DeleteCustomizationDialog
        decrementOrderData={decrementOrderData}
        handleDeleteByCartId={handleDeleteByCartId}
        open={openDecrementDialog}
        handleClose={handleCloseDeleteCustomization}
      />
    </div>
  );
}
