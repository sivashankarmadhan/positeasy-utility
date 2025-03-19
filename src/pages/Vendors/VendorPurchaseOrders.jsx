// @mui
import {
  Box,
  Card,
  Container,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
  IconButton,
  Chip,
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Checkbox,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// components
import { Icon } from '@iconify/react';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { find, forEach, get, isEmpty, lowerCase, map, reduce, isBoolean, omit } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { useSettingsContext } from 'src/components/settings';
import {
  ORDER_STATUS,
  OrderStatusSections,
  PARTIAL_BILLING_TABS,
  PRINT_CONSTANT,
  USER_AGENTS,
  hideScrollbar,
  ORDER_TYPE,
  PURCHASE_ORDER_PAYMENT_TYPE,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import {
  alertDialogInformationState,
  allConfiguration,
  billingProducts,
  currentStoreId,
  currentTerminalId,
  selectedBLE,
  selectedLAN,
  selectedUSB,
} from 'src/global/recoilState';
import { convertToRupee } from 'src/helper/ConvertPrice';
import AuthService from 'src/services/authService';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import PRODUCTS_API from 'src/services/products';
import { calculateTotalQuantity } from 'src/helper/calculateTotalQuantity';
import BridgeConstants from 'src/constants/BridgeConstants';
import NativeService from 'src/services/NativeService';
import PrinterService from 'src/services/PrinterService';
import ElectronService from 'src/services/ElectronService';
import {
  dateFormat,
  fDatesWithTimeStampFromUtc,
  fDatesWithTimeStampWithDayjs,
  fDateTime,
  formatTime,
  IndFormat,
} from 'src/utils/formatTime';
import formatAdditionalInfo from 'src/utils/formatAdditionalInfo';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import formatPrint from 'src/utils/FormatPrint';
import { currentEndDate, currentStartDate } from 'src/global/recoilState';
import PAYMENT_API from 'src/services/payment';
import RouterConstants from 'src/constants/RouterConstants';
import { filterShortCode } from 'src/helper/filterShortCode';
import uuid from 'react-uuid';
import VendorServices from 'src/services/API/VendorServices';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import RowContent from 'src/sections/PurchaseOrders/RowContent';
import statusColor, { purchaseOrderStatusColor } from 'src/utils/statusColor';

// ----------------------------------------------------------------------

function VendorPurchaseOrders() {
  const params = useParams();
  const vendorId = get(params, 'vendorId');

  const [orderList, setOrderList] = useState([]);

  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedList, setSelectedList] = useState({});

  const size = 10;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({});

  const isInitialRender = useRef(true);

  const theme = useTheme();
  const navigate = useNavigate();

  const { themeStretch } = useSettingsContext();

  const [isLoading, setIsLoading] = useState(false);

  const isMinWidth900px = useMediaQuery('(min-width:900px)');
  const isMobile = useMediaQuery('(max-width:600px)');

  const configuration = useRecoilValue(allConfiguration);

  const [lastElement, setLastElement] = useState(null);
  const [currentTab, setCurrentTab] = useState(PARTIAL_BILLING_TABS.ORDERS);

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        setPage((no) => no + 1);
      }
    })
  );

  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = observer.current;
    if (currentElement) {
      currentObserver.observe(currentElement);
    }
    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastElement]);

  const getPriceWithGST = (e) => {
    const { gstPercentageValue, withoutGstAmount } = getTotalPriceAndGst({
      price: e?.price,
      GSTPercent: e?.GSTPercent,
      GSTInc: e?.GSTInc,
      fullData: e,
    });

    let price = 0;
    if (get(e, 'GSTPercent') > 0) {
      const gst = (gstPercentageValue / 100) * Number(get(e, 'quantity'));
      const amt = (withoutGstAmount / 100) * Number(get(e, 'quantity'));
      price = amt + gst;
    } else {
      price = (withoutGstAmount / 100) * Number(get(e, 'quantity'));
    }
    let addOnPrice = 0;
    map(get(e, 'addOns'), (d) => {
      const { gstPercentageValue, withoutGstAmount } = getTotalPriceAndGst({
        price: d?.price,
        GSTPercent: d?.GSTPercent,
        GSTInc: d?.GSTInc,
        fullData: d,
      });

      if (get(d, 'GSTPercent') > 0) {
        const gst = (gstPercentageValue / 100) * Number(get(d, 'quantity'));
        const amt = (withoutGstAmount / 100) * Number(get(d, 'quantity'));
        addOnPrice += amt + gst;
      } else {
        addOnPrice += (withoutGstAmount / 100) * Number(get(d, 'quantity'));
      }
    });
    return price + addOnPrice;
  };
  const getTotalPriceWithGST = (data) => {
    let total = 0;
    map(data, (e, index) => {
      total += getPriceWithGST(e);
    });
    return total || 0;
  };

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
    console.log('orderDetails', orderDetails);
    if (isEmpty(orderDetails)) return 0;
    let totalPrice = 0;
    map(orderDetails, (e) => {
      if (isEmpty(e.addOn)) {
        totalPrice += getActualPrice(e.productId, orderDetails) * e.quantity;
      } else if (!isEmpty(e.addOn)) {
        let totalAddonPrice = 0;
        map(e.addOn, (d) => {
          totalAddonPrice += d.price * d.quantity;
        });
        totalPrice += getActualPrice(e.productId, orderDetails) + totalAddonPrice * e.quantity;
      }
    });
    return totalPrice;
  };

  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = observer.current;
    if (currentElement) {
      currentObserver.observe(currentElement);
    }
    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastElement]);

  const getOrderList = async ({ newTotalPage, newPage }) => {
    if (!!newTotalPage && !!page && newTotalPage < page) {
      return;
    }

    try {
      let res = await VendorServices.getVendorPurchaseOrdersList({
        size,
        page: newPage,
        vendorId: vendorId,
      });

      if (newPage === 1) {
        setOrderList(get(res, 'data.data'));
        setTotalPages(get(res, 'data.totalPages'));
      } else {
        setOrderList((prev) => [...(prev || []), ...(get(res, 'data.data') || [])]);
      }
    } catch (error) {
      console.log('error', error);
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_GET_ORDERS_LIST);
    }
  };

  const getOrderDetails = async () => {
    try {
      const orderDetailsRes = await PurchaseOrderServices.getPurchaseOrderDetails({
        referenceId: selectedList?.referenceId,
      });
      setOrderDetails({
        ordersInfo: get(orderDetailsRes, 'data.purchaseDetails'),
        paymentsInfo: get(orderDetailsRes, 'data.purchaseBills'),
        meta: omit(get(orderDetailsRes, 'data'), ['purchaseDetails', 'purchaseBills']),
      });
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_GET_ORDER_DETAILS);
    }
  };

  useEffect(() => {
    getOrderList({ newTotalPage: totalPages, newPage: page });
  }, [page]);

  useEffect(() => {
    if (!isInitialRender.current) {
      if (page === 1) {
        setSelectedList({});
        setTotalPages(null);
        setCurrentTab(PARTIAL_BILLING_TABS.ORDERS);
        setOrderList([]);
        getOrderList({ newTotalPage: null, newPage: page });
      } else {
        setPage(1);
        setSelectedList({});
        setTotalPages(null);
        setOrderList([]);
        setCurrentTab(PARTIAL_BILLING_TABS.ORDERS);
      }
    } else {
      isInitialRender.current = false;
    }
    setShowOrderDetails(false);
  }, [currentStore, currentTerminal]);

  useEffect(() => {
    return () => {
      isInitialRender.current = true;
    };
  }, []);

  useEffect(() => {
    if (!isEmpty(selectedList)) {
      getOrderDetails();
    } else {
      setOrderDetails([]);
    }
  }, [selectedList]);

  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = observer.current;
    if (currentElement) {
      currentObserver.observe(currentElement);
    }
    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastElement]);

  const handleChangeTab = (e, value) => {
    setCurrentTab(value);
  };

  const getCustomerDetails = async () => {
    const customerId = get(orderDetails, 'ordersInfo.customerId');
    if (!customerId) {
      setCustomerDetails({});
      return;
    }
    try {
      const res = await PRODUCTS_API.getCustomerDetails({
        customerId,
      });
      setCustomerDetails(get(res, 'data', {}));
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    getCustomerDetails();
  }, [orderDetails]);

  const subTotal = reduce(
    get(orderDetails, 'ordersInfo'),
    (_acc, curr) => {
      return (
        getTotalPriceAndGst({
          price: (get(curr, 'price') / 100) * get(curr, 'quantity'),
          GSTPercent: get(curr, 'GSTPercent'),
          GSTInc: get(curr, 'GSTInc'),
          fullData: curr,
        })?.withoutGstAmount + _acc
      );
    },
    0
  );

  const totalGst = reduce(
    get(orderDetails, 'ordersInfo'),
    (_acc, curr) => {
      return (
        getTotalPriceAndGst({
          price: (get(curr, 'price') / 100) * get(curr, 'quantity'),
          GSTPercent: get(curr, 'GSTPercent'),
          GSTInc: get(curr, 'GSTInc'),
          fullData: curr,
        })?.gstPercentageValue + _acc
      );
    },
    0
  );

  const finalDeliveryCharges = Number((get(orderDetails, 'meta.data.deliveryCharges') || 0) / 100);
  const finalDiscount = Number((get(orderDetails, 'meta.data.discount') || 0) / 100);

  const totalAmount = (subTotal || 0) + (totalGst || 0) + finalDeliveryCharges - finalDiscount;

  const currentStatus = get(orderDetails, 'meta.data.status');

  console.log('orderDetails', orderDetails);

  const orderListContent = () => {
    return (
      <Grid container sx={{ pt: 0, gap: 1, overflow: 'auto', ...hideScrollbar }}>
        <Typography
          sx={{
            fontWeight: 'bold',
            fontSize: '20px',
          }}
          mb={1}
        >
          Orders List
        </Typography>
        {map(orderList, (_order, _index) => {
          return (
            <Grid
              md={12}
              xs={12}
              sm={12}
              item
              onClick={() => {
                setSelectedList(_order);
                setShowOrderDetails(true);
              }}
              key={_index}
              sx={{ p: 0.2 }}
              ref={setLastElement}
            >
              <Tooltip title={`Click to select `}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    p: 0.5,
                    pl: 2,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover':
                      get(selectedList, 'purchaseId') === _order?.purchaseId
                        ? {}
                        : {
                            backgroundColor: '#E9E9EB',
                            color: '#000',
                          },
                    ...(get(selectedList, 'purchaseId') === _order?.purchaseId
                      ? {
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.common.white,
                        }
                      : {}),
                  }}
                >
                  <Stack flexDirection={'column'} sx={{ textAlign: 'left', width: '100%' }}>
                    <Stack
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      {' '}
                      <Typography sx={{ fontWeight: 'bold' }}>
                        <span style={{ fontSize: '12px' }}>Purchase ID #</span>
                        <span style={{ fontSize: '15px' }}>{get(_order, 'purchaseId')}</span>
                      </Typography>
                      <Typography sx={{ fontSize: '15px', fontWeight: 'bold', mr: 1 }}>
                        {fCurrency(convertToRupee(get(_order, 'amount', 0)))}
                      </Typography>
                    </Stack>
                    <Stack
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography variant="caption">
                        {fDatesWithTimeStampWithDayjs(get(_order, 'date'))}
                      </Typography>
                      <Chip
                        sx={{
                          color: '#5A0A45',
                          backgroundColor: '#DECFDA',
                          fontSize: '9px',
                          height: '17px',
                          visibility: get(_order, 'name') ? 'visible' : 'hidden',
                          fontWeight: 'bold',
                        }}
                        label={get(_order, 'name')}
                      />
                    </Stack>
                  </Stack>
                </Card>
              </Tooltip>
            </Grid>
          );
        })}
        {/* {loading && <ProductLoader />} */}

        {!!totalPages && !!page && totalPages < page && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            No more items
          </Typography>
        )}
      </Grid>
    );
  };

  const renderBackIcon = () => {
    return (
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          backgroundColor: 'lightgray',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={() => {
          setShowOrderDetails(false);
        }}
      >
        <ArrowBackIcon color="primary" fontSize="small" />
      </Box>
    );
  };

  const sumPaidAmount = () => {
    const sum = reduce(
      get(orderDetails, 'paymentsInfo'),
      function (previousValue, current) {
        return previousValue + (get(current, 'paidAmount') || 0);
      },
      0
    );
    return sum;
  };

  const renderOrderDetails = () => (
    <Stack
      className="OrdersViewStep2"
      borderRadius={'20px'}
      sx={{
        border: 0.1,
        borderColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        width: { xs: '100%', md: '100%', sm: '100%', lg: '75%' },
        height: 'calc(100vh - 7rem)',
        overflow: 'hidden',
        position: 'relative',
        // p: 2,
        mt: { xs: 2, sm: isMobile ? 2 : 0, md: 0, lg: 0 },
      }}
    >
      {isEmpty(orderDetails) && (
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: '20px',
            m: 'auto',
            position: 'absolute',
            top: '65%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'nowrap',
          }}
        >
          Please select an order to view details.
        </Typography>
      )}
      <Box p={isMobile ? 0.5 : 2}>
        {!isEmpty(orderDetails) && (
          <>
            <Stack
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                mb: 2,
                flexDirection: 'column',
              }}
            >
              <Stack flexDirection={'column'} sx={{ width: '100%' }}>
                {!isEmpty(orderDetails) && (
                  <Stack
                    direction="row"
                    gap={isMobile ? 2 : 0}
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      {isMobile && renderBackIcon()}
                      <Tabs
                        variant="scrollable"
                        scrollButtons={false}
                        value={currentTab}
                        onChange={handleChangeTab}
                        allowScrollButtonsMobile
                      >
                        <Tab
                          icon={
                            <Icon
                              icon={'icon-park-solid:transaction-order'}
                              height={22}
                              width={22}
                              color="#5a0b45"
                            />
                          }
                          value={PARTIAL_BILLING_TABS.ORDERS}
                          label={'Orders'}
                        />
                        <Tab
                          icon={
                            <Icon
                              icon={'ri:currency-fill'}
                              height={22}
                              width={22}
                              color="#5a0b45"
                            />
                          }
                          value={PARTIAL_BILLING_TABS.PAYMENT_INFO}
                          label={'Payment Info'}
                        />
                      </Tabs>

                      <Chip
                        size="small"
                        sx={{
                          ml: 0.5,
                          fontSize: '11px',
                          fontWeight: 800,
                          '&.MuiChip-root': { borderRadius: '4px' },
                          backgroundColor: purchaseOrderStatusColor(currentStatus)?.bgColor,
                          color: purchaseOrderStatusColor(currentStatus)?.color,
                        }}
                        label={currentStatus}
                      />
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Stack>
            {currentTab === PARTIAL_BILLING_TABS.ORDERS && (
              <Stack justfiyContent="space-between">
                <Stack
                  justifyContent="space-between"
                  sx={{
                    // height: !isMinWidth900px ? 'calc(100vh - 22rem)' : 'calc(100vh - 20rem)',
                    overflowY: 'auto',
                    ...hideScrollbar,
                  }}
                >
                  <Box>
                    <TableContainer
                      component={Paper}
                      sx={{
                        height: isMobile ? 'calc(100vh - 30rem)' : 'calc(100vh - 30.5rem)',
                        mt: 1,
                      }}
                    >
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow
                            sx={{
                              '& .MuiTableCell-head': {
                                background: theme.palette.primary.lighter,
                              },
                            }}
                          >
                            <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                              Name
                            </TableCell>
                            <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                              Quantity
                            </TableCell>
                            <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                              Unit price (₹)
                            </TableCell>
                            <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                              GSTPercent
                            </TableCell>
                            <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                              GSTInc
                            </TableCell>
                            <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                              Amount (₹)
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {map(get(orderDetails, 'ordersInfo'), (_item, _index) => {
                            return (
                              <TableRow>
                                <TableCell
                                  sx={{ color: theme.palette.primary.main }}
                                  align={'center'}
                                >
                                  {get(_item, 'name')}
                                </TableCell>
                                <TableCell
                                  sx={{ color: theme.palette.primary.main }}
                                  align={'center'}
                                >
                                  {get(_item, 'quantity')}
                                </TableCell>
                                <TableCell
                                  sx={{ color: theme.palette.primary.main }}
                                  align={'center'}
                                >
                                  {toFixedIfNecessary(get(_item, 'price') / 100, 2)}
                                </TableCell>

                                <TableCell
                                  sx={{ color: theme.palette.primary.main }}
                                  align={'center'}
                                >
                                  {get(_item, 'GSTPercent') || '-'}
                                </TableCell>
                                <TableCell
                                  sx={{ color: theme.palette.primary.main }}
                                  align={'center'}
                                >
                                  {isBoolean(get(_item, 'GSTInc')) ? (
                                    <Checkbox checked={get(_item, 'GSTInc')} disabled />
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell
                                  sx={{ color: theme.palette.primary.main }}
                                  align={'center'}
                                >
                                  {toFixedIfNecessary(
                                    (get(_item, 'price') / 100) * get(_item, 'quantity'),
                                    2
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Stack flexDirection="row" justifyContent="flex-end" mt={5}>
                      <Stack
                        sx={{ background: '#F4F5F7', borderRadius: '5px' }}
                        p={2}
                        width={isMobile ? '80%' : '50%'}
                        spacing={1.5}
                      >
                        <Stack flexDirection="row" justifyContent="space-between">
                          <Typography sx={{ fontSize: '15px' }}>Sub Total</Typography>
                          <Typography sx={{ fontSize: '15px' }}>{fCurrency(subTotal)}</Typography>
                        </Stack>
                        <Stack flexDirection="row" justifyContent="space-between">
                          <Typography sx={{ fontSize: '15px' }}>GST</Typography>
                          <Typography sx={{ fontSize: '15px' }}>{fCurrency(totalGst)}</Typography>
                        </Stack>

                        {!!finalDiscount && (
                          <Stack flexDirection="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: '15px' }}>Discount</Typography>
                            <Typography sx={{ fontSize: '15px' }}>
                              {fCurrency(finalDiscount)}
                            </Typography>
                          </Stack>
                        )}
                        {console.log('orderDetails', orderDetails)}
                        {!!finalDeliveryCharges && (
                          <Stack flexDirection="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: '15px' }}>Delivery Charges</Typography>
                            <Typography sx={{ fontSize: '15px' }}>
                              {fCurrency(finalDeliveryCharges)}
                            </Typography>
                          </Stack>
                        )}

                        {console.log('orderDetails', orderDetails)}

                        {(get(orderDetails, 'paymentsInfo')?.at(-1)?.type ===
                          PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL ||
                          isEmpty(get(orderDetails, 'paymentsInfo'))) && (
                          <Stack flexDirection="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: '15px' }}>Balance</Typography>
                            <Typography
                              sx={{
                                fontWeight: 'bold',
                                fontSize: '15px',
                                color: theme.palette.success.main,
                              }}
                            >
                              {fCurrency(
                                get(orderDetails, 'paymentsInfo')?.at(-1)?.type ===
                                  PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL
                                  ? totalAmount - sumPaidAmount() / 100
                                  : totalAmount
                              )}
                            </Typography>
                          </Stack>
                        )}

                        <Stack flexDirection="row" justifyContent="space-between">
                          <Typography sx={{ fontWeight: 'bold', fontSize: '15px' }}>
                            Total
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '15px',
                              color: theme.palette.primary.main,
                            }}
                          >
                            {fCurrency(totalAmount)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            )}
            {currentTab === PARTIAL_BILLING_TABS.PAYMENT_INFO && (
              <Box
                sx={{
                  height: 'calc(100vh - 10.2rem)',
                  overflowY: 'auto',
                  ...hideScrollbar,
                  overflowX: 'clip',
                }}
              >
                <Stack gap={2}>
                  {map(get(orderDetails, 'paymentsInfo'), (_item) => {
                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 1.5,
                          px: 1.5,
                          py: 2.5,
                          my: 1,
                          mx: 2,
                          border: '1px dashed',
                          borderRadius: 1,
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                        }}
                      >
                        <RowContent title="Reference ID" value={get(_item, 'referenceId')} isCopy />
                        <RowContent title="Payment ID" value={get(_item, 'paymentId')} isCopy />
                        <RowContent title="Date" value={dateFormat(get(_item, 'createdAt'))} />
                        <RowContent title="time" value={formatTime(get(_item, 'createdAt'))} />
                        <RowContent title="Gateway Pay ID" value={_item?.gatewayPayId} />
                        <RowContent title="Gateway Source" value={_item?.gatewaySource} />
                        <RowContent title="Payment Mode" value={_item?.mode} />
                        <RowContent
                          title="Paid Amount"
                          value={fCurrency(_item?.paidAmount / 100)}
                        />
                        <RowContent
                          title="Payment Status"
                          value={_item?.paymentStatus}
                          chipColor={statusColor(_item?.paymentStatus)}
                          isChip
                        />
                        <RowContent title="Payment Type" value={_item?.type} />
                        <RowContent title="Reason" value={_item?.reason} />
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Box>
    </Stack>
  );

  function renderMobileViewContent() {
    return (
      <>
        {!showOrderDetails && (
          <Stack
            gap={2}
            p={2}
            borderRadius={'20px'}
            sx={{
              border: 0.2,
              borderColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
              width: '100%',
              height: 'calc(100vh - 10rem)',
              position: 'relative',
            }}
          >
            {orderListContent()}
          </Stack>
        )}
        {showOrderDetails && renderOrderDetails()}
      </>
    );
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Container
        id="noprint"
        className="storesStep1"
        maxWidth={themeStretch ? false : 'xxl'}
        sx={{
          mt: 1,
          '&.MuiContainer-root': {
            p: 1,
          },
        }}
      >
        {!isMobile && (
          <Stack flexDirection={'row'} gap={2} justifyContent="space-between">
            <Stack
              gap={2}
              p={2}
              borderRadius={'20px'}
              sx={{
                border: 0.2,
                borderColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity
                ),
                width: { xs: '100%', md: '32%', sm: '60%', lg: '25%' },
                height: 'calc(100vh - 7rem)',
                overflow: 'auto',
                position: 'relative',
              }}
            >
              {orderListContent()}
            </Stack>
            {renderOrderDetails()}
          </Stack>
        )}
        {isMobile && renderMobileViewContent()}
      </Container>
    </>
  );
}

export default VendorPurchaseOrders;
