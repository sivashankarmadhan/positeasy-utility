import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExtensionIcon from '@mui/icons-material/Extension';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  Box,
  Card,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { filter, find, forEach, get, groupBy, isEmpty, map, some } from 'lodash';
import { useEffect, useState } from 'react';
import uuid from 'react-uuid';
import { useRecoilValue } from 'recoil';
import VegNonIcon from 'src/components/cart/VegNonIcon';
import { StatusConstants } from 'src/constants/AppConstants';
import { billingProducts } from 'src/global/recoilState';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import AddonBillingDialog from './AddonBillingDialog';
import DeleteCustomizationDialog from './DeleteCustomizationDialog';
import OverflowTruncate from './OverflowTruncate';
import ProductLoader from './ProductLoader';
import RepeatLastCustomizationDialog from './RepeatLastCustomizationDialog';
import S3ImageCaching from './S3ImageCaching';
import PRODUCTS_API from 'src/services/products';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
export default function BillingProductSmallGrid(props) {
  const theme = useTheme();
  const {
    item,
    addOrder,
    noStocks,
    setNoStocks,
    setaddOrder,
    isAddonMandatory,
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
  const [handleGridClick, setHandleGridClick] = useState(true);
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
            totalAddonPrice +=
              getTotalPriceAndGst({
                price: d.price,
                GSTPercent: d.GSTPercent,
                GSTInc: d?.GSTInc,
                fullData: d,
                orderType,
              })?.withGstAmount * d.quantity;
          });
          totalPrice += (getPrice(e.productId) + totalAddonPrice) * e.quantity;
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

  const maxChars = 10; // Set the maximum number of characters before truncation

  let truncatedText = get(selectedProduct, 'name');

  if (get(selectedProduct, 'name').length > maxChars) {
    truncatedText = get(selectedProduct, 'name')?.slice(0, maxChars) + '...';
  }
  return (
    <div>
      <Paper
        sx={{
          cursor:
            selectedProduct.stockMonitor && selectedProduct.stockQuantity <= 0
              ? 'not-allowed'
              : 'pointer',
          borderRadius: 1,
          p: 1.5,
          border: 1,
          borderColor: isOrdered(selectedProduct.productId)
            ? isStockAvailable(selectedProduct)
              ? theme.palette.success.dark
              : theme.palette.error.main
            : '#fff',
          overflow: 'visible',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          minHeight: 115,
        }}
        onClick={(event) => {
          if (handleGridClick) {
            if (selectedProduct.stockMonitor && selectedProduct.stockQuantity <= 0) return;
            event.stopPropagation();
            handleAddonNewOrder(selectedProduct);
          }
        }}
      >
        <Stack flexDirection={'column'} sx={{ width: '100%', height: 50 }}>
          {isOrdered(selectedProduct.productId) && (
            <div
              style={{
                position: 'absolute',
                right: -10,
                top: -10,
                backgroundColor: theme.palette.common.white,
                display: 'flex',
                borderRadius: 20,
              }}
            >
              <CheckCircleIcon
                sx={{
                  color: theme.palette.success.dark,
                  fontSize: '20px',
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
                borderTopLeftRadius: 7,
                borderBottomRightRadius: 7,
                fontSize: '10px',
                px: 0.5,
                pr: 0.5,
              }}
            >
              {selectedProduct.tag}
            </Typography>
          )}

          {selectedProduct.stockMonitor && selectedProduct.stockQuantity <= 0 && (
            <Typography
              sx={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: theme.palette.error.main,
                color: theme.palette.common.white,
                fontWeight: 'bold',
                borderRadius: 10,
                fontSize: '10px',
                py: 0.5,
                px: 0.5,
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
                right: -31.5,
                bottom: 30.5,
                backgroundColor: theme.palette.info.main,
                color: theme.palette.common.white,
                fontWeight: 'bold',
                borderTopRightRadius: 7.5,
                borderBottomLeftRadius: 7.5,
                fontSize: '8px',
                px: 0.5,
                pr: 0.5,
                transform: 'rotate(-90deg)',
              }}
            >
              Hurry, Only {selectedProduct.stockQuantity} left
            </Typography>
          )}
          {!isEmpty(selectedProduct.addOn) && isAddonMandatory && (
            <div
              style={{
                position: 'absolute',
                left: -7,
                bottom: -7,
                display: 'flex',
                borderRadius: 10,
              }}
            >
              <Tooltip title="AddOn">
                <ExtensionIcon
                  sx={{
                    color: isOrderedWithAddon(selectedProduct.productId)
                      ? theme.palette.success.dark
                      : theme.palette.grey[500],
                    fontSize: '20px',
                  }}
                />
              </Tooltip>
            </div>
          )}
          <Stack
            flexDirection={'row'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              top: 10,
            }}
          >
            <Tooltip title={selectedProduct.name}>
              <Typography
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  fontSize: '12px',
                  ml: 0.5,
                  mr: 0.5,
                  mt: 1,
                  mb: 1,
                  width: '90%',
                  overflowWrap: 'break-word',
                }}
              >
                {truncatedText}
              </Typography>
            </Tooltip>
          </Stack>
          <div
            style={{
              position: 'absolute',
              right: -8,
              top: -1,
              backgroundColor: theme.palette.common.white,
              display: 'flex',
              borderRadius: 20,
            }}
          >
            {!isEmpty(get(selectedProduct, 'attributes')) && (
              <VegNonIcon text={get(selectedProduct, 'attributes.isVeg')} />
            )}
          </div>
          <Stack
            sx={{
              display: 'flex',
              visibility: get(selectedProduct, 'unitsEnabled', false) ? 'visible' : 'hidden ',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
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

          <Stack flexDirection="column" alignItems="center" mt={0.5} ml={-0.5}>
            <Stack
              flexDirection={'row'}
              sx={{
                display: 'flex',
                justifyContent: 'left',
                width: '100%',
                pl: 1,
                alignItems: 'left',
              }}
            >
              <Stack
                flexDirection={'row'}
                sx={{
                  display: isOrdered(selectedProduct.productId) ? 'none' : 'flex',
                  alignItems: 'center',
                  bottom: 10,
                  ...(selectedProduct.offerPrice && String(selectedProduct.offerPrice)?.length > 4
                    ? {
                        flexDirection: 'column',
                      }
                    : {}),
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
                    textAlign: 'center',
                    mr: 1,
                    bottom: -16,
                    whiteSpace: 'nowrap',
                    fontSize:
                      selectedProduct.offerPrice !== selectedProduct.price &&
                      selectedProduct.offerPrice > 0 &&
                      typeof selectedProduct.offerPrice !== 'object'
                        ? '8px'
                        : isOrdered(selectedProduct.productId)
                        ? '10px'
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
                        pl: 0,
                        whiteSpace: 'nowrap',
                        fontSize: isOrdered(selectedProduct.productId) ? '8px' : '12px',
                      }}
                    >
                      {fCurrency(selectedProduct.offerPrice)}
                    </Typography>
                  )}

                {!!selectedProduct?.GSTPercent && (
                  <Typography
                    sx={{
                      fontSize: '5px',
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
                              get(selectedProduct, 'offerPrice') || get(selectedProduct, 'price'),
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
                  fontSize: '12px',
                  color: theme.palette.primary.main,
                  bottom: 10,
                  whiteSpace: 'nowrap',
                  pb: 0.5,
                }}
              >
                {fCurrency(getOrderDetailsById(selectedProduct.productId).totalPrice)}
              </Typography>
            </Stack>
          </Stack>

          <Stack
            flexDirection={'row'}
            sx={{
              direction: 'flex',
              justifyContent: 'center',
            }}
          >
            {isOrdered(selectedProduct.productId) && (
              <Stack direction={'row'} alignItems="center">
                <Stack
                  sx={{
                    backgroundColor: '#F4F5F6',
                    borderRadius: 2,
                    width: 20,
                    height: 20,
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
                        fontSize: '12px',
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDecrement(selectedProduct);
                      }}
                    />
                  ) : (
                    <DeleteOutlineIcon
                      sx={{
                        fontSize: '12px',
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
                    mx: 1,
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
                    width: 20,
                    height: 20,
                  }}
                  justifyContent="center"
                  alignItems="center"
                >
                  <AddIcon
                    sx={
                      getAvailabileStock(selectedProduct.productId)
                        ? {
                            color: theme.palette.success.dark,
                            fontSize: '12px',
                            '&:hover': { color: theme.palette.success.dark },
                          }
                        : {
                            color: 'grey',
                            fontSize: '12px',
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
        </Stack>
      </Paper>
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
