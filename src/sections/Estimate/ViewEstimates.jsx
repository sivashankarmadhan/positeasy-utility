import { Helmet } from 'react-helmet-async';
// @mui
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
  Chip,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
// components
import LockIcon from '@mui/icons-material/Lock';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ForwardIcon from '@mui/icons-material/Forward';
import { find, forEach, get, groupBy, isEmpty, map } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { useSettingsContext } from 'src/components/settings';
import {
  ESTIMATE_STATUS,
  EstimateStatusSections,
  PRINT_CONSTANT,
  ROLES_DATA,
  USER_AGENTS,
  hideScrollbar,
} from 'src/constants/AppConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { estimateViewTourConfig } from 'src/constants/TourConstants';
import { convertToRupee } from 'src/helper/ConvertPrice';
import DateHelper from 'src/helper/DateHelper';
import { PATH_DASHBOARD } from 'src/routes/paths';
import STORES_API from 'src/services/stores';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import AuthService from 'src/services/authService';
import PrintIcon from '@mui/icons-material/Print';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  alertDialogInformationState,
  allConfiguration,
  selectedBLE,
  selectedLAN,
  selectedUSB,
} from 'src/global/recoilState';
import { calculateTotalQuantity } from 'src/helper/calculateTotalQuantity';
import BridgeConstants from 'src/constants/BridgeConstants';
import NativeService from 'src/services/NativeService';
import PrinterService from 'src/services/PrinterService';
import ProductLoader from 'src/components/ProductLoader';
import AddIcon from '@mui/icons-material/Add';
import PrintableCart from 'src/components/cart/PrintableCart';
import ElectronService from 'src/services/ElectronService';
import formatPrint from 'src/utils/FormatPrint';
// ----------------------------------------------------------------------

export default function ViewEstimates() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { themeStretch } = useSettingsContext();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [esimationList, setEstimationList] = useState([]);
  const [selected, setSelected] = useState({});
  const defaultBillingKeyStatus = AuthService.getBillingKeyStatus();
  const [isOpenKeyEnter, setIsOpenKeyEnter] = useState(false);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const [currentStatus, setCurrentStatus] = useState(ESTIMATE_STATUS.PENDING);
  const shopName = AuthService.getShopName();
  const address = AuthService.getAddress();
  const isMobile = useMediaQuery('(max-width:800px)');
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole;
  const configuration = useRecoilValue(allConfiguration);
  const printType = get(configuration, 'printType', PRINT_CONSTANT.POS);
  const printMode = get(configuration, 'savePrint', false);
  const printerInfo = get(configuration, 'printInfo.paperSize', PRINT_CONSTANT.POS_BLUETOOTH_80MM);
  const [lastElement, setLastElement] = useState(null);
  const size = 10;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const isBluetooth = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_BLUETOOTH);
  const isLAN = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_LAN);
  const isUSB = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_USB);

  const sizeMap = {
    [PRINT_CONSTANT.POS_BLUETOOTH_80MM]: 48,
    [PRINT_CONSTANT.POS_USB_80MM]: 48,
    [PRINT_CONSTANT.POS_LAN_80MM]: 48,
    [PRINT_CONSTANT.POS_BLUETOOTH_58MM]: 28,
    [PRINT_CONSTANT.POS_USB_58MM]: 28,
    [PRINT_CONSTANT.POS_LAN_58MM]: 28,
    [PRINT_CONSTANT.POS_BLUETOOTH_72MM]: 42,
    [PRINT_CONSTANT.POS_USB_72MM]: 42,
    [PRINT_CONSTANT.POS_LAN_72MM]: 42,
  };
  const selectedBLEPrinter = useRecoilValue(selectedBLE);
  const selectedUSBPrinter = useRecoilValue(selectedUSB);
  const selectedLANPrinter = useRecoilValue(selectedLAN);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const isElectron = ElectronService.isElectron();

  const handleEdit = async (e) => {
    try {
      navigate(PATH_DASHBOARD.createestimate, {
        replace: true,
        state: { ...e, isOldEstimate: true },
      });
    } catch (e) {
      console.log(e);
    }
  };
  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        setPage((no) => no + 1);
      }
    })
  );
  const serializeForPrint = (selected) => {
    const options = [];

    if (isEmpty(get(selected, 'orderDetails', []))) return;
    map(get(selected, 'orderDetails', []), (e) => {
      let serializeAddOn = [];
      map(get(e, 'addOns'), (d) => {
        serializeAddOn.push({
          quantity: d.quantity * e.quantity,
          price: toFixedIfNecessary(d.price / 100, 2),
          name: d.name,
        });
      });
      options.push({
        quantity: e.quantity,
        price: toFixedIfNecessary(e.price / 100, 2),
        addOns: serializeAddOn,
        name: e.name,
        counter: e.counter,
        unit: e.unit ? `${e.unit}${e.unitName}` : '',
      });
    });
    return options;
  };
  const handlePrint = (orderId) => {
    try {
      const sortedData = serializeForPrint(selected);
      const totalQuantity = calculateTotalQuantity(get(selected, 'orderDetails', []));
      const counterWise = groupBy(sortedData, 'counter');
      let printData = {
        orderId: orderId,
        title: shopName,
        subTitle: address,
        items: sortedData,
        itemCounterWise: counterWise,
        totalAmount:
          getTotalPriceWithGST(get(selected, 'orderDetails', [])) -
          calculateTotalGst(get(selected, 'orderDetails', [])),
        footerMain: 'Thank you visit again',
        footer2: '',
        poweredBy: 'powered by Poriyaalar.com',
        totalQty: totalQuantity,
        totalCartItems: !isEmpty(get(selected, 'orderDetails', []))
          ? get(selected, 'orderDetails', []).length
          : 0,
        gstAmount: calculateTotalGst(get(selected, 'orderDetails', [])),
        totalWithGst: getTotalPriceWithGST(get(selected, 'orderDetails', [])),
      };
      if (isAndroid && !isAndroidRawPrint) {
        const nativeRequest = [
          {
            name: BridgeConstants.PRINT,
            data: {
              printerName: 'BlueTooth Printer',
              base64String: printData,
              printerInfo: {
                printType: printerInfo,
                ...(isBluetooth
                  ? {
                      macAddress: get(selectedBLEPrinter, 'macAddress', ''),
                    }
                  : isLAN
                  ? {
                      host: get(selectedLANPrinter, 'host', ''),
                      port: get(selectedLANPrinter, 'port', 0),
                    }
                  : isUSB
                  ? {
                      vendorId: get(selectedUSBPrinter, 'vendorId', ''),
                      productId: get(selectedUSBPrinter, 'productId', ''),
                    }
                  : {}),
              },
            },
          },
        ];
        return NativeService.sendAndReceiveNativeData(nativeRequest).then((response) => {
          const nativeItem = response.filter(
            (responseItem) => responseItem.name === BridgeConstants.PRINT
          );
          return nativeItem[0].data.message;
        });
      } else if (isAndroidRawPrint) {
        const nativeRequest = [
          {
            name: BridgeConstants.PRINT_RAW,
            data: {
              printerName: 'BlueTooth Printer',
              printRawData: formatPrint(printData, sizeMap[printerInfo], false, false),
              printerInfo: {
                printType: printerInfo,
                ...(isBluetooth
                  ? {
                      macAddress: get(selectedBLEPrinter, 'macAddress', ''),
                    }
                  : isLAN
                  ? {
                      host: get(selectedLANPrinter, 'host', ''),
                      port: get(selectedLANPrinter, 'port', 0),
                    }
                  : isUSB
                  ? {
                      vendorId: get(selectedUSBPrinter, 'vendorId', ''),
                      productId: get(selectedUSBPrinter, 'productId', ''),
                    }
                  : {}),
              },
            },
          },
        ];
        NativeService.sendAndReceiveNativeData(nativeRequest)
          .then((response) => {
            console.log('Native response Print', response);
            const nativeItem = response.filter(
              (responseItem) => responseItem.name === BridgeConstants.PRINT_RAW
            );
            return nativeItem[0].data.message;
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        // PrinterService.nodePrint(JSON.stringify(printData));
        if (isElectron) PrinterService.nodePrint();
        else
          setTimeout(() => {
            window.print();
          }, 500);
      }
    } catch (e) {
      console.log('catch', e);
    }
  };

  const handleDelete = async (e, onClose) => {
    try {
      const response = await STORES_API.removeEstimate(get(e, 'estimateId'));
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        getAllEstimates(1);
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getAllEstimates = async (actualPage) => {
    try {
      setLoading(true);
      const options = { status: currentStatus, size, page: actualPage };
      const response = await STORES_API.getAllEstimates(options);
      if (response) {
        if (actualPage === 1) {
          setEstimationList(get(response, 'data.data'));
          setSelected(get(response, 'data.data.0', {}));
          setTotalPages(get(response, 'data.totalPages', 0));
        }
        if (actualPage > 1) {
          setEstimationList((prev) => [...prev, ...get(response, 'data.data')]);
          setTotalPages(get(response, 'data.totalPages', 0));
        }
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
      setEstimationList([]);
      setSelected({});
    }
  };
  const formatAdditionalInfo = (data) => {
    if (isEmpty(data) || !data) return '';
    let formatted = '';
    map(data, (e, index) => {
      if (index === 0) formatted += `${get(e, 'info', '')}`;
      else formatted += `\n${get(e, 'info', '')}`;
    });
    formatted?.replace('\n', '');
    return formatted;
  };

  const getPriceWithGST = (e) => {
    let price = 0;
    if (get(e, 'GSTPercent') > 0) {
      const gst =
        ((Number(convertToRupee(get(e, 'price'))) * Number(get(e, 'GSTPercent'))) / 100) *
        Number(get(e, 'quantity'));
      const amt = Number(convertToRupee(get(e, 'price'))) * Number(get(e, 'quantity'));
      price = amt + gst;
    } else {
      price = Number(convertToRupee(get(e, 'price'))) * Number(get(e, 'quantity'));
    }
    let addOnPrice = 0;
    map(get(e, 'addOns'), (d) => {
      if (get(d, 'GSTPercent') > 0) {
        const gst =
          ((Number(convertToRupee(get(d, 'price'))) * Number(get(d, 'GSTPercent'))) / 100) *
          Number(get(d, 'quantity'));
        const amt = Number(convertToRupee(get(d, 'price'))) * Number(get(d, 'quantity'));
        addOnPrice += amt + gst;
      } else {
        addOnPrice += Number(convertToRupee(get(d, 'price'))) * Number(get(d, 'quantity'));
      }
    });
    return price + addOnPrice;
  };
  const getTotalPriceWithGST = (data) => {
    let total = 0;
    map(data, (e, index) => {
      total += getPriceWithGST(e);
    });
    return total;
  };
  const calculateTotalGst = (data) => {
    let gst = 0;
    map(data, (e) => {
      if (e.GSTPercent > 0) gst += (((e.price / 100) * e.GSTPercent) / 100) * e.quantity;
      map(get(e, 'addOns'), (d) => {
        if (d.GSTPercent > 0)
          gst += (((d.price / 100) * d.GSTPercent) / 100) * d.quantity * e.quantity;
      });
    });
    return gst ? gst : 0;
  };

  const getActualPrice = (curr) => {
    if (!curr) return;
    const check = find(get(selected, 'orderDetails', []), (e) => e.productId === curr);
    if (check) return check.price;
  };
  const getOfferPrice = (curr) => {
    if (!curr) return;
    const check = find(get(selected, 'orderDetails', []), (e) => e.productId === curr);
    if (check) return check.offerPrice;
  };

  const checkOfferCart = (orderDetails) => {
    let a = 0;
    if (isEmpty(orderDetails)) return 0;
    if (!isEmpty(orderDetails)) {
      forEach(orderDetails, (e) => {
        const offerPrice = getOfferPrice(e.productId);

        if (offerPrice) {
          a += (getActualPrice(e.productId) - offerPrice) * e.quantity;
        }
      });

      return a ? a : 0;
    }
  };

  const handleOpenVerificationModal = () => {
    setIsOpenKeyEnter(true);
  };
  const handleClose = () => {
    setIsOpenKeyEnter(false);
  };
  const routeToStores = () => {
    navigate('/dashboard/stores');
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

  useEffect(() => {
    if (currentStatus && page <= totalPages) {
      if (page > 1) getAllEstimates(page);
    }
  }, [page]);
  useEffect(() => {
    if (currentStatus) {
      setPage(1);
      setTotalPages(0);
      getAllEstimates(1);
    }
  }, [currentStatus]);

  const handleChange = (event, newValue) => {
    setCurrentStatus(newValue);
  };

  const statusColor = (status) => {
    if (status === ESTIMATE_STATUS.COMPLETED) {
      return 'success';
    } else if (status === ESTIMATE_STATUS.PENDING) {
      return 'warning';
    } else return 'info';
  };

  const totalOffer = checkOfferCart(get(selected, 'orderDetails', []));
  const totalGST = calculateTotalGst(get(selected, 'orderDetails', []));

  const handleDeleteEstimate = (selected) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to delete estimate ?`,
      actions: {
        primary: {
          text: ' Delete Estimate',
          onClick: (onClose) => {
            handleDelete(selected, onClose);
          },
          sx: {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
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

  if (isLoading) return <LoadingScreen />;

  const AddAndSwitchStoreContent = () => {
    return (
      <Stack>
        <Tabs
          variant="scrollable"
          scrollButtons={false}
          value={currentStatus}
          onChange={handleChange}
          sx={{
            mr: 1,
            '& .MuiTabs-flexContainer': {
              justifyContent: 'space-evenly',
            },
          }}
        >
          {map(EstimateStatusSections, (_item) => (
            <Tab value={_item.status} label={_item.name} />
          ))}
        </Tabs>
        <Autocomplete
          sx={{ width: '100%', mt: 2 }}
          size="small"
          disableClearable
          options={esimationList}
          onChange={(e, val) => setSelected(val)}
          getOptionLabel={(option) =>
            get(option, 'customerInfo.0.name') || get(option, 'estimateId')
          }
          renderOption={(props, option, { selected }) => (
            <li {...props}>{get(option, 'customerInfo.0.name') || get(option, 'estimateId')}</li>
          )}
          filterOptions={(options, { inputValue }) => {
            const trimmedInput = inputValue.trim();
            return options.filter((option) => {
              const nameMatch = option.customerInfo[0]?.name
                .toLowerCase()
                .includes(trimmedInput.toLowerCase());
              const phoneMatch = option.customerInfo[0]?.contactNumber.includes(trimmedInput);
              const IdMatch = option.estimateId.toLowerCase().includes(trimmedInput.toLowerCase());
              return IdMatch || phoneMatch || nameMatch;
            });
          }}
          renderInput={(params) => (
            <TextField
              className="EstimateViewStep1"
              {...params}
              label="Search estimations"
              InputProps={{
                ...params.InputProps,
                type: 'search',
              }}
            />
          )}
        />
      </Stack>
    );
  };

  const sortedData = serializeForPrint();
  const totalQuantity = calculateTotalQuantity(get(selected, 'orderDetails', []));

  return (
    <>
      <Helmet>
        <title> View Estimate | POSITEASY</title>
      </Helmet>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          backgroundColor: '#FFFFFF',
        }}
      >
        <PrintableCart
          totalGST={totalGST}
          totalDiscount={totalOffer}
          sortedData={sortedData}
          totalQuantity={totalQuantity}
          totalValueNoOffer={
            getTotalPriceWithGST(get(selected, 'orderDetails', [])) -
            calculateTotalGst(get(selected, 'orderDetails', []))
          }
          totalOrderValue={getTotalPriceWithGST(get(selected, 'orderDetails', []))}
          printerInfo={printerInfo}
          estimateId={get(selected, 'estimateId')}
        />
      </div>


      <Divider sx={{ border: '0.5px solid #F0F0F0' }} />
      <Stack
        flexDirection="row"
        justifyContent="flex-end"
        mt={2}
        sx={{
          mr: {
            xs: 1.5,
            xl: 7,
            md: 4,
          },
        }}
        id="noprint"
      >
        <Button
          onClick={() => {
            navigate(PATH_DASHBOARD.createestimate);
          }}
          sx={{ width: 100 }}
          variant="contained"
        >
          <AddIcon sx={{ width: 20, height: 20, mr: 0.5 }} />
          <Typography fontWeight="bold">Create</Typography>
        </Button>
      </Stack>
      <Container
        id="noprint"
        className="storesStep1"
        maxWidth={themeStretch ? false : 'xxl'}
        sx={{
          mt: 2,
          mx: 'auto',
          filter:  'blur(10px)',
          pointerEvents: 'none',
          '&.MuiContainer-root': {
            p: 1,
          },
        }}
      >
        {isEmpty(esimationList) && (
          <Typography
            sx={{
              display: 'flex',
              justifyContent: 'right',
              alignItems: 'right',
              color: 'text.secondary',
              fontSize: '20px',
              position: 'absolute',
              top: '50%',
              left: '65%',
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
            }}
          >
            No {currentStatus?.toLowerCase()} estimates
          </Typography>
        )}
        {isMobile && <Box>{AddAndSwitchStoreContent()}</Box>}
        <Stack flexDirection={'row'} gap={2} justifyContent="space-between">
          {!isMobile && (
            <Stack
              gap={2}
              p={2}
              pt={4}
              borderRadius={'8px'}
              sx={{
                border: 0.2,
                borderColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity
                ),
                width: { xs: '40%', md: '32%', sm: '32%', lg: '25%' },
                height: 'calc(100vh - 10rem)',
                overflow: 'auto',
                position: 'relative',
              }}
            >
              {AddAndSwitchStoreContent()}

              <Grid container sx={{ pt: 0, gap: 1, overflow: 'auto', ...hideScrollbar }}>
                {map(esimationList, (e) => (
                  <Grid
                    md={12}
                    xs={12}
                    sm={12}
                    item
                    onClick={() => setSelected(e)}
                    key={get(e, 'estimateId')}
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
                            get(selected, 'estimateId') === get(e, 'estimateId')
                              ? {}
                              : {
                                  backgroundColor: '#E9E9EB',
                                  color: '#000',
                                },
                          ...(get(selected, 'estimateId') === get(e, 'estimateId')
                            ? {
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.common.white,
                              }
                            : {}),
                        }}
                      >
                        <Stack flexDirection={'column'} sx={{ textAlign: 'left' }}>
                          <Typography variant="subtitle1">
                            {get(e, 'customerInfo.0.name')}
                          </Typography>
                          <Typography variant="caption">
                            {get(e, 'customerInfo.0.contactNumber')}
                          </Typography>{' '}
                          <Typography variant="caption">{get(e, 'estimateId')}</Typography>
                        </Stack>
                      </Card>
                    </Tooltip>
                  </Grid>
                ))}
                {loading && <ProductLoader />}

                {page - 1 === totalPages && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'flex', justifyContent: 'center' }}
                  >
                    No more items
                  </Typography>
                )}
              </Grid>
            </Stack>
          )}
          <Stack
            className="EstimateViewStep2"
            borderRadius={'8px'}
            sx={{
              border: 0.1,
              borderColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
              width: { xs: '100%', md: '100%', sm: '100%', lg: '70%' },
              height: 'calc(100vh - 10rem)',
              overflow: 'auto',
              position: 'relative',
              mt: { xs: 2, sm: isMobile ? 2 : 0, md: 0, lg: 0 },
            }}
          >
            <Box p={2}>
              {!isEmpty(selected) && (
                <>
                  <Stack
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      ml: 1,
                      flexDirection: { xs: 'column', sm: 'row' },
                    }}
                  >
                    <Typography variant="h6">Estimation</Typography>

                    <Stack
                      flexDirection={'row'}
                      sx={{
                        display: { xs: 'grid', sm: 'flex' },
                        justifyContent: { xs: 'space-between', sm: 'flex-end' },
                        gap: 2,
                        width: '100%',
                        alignItems: 'center',
                        gridTemplateColumns: '[line-1] 1fr [line-2] 1fr [line-3]',
                      }}
                    >
                      <Tooltip title="Delete estimate">
                        <Button
                          className="EstimateViewStep3"
                          onClick={() => handleDeleteEstimate(selected)}
                          variant="text"
                          startIcon={<DeleteForeverIcon />}
                          sx={{ justifyContent: 'flex-start', display: 'flex' }}
                        >
                          Delete
                        </Button>
                      </Tooltip>

                      {printMode && printType === PRINT_CONSTANT.POS && (
                        <Button
                          // disabled={!isAndroid}
                          startIcon={<PrintIcon />}
                          size="small"
                          onClick={() => {
                            handlePrint(get(selected, 'estimateId'));
                          }}
                          variant="contained"
                        >
                          Reprint
                        </Button>
                      )}
                      {get(selected, 'status', '') === ESTIMATE_STATUS.PENDING && (
                        <Tooltip title="Forward to bill">
                          <Button
                            className="EstimateViewStep4"
                            onClick={() => handleEdit(selected)}
                            variant="contained"
                            size="small"
                            startIcon={<ForwardIcon />}
                            sx={{ textTransform: 'none', whiteSpace: 'nowrap', marginRight: 5.5 }}
                          >
                            Update or Convert
                          </Button>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                  <Stack
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      ml: '8px',
                    }}
                  >
                    <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ minWidth: { xs: 80, sm: 60 } }}>
                        Name
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        : {get(selected, 'customerInfo.0.name', '-')}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ minWidth: { xs: 80, sm: 60 } }}>
                        Contact
                      </Typography>
                      <Typography variant="subtitle2">
                        : {get(selected, 'customerInfo.0.contactNumber', '-')}
                      </Typography>
                    </Stack>
                    {get(selected, 'type') && (
                      <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ minWidth: { xs: 80, sm: 60 } }}>
                          Type
                        </Typography>
                        <Typography variant="subtitle2">: {get(selected, 'type', '-')}</Typography>
                      </Stack>
                    )}
                    {get(selected, 'customCode') && (
                      <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ minWidth: { xs: 80, sm: 60 } }}>
                          Custom
                        </Typography>
                        <Typography variant="subtitle2">
                          : {get(selected, 'codeName') || get(selected, 'customCode')}
                        </Typography>
                      </Stack>
                    )}
                    <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ minWidth: { xs: 80, sm: 60 } }}>
                        Date
                      </Typography>
                      <Typography variant="subtitle2">
                        : {DateHelper.format(get(selected, 'date'))}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ minWidth: { xs: 80, sm: 60 } }}>
                        Estimate No
                      </Typography>
                      <Typography variant="subtitle2">: {get(selected, 'estimateId')} </Typography>
                    </Stack>
                    {map(get(selected, 'customerInfo.0.additionalInfo', []), (h) => (
                      <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ minWidth: { xs: 80, sm: 60 } }}>
                          {get(h, 'customFieldKey')} {console.log(get(h, 'customFieldKey'))}
                        </Typography>
                        <Typography variant="subtitle2">: {get(h, 'customFieldValue')} </Typography>
                      </Stack>
                    ))}{' '}
                    <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ minWidth: { xs: 80, sm: 60 } }}>
                        Status
                      </Typography>
                      :
                      <Chip
                        size="small"
                        color={statusColor(get(selected, 'status', ''))}
                        sx={{
                          ml: 0.5,
                          fontSize: '11px',
                          fontWeight: 600,
                          '&.MuiChip-root': { borderRadius: '4px' },
                        }}
                        label={`${get(selected, 'status', 'Status not found')}`}
                      />
                    </Stack>
                  </Stack>
                </>
              )}
              <Box
                sx={{
                  height: !isEmpty(esimationList) ? 'calc(100vh - 27rem)' : 'calc(100vh - 22rem)',
                  overflowY: 'auto',
                  ...hideScrollbar,
                  overflowX: 'clip',
                }}
              >
                {!isEmpty(selected) && (
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      overflow: 'auto',
                      ...hideScrollbar,
                      p: 0.2,
                      m: 1,
                      ml: '-1px',
                    }}
                  >
                    {map(get(selected, 'orderDetails', []), (e, index) => (
                      <Grid
                        item
                        xs={10}
                        sm={11}
                        md={11}
                        lg={11}
                        xl={11}
                        sx={{
                          border: '1px dashed',
                          borderRadius: 1,
                          m: 1,
                          p: 1,
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                        }}
                      >
                        <Stack flexDirection={'column'}>
                          <Stack
                            flexDirection={'row'}
                            sx={{ display: 'flex', justifyContent: 'space-between' }}
                          >
                            {' '}
                            <Typography variant="subtitle1">{get(e, 'name', '-')}</Typography>
                            <Typography
                              variant="subtitle1"
                              sx={{ color: theme.palette.primary.main }}
                            >
                              {fCurrency(getPriceWithGST(e))}
                            </Typography>
                          </Stack>
                          <Stack
                            flexDirection={'row'}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="caption">{get(e, 'name')}</Typography>
                            <Stack flexDirection={'row'}>
                              <Typography variant="caption">
                                {fCurrency(convertToRupee(get(e, 'price')))}
                              </Typography>
                              <Typography variant="caption" sx={{ mx: 1 }}>
                                x
                              </Typography>
                              <Typography variant="caption">{get(e, 'quantity')}</Typography>
                            </Stack>
                          </Stack>
                          {get(e, 'GSTPercent') > 0 && (
                            <Stack
                              flexDirection={'row'}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Typography variant="caption">GST {get(e, 'GSTPercent')}%</Typography>
                              <Stack flexDirection={'row'}>
                                <Typography variant="caption">
                                  {fCurrency(
                                    (convertToRupee(get(e, 'price')) * get(e, 'GSTPercent')) / 100
                                  )}
                                </Typography>
                                <Typography variant="caption" sx={{ mx: 1 }}>
                                  x
                                </Typography>
                                <Typography variant="caption">{get(e, 'quantity')}</Typography>
                              </Stack>
                            </Stack>
                          )}
                        </Stack>
                        {!isEmpty(get(e, 'addOns')) && (
                          <>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                              Addons:
                            </Typography>
                            {map(get(e, 'addOns'), (h) => (
                              <Stack flexDirection={'column'}>
                                <Stack
                                  flexDirection={'row'}
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Typography variant="caption" sx={{ fontSize: '10px' }}>
                                    {get(h, 'name')}
                                  </Typography>
                                  <Stack flexDirection={'row'}>
                                    <Typography variant="caption" sx={{ fontSize: '10px' }}>
                                      {fCurrency(convertToRupee(get(h, 'price')))}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: '10px', mx: 1 }}>
                                      x
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: '10px' }}>
                                      {get(h, 'quantity')}
                                    </Typography>
                                  </Stack>
                                </Stack>
                                {get(h, 'GSTPercent') > 0 && (
                                  <Stack
                                    flexDirection={'row'}
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Typography variant="caption" sx={{ fontSize: '10px' }}>
                                      Addon- GST {get(h, 'GSTPercent')}%
                                    </Typography>
                                    <Stack flexDirection={'row'}>
                                      <Typography variant="caption" sx={{ fontSize: '10px' }}>
                                        {fCurrency(
                                          (convertToRupee(get(h, 'price')) * get(h, 'GSTPercent')) /
                                            100
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ fontSize: '10px', mx: 1 }}
                                      >
                                        x
                                      </Typography>
                                      <Typography variant="caption" sx={{ fontSize: '10px' }}>
                                        {get(h, 'quantity')}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                )}
                              </Stack>
                            ))}
                          </>
                        )}
                      </Grid>
                    ))}
                    {get(selected, 'additionalInfo.0.info') && (
                      <Grid
                        item
                        xs={10}
                        sm={11}
                        md={11}
                        lg={5.6}
                        xl={3.7}
                        sx={{
                          border: '1px dashed',
                          borderRadius: 1,
                          m: 1,
                          p: 1,
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                        }}
                      >
                        <Stack flexDirection={'column'}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            Additional Information
                          </Typography>
                          {map(get(selected, 'additionalInfo', []), (e) => (
                            <Typography variant="caption">- {get(e, 'info', '')}</Typography>
                          ))}
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Box>
            </Box>

            <Divider sx={{ border: '0.5px solid #F0F0F0' }} />
            <Stack
              className="EstimateViewStep6"
              sx={{
                gap: { xs: 1, sm: 2 },
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                mt: { xs: 1, sm: 8 },
                flexDirection: { xs: 'column', sm: 'row' },
                pt: { xs: 2, sm: 0 },
                mb: 5,
              }}
              px={2}
              pb={2}
            >
              <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ minWidth: 120 }}>
                  Total Items
                </Typography>
                <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
                  :{' '}
                  {!isEmpty(get(selected, 'orderDetails', []))
                    ? get(selected, 'orderDetails', []).length
                    : 0}
                </Typography>
              </Stack>
              <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ minWidth: 120 }}>
                  Total GST
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                  : {fCurrency(calculateTotalGst(get(selected, 'orderDetails', [])))}
                </Typography>
              </Stack>

              <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ minWidth: 120 }}>
                  Total amount
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                  : {fCurrency(getTotalPriceWithGST(get(selected, 'orderDetails', [])))}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Container>
      <TakeATourWithJoy config={estimateViewTourConfig} />
    </>
  );
}
