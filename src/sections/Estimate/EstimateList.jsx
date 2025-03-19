import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExtensionIcon from '@mui/icons-material/Extension';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, List, ListItem, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { filter, find, forEach, get, isEmpty, map, some, sortBy } from 'lodash';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import AddonBillingDialog from 'src/components/AddonBillingDialog';
import OverflowTruncate from 'src/components/OverflowTruncate';
import S3ImageCaching from 'src/components/S3ImageCaching';
import { hideScrollbar } from 'src/constants/AppConstants';
import { billingProducts, estimateCart, noStockProducts } from 'src/global/recoilState';
import AuthService from 'src/services/authService';
import { fCurrency } from 'src/utils/formatNumber';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

export default function EstimateList(
  { isLaptop, info, isCustomCodeEnabled, isCustomerCodeEnabled } = this.props
) {
  const theme = useTheme();
  const [orders, setaddOrder] = useRecoilState(estimateCart);
  const [noStocks, setNoStocks] = useRecoilState(noStockProducts);
  const [addonListDialogData, setAddonListDialogData] = useState({});
  const [openBillingAddonDialog, setOpenBillingAddonDialog] = useState(false);
  const [priceEditMode, setPriceEditMode] = useState({ isEdit: false, cartId: '' });
  const [newPrice, setNewPrice] = useState('');

  const sortedOrders = sortBy(orders, [
    (e) => {
      const extractedTimestamp = e.cartId.match(/:(.*)$/)[1];
      return extractedTimestamp;
    },
  ]);
  const handlePriceChange = (e) => {
    setNewPrice(e.target.value);
  };
  const handleOpenPriceEditMode = (e) => {
    setNewPrice('');
    setPriceEditMode({ isEdit: true, cartId: get(e, 'cartId') });
  };
  const handleCancelPriceEditMode = () => {
    setPriceEditMode({ isEdit: false, cartId: '' });
    setNewPrice('');
  };
  const handlePriceEditMode = (order) => {
    const newData = filter(orders, (d) => get(d, 'cartId') !== get(order, 'cartId'));
    const finalPrice = typeof newPrice === 'string' ? Number(newPrice) : newPrice;
    const priceEditedData = {
      ...order,
      price: finalPrice,
      offerPrice: finalPrice,
    };
    setaddOrder([...newData, priceEditedData]);
    setPriceEditMode({ isEdit: false, cartId: '' });
    setNewPrice('');
  };
  const isOrdered = (curr) => {
    if (!curr) return;
    const check = some(orders, (e) => e.productId === curr.productId && e.cartId === curr.cartId);
    return check;
  };

  const getOrdered = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr.productId && e.cartId === curr.cartId);
    return check;
  };
  const addAddon = (order) => {
    try {
      setAddonListDialogData({
        addOnData: get(order, 'productAddons'),
        productData: { ...order },
      });
      setOpenBillingAddonDialog(true);
    } catch (e) {
      console.log(e);
    }
  };
  const handleAddonDecision = (e) => {
    if (isEmpty(get(e, 'selectedAddOn'))) {
      setAddonListDialogData({});
      setOpenBillingAddonDialog(false);
    }
    if (isEmpty(get(e, 'selectedAddOn'))) return;
    const newData = filter(orders, (d) => get(d, 'cartId') !== get(e, 'productData.cartId'));
    let addOns = [];
    map(get(e, 'selectedAddOn', []), (g) => {
      const check = some(
        get(e, 'productData.addOn'),
        (h) => get(h, 'addOnId') === get(g, 'addOnId') && get(h, 'quantity') === get(g, 'quantity')
      );
      if (!check) addOns.push(g);
    });
    setaddOrder([
      ...newData,
      { ...e.productData, addOn: [...get(e, 'productData.addOn', []), ...addOns] },
    ]);
    setAddonListDialogData({});
    setOpenBillingAddonDialog(false);
  };
  const handleDeleteAddon = (product, addon) => {
    const newData = filter(orders, (d) => get(d, 'cartId') !== get(product, 'cartId'));
    const otherAddons = filter(
      get(product, 'addOn'),
      (d) => get(d, 'addOnId') !== get(addon, 'addOnId')
    );
    setaddOrder([...newData, { ...product, addOn: [...otherAddons] }]);
  };
  const isAddOnProduct = (productId) => {
    const product = find(orders, (e) => e.productId === productId);
    const length = get(product, 'addOn', []).length;
    return length > 0;
  };
  const getOrderedQuantity = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr.productId && e.cartId === curr.cartId);
    return check ? check.quantity : 0;
  };
  const getPrice = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr);
    if (check) return check.offerPrice ? check.offerPrice : check.price;
  };

  const getPriceWithGST = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr);
    if (check)
      return check.offerPrice
        ? check.GSTPercent > 0
          ? (check.GSTPercent * check.offerPrice) / 100 + check.offerPrice
          : check.offerPrice
        : check.GSTPercent > 0
        ? (check.GSTPercent * check.price) / 100 + check.price
        : check.price;
  };

  const getActualPrice = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr);
    if (check) return check.price;
  };
  const getOrderDetailsById = (curr) => {
    const data = filter(orders, (e) => e.productId === curr);
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
            totalAddonPrice += d.price;
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
  const isStockAvailable = (curr) => {
    if (isEmpty(noStocks)) return true;
    const findedData = find(noStocks, (e) => e.productId === curr.productId);
    if (!isEmpty(findedData) && get(findedData, 'quantity') <= -1) return false;
    if (isEmpty(findedData)) return true;
  };
  const getAvailabileStock = (curr) => {
    let availability = true;
    const orderData = getOrderDetailsById(curr);
    const productData = find(orders, (e) => e.productId === curr);
    if (get(productData, 'stockMonitor')) {
      if (get(productData, 'stockQuantity') <= get(orderData, 'quantity')) availability = false;
    } else availability = true;
    return availability;
  };
  const getTotalPrice = (curr, cartId) => {
    const price = getPriceWithGST(curr);
    let getAddonPrice = 0;
    const order = find(orders, (e) => e.cartId === cartId);
    if (isEmpty(order.addOn)) return price;
    let addOnPrice = 0;
    forEach(order.addOn, (d) => {
      addOnPrice += ((d.price * d.GSTPercent) / 100 + d.price) * d.quantity;
    });
    getAddonPrice = price + (addOnPrice ? addOnPrice : 0);
    return getAddonPrice;
  };
  const getTotalActualPrice = (curr, cartId) => {
    const price = getActualPrice(curr);
    let getAddonPrice = 0;
    const order = find(orders, (e) => e.cartId === cartId);
    if (isEmpty(order.addOn)) return price;
    let addOnPrice = 0;
    forEach(order.addOn, (d) => {
      addOnPrice += d.price * d.quantity;
    });
    getAddonPrice = price + (addOnPrice ? addOnPrice : 0);
    return getAddonPrice;
  };
  const handleIncrementOrder = (e) => {
    setaddOrder((prevState) => {
      const newData = filter(prevState, (d) => e.cartId !== d.cartId);
      const currentData = find(prevState, (d) => e.cartId === d.cartId);
      return [
        ...newData,
        {
          ...e,
          quantity: !isEmpty(currentData) ? currentData.quantity + 1 : e.quantity + 1,
          addOn: e.addOn ? e.addOn : [],
        },
      ];
    });
  };
  const handleDecrementOrder = (e) => {
    setaddOrder((prevState) => {
      const newData = filter(prevState, (d) => e.cartId !== d.cartId);
      const currentData = find(prevState, (d) => e.cartId === d.cartId);
      return currentData.quantity > 1
        ? [
            ...newData,
            {
              ...e,
              quantity: !isEmpty(currentData) ? currentData.quantity - 1 : e.quantity - 1,
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
  return (
    <Box
      sx={{
        paddingBottom: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        pt: 0,
        ...hideScrollbar,
      }}
    >
      <List
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',

          height: isLaptop
            ? isCustomerCodeEnabled || isCustomCodeEnabled
              ? 'calc(100vh - 560px)'
              : 'calc(100vh - 505px)'
            : isCustomerCodeEnabled || isCustomCodeEnabled
            ? 'calc(100vh - 560px)'
            : 'calc(100vh - 510px)',
          mb: isLaptop ? 5 : 2,
          py: 0,
          ...hideScrollbar,
        }}
      >
        {map(sortedOrders, (e, index) => {
          return (
            <ListItem
              key={e.cartId}
              sx={{
                pb: 1,
                ml: 0.5,
                mr: 0.5,
                borderBottom: `1px solid #E9E9E9`,
                width: 'auto',
                px: 0,
                mx: 0,
              }}
            >
              <Stack flexDirection="row" sx={{ width: '100%' }}>
                <Box
                  sx={{
                    width: '18%',
                    flexShrink: 0,
                    height: 60,
                    mr: 2,
                    position: 'relative',
                  }}
                >
                  <S3ImageCaching
                    src={e?.productImage}
                    style={{ borderRadius: 4, width: '100%', height: '100%' }}
                  />
                  {get(e, 'unitsEnabled', false) && (
                    <Box
                      sx={{
                        py: 0.3,
                        px: 0.7,
                        backgroundColor: 'white',
                        borderRadius: 0.5,
                        position: 'absolute',
                        bottom: 6,
                        right: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ fontSize: '10px' }}>
                        {get(e, 'unit')} {get(e, 'unitName')}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box
                  sx={{
                    width: '75%',
                  }}
                >
                  <Stack flexDirection="row" alignItems="center" sx={{ width: '100%' }}>
                    <Typography sx={{ width: '95%', fontSize: '12px', fontWeight: 'bold' }}>
                      <OverflowTruncate name={e.name?.toUpperCase()} />
                    </Typography>
                  </Stack>

                  <Stack
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ width: '100%' }}
                  >
                    <Typography sx={{ width: '70%', fontSize: '10px' }}>
                      {e.category}

                      {get(e, 'counter') ? ` (Counter: ${get(e, 'counter', '')})` : ''}
                    </Typography>
                    <Stack direction={'row'} spacing={1}>
                      {get(priceEditMode, 'isEdit') &&
                      get(e, 'cartId') === get(priceEditMode, 'cartId') ? (
                        <>
                          <CloseIcon
                            onClick={() => handleCancelPriceEditMode()}
                            sx={{
                              fontSize: '16px',
                              cursor: 'pointer',
                              color: 'text.secondary',
                              '&:hover': { color: 'error.main' },
                            }}
                          />
                          <DoneIcon
                            onClick={() => {
                              if (!newPrice) return;
                              handlePriceEditMode(e);
                            }}
                            disabled={!newPrice}
                            sx={{
                              fontSize: '16px',
                              mx: 1,
                              cursor: !newPrice ? 'not-allowed' : 'pointer',
                              color: 'text.secondary',
                              '&:hover': { color: 'success.main' },
                            }}
                          />
                        </>
                      ) : (
                        <EditIcon
                          onClick={() => handleOpenPriceEditMode(e)}
                          sx={{
                            fontSize: '16px',
                            mx: 1,
                            cursor: 'pointer',
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main' },
                          }}
                        />
                      )}
                      {get(priceEditMode, 'isEdit') &&
                        get(priceEditMode, 'cartId') === get(e, 'cartId') && (
                          <input
                            onChange={handlePriceChange}
                            defaultValue={getPrice(e.productId)}
                            type="number"
                            style={{
                              maxHeight: 20,
                              maxWidth: 90,
                              width: newPrice
                                ? newPrice?.length + 1 + 'ch'
                                : getPrice(e.productId)?.toString()?.length + 1 + 'ch',
                              outlineColor: theme.palette.primary.main,
                              textAlign: 'right',
                            }}
                          />
                        )}
                      {(!get(priceEditMode, 'isEdit') ||
                        get(priceEditMode, 'cartId') !== get(e, 'cartId')) && (
                        <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                          {e.offerPrice !== e.price &&
                            e.offerPrice > 0 &&
                            typeof e.offerPrice !== 'object' && (
                              <Typography
                                noWrap
                                sx={{
                                  minWidth: 20,
                                  fontSize: '10px',
                                  textDecorationLine: 'line-through',
                                  mr: 1,
                                }}
                              >
                                {fCurrency(getActualPrice(e.productId))}
                              </Typography>
                            )}
                          <Typography noWrap sx={{ minWidth: 20, fontSize: '10px' }}>
                            {fCurrency(getPrice(e.productId))}
                          </Typography>
                        </Stack>
                      )}
                      <Typography sx={{ fontSize: '10px' }}>x</Typography>
                      <Typography sx={{ fontSize: '10px' }}>{e.quantity}</Typography>
                    </Stack>
                  </Stack>
                  {e.GSTPercent > 0 && (
                    <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ minWidth: 20, fontSize: '8px', textAlign: 'right' }}>
                        GST {e.GSTPercent}%
                      </Typography>

                      <Stack direction={'row'} spacing={1}>
                        <Typography sx={{ minWidth: 20, fontSize: '10px' }}>
                          {fCurrency((getPrice(e.productId) * e.GSTPercent) / 100)}
                        </Typography>{' '}
                        <Typography sx={{ fontSize: '10px' }}>x</Typography>
                        <Typography sx={{ fontSize: '10px' }}>{e.quantity}</Typography>
                      </Stack>
                    </Stack>
                  )}
                  {map(get(e, 'addOn', []), (d) => (
                    <>
                      <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography
                            sx={{ minWidth: 20, fontSize: '10px', display: 'flex', gap: 0.3 }}
                          >
                            <b> Addon -</b>{' '}
                            <Box sx={{ width: '6rem' }}>
                              <OverflowTruncate name={d.name} />
                            </Box>
                          </Typography>
                        </Box>
                        <Tooltip title="Delete addon">
                          <DeleteForeverIcon
                            onClick={() => handleDeleteAddon(e, d)}
                            color="error"
                            sx={{ fontSize: 14, cursor: 'pointer' }}
                          />
                        </Tooltip>
                        <Stack direction={'row'} spacing={1}>
                          <Typography sx={{ minWidth: 20, fontSize: '10px' }}>
                            {fCurrency(d.price)}
                          </Typography>
                          <Typography sx={{ fontSize: '10px' }}>x</Typography>
                          <Typography sx={{ fontSize: '10px' }}>
                            {d.quantity * e.quantity}
                          </Typography>
                        </Stack>
                      </Stack>

                      {d.GSTPercent > 0 && (
                        <Stack
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box>
                            <Typography sx={{ minWidth: 20, fontSize: '8px', textAlign: 'right' }}>
                              Addon-GST {d.GSTPercent}%
                            </Typography>
                          </Box>
                          <Stack direction={'row'} spacing={1}>
                            <Typography sx={{ minWidth: 20, fontSize: '8px' }}>
                              {fCurrency((d.price * d.GSTPercent) / 100)}
                            </Typography>
                            <Typography sx={{ fontSize: '8px' }}>x</Typography>
                            <Typography sx={{ fontSize: '8px' }}>
                              {d.quantity * e.quantity}
                            </Typography>
                          </Stack>
                        </Stack>
                      )}
                    </>
                  ))}
                  {!isEmpty(get(e, 'productAddons', [])) && (
                    <Tooltip title={'Add Addon'}>
                      <Stack
                        onClick={() => addAddon(e)}
                        flexDirection={'row'}
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          '&:hover': {
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '10px',
                            mr: 0.3,
                          }}
                        >
                          Add
                        </Typography>
                        <ExtensionIcon
                          fontSize="small"
                          sx={{
                            cursor: 'pointer',
                            color: theme.palette.primary.main,
                            fontSize: '10px',
                          }}
                        />
                      </Stack>
                    </Tooltip>
                  )}
                  <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                    <Stack mt={1}>
                      {isOrdered(e) && (
                        <Stack key={e.productId} flexDirection={'row'} alignItems="center">
                          <Stack
                            sx={{
                              backgroundColor: '#F4F5F6',
                              borderRadius: 2,
                              width: 25,
                              height: 25,
                              ...(getOrdered(e).quantity > 1
                                ? {}
                                : { backgroundColor: theme.palette.error.main, color: 'white' }),
                            }}
                            justifyContent="center"
                            alignItems="center"
                          >
                            {getOrdered(e).quantity > 1 ? (
                              <RemoveIcon
                                sx={{
                                  color: theme.palette.error.main,
                                  fontSize: '18px',
                                  cursor: 'pointer',
                                }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDecrementOrder(e);
                                }}
                              />
                            ) : (
                              <DeleteOutlineIcon
                                sx={{
                                  fontSize: '16px',
                                  cursor: 'pointer',
                                }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDecrementOrder(e);
                                }}
                              />
                            )}
                          </Stack>

                          <Typography
                            sx={{
                              width: 40,
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: '14px',
                            }}
                          >
                            {getOrderedQuantity(e)}
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
                                getAvailabileStock(e.productId)
                                  ? {
                                      color: theme.palette.success.dark,
                                      fontSize: '18px',
                                      '&:hover': { color: theme.palette.success.dark },
                                      cursor: 'pointer',
                                    }
                                  : {
                                      color: 'grey',
                                      fontSize: '18px',
                                      cursor: 'not-allowed',
                                    }
                              }
                              onClick={(event) => {
                                event.stopPropagation();
                                const isAvailable = getAvailabileStock(e.productId);
                                if (isAvailable) handleIncrementOrder(e);
                              }}
                            />
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        textAlign: 'left  ',
                        pl: 1,
                        fontSize: '16px',
                      }}
                    >
                      {fCurrency(getTotalPrice(e.productId, e.cartId) * e.quantity)}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </ListItem>
          );
        })}

        {(info || get(sortedOrders, '0.info')) && (
          <ListItem
            sx={{
              pb: 1,
              ml: 0.5,
              mr: 0.5,
              borderBottom: `1px solid  #E9E9E9`,
              width: 'auto',
              px: 0,
              mx: 0,
            }}
          >
            <Stack flexDirection={'column'}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                Added Information:
              </Typography>
              <Typography variant="caption" sx={{ ml: 1 }}>
                - {info || get(sortedOrders, '0.info')}
              </Typography>
            </Stack>
          </ListItem>
        )}
      </List>{' '}
      {!isEmpty(addonListDialogData) && (
        <AddonBillingDialog
          handleClose={handleAddonDecision}
          open={openBillingAddonDialog}
          data={addonListDialogData}
        />
      )}
    </Box>
  );
}
