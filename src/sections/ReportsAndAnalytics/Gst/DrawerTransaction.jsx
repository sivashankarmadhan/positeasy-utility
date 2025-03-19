import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Chip,
  Drawer,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled,
  tableCellClasses,
  useTheme,
  Divider,
  IconButton,
} from '@mui/material';
import { find, get, isEmpty, map, reduce } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { products } from 'src/global/recoilState';
import { GstData } from 'src/global/SettingsState';
import BookingServices from 'src/services/API/BookingServices';
import { fCurrency } from 'src/utils/formatNumber';
import { hideScrollbar } from 'src/constants/AppConstants';
import { calculateTotalQuantity } from 'src/helper/calculateTotalQuantity';
import ViewAdditionalInfo from 'src/sections/Billing/ViewAdditionalInfo';
import formatAdditionalInfo from 'src/utils/formatAdditionalInfo';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import statusColor from 'src/utils/statusColor';
import { toFixedIfNecessary } from 'src/utils/formatNumber';

export default function DrawerTransaction({ handleOpen, handleClose, open, row, rows }) {
  const theme = useTheme();

  const [openAdditionalInfoDrawer, setOpenAdditionalInfoDrawer] = useState(false);

  const [productBuyOpen, setProductBuyOpen] = useState(false);
  const productList = useRecoilValue(products);
  const [orderDetails, setOrderDetails] = useState([]);

  const gstData = useRecoilValue(GstData);

  const handleClick = () => {
    getOrderDetails();
    setProductBuyOpen(true);
  };
  const handleOut = () => {
    setProductBuyOpen(false);
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
  const sum = reduce(
    orderDetails?.payments,
    function (previousValue, current) {
      return previousValue + get(current, 'paidTotal');
    },
    0
  );

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

  const totalParcelCharges = calculateTotalParcelCharges(get(orderDetails, 'orders'));

  const actualParcelCharges =
    (Number(totalParcelCharges) || 0) + (Number(orderDetails?.packingCharges) || 0);

  const totalGST = calculateTotalGst(get(orderDetails, 'orders'));

  return (
    <Stack>
      <Drawer
        key={row.orderId}
        anchor="right"
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
        sx={{ ...hideScrollbar }}
      >
        <Stack
          gap={3}
          container
          justifyContent={'center'}
          textAlign={'center'}
        // sx={{ width: { xs: '370px', sm: '430px' }, ...hideScrollbar }}
        >
          <TableContainer
            sx={{ borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
            component={Paper}
            p={2}
            style={{ maxHeight: 900, maxWidth: 500, ...hideScrollbar }}
          >
            <Table stickyHeader sx={{ ...hideScrollbar }}>
              <TableHead>
                <TableRow>
                  <StyledTableCell style={{ backgroundImage: 'none' }} colSpan={6} align="center">
                    <Stack flexDirection={'row'} pr={0} justifyContent={'space-between'}>
                      <Typography fontWeight={600}>Transaction details</Typography>
                      <CloseIcon onClick={handleClose} sx={{ cursor: 'pointer' }} />
                    </Stack>
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableRow>
                <TableCell align="left">Booking Order ID</TableCell>
                <TableCell align="right">{get(row, 'orderId')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Payment ID</TableCell>
                <TableCell align="right">{get(row, 'paymentId')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Gateway Pay Id</TableCell>
                <TableCell align="right">
                  {row['payments.gatewayPayId'] ? row['payments.gatewayPayId'] : '---'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Gateway Source</TableCell>
                <TableCell align="right">{row['payments.gatewaySource'] || '---'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Order Type</TableCell>
                <TableCell align="right">{get(orderDetails, 'orderType') || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Booking Date</TableCell>
                <TableCell align="right">{get(row, 'date') || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Booking Time</TableCell>
                <TableCell align="right">{get(row, 'time') || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Payment Status</TableCell>
                <TableCell align="right">
                  <Tooltip placement="left-start" title={get(row, 'reason')}>
                    <Chip
                      size="small"
                      color={statusColor(get(row, 'paymentStatus'))}
                      sx={{
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        '&.MuiChip-root': { borderRadius: '4px' },
                      }}
                      label={`${get(row, 'paymentStatus')}`}
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Payment Type</TableCell>
                <TableCell align="right">{get(row, 'type') || '---'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Payment Status Reason</TableCell>
                <TableCell align="right">{row['payments.reason'] || '---'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Order Summary</TableCell>
                <TableCell align="right">
                  {fCurrency((get(row, 'orderAmount') - get(row, 'GSTPrice')) / 100)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">GST Amount</TableCell>
                <TableCell align="right">{fCurrency(get(row, 'GSTPrice') / 100)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Total Order Amount</TableCell>
                <TableCell align="right">{fCurrency(get(row, 'orderAmount') / 100)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Total Paid Amount</TableCell>
                <TableCell align="right">{fCurrency(sum / 100)}</TableCell>
              </TableRow>
            </Table>
          </TableContainer>

          <Stack>
            <TableContainer style={{ height: 340, minHeight: 340, maxWidth: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <StyledTableRow>
                    <StyledInnerTableCell style={{ backgroundImage: 'none' }}>
                      Product Name
                    </StyledInnerTableCell>
                    <StyledInnerTableCell style={{ backgroundImage: 'none' }}>
                      Quantity
                    </StyledInnerTableCell>
                    <StyledInnerTableCell style={{ backgroundImage: 'none' }} align="center">
                      Price
                    </StyledInnerTableCell>
                    <StyledInnerTableCell style={{ backgroundImage: 'none' }} align="center">
                      Total Price
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
                          </TableCell>{' '}
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
                              -
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
                              ) * e.quantity}
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
                pr={5}
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
                pr={5}
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
                pr={4.5}
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
                  ₹ {toFixedIfNecessary(calculateActualTotalPrice(get(orderDetails, 'orders')), 2)}
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
                pr={4.5}
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
                pr={4.5}
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
                pr={5}
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
                pr={5}
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
                pr={5}
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
                pr={5}
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
                pr={4.5}
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
                  ₹ {(orderDetails?.roundOff || 0) / 100}
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
                pr={2}
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
          </Stack>
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
