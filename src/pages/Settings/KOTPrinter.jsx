import { filter, get, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PRINT_CONSTANT, USER_AGENTS } from '../../constants/AppConstants';
import BridgeConstants from '../../constants/BridgeConstants';
import { StorageConstants } from '../../constants/StorageConstants';
import { SuccessConstants } from '../../constants/SuccessConstants';
import {
  allConfiguration,
  currentStoreId,
  currentTerminalId,
  selectedKOTBLE,
  selectedKOTLAN,
  selectedKOTUSB,
  alertDialogInformationState,
} from '../../global/recoilState';
import ObjectStorage from '../../modules/ObjectStorage';
import SettingServices from '../../services/API/SettingServices';
import NativeService from '../../services/NativeService';
import PrinterService from '../../services/PrinterService';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Grid,
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
} from '@mui/material';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import LanIcon from '@mui/icons-material/Lan';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncIcon from '@mui/icons-material/Sync';
import UsbIcon from '@mui/icons-material/Usb';
import { useMediaQuery } from '@poriyaalar/custom-hooks';

const KOTPrinter = ({ initialFetch }) => {
  const theme = useTheme();

  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const configuration = useRecoilValue(allConfiguration);

  const PrintInfo = get(configuration, 'printInfo');

  const kotPrintInfo = get(configuration, 'printInfo.kotPrintInfo');
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const kotPrintMode = get(kotPrintInfo, 'savePrint', false);
  const kotPrintType = get(kotPrintInfo, 'printType', PRINT_CONSTANT.POS);
  const isCountersEnabled = get(configuration, 'counterSettings.isCountersEnabled', false);
  const kotPrintLan = get(kotPrintInfo, 'lan');
  const counterKOTMode = get(kotPrintInfo, 'counterKOTMode', false);
  const deliverySlipMode = get(kotPrintInfo, 'deliverySlipMode', true);
  const kotPaperSize = get(kotPrintInfo, 'paperSize', PRINT_CONSTANT.POS_BLUETOOTH_80MM);

  const [usbPrinters, setUSBPrinters] = useState([]);
  const [blePrinters, setBlePrinters] = useState([]);

  const [selectedUSBPrinter, setSelectedUSBPrinter] = useRecoilState(selectedKOTUSB);
  const [selectedBLEPrinter, setSelectedBLEPrinter] = useRecoilState(selectedKOTBLE);
  const [selectedKOTLANPrinter, setSelectedKOTLANPrinter] = useRecoilState(selectedKOTLAN);

  const [KOTLanPrinter, setKOTLanPrinter] = useState({});

  const isPos_ble = kotPaperSize && kotPaperSize.includes(PRINT_CONSTANT.POS_BLUETOOTH);
  const isPos_lan = kotPaperSize && kotPaperSize.includes(PRINT_CONSTANT.POS_LAN);
  const isPos_usb = kotPaperSize && kotPaperSize.includes(PRINT_CONSTANT.POS_USB);

  const handleChangePrintMode = async (option) => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        ...configuration,
        printInfo: {
          ...PrintInfo,
          kotPrintInfo: { ...(kotPrintInfo || {}), ...option },
        },
      };
      await SettingServices.postPrintMode(options, currentStore, currentTerminal);
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelectUSBPrinter = (data) => {
    const printer = {
      vendorId: get(data, 'vendor_id'),
      productId: get(data, 'product_id'),
    };
    setSelectedUSBPrinter(printer);
    ObjectStorage.setItem(StorageConstants.SELETED_KOT_USB_PRINTER, printer);
  };
  const handleSelectBLEPrinter = (data) => {
    const printer = { macAddress: get(data, 'inner_mac_address') };
    setSelectedBLEPrinter(printer);
    ObjectStorage.setItem(StorageConstants.SELETED_KOT_BLE_PRINTER, printer);
  };

  const handleSelectKOTLANPrinter = (data) => {
    handleChangePrintMode({
      lan: {
        host: get(data, 'host'),
        port: Number(get(data, 'port')),
      },
    });
    // const printer = {
    //   host: get(data, 'host'),
    //   port: Number(get(data, 'port')),
    // };
    // setSelectedKOTLANPrinter(printer);
    // ObjectStorage.setItem(StorageConstants.SELETED_KOT_LAN_PRINTER, printer);
  };

  const getUSBPrinterList = async () => {
    if (window.navigator.userAgent.includes(USER_AGENTS.REACT_NATIVE)) {
      console.log('usb deviceList');
      const nativeRequest = [
        {
          name: BridgeConstants.USB_DEVICE_LIST,
          data: { printerType: kotPaperSize },
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
          toast.error(get(e, 'message'));
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
          data: { printerType: kotPaperSize },
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
          toast.error(get(e, 'message'));
        });
    } else {
      PrinterService.nodePrinterList(JSON.stringify({ printerType: kotPaperSize }));
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
  useEffect(() => {
    if (isPos_lan && isEmpty(KOTLanPrinter)) {
      setKOTLanPrinter({
        host: '192.168.0.100',
        port: 9100,
      });
    }
  }, []);

  const handleTestPrint = () => {
    const printerInfo = get(
      configuration,
      'printInfo.kotPrintInfo.savePrint',
      PRINT_CONSTANT.POS_USB_80MM
    );
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: 'Test the Printer?',
      actions: {
        primary: {
          text: 'Print',
          onClick: (onClose) => {
            onClose();
            PrinterService.testPrint(kotPrintMode, {
              selectedUSBPrinter,
              selectedBLEPrinter,
              selectedKOTLANPrinter,
            });
          },
          className: 'bg-primary-600',
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          className: 'text-black',
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };

  //   useEffect(() => {
  //     if (kotPaperSize) getPrinterList();
  //   }, [kotPaperSize]);

  useEffect(() => {
    setKOTLanPrinter(kotPrintLan);
  }, [configuration]);
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <>
      <Box sx={{  mt:1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        
          
         
        </Box>
        
      </Box>

      <Grid container>
            <Grid xs={12} lg={4} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
          <Typography variant="h6">KOT Print Mode</Typography>
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
            checked={kotPrintMode}
            onChange={() => {
              handleChangePrintMode({
                savePrint: !kotPrintMode,
              });
            }}
          />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
              KOT Print your billing receipt every time.
              </Typography>
            </Box>
            </Grid>
            </Grid>

      <>
      {kotPrintMode && (<Box sx={{ border: '1px solid #DEDEDE', borderRadius: '12px', p: isMobile?1:2, mt:2 }}>
          <Stack
            className="settingConfigStep1"
            mb={1.5}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>Delivery slip</Typography>
              <Typography variant="body2"> KOT Print your billing receipt every time.</Typography>
            </Box>
            <Stack
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
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
                checked={deliverySlipMode}
                onChange={() => {
                  handleChangePrintMode({
                    deliverySlipMode: !deliverySlipMode,
                    ...(deliverySlipMode && !counterKOTMode ? { savePrint: false } : {}),
                  });
                }}
              />
            </Stack>
          </Stack>

          {deliverySlipMode && (
            <Stack mb={2} flexDirection={isMobile? 'column':"row"} justifyContent="space-between" alignItems={isMobile?'':"center"}>
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>Paper Size</Typography>
                <Typography  sx={{ fontSize: '12px', fontWeight: '300' }}>
                  Select thermal printer paper size 
                  <br /> <b>Note: 58mm (2inch) 80mm (3inch)</b>
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  justifyContent: isMobile?'':'flex-end',
                }}
              >
                <Stack
                  spacing={2}
                  direction="row"
                  alignItems="center"
                  sx={{ display: 'flex', }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#8A2B6F',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <UsbIcon style={{ color: 'white', fontSize: 16 }} />
                  </div>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      aria-label="radio-options"
                      name="radio-options"
                      value={kotPaperSize}
                      onChange={(event) => {
                        handleChangePrintMode({
                          paperSize: event.target.value,
                        });
                      }}
                    >
                      <FormControlLabel
                        value={PRINT_CONSTANT.POS_USB_58MM}
                        control={<Radio size="small"/>}
                        label="58mm"
                      />

                      <FormControlLabel
                        value={PRINT_CONSTANT.POS_USB_80MM}
                        control={<Radio size="small"/>}
                        label="80mm"
                      />
                    </RadioGroup>
                  </FormControl>
                </Stack>

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
                    }}
                  >
                    <BluetoothIcon style={{ color: 'white', fontSize: '16px' }} />
                  </div>

                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      aria-label="radio-options"
                      name="radio-options"
                      value={kotPaperSize}
                      onChange={(event) => {
                        handleChangePrintMode({
                          paperSize: event.target.value,
                        });
                      }}
                    >
                      <FormControlLabel
                        value={PRINT_CONSTANT.POS_BLUETOOTH_58MM}
                        control={<Radio size="small"/>}
                        label="58mm"
                      />
                      
                      <FormControlLabel
                        value={PRINT_CONSTANT.POS_BLUETOOTH_80MM}
                        control={<Radio size="small"/>}
                        label="80mm"
                      />
                    </RadioGroup>
                  </FormControl>
                </Stack>

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
                    }}
                  >
                    <LanIcon style={{ color: 'white', fontSize: '16px' }} />
                  </div>

                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      aria-label="radio-options"
                      name="radio-options"
                      value={kotPaperSize}
                      onChange={(event) => {
                        handleChangePrintMode({
                          paperSize: event.target.value,
                        });
                      }}
                    >
                      <FormControlLabel
                        value={PRINT_CONSTANT.POS_LAN_58MM}
                        control={<Radio size="small"/>}
                        label="58mm"
                      />
                      
                      <FormControlLabel
                        value={PRINT_CONSTANT.POS_LAN_80MM}
                        control={<Radio size="small"/>}
                        label="80mm"
                      />
                    </RadioGroup>
                  </FormControl>
                </Stack>
              </Box>
            </Stack>
          )}
        </Box>)}

        {kotPrintMode && deliverySlipMode && isPos_lan &&(
          <Box sx={{ border: '1px solid #DEDEDE', borderRadius: '12px', p: 2, mt: 1 }}>
            <Stack mb={2} flexDirection="column">
              <Stack flexDirection={'row'} justifyContent={'space-between'} sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                  {isPos_lan
                        ? 'LAN Devices'
                        : ''}
                </Typography>
              </Stack>
              {isPos_lan && (
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
                      value={get(KOTLanPrinter, 'host')}
                      onChange={(e) =>
                        setKOTLanPrinter((prev) => ({
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
                      value={get(KOTLanPrinter, 'port')}
                      onChange={(e) =>
                        setKOTLanPrinter((prev) => ({
                          ...prev,
                          port: e.target.value,
                        }))
                      }
                    />

                    {!isEmpty(get(KOTLanPrinter, 'port')) &&
                      !isEmpty(get(KOTLanPrinter, 'host')) && (
                        <Button
                          variant="contained"
                          onClick={() => handleSelectKOTLANPrinter(KOTLanPrinter)}
                        >
                          {get(selectedKOTLANPrinter, 'host') === get(KOTLanPrinter, 'host') &&
                            get(selectedKOTLANPrinter, 'port') === get(KOTLanPrinter, 'port')
                            ? 'Saved'
                            : 'Save'}
                        </Button>
                      )}
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Box>
        )}
        {kotPrintMode && isCountersEnabled && (
          <Box sx={{ border: '1px solid #DEDEDE', borderRadius: '12px', p: 2, mt: 1 }}>
            <Stack
              className="settingConfigStep1"
              mb={1.5}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>Counter KOT</Typography>
                <Typography variant="body2">
                If enabled, you can print the kitchen order token as per counter.
                </Typography>
                <Typography variant="body2">
                  Note : Counter wise printer settings do only in billing app
                </Typography>
              </Box>
              <Stack
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                }}
              >
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
                  checked={counterKOTMode}
                  onChange={() => {
                    handleChangePrintMode({
                      counterKOTMode: !counterKOTMode,
                      ...(!deliverySlipMode && counterKOTMode ? { savePrint: false } : {}),
                    });
                  }}
                />
              </Stack>
            </Stack>
          </Box>
        )}
      </>
    </>
  );
};

export default KOTPrinter;
