import CloseIcon from '@mui/icons-material/Close';
import {
  Divider,
  Drawer,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { find, get, isEmpty, map, reduce } from 'lodash';
import { calculateTotalQuantity } from 'src/helper/calculateTotalQuantity';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useState } from 'react';
import ViewAdditionalInfo from 'src/sections/Billing/ViewAdditionalInfo';
import formatAdditionalInfo from 'src/utils/formatAdditionalInfo';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import { allConfiguration } from 'src/global/recoilState';
import { useRecoilValue } from 'recoil';

export default function DrawerTransaction({ handleOpen, handleClose, open, row, filterTable }) {
  const theme = useTheme();

  const [openAdditionalInfoDrawer, setOpenAdditionalInfoDrawer] = useState(false);

  const configuration = useRecoilValue(allConfiguration);
  const additionalDiscountConfig = get(configuration, 'billingSettings.additionalDiscount', false);
  const additionalChargesConfig = get(configuration, 'billingSettings.additionalCharges', false);
  const deliveryChargesConfig = get(configuration, 'billingSettings.deliveryCharges', false);

  const StyledHeadTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
  }));
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.lighter,
      color: 'white',
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
  const sum = reduce(
   row.data1,
    function (previousValue, current) {
      return previousValue + get(current, 'quantity');
    },
    0
  );

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

  const totalParcelCharges = calculateTotalParcelCharges(get(row, 'data1')) / 100;

  const actualParcelCharges =
    (Number(totalParcelCharges) || 0) + (Number(row.data2?.packingCharges) || 0);

  return (
    <Stack>
      <Drawer
        key={row?.orderId}
        anchor="right"
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
      >
        <Stack>
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
              Order details
            </Typography>
            <Stack flexDirection={'row'} pr={0} justifyContent={'space-between'}>
              <CloseIcon
                fontSize="small"
                onClick={handleClose}
                sx={{ cursor: 'pointer', color: '#fff' }}
              />
            </Stack>
          </Stack>
          <TableContainer style={{ maxWidth: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell
                    style={{ backgroundImage: 'none', color: theme.palette.primary.main }}
                  >
                    Product Name
                  </StyledTableCell>
                  <StyledTableCell
                    style={{ backgroundImage: 'none', color: theme.palette.primary.main }}
                    align="right"
                  >
                    Quantity
                  </StyledTableCell>
                  <StyledTableCell
                    style={{ backgroundImage: 'none', color: theme.palette.primary.main }}
                    align="right"
                  >
                    Price
                  </StyledTableCell>

                  <StyledTableCell
                    style={{ backgroundImage: 'none', color: theme.palette.primary.main }}
                    align="center"
                  >
                    Total Price
                  </StyledTableCell>
                  <StyledTableCell
                    style={{ backgroundImage: 'none', color: theme.palette.primary.main }}
                    align="center"
                  />
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {map(row.data1, (e, index) => {
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
                      </TableRow>{' '}
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
                          <TableCell></TableCell>
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
                            {e.quantity *
                              toFixedIfNecessary(
                                getTotalPriceAndGst({
                                  price: e?.price,
                                  GSTPercent: e?.GSTPercent,
                                  GSTInc: e?.GSTInc,
                                  fullData: e,
                                })?.gstPercentageValue / 100,
                                2
                              )}
                          </TableCell>
                          <TableCell></TableCell>
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
          <Stack
            mt={1}
            ml={2}
            sx={{
              width: {
                xs: '80%',
                sm: '70%',
                md: '90%',
                lg: '90%',
              },
            }}
            justifyContent={'space-between'}
          >
            <Stack
              sx={{
                width: {
                  xs: '100%',
                  sm: '100%',
                  md: '95%',
                  lg: '90%',
                },
              }}
              flexDirection="row"
              justifyContent={'space-between'}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '50%',
                }}
                align="left"
              >
                Total No Of Items
              </Typography>

              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '60%',
                }}
                align="right"
              >
                {row.data1?.length || 0}
              </Typography>
            </Stack>
            <Stack
              sx={{
                width: {
                  xs: '100%',
                  sm: '100%',
                  md: '95%',
                  lg: '90%',
                },
              }}
              flexDirection="row"
              justifyContent={'space-between'}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '50%',
                }}
                align="left"
              >
                Total Order Quantity
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '60%',
                }}
                align="right"
              >
                {sum || 0}
              </Typography>
            </Stack>
            <Stack
              sx={{
                width: {
                  xs: '100%',
                  sm: '100%',
                  md: '95%',
                  lg: '90%',
                },
              }}
              flexDirection="row"
              justifyContent={'space-between'}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '50%',
                }}
                align="left"
              >
                Sub Total
              </Typography>

              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '60%',
                }}
                align="right"
              >
                ₹{toFixedIfNecessary(calculateActualTotalPrice(row.data1), 2)}
              </Typography>
            </Stack>

            <Stack
              sx={{
                width: {
                  xs: '100%',
                  sm: '100%',
                  md: '95%',
                  lg: '90%',
                },
              }}
              flexDirection="row"
              justifyContent={'space-between'}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '50%',
                }}
                align="left"
              >
                Parcel Charges
              </Typography>

              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '60%',
                }}
                align="right"
              >
                {fCurrency(actualParcelCharges)}
              </Typography>
            </Stack>

            <Stack
              sx={{
                width: {
                  xs: '100%',
                  sm: '100%',
                  md: '95%',
                  lg: '90%',
                },
              }}
              flexDirection="row"
              justifyContent={'space-between'}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '50%',
                }}
                align="left"
              >
                GST
              </Typography>

              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '60%',
                }}
                align="right"
              >
                {fCurrency(row.data2?.GSTPrice)}
              </Typography>
            </Stack>

            {additionalDiscountConfig && (
              <Stack
                sx={{
                  width: {
                    xs: '100%',
                    sm: '100%',
                    md: '95%',
                    lg: '90%',
                  },
                }}
                flexDirection="row"
                justifyContent={'space-between'}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                    minWidth: '50%',
                  }}
                  align="left"
                >
                  Additional Discount
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                    minWidth: '60%',
                  }}
                  align="right"
                >
                  {fCurrency(row.data2?.additionalDiscount || 0)}
                </Typography>
              </Stack>
            )}

            {additionalChargesConfig && (
              <Stack
                sx={{
                  width: {
                    xs: '100%',
                    sm: '100%',
                    md: '95%',
                    lg: '90%',
                  },
                }}
                flexDirection="row"
                justifyContent={'space-between'}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                    minWidth: '50%',
                  }}
                  align="left"
                >
                  Additional Charges
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                    minWidth: '60%',
                  }}
                  align="right"
                >
                  {fCurrency(row.data2?.additionalCharges || 0)}
                </Typography>
              </Stack>
            )}

            {deliveryChargesConfig && (
              <Stack
                sx={{
                  width: {
                    xs: '100%',
                    sm: '100%',
                    md: '95%',
                    lg: '90%',
                  },
                }}
                flexDirection="row"
                justifyContent={'space-between'}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                    minWidth: '50%',
                  }}
                  align="left"
                >
                  Delivery Charges
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    paddingY: '6px',
                    minWidth: '60%',
                  }}
                  align="right"
                >
                  {fCurrency(row.data2?.deliveryCharges || 0)}
                </Typography>
              </Stack>
            )}
            <Stack
              sx={{
                width: {
                  xs: '100%',
                  sm: '100%',
                  md: '95%',
                  lg: '90%',
                },
              }}
              flexDirection="row"
              justifyContent={'space-between'}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '50%',
                }}
                align="left"
              >
                Additional Info
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  minWidth: '62%',
                }}
                align="right"
              >
                <IconButton
                  onClick={() => {
                    setOpenAdditionalInfoDrawer(true);
                  }}
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: '14px',
                  }}
                  disabled={!formatAdditionalInfo(row?.additionalInfo)}
                >
                  <DescriptionOutlinedIcon />
                </IconButton>
              </Typography>
            </Stack>

            <Stack
              sx={{
                width: {
                  xs: '100%',
                  sm: '100%',
                  md: '95%',
                  lg: '90%',
                },
              }}
              flexDirection="row"
              justifyContent={'space-between'}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '50%',
                }}
                align="left"
              >
                Rounded Off
              </Typography>

              <Typography
                sx={{
                  fontSize: '14px',
                  paddingY: '6px',
                  minWidth: '60%',
                }}
                align="right"
              >
                ₹ {toFixedIfNecessary(row.data2?.roundOff || 0, 2)}
              </Typography>
            </Stack>

            <Stack
              sx={{
                width: {
                  xs: '100%',
                  sm: '100%',
                  md: '95%',
                  lg: '90%',
                },
              }}
              flexDirection="row"
              justifyContent={'space-between'}
              mt={0}
            >
              <Typography
                sx={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  paddingY: '6px',
                  minWidth: '50%',
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
                  minWidth: '60%',

                  color: theme.palette.success.main,
                }}
                align="right"
              >
                {fCurrency(row?.data2?.orderAmount)}
              </Typography>
            </Stack>
          </Stack>
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
