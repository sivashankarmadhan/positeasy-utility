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
  MenuItem,
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
import { allConfiguration, billingProducts } from 'src/global/recoilState';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import AddonBillingDialog from './AddonBillingDialog';
import DeleteCustomizationDialog from './DeleteCustomizationDialog';
import OverflowTruncate from './OverflowTruncate';
import ProductLoader from './ProductLoader';
import RepeatLastCustomizationDialog from './RepeatLastCustomizationDialog';
import S3ImageCaching from './S3ImageCaching';
import PRODUCTS_API from 'src/services/products';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import { useLocation } from 'react-router';

export default function BillingProduct(props) {
  const theme = useTheme();
  const location = useLocation();
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
  console.log('itemmm', item);
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

  const configuration = useRecoilValue(allConfiguration);
  const isReverseStock = get(configuration, 'isReverseStock', false);

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
    console.log('dataaa', data);
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
    if (isReverseStock) return true;
    let previousEditProductQuantity = 0;

    if (location?.state?.orders) {
      const productData = find(location?.state?.orders, (_product) => _product?.productId === curr);
      previousEditProductQuantity = get(productData, 'quantity');
    }

    let availability = true;
    const orderData = getOrderDetailsById(curr);
    const quantity = get(orderData, 'quantity');
    const productData = find(allProductsWithUnits, (e) => e.productId === curr);
    if (get(productData, 'stockMonitor')) {
      let condition =
        get(productData, 'stockQuantity') >= quantity - previousEditProductQuantity + 1;
      if (condition) {
        availability = true;
      } else {
        availability = false;
      }
    } else availability = true;

    return availability;
  };

  const isStockAvailable = (curr) => {
    if (isReverseStock) return true;
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
    console.log('assssss', e);
    try {
      if (isOrdered(selectedProduct.productId) && isStockAvailable(selectedProduct)) {
        const isAvailable = getAvailabileStock(selectedProduct.productId);
        if (isAvailable) handleAddonIncrement(selectedProduct);
        return;
      }

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
          quantity: e?.stockQuantity > 0 && e?.stockQuantity < 1 ? e?.stockQuantity : 1,
          addOn: e.addOn && isAddonMandatory ? e.addOn : [],
          productAddons: get(e, 'productAddons', []),
          ...(get(e, 'parcelCharges') &&
          !tableName &&
          lowerCase(orderType) === lowerCase(OrderTypeConstants.Parcel)
            ? { isParcelCharges: true }
            : {}),
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

  let gstValue = selectedProduct.price * (selectedProduct.GSTPercent / 100);
  let gstValueWithOffer = selectedProduct.offerPrice * (selectedProduct.GSTPercent / 100);

  let previousEditProductQuantity = 0;

  if (location?.state?.orders) {
    const productData = find(
      location?.state?.orders,
      (_product) => _product?.productId === selectedProduct?.productId
    );
    previousEditProductQuantity = get(productData, 'quantity');
  }

  let isSoldOut =
    (get(selectedProduct, 'status') === 'SOLDOUT' ||
      (selectedProduct.stockMonitor && selectedProduct.stockQuantity <= 0)) &&
    !previousEditProductQuantity;

  if (isReverseStock) {
    isSoldOut = false;
  }

  if (loading) return <ProductLoader width={50} />;

  return (
    <div
      style={{
        margin: 0,
      }}
    >
      <Grid
        key={selectedProduct.productId}
        item
        sx={{
          m: 1,
        }}
        onClick={(event) => {
          if (isSoldOut) return;
          event.stopPropagation();
          handleAddonNewOrder(selectedProduct);
        }}
      >
        <Card
          sx={{
            cursor: isSoldOut ? 'not-allowed' : 'pointer',
            borderRadius: 0,
            p: 1.5,
            border: 2,
            borderColor: isOrdered(selectedProduct.productId)
              ? isStockAvailable(selectedProduct)
                ? theme.palette.success.dark
                : theme.palette.error.main
              : '#fff',
            overflow: 'visible',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Stack flexDirection={'column'} sx={{ width: '100%' }}>
            <Box
              sx={{
                height: 140,
                width: '100%',
                position: 'relative',
              }}
            >
              <S3ImageCaching
                style={{
                  borderRadius: 4,
                  objectFit: 'cover',
                  height: selectedProduct.productImage ? '100%' : 100,
                  width: selectedProduct.productImage ? '100%' : 100,
                  filter: isSoldOut ? 'blur(4px)' : '',
                }}
                src={selectedProduct.productImage}
              />
              {get(selectedProduct, 'unitsEnabled', false) && (
                <>
                  <FormControl
                    sx={{
                      minWidth: 50,
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: 'white',
                      borderRadius: 1,
                      border: 0,
                    }}
                    size="small"
                  >
                    <Select
                      defaultValue={get(selectedProduct, 'productId')}
                      value={get(selectedProduct, 'productId')}
                      autoWidth
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleUnitsChange}
                      inputProps={{ style: { height: 10 } }}
                    >
                      {map(getUnits(selectedProduct), (e) => (
                        <MenuItem key={get(e, 'productId')} value={get(e, 'productId')}>
                          {get(e, 'unit')} {e.unitName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </Box>
            {isOrdered(selectedProduct.productId) && (
              <div
                style={{
                  position: 'absolute',
                  right: -13,
                  top: -19,
                  backgroundColor: theme.palette.common.white,
                  display: 'flex',
                  borderRadius: 20,
                }}
              >
                <CheckCircleIcon
                  sx={{
                    color: theme.palette.success.dark,
                    fontSize: '35px',
                  }}
                />
              </div>
            )}
            {isSoldOut && (
              <Typography
                sx={{
                  position: 'absolute',
                  top: '37%',
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
            {selectedProduct.stockMonitor &&
              selectedProduct.status === StatusConstants.ACTIVE &&
              selectedProduct.stockQuantity > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    left: 10,
                    top: 130,
                    backgroundColor: theme.palette.common.white,
                    color: theme.palette.primary.main,
                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 10,
                    fontSize: '10px',
                    px: 0.5,
                    pr: 1,
                    fontWeight: 'bold',
                  }}
                >
                  Hurry, Only {selectedProduct.stockQuantity} left
                </Typography>
              )}
            {!isEmpty(selectedProduct.addOn) && isAddonMandatory && (
              <div
                style={{
                  position: 'absolute',
                  left: -12,
                  bottom: -12,
                  display: 'flex',
                  borderRadius: 20,
                }}
              >
                <Tooltip title="AddOn">
                  <ExtensionIcon
                    sx={{
                      color: isOrderedWithAddon(selectedProduct.productId)
                        ? theme.palette.success.dark
                        : theme.palette.grey[500],
                      fontSize: '30px',
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
                mt: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left  ',
                  fontSize: '17px',
                  ml: 0.5,
                  mr: 0.5,
                  width: get(selectedProduct, 'unitsEnabled', false) ? '45%' : '90%',
                }}
              >
                <OverflowTruncate name={selectedProduct.name} />
              </Typography>
            </Stack>

            {selectedProduct.tag && (
              <Typography
                sx={{
                  position: 'absolute',
                  left: 12,
                  top: 20,
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.common.white,
                  fontWeight: 'bold',
                  borderTopRightRadius: 10,
                  borderBottomRightRadius: 10,
                  fontSize: '10px',
                  px: 0.5,
                  pr: 1,
                }}
              >
                {selectedProduct.tag}
              </Typography>
            )}
            {!isEmpty(get(selectedProduct, 'attributes')) && (
              <VegNonIcon text={get(selectedProduct, 'attributes.isVeg')} />
            )}

            <Stack flexDirection="row" alignItems="center" mt={0.5} ml={-0.5}>
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  pr: 1,
                  alignItems: 'center',
                }}
              >
                <Stack
                  flexDirection={'row'}
                  sx={{
                    display: isOrdered(selectedProduct.productId) ? 'none' : 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Stack flexDirection="row" alignItems="end" gap={0.5}>
                    <Typography
                      sx={{
                        color: theme.palette.primary.main,
                        display:
                          isOrdered(selectedProduct.productId) && selectedProduct.offerPrice
                            ? 'none'
                            : 'inherit',
                        fontWeight: 'bold',
                        textAlign: 'left  ',
                        pl: 1,
                        fontSize:
                          selectedProduct.offerPrice !== selectedProduct.price &&
                          selectedProduct.offerPrice > 0 &&
                          typeof selectedProduct.offerPrice !== 'object'
                            ? '14px'
                            : isOrdered(selectedProduct.productId)
                            ? '16px'
                            : '18px',
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
                      {fCurrency(
                        tableCategory && get(selectedProduct, `priceVariants.${tableCategory}`)
                          ? get(selectedProduct, `priceVariants.${tableCategory}`)
                          : orderType && get(selectedProduct, `priceVariants.${orderType}`)
                          ? get(selectedProduct, `priceVariants.${orderType}`)
                          : selectedProduct?.price
                      )}
                    </Typography>
                    {!!selectedProduct?.GSTPercent && !selectedProduct?.offerPrice && (
                      <Typography
                        sx={{
                          fontSize: '10px',
                          mb: 0.4,
                          fontWeight: 'bold',
                          color: theme.palette.primary.main,
                        }}
                      >
                        &nbsp;
                        {!get(selectedProduct, 'GSTInc')
                          ? ` + ( ₹ ${toFixedIfNecessary(
                              getTotalPriceAndGst({
                                price: get(selectedProduct, 'price'),
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
                  {selectedProduct.offerPrice !== selectedProduct.price &&
                    selectedProduct.offerPrice > 0 &&
                    typeof selectedProduct.offerPrice !== 'object' && (
                      <Typography
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 'bold',
                          textAlign: 'left  ',
                          pl: 1,
                          fontSize: isOrdered(selectedProduct.productId) ? '12px' : '18px',
                        }}
                      >
                        {fCurrency(selectedProduct.offerPrice)}
                      </Typography>
                    )}

                  {!!selectedProduct?.GSTPercent &&
                    selectedProduct.offerPrice !== selectedProduct.price &&
                    selectedProduct.offerPrice > 0 &&
                    typeof selectedProduct.offerPrice !== 'object' && (
                      <Typography
                        sx={{
                          fontSize: '10px',
                          mb: -0.5,
                          fontWeight: 'bold',
                          color: theme.palette.primary.main,
                        }}
                      >
                        &nbsp;
                        {!get(selectedProduct, 'GSTInc')
                          ? ` + ( ₹ ${toFixedIfNecessary(
                              getTotalPriceAndGst({
                                price: get(selectedProduct, 'offerPrice'),
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
                    textAlign: 'left  ',
                    pl: 1,
                    fontSize: '18px',
                    color: theme.palette.primary.main,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fCurrency(getOrderDetailsById(selectedProduct.productId).totalPrice)}
                </Typography>
              </Stack>
              {isOrdered(selectedProduct.productId) && (
                <Stack
                  direction={'row'}
                  sx={{
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Stack
                    sx={{
                      width: 30,
                      height: 30,
                    }}
                    justifyContent="center"
                    alignItems="center"
                  >
                    {getOrdered(selectedProduct.productId).quantity > 1 ? (
                      <Stack
                        sx={{
                          width: 28,
                          height: 28,
                          p: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#F4F5F6',
                          borderRadius: 2,
                          ...(getOrdered(selectedProduct.productId).quantity === 1
                            ? { backgroundColor: theme.palette.error.main, color: 'white' }
                            : {}),
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDecrement(selectedProduct);
                        }}
                      >
                        <RemoveIcon
                          sx={{
                            color: theme.palette.error.main,
                            fontSize: '18px',
                          }}
                        />
                      </Stack>
                    ) : (
                      <Stack
                        sx={{
                          width: 28,
                          height: 28,
                          p: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#F4F5F6',
                          borderRadius: 2,
                          ...(getOrdered(selectedProduct.productId).quantity === 1
                            ? { backgroundColor: theme.palette.error.main, color: 'white' }
                            : {}),
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDecrement(selectedProduct);
                        }}
                      >
                        <DeleteOutlineIcon
                          sx={{
                            fontSize: '18px',
                            justifyContent: 'center',
                          }}
                        />
                      </Stack>
                    )}
                  </Stack>

                  <Typography
                    sx={{ width: 40, textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}
                  >
                    {getOrderDetailsById(selectedProduct.productId).quantity}
                  </Typography>

                  <Stack
                    sx={{
                      backgroundColor: '#F4F5F6',
                      borderRadius: 2,
                      width: 28,
                      height: 28,
                    }}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <AddIcon
                      sx={
                        getAvailabileStock(selectedProduct.productId)
                          ? {
                              color: theme.palette.success.dark,
                              fontSize: '18px',
                              '&:hover': { color: theme.palette.success.dark },
                            }
                          : {
                              color: 'grey',
                              fontSize: '18px',
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
        </Card>
      </Grid>
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
