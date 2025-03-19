import BluetoothIcon from '@mui/icons-material/Bluetooth';
import LanIcon from '@mui/icons-material/Lan';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncIcon from '@mui/icons-material/Sync';
import UsbIcon from '@mui/icons-material/Usb';
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Typography,
  useTheme,
  TextField,
  Grid,
  ListItem,
  List,
  ListItemText,
} from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { filter, get, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import AddPrintInformation from 'src/components/AddPrintInformation';
import {
  ALL_CONSTANT,
  DEFAULT_BLUETOOTH_PRINT_CONNECTION,
  PRINT_CONSTANT,
  SettingsSections,
  USER_AGENTS,
} from 'src/constants/AppConstants';
import BridgeConstants from 'src/constants/BridgeConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import RouterConstants from 'src/constants/RouterConstants';
import { StorageConstants } from 'src/constants/StorageConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { SelectedSection } from 'src/global/SettingsState';
import {
  allConfiguration,
  currentStoreId,
  currentTerminalId,
  selectedBLE,
  selectedLAN,
  selectedUSB,
} from 'src/global/recoilState';
import ObjectStorage from 'src/modules/ObjectStorage';
import SettingServices from 'src/services/API/SettingServices';
import NativeService from 'src/services/NativeService';
import PrinterService from 'src/services/PrinterService';
import AuthService from 'src/services/authService';
import getFirstTerminalIdInAll from 'src/helper/getFirstTerminalId';
import KOTPrinter from './KOTPrinter';
export default function Printer() {
  const theme = useTheme();
  const navigate = useNavigate();
  const setSection = useSetRecoilState(SelectedSection);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const printMode = get(configuration, 'savePrint', false);
  const isFeedback = get(configuration, 'isFeedback', false);
  const printType = get(configuration, 'printType', PRINT_CONSTANT.POS);
  const [usbPrinters, setUSBPrinters] = useState([]);
  const [blePrinters, setBlePrinters] = useState([]);
  const isOrderTypeEnable = get(configuration, 'isOrderType.isActive', false);
  const [selectedUSBPrinter, setSelectedUSBPrinter] = useRecoilState(selectedUSB);
  const [selectedBLEPrinter, setSelectedBLEPrinter] = useRecoilState(selectedBLE);
  const [selectedLANPrinter, setSelectedLANPrinter] = useRecoilState(selectedLAN);
  const [lanPrinter, setLanPrinter] = useState(selectedLANPrinter);
  const [openInformation, setOpenInformation] = useState(false);
  const [isNormalPrintTab, setIsNormalPrintTab] = useState(true);

  const shopName = AuthService.getShopName();
  const [value, setValue] = useState('TOP');
  const PrintInfoInConfig = get(configuration, 'printInfo');

  const printInformationData = get(configuration, 'printInfo.printInformation');
  const isMobile = useMediaQuery('(max-width:600px)');
  const handleOpenPrintInformation = () => {
    setOpenInformation(true);
  };
  const handleClosePrintInformation = () => {
    setOpenInformation(false);
  };
  const printerInfo = get(configuration, 'printInfo.paperSize', PRINT_CONSTANT.POS_BLUETOOTH_80MM);
  const handleSelectUSBPrinter = (data) => {
    const printer = { vendorId: get(data, 'vendor_id'), productId: get(data, 'product_id') };
    setSelectedUSBPrinter(printer);
    ObjectStorage.setItem(StorageConstants.SELETED_USB_PRINTER, printer);
  };
  const handleSelectBLEPrinter = (data) => {
    const printer = { macAddress: get(data, 'inner_mac_address') };
    setSelectedBLEPrinter(printer);
    ObjectStorage.setItem(StorageConstants.SELETED_BLE_PRINTER, printer);
  };
  const handleSelectLANPrinter = (data) => {
    const printer = {
      host: get(data, 'host'),
      port: Number(get(data, 'port')),
    };
    setSelectedLANPrinter(printer);
    ObjectStorage.setItem(StorageConstants.SELETED_LAN_PRINTER, printer);
    toast.success('Printer Saved');
  };
  const isPos_ble = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_BLUETOOTH);
  const isPos_LAN = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_LAN);
  const isPos_usb = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_USB);

  const isMinWidth900px = useMediaQuery('(min-width:900px)');
  const bluetoothConnectionType = get(
    configuration,
    'printInfo.bluetoothPrintConnectionSettings.keepConnection',
    DEFAULT_BLUETOOTH_PRINT_CONNECTION.DEFAULT
  );
  const initialFetch = async () => {
    if (!currentStore && !currentTerminal) return;
    try {
      const resp = await SettingServices.getPrintConfiguration();
      if (resp) {
        console.log('configurationnnn', configuration, get(resp, 'data.0'));

        setConfiguration({
          ...(configuration || {}),
          ...(get(resp, 'data.0') || {}),
        });
      }
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handlePostPrintMode = async (isType, type, printInfo) => {
    try {
      const options = {
        ...configuration,
        savePrint: isType || printInfo ? printMode : !printMode,
        printType: isType ? type : printType,
        ...(printInfo
          ? {
              printInfo: {
                ...PrintInfoInConfig,
                ...(isType && type === PRINT_CONSTANT.PDF
                  ? {}
                  : isType && type === PRINT_CONSTANT.POS
                  ? { paperSize: PRINT_CONSTANT.POS_USB_80MM }
                  : { paperSize: printInfo }),
                printInformation: printInformationData,
              },
            }
          : {
              printInfo: {
                ...PrintInfoInConfig,
                ...(isType && type === PRINT_CONSTANT.PDF
                  ? {}
                  : isType && type === PRINT_CONSTANT.POS
                  ? { paperSize: PRINT_CONSTANT.POS_USB_80MM }
                  : { paperSize: printerInfo }),
                printInformation: printInformationData,
              },
            }),
      };
      console.log('options', options);
      await SettingServices.postPrintMode(options);
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
    }
  };
  const handleChangeDefaultPrint = (event) => {
    handlePostPrintMode(true, event.target.value);
  };
  const handleOptionChange = (event) => {
    handlePostPrintMode(false, '', event.target.value);
  };

  const getUSBPrinterList = async () => {
    if (window.navigator.userAgent.includes(USER_AGENTS.REACT_NATIVE)) {
      const nativeRequest = [
        {
          name: BridgeConstants.USB_DEVICE_LIST,
          data: { printerType: printerInfo },
        },
      ];
      NativeService.sendAndReceiveNativeData(nativeRequest)
        .then((response) => {
          const nativeItem = response.filter(
            (responseItem) => responseItem.name === BridgeConstants.USB_DEVICE_LIST
          );
          if (get(nativeItem, '0.data')) {
            setUSBPrinters(get(nativeItem, '0.data.deviceList', []));
          }
          if (get(nativeItem, '0.error')) {
            toast.error(get(nativeItem, '0.error.message', []));
          }
        })
        .catch((e) => {
          console.log(e);
          toast.error(get(e, 'message') || e?.errorResponse?.message);
        });
    } else {
      console.log('Node printer default print only working now');
      // PrinterService.nodePrinterList(JSON.stringify({ printerType: printerInfo }));
      // setTimeout(()=>{
      //  setUSBPrinters(GlobalStorageService.getItemArray(StorageConstants.USB_PRINTER_LIST));
      // },500)
    }
  };
  const getBLEPrinterList = async () => {
    if (window.navigator.userAgent.includes(USER_AGENTS.REACT_NATIVE)) {
      const nativeRequest = [
        {
          name: BridgeConstants.BLE_DEVICE_LIST,
          data: { printerType: printerInfo },
        },
      ];
      NativeService.sendAndReceiveNativeData(nativeRequest)
        .then((response) => {
          const nativeItem = filter(
            response,
            (responseItem) => get(responseItem, 'name') === BridgeConstants.BLE_DEVICE_LIST
          );
          if (get(nativeItem, '0.data')) {
            setBlePrinters(get(nativeItem, '0.data.deviceList', []));
          }
          if (get(nativeItem, '0.error')) {
            toast.error(get(nativeItem, '0.error.message', []));
          }
        })
        .catch((e) => {
          console.log(e);
          toast.error(get(e, 'message') || e?.errorResponse?.message);
        });
    } else {
      PrinterService.nodePrinterList(JSON.stringify({ printerType: printerInfo }));
    }
  };
  const getPrinterList = () => {
    try {
      if (isPos_usb) {
        getUSBPrinterList();
      }
      if (isPos_ble) {
        getBLEPrinterList();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleChangePrintMode = async () => {
    try {
      const options = {
        savePrint: !printMode,
        printType: printType,
        printInfo: { ...PrintInfoInConfig, paperSize: printerInfo },
      };
      await SettingServices.postPrintMode(options);
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeConnectionType = async (event) => {
    try {
      const options = {
        printInfo: {
          ...PrintInfoInConfig,
          bluetoothPrintConnectionSettings: {
            keepConnection: event.target.value || bluetoothConnectionType,
          },
        },
      };
      await SettingServices.postPrintMode(options);
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeisFeedback = async () => {
    try {
      const options = {
        isFeedback: !isFeedback,
      };
      await SettingServices.postPrintMode(options);
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
    }
  };

  const onSubmitPrintInformation = async (data, reset) => {
    try {
      const printerInfo = get(
        configuration,
        'printInfo.paperSize',
        PRINT_CONSTANT.POS_BLUETOOTH_80MM
      );

      const printType = get(configuration, 'printType', PRINT_CONSTANT.POS);
      const printMode = get(configuration, 'savePrint', false);

      const options = {
        savePrint: printMode,
        printType: printType,
        printInfo: {
          ...PrintInfoInConfig,
          paperSize: printerInfo,
          printInformation: data,
        },
      };
      await SettingServices.postPrintMode(options);
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      handleClosePrintInformation();
      // reset();
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (isPos_LAN && isEmpty(lanPrinter)) {
      setLanPrinter({
        host: '192.168.0.100',
        port: 9100,
      });
    }
  }, []);
  useEffect(() => {
    initialFetch();
  }, [currentTerminal, currentStore]);

  useEffect(() => {
    if (printerInfo) getPrinterList();
  }, [printerInfo]);

  return (
    <Box className="settingProfileStep1">
      <Box
      //  sx={{ minHeight: 'calc(100vh-150px', maxHeight: 'calc(100vh-250px' }}
      >
        <Box sx={{ borderRadius: '6px', p: isMobile ? 1 : 2 }}>
          <Grid container>
            <Grid xs={12} lg={4} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Save & Normal Print Mode</Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    justifySelf: 'flex-end',
                  }}
                  size="large"
                  checked={printMode}
                  onChange={handleChangePrintMode}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: '300' }}>
                  Save & Normal Print your receipt every time.
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Stack flexDirection={'column'} gap={1} sx={{ mt: 1 }}>
            {printMode && (
              <>
                <Box>
                  <Grid container gap={2}>
                    {/* <Grid item xs={12} sm={5.8} md={5.8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                            Type and Size
                          </Typography> */}
                    {/* {printMode && (
                            <FormControl
                              sx={{
                                display: 'flex',
                                gap: 1,
                              }}
                            >
                              <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                value={printType}
                                onChange={handleChangeDefaultPrint}
                              >
                                <FormControlLabel
                                  value={PRINT_CONSTANT.POS}
                                  control={<Radio size="small" />}
                                  label={PRINT_CONSTANT.POS}
                                />
                                <FormControlLabel
                                  value={PRINT_CONSTANT.PDF}
                                  control={<Radio size="small" />}
                                  label={PRINT_CONSTANT.PDF}
                                />
                              </RadioGroup>
                            </FormControl>
                          )} */}
                    {/* </Box> */}
                    {/* <Typography sx={{ fontSize: '12px' }}>
                          Select thermal printer to select POS, otherwise PDF
                        </Typography> */}
                    {/* </Grid> */}

                    <Grid item xs={12} sm={5.8} md={5.8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                          Paper Size
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '12px' }}>
                        Select thermal printer paper size
                        <br />
                        <b>Note: 58mm (2inch) 80mm (3inch)</b>
                      </Typography>
                    </Grid>
                  </Grid>

                  {printMode && printType === PRINT_CONSTANT.POS && (
                    <Grid container gap={1} sx={{ mt: 1 }}>
                      <Stack sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                        <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: printerInfo ? '#8A2B6F' : '#CBD1D7',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <UsbIcon style={{ color: 'white', fontSize: 16 }} />
                            </div>
                            <Typography
                              sx={{
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: '700',
                              }}
                            >
                              USB
                            </Typography>
                          </Box>
                        </Box>
                        <FormControl
                          component="fieldset"
                          sx={{ display: 'flex', flexDirection: 'row' }}
                        >
                          <RadioGroup
                            row
                            aria-label="radio-options"
                            name="radio-options"
                            value={printerInfo}
                            onChange={handleOptionChange}
                          >
                            <FormControlLabel
                              value={PRINT_CONSTANT.POS_USB_58MM}
                              control={<Radio size="small" />}
                              label="58mm"
                            />

                            <FormControlLabel
                              value={PRINT_CONSTANT.POS_USB_80MM}
                              control={<Radio size="small" />}
                              label="80mm"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Stack>
                      <Stack sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                        <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#8A2B6F',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <BluetoothIcon style={{ color: 'white', fontSize: 16 }} />
                            </div>
                            <Typography
                              sx={{
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: '700',
                              }}
                            >
                              Bluetooth
                            </Typography>
                          </Box>
                        </Box>
                        <FormControl
                          component="fieldset"
                          sx={{ display: 'flex', flexDirection: 'row' }}
                        >
                          <RadioGroup
                            row
                            aria-label="radio-options"
                            name="radio-options"
                            value={printerInfo}
                            onChange={handleOptionChange}
                          >
                            <FormControlLabel
                              value={PRINT_CONSTANT.POS_BLUETOOTH_58MM}
                              control={<Radio size="small" />}
                              label="58mm"
                            />

                            <FormControlLabel
                              value={PRINT_CONSTANT.POS_BLUETOOTH_80MM}
                              control={<Radio size="small" />}
                              label="80mm"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Stack>
                      <Stack
                        Stack
                        sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}
                      >
                        <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#8A2B6F',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <LanIcon style={{ color: 'white', fontSize: 16 }} />
                            </div>
                            <Typography
                              sx={{
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: '700',
                              }}
                            >
                              LAN/Wireless
                            </Typography>
                          </Box>
                        </Box>
                        <FormControl
                          component="fieldset"
                          sx={{ display: 'flex', flexDirection: 'row' }}
                        >
                          <RadioGroup
                            row
                            aria-label="radio-options"
                            name="radio-options"
                            value={printerInfo}
                            onChange={handleOptionChange}
                          >
                            <FormControlLabel
                              value={PRINT_CONSTANT.POS_LAN_58MM}
                              control={<Radio size="small" />}
                              label="58mm"
                            />

                            <FormControlLabel
                              value={PRINT_CONSTANT.POS_LAN_80MM}
                              control={<Radio size="small" />}
                              label="80mm"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Stack>
                    </Grid>
                  )}

                  {/* {printMode && printType === PRINT_CONSTANT.POS && (
                          <Stack
                            spacing={2}
                            direction="row"
                            alignItems="center"
                            sx={{ display: 'flex' }}
                            justifyContent={'flex-end'}
                          >
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: printerInfo ? '#8A2B6F' : '#CBD1D7',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <UsbIcon style={{ color: 'white' }} />
                            </div>
                            <FormControl component="fieldset">
                              <RadioGroup
                                row
                                aria-label="radio-options"
                                name="radio-options"
                                value={printerInfo}
                                onChange={handleOptionChange}
                              >
                                <FormControlLabel
                                  value={PRINT_CONSTANT.POS_USB_58MM}
                                  control={<Radio />}
                                  label="58mm"
                                />
                                <FormControlLabel
                                  value={PRINT_CONSTANT.POS_USB_72MM}
                                  control={<Radio />}
                                  label="72mm"
                                />
                                <FormControlLabel
                                  value={PRINT_CONSTANT.POS_USB_80MM}
                                  control={<Radio />}
                                  label="80mm"
                                />
                              </RadioGroup>
                            </FormControl>
                          </Stack>
                        )}

                        {printMode && printType === PRINT_CONSTANT.POS && (
                          <Stack spacing={2} direction="row" alignItems="center">
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: printerInfo ? '#8A2B6F' : '#CBD1D7',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <BluetoothIcon style={{ color: 'white' }} />
                            </div>

                            <FormControl component="fieldset">
                              <RadioGroup
                                row
                                aria-label="radio-options"
                                name="radio-options"
                                value={printerInfo}
                                onChange={handleOptionChange}
                              >
                                <FormControlLabel
                                  value={PRINT_CONSTANT.POS_BLUETOOTH_58MM}
                                  control={<Radio />}
                                  label="58mm"
                                />
                                <FormControlLabel
                                  value={PRINT_CONSTANT.POS_BLUETOOTH_72MM}
                                  control={<Radio />}
                                  label="72mm"
                                />
                                <FormControlLabel
                                  value={PRINT_CONSTANT.POS_BLUETOOTH_80MM}
                                  control={<Radio />}
                                  label="80mm"
                                />
                              </RadioGroup>
                            </FormControl>
                          </Stack>
                        )}
                        {printMode && printType === PRINT_CONSTANT.POS && (
                          <Stack spacing={2} direction="row" alignItems="center">
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: printerInfo ? '#8A2B6F' : '#CBD1D7',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <LanIcon style={{ color: 'white' }} />
                            </div>

                            <FormControl component="fieldset">
                              <RadioGroup
                                row
                                aria-label="radio-options"
                                name="radio-options"
                                value={printerInfo}
                                onChange={handleOptionChange}
                              >
                                <FormControlLabel
                                  value={PRINT_CONSTANT.POS_LAN_58MM}
                                  control={<Radio />}
                                  label="58mm"
                                />
                                <FormControlLabel
                                  value={PRINT_CONSTANT.POS_LAN_72MM}
                                  control={<Radio />}
                                  label="72mm"
                                />
                                <FormControlLabel
                                  value={PRINT_CONSTANT.POS_LAN_80MM}
                                  control={<Radio />}
                                  label="80mm"
                                />
                              </RadioGroup>
                            </FormControl>
                          </Stack>
                        )} */}
                  {/* </Box> */}
                  {/* </Stack> */}
                  {isPos_LAN && (
                    <Box sx={{ py: 1 }}>
                      <Stack mb={2} flexDirection="column">
                        <Stack
                          flexDirection={'row'}
                          justifyContent={'space-between'}
                          sx={{ mb: 1 }}
                        >
                          <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                            {isPos_LAN ? 'LAN Devices' : ''}
                          </Typography>
                        </Stack>

                        {isPos_LAN && (
                          <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Stack
                              sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 1,

                                justifyItems: 'center',
                              }}
                            >
                              <TextField
                                fullWidth
                                name="host"
                                placeholder="Enter HOST, for example: 192.168.0.100"
                                type="text"
                                value={get(lanPrinter, 'host')}
                                onChange={(e) =>
                                  setLanPrinter((prev) => ({
                                    ...prev,
                                    host: e.target.value,
                                  }))
                                }
                              />
                              <TextField
                                fullWidth
                                placeholder="Enter PORT, for example: 9100"
                                name="port"
                                type="number"
                                value={get(lanPrinter, 'port')}
                                onChange={(e) =>
                                  setLanPrinter((prev) => ({
                                    ...prev,
                                    port: e.target.value,
                                  }))
                                }
                              />
                              <Button
                                variant="contained"
                                onClick={() => handleSelectLANPrinter(lanPrinter)}
                              >
                                Save
                              </Button>
                            </Stack>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  )}
                  <Box>
                    <Stack mb={2} flexDirection="column">
                      <Box>
                        <AddPrintInformation
                          open={openInformation}
                          handleClose={handleClosePrintInformation}
                          onSubmitPrintInformation={onSubmitPrintInformation}
                          printInformationData={printInformationData}
                        />
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </>
            )}
          </Stack>
          {isPos_ble && printMode && (
            <Grid container>
              <Grid xs={12} sm={12} md={12}>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2, mt: 2 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                      Bluetooth Connection Type
                    </Typography>
                    <Stack spacing={2} direction="row" alignItems="center">
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#8A2B6F',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginLeft: 5,
                        }}
                      >
                        <BluetoothIcon style={{ color: 'white', fontSize: '16px' }} />
                      </div>

                      <FormControl component="fieldset">
                        <RadioGroup
                          row
                          aria-label="radio-options"
                          name="radio-options"
                          value={bluetoothConnectionType}
                          onChange={handleChangeConnectionType}
                        >
                          <FormControlLabel
                            value={DEFAULT_BLUETOOTH_PRINT_CONNECTION.DEFAULT}
                            control={<Radio size="small" />}
                            label="Default"
                          />

                          <FormControlLabel
                            value={DEFAULT_BLUETOOTH_PRINT_CONNECTION.COUNTER_MODE}
                            control={<Radio size="small" />}
                            label="Counter mode"
                          />
                          <FormControlLabel
                            value={DEFAULT_BLUETOOTH_PRINT_CONNECTION.STICKY_MODE}
                            control={<Radio size="small" />}
                            label="Sticky mode"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          )}
          <KOTPrinter initialFetch={initialFetch} />
          <Grid container>
            <Grid xs={12} lg={4} md={6}>
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2, mt: 2 }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                    Show parcel charges
                  </Typography>
                  <Switch
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.light,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.light,
                      },

                      justifySelf: 'flex-end',
                    }}
                    size="large"
                    checked={get(printInformationData, 'isAllowParcelCharges')}
                    onChange={() => {
                      onSubmitPrintInformation({
                        ...printInformationData,
                        isAllowParcelCharges: !get(printInformationData, 'isAllowParcelCharges'),
                      });
                    }}
                  />
                </Box>
                <Typography sx={{ fontWeight: '300' }}>
                  If enabled, show parcel charges in print.
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {isOrderTypeEnable && (
            <Grid container>
              <Grid xs={12} lg={4} md={6}>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2, mt: 2 }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: '700', mb: 2 }}>
                      OrderType Position
                    </Typography>

                    <FormControl>
                      <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        name="radio-buttons-group"
                        value={get(printInformationData, 'orderTypePosition') || value}
                        onChange={(event) => {
                          onSubmitPrintInformation({
                            ...printInformationData,
                            orderTypePosition: event.target.value,
                          });
                          setValue(event.target.value);
                        }}
                      >
                        <FormControlLabel value="TOP" control={<Radio />} label="Top" />
                        <FormControlLabel value="BOTTOM" control={<Radio />} label="Bottom" />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Box>
        {/* <Box mt={5}>
          {!isNormalPrintTab && (<KOTPrinter initialFetch={initialFetch} />)}
        </Box> */}
      </Box>
    </Box>
  );
}
