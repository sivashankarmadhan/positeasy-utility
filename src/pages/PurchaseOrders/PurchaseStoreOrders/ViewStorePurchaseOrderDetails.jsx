import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Box,
  Stack,
  Typography,
  Checkbox,
  useTheme,
  Tabs,
  Tab,
  alpha,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import { get, map, isBoolean, reduce, isEmpty, filter, some, find } from 'lodash';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import toast from 'react-hot-toast';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import { useLocation, useParams } from 'react-router';
import {
  hideScrollbar,
  PARTIAL_BILLING_TABS,
  STORE_PURCHASE_ORDER_STATUS,
  PURCHASE_ORDER_PAYMENT_TYPE,
  PURCHASE_ORDER_STATUS_FOR_BTN_GRP,
  ALL_CONSTANT,
  USER_AGENTS,
  STORE_PURCHASE_ORDER_STATUS_FOR_BTN_GRP,
} from 'src/constants/AppConstants';
import { Icon } from '@iconify/react';
import RowContent from 'src/sections/PurchaseOrders/RowContent';
import { dateFormat, formatTime, IndFormat } from 'src/utils/formatTime';
import statusColor, { purchaseOrderStatusColor, storePurchaseOrderStatusColor } from 'src/utils/statusColor';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import AddPaymentForPurchaseOrder from 'src/sections/PurchaseOrders/AddPaymentForPurchaseOrder';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { findIndex } from 'lodash';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import AddProductOrRawMaterialToStore from 'src/sections/PurchaseOrders/AddProductOrRawMaterialToStore';
import AddCardIcon from '@mui/icons-material/AddCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PdfDownload from 'src/PrintPdf/PdfDownload';
import AuthService from 'src/services/authService';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { generateFilename } from 'src/helper/generateFilename';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import {
  alertDialogInformationState,
  currentStoreId,
  currentTerminalId,
} from 'src/global/recoilState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import PRODUCTS_API from 'src/services/products';
import ProductLoader from 'src/components/ProductLoader';
import StoreAddProductOrRawMaterialToStore from 'src/sections/PurchaseOrders/PurchaseOrderStores/StoreAddProductOrRawMaterialToStore';

const ViewStorePurchaseOrderDetails = () => {
  const theme = useTheme();
  const params = useParams();
  const location = useLocation();
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [countersList, setCountersList] = useState([]);
  const [currentTab, setCurrentTab] = useState(PARTIAL_BILLING_TABS.ORDERS);
  const isMobile = useMediaQuery('(max-width:600px)');
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [isLoading, setIsLoading] = useState(false);

  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);

  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState({
    status: false,
    paymentType: PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT,
  });

  const [isOpenProductModal, setIsOpenProductModal] = useState({
    status: false,
    data: {},
  });
  const referenceId = get(params, 'referenceId');

  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState({});

  const getPurchaseOrderDetails = async () => {
    try {
      setIsLoading(true)
      const res = await PurchaseOrderServices.getPurchaseOrderDetails({ referenceId });
      setPurchaseOrderDetails(get(res, 'data'));
      setIsLoading(false)
    } catch (e) {
      setIsLoading(false)
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    getPurchaseOrderDetails();
  }, []);

  const subTotal = reduce(
    get(purchaseOrderDetails, 'purchaseDetails'),
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
    get(purchaseOrderDetails, 'purchaseDetails'),
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

  const finalDeliveryCharges = Number(
    (get(purchaseOrderDetails, 'data.deliveryCharges') || 0) / 100
  );
  const finalDiscount = Number((get(purchaseOrderDetails, 'data.discount') || 0) / 100);

  const totalAmount = (subTotal || 0) + (totalGst || 0) + finalDeliveryCharges - finalDiscount;

  const paymentType = get(purchaseOrderDetails, 'purchaseBills.0.type');

  const currentStatus = get(purchaseOrderDetails, 'data.status');

  const handleChangeTab = (e, value) => {
    setCurrentTab(value);
  };

  const closeModal = () => {
    setIsOpenPaymentModal({
      status: false,
      paymentType: PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT,
    });
  };

  const closeProductModal = () => {
    setIsOpenProductModal({
      status: false,
      data: {},
    });
  };

  const getCurrentStatusIndex = findIndex(STORE_PURCHASE_ORDER_STATUS_FOR_BTN_GRP, (_item) => {
    return get(_item, 'name') === currentStatus;
  });
  const getCounterName = (counterId) => {
    const data = find(countersList, (e) => e.counterId === counterId)?.name;
    return data;
  };

  const changeStatus = async (status, onClose) => {
    try {
      await PurchaseOrderServices.updatePurchaseOrderStatus({
        referenceId,
        status,
      });
      toast.success(`Changed status to ${status}`);
      getPurchaseOrderDetails();
      onClose?.();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const changeStatusWithAlert = ({ status }) => {
    const isNotRevert = [
      STORE_PURCHASE_ORDER_STATUS.CANCELLED,
      STORE_PURCHASE_ORDER_STATUS.RETURN,
      STORE_PURCHASE_ORDER_STATUS.CLOSE,
    ].includes(status);

    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `${isNotRevert ? 'You cannot revert the action.' : ''} ${
        STORE_PURCHASE_ORDER_STATUS.CANCELLED !== status
          ? `Are you sure you want to change the status to ${status}?`
          : 'Are you sure you want to CANCEL the  purchase order?'
      }`,
      actions: {
        primary: {
          text: 'Submit',
          onClick: (onClose) => {
            changeStatus(status, onClose);
          },
          sx: {
            backgroundColor:
              STORE_PURCHASE_ORDER_STATUS.CANCELLED !== status
                ? theme.palette.primary.main
                : theme.palette.error.main,
            '&:hover': {
              backgroundColor:
                STORE_PURCHASE_ORDER_STATUS.CANCELLED !== status
                  ? theme.palette.primary.main
                  : theme.palette.error.main,
            },
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          sx: {
            color: '#000',
          },
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };

  useEffect(() => {
    if (location?.state?.flow === 'bills') {
      setCurrentTab(PARTIAL_BILLING_TABS.PAYMENT_INFO);
    }
  }, [location]);

  const isPartiallyPaidStatus =
    get(STORE_PURCHASE_ORDER_STATUS_FOR_BTN_GRP, `${getCurrentStatusIndex}.name`) ===
    STORE_PURCHASE_ORDER_STATUS.PARTIALLY_PAID;

  const isBilledStatus =
    get(STORE_PURCHASE_ORDER_STATUS_FOR_BTN_GRP, `${getCurrentStatusIndex}.name`) ===
    STORE_PURCHASE_ORDER_STATUS.BILLED;

  const postPayment = async (data, reset) => {
    try {
      await PurchaseOrderServices.payBillsFotPurchaseOrder({
        paymentType: get(data, 'type'),
        mode: get(data, 'mode'),
        ...(get(data, 'amount') ? { amount: get(data, 'amount') } : {}),
        referenceId,
      });
      toast.success(SuccessConstants.PURCHASE_ORDER_PAYMENT_IS_SUCCESSFULLY);
      reset();
      closeModal();
      if (get(data, 'type') === PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT) {
        await changeStatus(STORE_PURCHASE_ORDER_STATUS.CLOSE);
      } else if (
        get(data, 'type') === PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL &&
        currentStatus !== STORE_PURCHASE_ORDER_STATUS.PARTIALLY_PAID
      ) {
        await changeStatus(
          get(STORE_PURCHASE_ORDER_STATUS_FOR_BTN_GRP, `${getCurrentStatusIndex + 1}.name`)
        );
      }
      getPurchaseOrderDetails();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const sumPaidAmount = () => {
    const sum = reduce(
      get(purchaseOrderDetails, 'purchaseBills'),
      function (previousValue, current) {
        return previousValue + (get(current, 'paidAmount') || 0);
      },
      0
    );
    return sum;
  };

  const getProductCounterList = async () => {
    try {
      // setLoading(true);
      const response = await PRODUCTS_API.getProductCounterList(currentStore);
      if (response) setCountersList(response.data);
    } catch (e) {
      setCountersList([]);
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal) getProductCounterList();
  }, [currentStore, currentTerminal]);

  const downloadPdf = async () => {
    try {
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        referenceId,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/${
          location?.state?.storePurchase ? 'intent' : 'purchase'
        }/download-pdf${query}`;
        const filename = generateFilename('Purchase_Order_Report');
        handleCSVDownload({
          url,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${AuthService._getAccessToken()}`,
            deviceid: AuthService.getDeviceId(),
          },
          filename,
        });
      } else {
        if (location?.state?.storePurchase) {
          await PurchaseOrderServices.exportPurchaseStoreOrderAsPdf(options);
        } else {
          await PurchaseOrderServices.exportPurchaseOrderAsPdf(options);

        }
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_PDF);
    }
  };

  const isAtleastStockAddedOne = some(get(purchaseOrderDetails, 'purchaseDetails'), (_item) => {
    return get(_item, 'stockStatus');
  });

  if (isLoading) return <ProductLoader />;


  return (
    <Box m={2}>
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
        <Stack flexDirection="row" gap={3} alignItems="center">
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
              icon={<Icon icon={'ri:currency-fill'} height={22} width={22} color="#5a0b45" />}
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
              backgroundColor: storePurchaseOrderStatusColor(currentStatus)?.bgColor,
              color: storePurchaseOrderStatusColor(currentStatus)?.color,
            }}
            label={currentStatus}
          />
        </Stack>

        <Stack flexDirection="row" gap={2}>
          <Tooltip title="Export pdf">
            <Stack ml={1}>
              <PdfDownload printPdf={downloadPdf} isUnderWeekDatesBol={true} />
            </Stack>
          </Tooltip>

          {paymentType !== PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT &&
            [
              STORE_PURCHASE_ORDER_STATUS.RECEIVED,
              STORE_PURCHASE_ORDER_STATUS.BILLED,
              STORE_PURCHASE_ORDER_STATUS.PARTIALLY_PAID,
            ].includes(currentStatus) && (
              <>
                {isMobile ? (
                  <IconButton
                    onClick={() => {
                      setIsOpenPaymentModal({
                        status: true,
                        paymentType: PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT,
                      });
                    }}
                  >
                    <AddCardIcon />
                  </IconButton>
                ) : (
                  <Button
                    onClick={() => {
                      setIsOpenPaymentModal({
                        status: true,
                        paymentType: PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT,
                      });
                    }}
                    variant="contained"
                    size="medium"
                  >
                    <Typography fontWeight="bold">Payment</Typography>
                  </Button>
                )}
              </>
            )}
        </Stack>
      </Stack>
      {currentTab === PARTIAL_BILLING_TABS.ORDERS && (
        <Box>
          <TableContainer
            component={Paper}
            sx={{ height: isMobile ? 'calc(100vh - 28rem)' : 'calc(100vh - 24.7rem)', mt: 4 }}
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
                    Type
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
                  <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                    Counter name
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.primary.main }} align={'center'} />
                </TableRow>
              </TableHead>
              <TableBody>
                {map(get(purchaseOrderDetails, 'purchaseDetails'), (_item, _index) => {
                  return (
                    <TableRow>
                      <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                        {get(_item, 'name')}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                        {get(_item, 'type')}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                        {get(_item, 'quantity')} {get(_item, 'unit', '')}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                        {toFixedIfNecessary(get(_item, 'price') / 100, 2)}
                      </TableCell>

                      <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                        {get(_item, 'GSTPercent') || '-'}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                        {isBoolean(get(_item, 'GSTInc')) ? (
                          <Checkbox checked={get(_item, 'GSTInc')} disabled />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                        {toFixedIfNecessary((_item?.price / 100) * _item?.quantity, 2)}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                        {getCounterName(get(_item, 'counterId')) || '-'}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                        {!get(_item, 'stockStatus') ? (
                          <IconButton
                            onClick={() => {
                              const filterSameProducts = filter(
                                get(purchaseOrderDetails, 'purchaseDetails'),
                                (_purchaseOrder) => {
                                  return (
                                    get(_purchaseOrder, 'productId') === get(_item, 'productId')
                                  );
                                }
                              );
                              const totalQuantity = reduce(
                                filterSameProducts,
                                function (previousValue, current) {
                                  return previousValue + get(current, 'quantity');
                                },
                                0
                              );

                              setIsOpenProductModal({
                                status: true,
                                data: {
                                  ...(_item || {}),
                                  quantity: totalQuantity,
                                },
                              });
                            }}
                            disabled={
                              ![
                                STORE_PURCHASE_ORDER_STATUS.RECEIVED,
                                STORE_PURCHASE_ORDER_STATUS.BILLED,
                                STORE_PURCHASE_ORDER_STATUS.PARTIALLY_PAID,
                                STORE_PURCHASE_ORDER_STATUS.CLOSE,
                              ].includes(currentStatus)
                            }
                          >
                            <AddHomeWorkIcon />
                          </IconButton>
                        ) : (
                          <Stack flexDirection="row" gap={1}>
                            <CheckCircleIcon sx={{ color: _item.stockStatus === "CANCELLED" ? 'red' : theme.palette.success.main }} />
                            <Typography
                              sx={{ color: _item.stockStatus === "CANCELLED" ? 'red' : theme.palette.success.main, fontWeight: 'bold' }}
                            >
                              {_item.stockStatus === "CANCELLED" ? 'CANCELLED' : 'Stock Added'}
                            </Typography>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            flexDirection={isMobile ? 'column-reverse' : 'row'}
            alignItems="flex-end"
            justifyContent="space-between"
            mt={3}
            gap={isMobile ? 3 : 0}
          >
            <Stack flexDirection="row" gap={2}>
              {![
                STORE_PURCHASE_ORDER_STATUS.CANCELLED,
                STORE_PURCHASE_ORDER_STATUS.RETURN,
                STORE_PURCHASE_ORDER_STATUS.CLOSE,
              ].includes(currentStatus) &&
                !isAtleastStockAddedOne && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      changeStatusWithAlert({ status: STORE_PURCHASE_ORDER_STATUS.CANCELLED });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              {![
                STORE_PURCHASE_ORDER_STATUS.CANCELLED,
                STORE_PURCHASE_ORDER_STATUS.RETURN,
                STORE_PURCHASE_ORDER_STATUS.OPEN,
                STORE_PURCHASE_ORDER_STATUS.CLOSE,
              ].includes(currentStatus) && (
                <ButtonGroup variant="contained">
                  <Button
                    sx={{ cursor: 'not-allowed'}}
                    size="medium"
                    // onClick={() => {
                    //   if (getCurrentStatusIndex !== 0) {
                    //     changeStatusWithAlert({
                    //       status: get(
                    //         STORE_PURCHASE_ORDER_STATUS_FOR_BTN_GRP,
                    //         `${getCurrentStatusIndex - 1}.name`
                    //       ),
                    //     });
                    //   }
                    // }}
                  >
                    <ArrowLeftIcon />
                  </Button>
                  <Typography
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: '#fff',
                      fontWeight: 'bold',
                      pt: 0.7,
                      height: 36,
                      px: 1,
                    }}
                  >
                    {currentStatus}
                  </Typography>
                  <Button
                    sx={
                      getCurrentStatusIndex === STORE_PURCHASE_ORDER_STATUS_FOR_BTN_GRP.length - 1
                        ? {
                            cursor: 'not-allowed',
                          }
                        : {}
                    }
                    size="medium"
                    onClick={() => {
                      if (getCurrentStatusIndex !== STORE_PURCHASE_ORDER_STATUS_FOR_BTN_GRP.length - 1) {
                        if (isPartiallyPaidStatus || isBilledStatus) {
                          setIsOpenPaymentModal({
                            status: true,
                            paymentType: PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL,
                          });
                        } else {
                          changeStatusWithAlert({
                            status: get(
                              STORE_PURCHASE_ORDER_STATUS_FOR_BTN_GRP,
                              `${getCurrentStatusIndex + 1}.name`
                            ),
                          });
                        }
                      }
                    }}
                  >
                    <ArrowRightIcon />
                  </Button>
                </ButtonGroup>
              )}

              {/* TODO: we will use future */}
              {/* {![STORE_PURCHASE_ORDER_STATUS.CANCELLED, STORE_PURCHASE_ORDER_STATUS.RETURN].includes(
                currentStatus
              ) && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    changeStatus(STORE_PURCHASE_ORDER_STATUS.RETURN);
                  }}
                >
                  Return
                </Button>
              )} */}
            </Stack>
            <Stack
              sx={{ background: '#F4F5F7', borderRadius: '5px' }}
              p={2}
              width={isMobile ? '80%' : '50%'}
              spacing={1.5}
            >
              <Stack flexDirection="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '15px' }}>Total No of Orders</Typography>
                <Typography sx={{ fontSize: '15px' }}>{get(purchaseOrderDetails, 'purchaseDetails')?.length}</Typography>
              </Stack>
              {/* <Stack flexDirection="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '15px' }}>GST</Typography>
                <Typography sx={{ fontSize: '15px' }}>{fCurrency(totalGst)}</Typography>
              </Stack>
              {!!get(purchaseOrderDetails, 'data.discount') && (
                <Stack flexDirection="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '15px' }}>Discount</Typography>
                  <Typography sx={{ fontSize: '15px' }}>
                    {fCurrency(get(purchaseOrderDetails, 'data.discount') / 100)}
                  </Typography>
                </Stack>
              )}
              {!!get(purchaseOrderDetails, 'data.deliveryCharges') && (
                <Stack flexDirection="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '15px' }}>Delivery Charges</Typography>
                  <Typography sx={{ fontSize: '15px' }}>
                    {fCurrency(get(purchaseOrderDetails, 'data.deliveryCharges') / 100)}
                  </Typography>
                </Stack>
              )}

              {(get(purchaseOrderDetails, 'purchaseBills')?.at(-1)?.type ===
                PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL ||
                isEmpty(get(purchaseOrderDetails, 'purchaseBills'))) && (
                <Stack flexDirection="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '15px' }}>Balance</Typography>
                  <Typography
                    sx={{ fontWeight: 'bold', fontSize: '15px', color: theme.palette.success.main }}
                  >
                    {fCurrency(
                      get(purchaseOrderDetails, 'purchaseBills')?.at(-1)?.type ===
                        PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL
                        ? Number(toFixedIfNecessary(totalAmount, 2)) - sumPaidAmount() / 100
                        : Number(toFixedIfNecessary(totalAmount, 2))
                    )}
                  </Typography>
                </Stack>
              )} */}

              {/* <Stack flexDirection="row" justifyContent="space-between">
                <Typography sx={{ fontWeight: 'bold', fontSize: '15px' }}>Total</Typography>
                <Typography
                  sx={{ fontWeight: 'bold', fontSize: '15px', color: theme.palette.primary.main }}
                >
                  {fCurrency(toFixedIfNecessary(totalAmount, 2))}
                </Typography>
              </Stack> */}
            </Stack>
          </Stack>
        </Box>
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
            {map(get(purchaseOrderDetails, 'purchaseBills'), (_item) => {
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
                  <RowContent title="Paid Amount" value={fCurrency(_item?.paidAmount / 100)} />
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
      <AddPaymentForPurchaseOrder
        isOpenModal={isOpenPaymentModal}
        closeModal={closeModal}
        postPayment={postPayment}
        orderDetails={purchaseOrderDetails}
      />
      {isOpenProductModal?.status && (
        <StoreAddProductOrRawMaterialToStore
        storeId={location?.state?.storeId}
        isStorePurchase ={true}
          isOpenModal={isOpenProductModal}
          closeModal={closeProductModal}
          getPurchaseOrderDetails={getPurchaseOrderDetails}
        />
      )}
    </Box>
  );
};

export default ViewStorePurchaseOrderDetails;
