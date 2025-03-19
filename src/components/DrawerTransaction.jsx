import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { find, get, isEmpty, map, reduce } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { allConfiguration, products } from '../global/recoilState';
import BookingServices from '../services/API/BookingServices';
import { fCurrency, toFixedIfNecessary } from '../utils/formatNumber';
import { hideScrollbar } from '../constants/AppConstants';
import { dateFormat, formatTime, timeFormat } from '../utils/formatTime';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import toast from 'react-hot-toast';
import { SuccessConstants } from '../constants/SuccessConstants';
import { calculateTotalQuantity } from '../helper/calculateTotalQuantity';
import ViewAdditionalInfo from '../sections/Billing/ViewAdditionalInfo';
import formatAdditionalInfo from '../utils/formatAdditionalInfo';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import getTotalPriceAndGst from '../utils/getTotalPriceAndGst';
import statusColor from '../utils/statusColor';

export default function DrawerTransaction({ handleOpen, handleClose, open, row }) {
  const theme = useTheme();

  const [openAdditionalInfoDrawer, setOpenAdditionalInfoDrawer] = useState(false);

  const configuration = useRecoilValue(allConfiguration);
  const additionalDiscountConfig = get(configuration, 'billingSettings.additionalDiscount', false);
  const additionalChargesConfig = get(configuration, 'billingSettings.additionalCharges', false);
  const deliveryChargesConfig = get(configuration, 'billingSettings.deliveryCharges', false);

  const productList = useRecoilValue(products);
  const [orderDetails, setOrderDetails] = useState([]);
  const handleClick = () => {
    getOrderDetails();
    // setProductBuyOpen(true);
  };
  const handleOut = () => {
    // setProductBuyOpen(false);
  };
  const getProductName = (productId) => {
    const data = find(productList, (e) => e.productId === productId);
    return get(data, 'name');
  };
  const getOrderDetails = async () => {
    try {
      if (get(row, 'orderId')) {
        const response = await BookingServices.getTransactionByOrderId({
          orderId: get(row, 'orderId'),
          paymentId: get(row, 'paymentId'),
        });
        if (response) setOrderDetails(get(response, 'data.0', []));
      }
    } catch (e) {
      console.log(e);
    }
  };
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
  }));

  const StyledInnerTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: '#DBDBDB',
      color: 'black',
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.primary.lighter,
      border: 0,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const getActualPrice = (curr, orderDetails) => {
    if (!curr) return;
    const check = find(orderDetails, (e) => e.productId === curr);
    if (check) {
      const { withoutGstAmount } = getTotalPriceAndGst({
        price: check?.price,
        GSTPercent: check?.GSTPercent,
        GSTInc: check?.GSTInc,
        fullData: check,
      });
      return withoutGstAmount;
    }
  };

  const calculateActualTotalPrice = (orderDetails) => {
    if (isEmpty(orderDetails)) return 0;
    let totalPrice = 0;
    map(orderDetails, (e) => {
      if (isEmpty(e.addOn)) {
        totalPrice += (getActualPrice(e.productId, orderDetails) / 100) * e.quantity;
      } else if (!isEmpty(e.addOn)) {
        let totalAddonPrice = 0;
        map(e.addOn, (d) => {
          totalAddonPrice += d.price * d.quantity;
        });
        totalPrice +=
          getActualPrice(e.productId, orderDetails) / 100 + totalAddonPrice * e.quantity;
      }
    });
    return totalPrice;
  };

  useEffect(() => {
    if (open) getOrderDetails();
  }, [open]);

  const calculateTotalParcelCharges = (data) => {
    let parcelCharges = 0;
    map(data, (e) => {
      if (e?.parcelCharges) {
        const parcelChargesGstValue = e?.parcelCharges * (e?.GSTPercent / 100) || 0;
        if (e?.GSTInc) {
          parcelCharges += (e?.parcelCharges - parcelChargesGstValue) * e.quantity;
        } else {
          parcelCharges += e?.parcelCharges * e.quantity;
        }
      }
      map(get(e, 'addOns'), (d) => {
        if (e?.parcelCharges) {
          parcelCharges += d?.parcelCharges * d.quantity * e.quantity;
        }
      });
    });
    return parcelCharges ? parcelCharges : 0;
  };

  const calculateTotalGst = (data) => {
    let gst = 0;
    map(data, (e) => {
      const { gstPercentageValue } = getTotalPriceAndGst({
        price: e?.offerPrice || e?.price,
        GSTPercent: e?.GSTPercent,
        GSTInc: e?.GSTInc,
        fullData: e,
      });

      if (e.GSTPercent > 0) gst += (gstPercentageValue / 100) * e.quantity;
      map(get(e, 'addOns'), (d) => {
        if (d.GSTPercent > 0) gst += (gstPercentageValue / 100) * d.quantity * e.quantity;
      });
    });
    return gst ? gst : 0;
  };

  // const totalParcelCharges = reduce(
  //   orderDetails?.orders,
  //   function (acc, val) {
  //     return acc + (get(val, 'parcelCharges') || 0);
  //   },
  //   0
  // );

  const totalParcelCharges = calculateTotalParcelCharges(get(orderDetails, 'orders'));

  const actualParcelCharges =
    (Number(totalParcelCharges) || 0) + (Number(orderDetails?.packingCharges) || 0);

  const totalGST = calculateTotalGst(get(orderDetails, 'orders'));
  console.log('row', row);

  return (
    <Stack>
      <Drawer
        key={row.orderId}
        anchor="right"
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
      >
        <Stack
          gap={1}
          container
          justifyContent={'center'}
          textAlign={'center'}
          // sx={{ width: { xs: '370px', sm: '430px' }, ...hideScrollbar }}
        >
          <Stack
            flexDirection={'row'}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1,
              // mb: 3,
              backgroundColor: theme.palette.primary.main,
              p: 2,
              position: 'sticky',
              top: 0,
              zIndex: 999,
              width: '100%',
            }}
          >
            <Typography fontWeight={600} sx={{ color: '#fff' }}>
              Payment Details
            </Typography>
            <Stack flexDirection={'row'} pr={0} justifyContent={'space-between'}>
              <CloseIcon onClick={handleClose} sx={{ cursor: 'pointer', color: '#fff' }} />
            </Stack>
          </Stack>
          <TableContainer
            sx={{ borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
            component={Paper}
            p={2}
            style={{ maxHeight: 900, maxWidth: 500, ...hideScrollbar }}
          >
            <Table>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Booking Order ID
                </TableCell>
                <TableCell align="right">{row.booking.orderId}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Payment ID
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.paymentId);
                    toast.success(SuccessConstants.COPY_CLIPBOARD);
                  }}
                >
                  <Tooltip title="Copy">
                    <CopyAllIcon sx={{ fontSize: '20px' }} />
                  </Tooltip>
                  <Typography sx={{ fontSize: '0.875rem' }}>{row.paymentId}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Gateway Pay ID
                </TableCell>
                <TableCell align="right">
                  {row['paymentgateway'] ? row['gatewayPayId'] : '--'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Gateway Source
                </TableCell>
                <TableCell align="right">{row['gatewaySource']}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Order Type
                </TableCell>
                <TableCell align="right">{row['mode']}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Booking Date
                </TableCell>
                <TableCell align="right">{dateFormat(row.date)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Booking Time
                </TableCell>
                <TableCell align="right">{formatTime(row.createdAt)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Payment Status
                </TableCell>
                <TableCell align="right">
                  <Tooltip placement="left-start" title={row['reason']}>
                    <Chip
                      size="small"
                      color={statusColor(row['paymentStatus'])}
                      sx={{
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        '&.MuiChip-root': { borderRadius: '4px' },
                      }}
                      label={`${row['paymentStatus']}`}
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Payment Type
                </TableCell>
                <TableCell align="right">{row.booking.type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Payment Status Reason
                </TableCell>
                <TableCell align="right">{row['reason']}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Total Order Amount
                </TableCell>
                <TableCell align="right">{fCurrency(row.booking.orderAmount / 100)}</TableCell>
              </TableRow>
            </Table>
          </TableContainer>

          {/* <Stack>
            <TableContainer style={{ height: 340, minHeight: 340, maxWidth: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <StyledTableRow>
                    <StyledInnerTableCell style={{ backgroundImage: 'none' }}>
                      Product ID
                    </StyledInnerTableCell>
                    <StyledInnerTableCell style={{ backgroundImage: 'none' }}>
                      Units
                    </StyledInnerTableCell>
                    <StyledInnerTableCell style={{ backgroundImage: 'none' }} align="center">
                      Unit Type
                    </StyledInnerTableCell>
                    <StyledInnerTableCell style={{ backgroundImage: 'none' }} align="center">
                      Base Price
                    </StyledInnerTableCell>
                    <StyledInnerTableCell style={{ backgroundImage: 'none' }} align="center">
                      Price
                    </StyledInnerTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {map(get(orderDetails, 'orders'), (e, index) => {
                    let parcelCharges = 0;
                    if (e?.parcelCharges) {
                      const parcelChargesGstValue = e?.parcelCharges * (e?.GSTPercent / 100) || 0;
                      if (e?.GSTInc) {
                        parcelCharges += (e?.parcelCharges - parcelChargesGstValue) * e.quantity;
                      } else {
                        parcelCharges += e?.parcelCharges * e.quantity;
                      }
                    }

                    return (
                      <>
                        <TableRow>
                          <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="left">
                            {index + 1} - {e.name}
                            {e.unit && (
                              <Typography sx={{ display: 'inline' }} variant="caption">
                                {` (${e.unit}${e.unitName})`}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                            {e.quantity}
                          </TableCell>
                          <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                            {e.unit || '--'}
                          </TableCell>
                          <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                            ₹
                            {toFixedIfNecessary(
                              getTotalPriceAndGst({
                                price: e?.price,
                                GSTPercent: e?.GSTPercent,
                                GSTInc: e?.GSTInc,
                                fullData: e,
                              })?.withoutGstAmount / 100,
                              2
                            )}
                          </TableCell>
                          <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                            ₹
                            {toFixedIfNecessary(
                              (getTotalPriceAndGst({
                                price: e?.price,
                                GSTPercent: e?.GSTPercent,
                                GSTInc: e?.GSTInc,
                                fullData: e,
                              })?.withoutGstAmount *
                                e.quantity) /
                                100,
                              2
                            )}
                          </TableCell>
                        </TableRow>
                        {get(e, 'parcelCharges') && (
                          <TableRow>
                            <TableCell
                              sx={{ lineHeight: '1.5', paddingY: '6px', fontSize: '11px' }}
                              align="left"
                            >
                              Parcel charges
                            </TableCell>
                            <TableCell
                              sx={{ lineHeight: '1.5', paddingY: '6px', fontSize: '11px' }}
                              align="center"
                            >
                              {e.quantity}
                            </TableCell>{' '}
                            <TableCell
                              sx={{ lineHeight: '1.5', paddingY: '6px', fontSize: '11px' }}
                              align="center"
                            >
                              --
                            </TableCell>
                            <TableCell
                              sx={{ lineHeight: '1.5', paddingY: '6px', fontSize: '11px' }}
                              align="center"
                            >
                              --
                            </TableCell>
                            <TableCell
                              sx={{ lineHeight: '1.5', paddingY: '6px', fontSize: '11px' }}
                              align="center"
                            >
                              {fCurrency(parcelCharges / 100)}
                            </TableCell>
                          </TableRow>
                        )}
                        {e.GSTPercent > 0 && (
                          <TableRow>
                            <TableCell
                              sx={{ lineHeight: '1.5', paddingY: '6px', fontSize: '11px' }}
                              align="left"
                            >
                              GST {e.GSTPercent}%
                            </TableCell>
                            <TableCell
                              sx={{ lineHeight: '1.5', paddingY: '6px', fontSize: '11px' }}
                              align="center"
                            >
                              {e.quantity}
                            </TableCell>{' '}
                            <TableCell
                              sx={{ lineHeight: '1.5', paddingY: '6px', fontSize: '11px' }}
                              align="center"
                            >
                              --
                            </TableCell>
                            <TableCell
                              sx={{ lineHeight: '1.5', paddingY: '6px', fontSize: '11px' }}
                              align="center"
                            >
                              --
                            </TableCell>
                            <TableCell
                              sx={{ lineHeight: '1.5', paddingY: '6px', fontSize: '11px' }}
                              align="center"
                            >
                              ₹
                              {toFixedIfNecessary(
                                getTotalPriceAndGst({
                                  price: e?.price,
                                  GSTPercent: e?.GSTPercent,
                                  GSTInc: e?.GSTInc,
                                  fullData: e,
                                })?.gstPercentageValue / 100,
                                2
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                        {map(get(e, 'addOns'), (d) => (
                          <>
                            <TableRow>
                              <TableCell
                                sx={{ fontSize: '10px', lineHeight: '1.5', paddingY: '6px' }}
                                align="left"
                              >
                                Addon - {d.name}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: '10px', lineHeight: '1.5', paddingY: '6px' }}
                                align="center"
                              >
                                {d.quantity}
                              </TableCell>
                              <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                                --
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: '10px', lineHeight: '1.5', paddingY: '6px' }}
                                align="center"
                              >
                                {fCurrency(d.price / 100)}
                              </TableCell>
                              <TableCell
                                sx={{ fontSize: '10px', lineHeight: '1.5', paddingY: '6px' }}
                                align="center"
                              >
                                {fCurrency((d.quantity * d.price) / 100)}
                              </TableCell>
                            </TableRow>
                            {d.GSTPercent > 0 && (
                              <TableRow>
                                <TableCell
                                  sx={{ fontSize: '10px', lineHeight: '1.5', paddingY: '6px' }}
                                  align="left"
                                >
                                  GST {d.GSTPercent}%
                                </TableCell>
                                <TableCell
                                  sx={{ fontSize: '10px', lineHeight: '1.5', paddingY: '6px' }}
                                  align="center"
                                >
                                  -
                                </TableCell>
                                <TableCell
                                  sx={{ fontSize: '10px', lineHeight: '1.5', paddingY: '6px' }}
                                  align="center"
                                >
                                  -
                                </TableCell>
                                <TableCell
                                  sx={{ fontSize: '10px', lineHeight: '1.5', paddingY: '6px' }}
                                  align="center"
                                >
                                  {fCurrency((d.quantity * ((d.price * d.GSTPercent) / 100)) / 100)}
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        ))}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ borderTop: '1px dashed #B4B5BB', mt: 1 }} />
            <Stack mt={1}>
              <Stack
                sx={{
                  width: {
                    xs: '80%',
                    sm: '70%',
                  },
                  ml: 'auto',
                }}
                flexDirection="row"
                justifyContent={'space-between'}
                px={2}
                pr={3}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="left"
                >
                  Total No Of Items
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="right"
                >
                  {get(orderDetails, 'orders')?.length || 0}
                </Typography>
              </Stack>

              <Stack
                sx={{
                  width: {
                    xs: '80%',
                    sm: '70%',
                  },
                  ml: 'auto',
                }}
                flexDirection="row"
                justifyContent={'space-between'}
                px={2}
                pr={3}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="left"
                >
                  Total Order Quantity
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="right"
                >
                  {calculateTotalQuantity(get(orderDetails, 'orders'))}
                </Typography>
              </Stack>

              <Stack
                sx={{
                  width: {
                    xs: '80%',
                    sm: '70%',
                  },
                  ml: 'auto',
                }}
                flexDirection="row"
                justifyContent={'space-between'}
                px={2}
                pr={3}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="left"
                >
                  Sub Total
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="right"
                >
                  ₹{toFixedIfNecessary(calculateActualTotalPrice(get(orderDetails, 'orders')), 2)}
                </Typography>
              </Stack>

              <Stack
                sx={{
                  width: {
                    xs: '80%',
                    sm: '70%',
                  },
                  ml: 'auto',
                }}
                flexDirection="row"
                justifyContent={'space-between'}
                px={2}
                pr={3}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="left"
                >
                  Parcel Charges
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="right"
                >
                  {fCurrency(actualParcelCharges / 100)}
                </Typography>
              </Stack>

              <Stack
                sx={{
                  width: {
                    xs: '80%',
                    sm: '70%',
                  },
                  ml: 'auto',
                }}
                flexDirection="row"
                justifyContent={'space-between'}
                px={2}
                pr={3}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="left"
                >
                  GST
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="right"
                >
                  {fCurrency(totalGST)}
                </Typography>
              </Stack>

              {additionalDiscountConfig && (
                <Stack
                  sx={{
                    width: {
                      xs: '80%',
                      sm: '70%',
                    },
                    ml: 'auto',
                  }}
                  flexDirection="row"
                  justifyContent={'space-between'}
                  px={2}
                  pr={3}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      paddingY: '6px',
                    }}
                    align="left"
                  >
                    Additional Discount
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '14px',
                      paddingY: '6px',
                    }}
                    align="right"
                  >
                    {fCurrency((orderDetails?.additionalDiscount || 0) / 100)}
                  </Typography>
                </Stack>
              )}

              {additionalChargesConfig && (
                <Stack
                  sx={{
                    width: {
                      xs: '80%',
                      sm: '70%',
                    },
                    ml: 'auto',
                  }}
                  flexDirection="row"
                  justifyContent={'space-between'}
                  px={2}
                  pr={3}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      paddingY: '6px',
                    }}
                    align="left"
                  >
                    Additional Charges
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '14px',
                      paddingY: '6px',
                    }}
                    align="right"
                  >
                    {fCurrency((orderDetails?.additionalCharges || 0) / 100)}
                  </Typography>
                </Stack>
              )}

              {deliveryChargesConfig && (
                <Stack
                  sx={{
                    width: {
                      xs: '80%',
                      sm: '70%',
                    },
                    ml: 'auto',
                  }}
                  flexDirection="row"
                  justifyContent={'space-between'}
                  px={2}
                  pr={3}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      paddingY: '6px',
                    }}
                    align="left"
                  >
                    Delivery Charges
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '14px',
                      paddingY: '6px',
                    }}
                    align="right"
                  >
                    {fCurrency((orderDetails?.deliveryCharges || 0) / 100)}
                  </Typography>
                </Stack>
              )}

              <Stack
                sx={{
                  width: {
                    xs: '80%',
                    sm: '70%',
                  },
                  ml: 'auto',
                }}
                flexDirection="row"
                justifyContent={'space-between'}
                px={2}
                pr={2}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="left"
                >
                  Additional Info
                </Typography>

                <IconButton
                  onClick={() => {
                    setOpenAdditionalInfoDrawer(true);
                  }}
                  sx={{ color: theme.palette.primary.main, pl: 1 }}
                  disabled={!formatAdditionalInfo(row?.additionalInfo)}
                >
                  <DescriptionOutlinedIcon />
                </IconButton>
              </Stack>

              <Stack
                sx={{
                  width: {
                    xs: '80%',
                    sm: '70%',
                  },
                  ml: 'auto',
                }}
                flexDirection="row"
                justifyContent={'space-between'}
                px={2}
                pr={3}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="left"
                >
                  Rounded Off
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                  }}
                  align="right"
                >
                  ₹ {(row?.roundOff || 0) / 100}
                </Typography>
              </Stack>

              <Stack
                sx={{
                  width: {
                    xs: '80%',
                    sm: '70%',
                  },
                  ml: 'auto',
                }}
                flexDirection="row"
                justifyContent={'space-between'}
                px={2}
                mt={0}
                pr={1.5}
              >
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    paddingY: '6px',
                  }}
                  align="left"
                >
                  Grand Total
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    paddingY: '6px',
                    color: theme.palette.success.main,
                  }}
                  align="right"
                >
                  {fCurrency(orderDetails.orderAmount / 100)}
                </Typography>
              </Stack>
            </Stack>
          </Stack> */}
          {/* </Drawer> */}
        </Stack>
      </Drawer>
      <ViewAdditionalInfo
        data={formatAdditionalInfo(row?.additionalInfo)}
        open={openAdditionalInfoDrawer}
        setOpen={setOpenAdditionalInfoDrawer}
      />
    </Stack>
  );
}
