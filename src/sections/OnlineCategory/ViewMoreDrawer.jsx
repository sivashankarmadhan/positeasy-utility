import {
  Drawer,
  Stack,
  useTheme,
  Button,
  Chip,
  IconButton,
  Paper,
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
  styled,
  Autocomplete,
  ListItem,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery, useResponsive } from '@poriyaalar/custom-hooks';
import { hideScrollbar, PaymentStatusConstants } from 'src/constants/AppConstants';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { dateFormat, timeFormat } from 'src/utils/formatTime';
import { fCurrency } from 'src/utils/formatNumber';
import { find, get, isEmpty, map } from 'lodash';
import { convertToRupee } from '../../helper/ConvertPrice';
import statusColor from 'src/utils/statusColor';

const ViewMoreDrawer = ({ openViewMoreDrawer, setOpenViewMoreDrawer, customerOrdersDetails }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');

  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const selectedOrderDetails = find(customerOrdersDetails, (_item) => {
    return get(_item, 'orderId') === selectedOrderId;
  });

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

  useEffect(() => {
    if (get(customerOrdersDetails, '0.orderId')) {
      setSelectedOrderId(get(customerOrdersDetails, '0.orderId'));
    }
  }, [customerOrdersDetails]);

  return (
    <Stack>
      <Drawer
        PaperProps={{
          sx: { width: isMobile ? '100%' : isTab ? '70%' : '30%', ...hideScrollbar },
        }}
        anchor="right"
        open={openViewMoreDrawer}
        onClose={() => setOpenViewMoreDrawer(false)}
        onOpen={() => setOpenViewMoreDrawer(true)}
      >
        <Stack gap={3} container justifyContent={'center'} textAlign={'center'}>
          <TableContainer
            sx={{ borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
            component={Paper}
            p={2}
            style={{ maxHeight: isMobile ? 550 : 500 }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell style={{ backgroundImage: 'none' }} colSpan={6} align="center">
                    <Stack flexDirection={'row'} pr={0} justifyContent={'space-between'}>
                      <Typography fontWeight={600}>Transaction Details</Typography>
                      <CloseIcon
                        onClick={() => {
                          setOpenViewMoreDrawer(false);
                        }}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Stack>
                  </StyledTableCell>
                </TableRow>
              </TableHead>

              <TableRow>
                <TableCell colSpan={2}>
                  <Autocomplete
                    disablePortal
                    options={map(customerOrdersDetails, (_order) => get(_order, 'orderId'))}
                    renderInput={(params) => <TextField {...params} label="Select Order ID" />}
                    onChange={(event, newValue) => {
                      setSelectedOrderId(newValue);
                    }}
                    value={selectedOrderId}
                  />
                </TableCell>
              </TableRow>

              {isEmpty(selectedOrderDetails) && (
                <TableRow sx={{ height: 'calc(100vh - 150px)' }}>
                  <TableCell align="center">Please select Order ID</TableCell>
                </TableRow>
              )}
              {!isEmpty(selectedOrderDetails) && (
                <>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Booking Order ID
                    </TableCell>
                    <TableCell align="right">{get(selectedOrderDetails, 'orderId')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Payment ID
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrderDetails?.['payments.paymentId']);
                        toast.success(SuccessConstants.COPY_CLIPBOARD);
                      }}
                    >
                      <Tooltip title="Copy">
                        <CopyAllIcon sx={{ fontSize: '20px' }} />
                      </Tooltip>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {get(selectedOrderDetails, 'paymentId')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Gateway Pay ID
                    </TableCell>
                    <TableCell align="right">
                      {selectedOrderDetails?.['payments.gatewayPayId']
                        ? selectedOrderDetails?.['payments.gatewayPayId']
                        : '---'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Gateway Source
                    </TableCell>
                    <TableCell align="right">
                      {selectedOrderDetails?.['payments.gatewaySource'] || '--'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Order Type
                    </TableCell>
                    <TableCell align="right">
                      {get(selectedOrderDetails, 'orderType') || '--'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Payment Mode
                    </TableCell>
                    <TableCell align="right">
                      {selectedOrderDetails?.['payments.mode'] || '--'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Paid Amount
                    </TableCell>
                    <TableCell align="right">
                      {fCurrency(
                        convertToRupee(selectedOrderDetails?.['payments.paidTotal']) || '--'
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Booking Date
                    </TableCell>
                    <TableCell align="right">
                      {dateFormat(get(selectedOrderDetails, 'date'))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Booking Time
                    </TableCell>
                    <TableCell align="right">
                      {timeFormat(get(selectedOrderDetails, 'time'))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Payment Status
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        placement="left-start"
                        title={get(selectedOrderDetails, 'reason') || '--'}
                      >
                        <Chip
                          size="small"
                          color={statusColor(selectedOrderDetails?.['payments.paymentStatus'])}
                          sx={{
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            '&.MuiChip-root': { borderRadius: '4px' },
                          }}
                          label={`${selectedOrderDetails?.['payments.paymentStatus']}`}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Payment Type
                    </TableCell>
                    <TableCell align="right">{get(selectedOrderDetails, 'type')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Payment Status Reason
                    </TableCell>
                    <TableCell align="right">
                      {selectedOrderDetails?.['payments.reason'] || '--'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                      Total Order Amount
                    </TableCell>
                    <TableCell align="right">
                      {fCurrency(get(selectedOrderDetails, 'orderAmount') / 100)}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </Table>
          </TableContainer>
          {!isEmpty(selectedOrderDetails) && (
            <>
              <Stack>
                <TableContainer style={{ height: 230 }}>
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
                      {map(get(selectedOrderDetails, 'orderDetails'), (e, index) => (
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
                              {fCurrency(e.price / 100)}
                            </TableCell>
                            <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                              {fCurrency((e.quantity * e.price) / 100)}
                            </TableCell>
                          </TableRow>
                          {e.GSTPercent > 0 && (
                            <TableRow>
                              <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="left">
                                GST {e.GSTPercent}%
                              </TableCell>
                              <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                                {e.quantity}
                              </TableCell>{' '}
                              <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                                --
                              </TableCell>
                              <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                                --
                              </TableCell>
                              <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                                {fCurrency((e.quantity * ((e.price * e.GSTPercent) / 100)) / 100)}
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
                                  sx={{ lineHeight: '1.5', paddingY: '6px' }}
                                  align="center"
                                >
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
                                    {fCurrency(
                                      (d.quantity * ((d.price * d.GSTPercent) / 100)) / 100
                                    )}
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          ))}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Stack
                  flexDirection="row"
                  justifyContent="space-between"
                  px={2}
                  pr={5}
                  mt={1}
                  sx={{ borderTop: '1px dashed #B4B5BB' }}
                >
                  <Typography
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '16px',
                      lineHeight: '2',
                      paddingY: '6px',
                      width: 200,
                    }}
                    align="left"
                  >
                    Grand Total
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '16px',
                      lineHeight: '2',
                      paddingY: '6px',
                    }}
                    align="right"
                  >
                    {fCurrency(get(selectedOrderDetails, 'orderAmount') / 100)}
                  </Typography>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Drawer>
    </Stack>
  );
};

export default ViewMoreDrawer;
