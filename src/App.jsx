// i18n
import './locales/i18n';

// scroll bar
import 'simplebar-react/dist/simplebar.min.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';

// ----------------------------------------------------------------------

import Stack from '@mui/material/Stack';
import { find, get, includes, isBoolean, isEmpty, orderBy, slice } from 'lodash';
import { useEffect, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ToastBar, Toaster, toast } from 'react-hot-toast';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { MotionLazyContainer } from './components/animate';
import ScrollToTop from './components/scroll-to-top';
import { SettingsProvider, ThemeSettings } from './components/settings';
import SnackbarProvider from './components/snackbar';
import {
  ALL_CONSTANT,
  Codes,
  CustomCodeTypes,
  ROLES_DATA,
  ROLES_WITHOUT_STORE_STAFF,
} from './constants/AppConstants';
import BridgeConstants from './constants/BridgeConstants';
import { ErrorConstants } from './constants/ErrorConstants';
import { ROLE_STORAGE, StorageConstants } from './constants/StorageConstants';
import { GstData } from './global/SettingsState';
import {
  allConfiguration,
  currentEndDate,
  currentStartDate,
  currentStoreId,
  currentTerminalId,
  customCodeList,
  customerList,
  isEstimateWithNoItemsEnableState,
  isOfflineState,
  offlineHoldOnListState,
  offlineOrdersListCountState,
  offlineToOnlineSyncingState,
  orderTypeConfiguration,
  selectedBLE,
  selectedUSB,
  selectedLAN,
  stores,
  whatsappDetailsState,
  whatsappBalanceDetailsState,
  isShowBillingSummaryState,
  fdSelectedStoreDetailsState,
  isPublishFDState,
  isMembershipState,
  storeReferenceState,
  storeNameState,
} from './global/recoilState';
import { generateUniquieId } from './helper/generateUniqueId';
import ThemeLocalization from './locales';
import ObjectStorage from './modules/ObjectStorage';
import Router from './routes';
import SettingServices from './services/API/SettingServices';
import AuthService from './services/authService';
import STORES_API from './services/stores';
import ThemeProvider from './theme';
import AlertDialog from './components/AlertDialog';

import NavigateSetter from 'src/components/NavigateSetter';
import { isForInStatement } from 'typescript';
import PRODUCTS_API from './services/products';
import WHATSAPP_CREDITS from './services/whatsappCredits';
import ONLINE_STORES from './services/onlineStoresServices';

// ----------------------------------------------------------------------

export default function App() {
  const setStoresData = useSetRecoilState(stores);
  const accessToken = AuthService._getAccessToken();
  const [selectedStore, setSelectedStore] = useRecoilState(currentStoreId);
  const [isMembershipEnable, setIsMembershipEnable] = useRecoilState(isMembershipState);
  const [selectedTerminal, setSelectedTerminal] = useRecoilState(currentTerminalId);
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const setCustomCodes = useSetRecoilState(customCodeList);
  const setCustomerCodes = useSetRecoilState(customerList);
  const currentSelectedRole = () => AuthService.getCurrentRoleInLocal();
  const setGstData = useSetRecoilState(GstData);
  const setOrderConfiguraton = useSetRecoilState(orderTypeConfiguration);
  const setIsEstimateWithNoItemsEnable = useSetRecoilState(isEstimateWithNoItemsEnableState);

  const setStoresDetails = useSetRecoilState(fdSelectedStoreDetailsState);
  const setIsPublishFD = useSetRecoilState(isPublishFDState);
  const setStoreReference = useSetRecoilState(storeReferenceState);
  const setStoreName = useSetRecoilState(storeNameState);

  const setSelectedUSBPrinter = useSetRecoilState(selectedUSB);
  const setSelectedBLEPrinter = useSetRecoilState(selectedBLE);
  const setSelectedLANPrinter = useSetRecoilState(selectedLAN);

  const [isShowBillingSummary, setIsShowBillingSummary] = useRecoilState(isShowBillingSummaryState);

  const [offlineToOnlineSyncing, setOfflineToOnlineSyncing] = useRecoilState(
    offlineToOnlineSyncingState
  );
  const staffPermissions = get(configuration, 'staffPermissions', {});

  const isAllowEditAndDelete = get(staffPermissions, 'isAllowEditAndDelete');

  const setOfflineOrdersListCount = useSetRecoilState(offlineOrdersListCountState);

  const setIsOffline = useSetRecoilState(isOfflineState);
  const setOfflineHoldOnList = useSetRecoilState(offlineHoldOnListState);

  const setStartDate = useSetRecoilState(currentStartDate);
  const setEndDate = useSetRecoilState(currentEndDate);
  const setWhatsappDetails = useSetRecoilState(whatsappDetailsState);
  const setBalanceDetails = useSetRecoilState(whatsappBalanceDetailsState);

  const deviceId = AuthService.getDeviceId();
  const navigationPage = useNavigate();

  const { role } = ObjectStorage.getItem(ROLE_STORAGE.ROLE) || {};
  const isManager = role === ROLES_DATA.store_manager.role;

  const getStores = async (role) => {
    try {
      if (role === ROLES_DATA.master.role) {
        const response = await STORES_API.getStoresMaster();
        handleStores(response);
      } else if (
        role === ROLES_DATA.store_manager.role ||
        role === ROLES_DATA.manager_and_staff.role
      ) {
        const response = await STORES_API.getStoresManager();
        handleStores(response);
      } else {
        const response = await STORES_API.getStoresByStoreId();
        handleStores(response);
      }
    } catch (e) {
      console.log('eeeeee', e);
    }
  };
  const handleStores = (response) => {
    const selectedStoreAndTerminal = ObjectStorage.getItem(
      StorageConstants.SELECTED_STORE_AND_TERMINAL
    );

    console.log('kkkkkk', get(response, 'data'));

    const isAvailableStoreAndTerminal = !!find(get(response, 'data'), (_item) => {
      if (
        get(_item, 'storeId') === selectedStoreAndTerminal.storeId &&
        get(_item, 'terminalId') === selectedStoreAndTerminal.terminalId
      ) {
        return true;
      }
      return false;
    });

    if (response && (isEmpty(selectedStoreAndTerminal) || !isAvailableStoreAndTerminal)) {
      const role = currentSelectedRole();

      const storeId = get(response, 'data.0.storeId');
      const terminalId = ROLES_WITHOUT_STORE_STAFF.includes(role)
        ? ALL_CONSTANT.ALL
        : get(response, 'data.0.terminalId');

      setStoresData(get(response, 'data'));
      ObjectStorage.setItem(StorageConstants.STORES_FULL_DETAILS, get(response, 'data'));
      setSelectedStore(storeId);
      setSelectedTerminal(terminalId);
      const currentStoreAndTerminal = {
        storeId,
        terminalId,
      };
      ObjectStorage.setItem(StorageConstants.SELECTED_STORE_AND_TERMINAL, currentStoreAndTerminal);
    } else {
      setSelectedStore(selectedStoreAndTerminal.storeId);
      setSelectedTerminal(selectedStoreAndTerminal.terminalId);
    }
  };

  const handlePostConfiguration = async (options) => {
    try {
      await SettingServices.postConfiguration(options);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditAndDeleteEnabletMode = () => {
    const options = {
      staffPermissions: {
        ...staffPermissions,
        isAllowDelete: true,
        isAllowEdit: true,
        isAllowEditAndDelete: false,
      },
    };
    handlePostConfiguration(options);
  };

  const getConfiguration = async () => {
    try {
      let resp = {};
      if (role === ROLES_DATA.store_staff.role) {
        resp = await SettingServices.getViewConfiguration();
      } else {
        resp = await SettingServices.getConfiguration();
      }
      const printResp = await SettingServices.getPrintConfiguration();
      if (get(resp, 'code') === 'Error') {
        //temporarly correct this if api ok
        setConfiguration({
          ...(configuration || {}),
          ...(get(printResp, 'data.0') || {}),
        });
      } else {
        setConfiguration({
          ...(configuration || {}),
          ...(get(resp, 'data.0') || {}),
          ...(get(printResp, 'data.0') || {}),
        });
      }

      ObjectStorage.setItem(StorageConstants.ORDER_RESET_TIME, {
        data: get(resp, 'data.0.orderReset.resetTime', '00:00'),
      });
      setGstData({
        gstNumber: get(resp, 'data.0.gstNumber'),
        gstPercent: get(resp, 'data.0.gstPercent'),
        gstEnabled: get(resp, 'data.0.gstEnabled'),
      });
      setOrderConfiguraton(get(resp, 'data.0.isOrderType', {}));
      if (get(resp, 'data.0.customCode')) {
        const customCodesDetails = await SettingServices.getCustomCodesData();
        setCustomCodes(get(customCodesDetails, 'data', []));
      }
      if (get(resp, 'data.0.customerManagement')) {
        const responseCustomerCodes = await SettingServices.getCustomerData();
        responseCustomerCodes &&
          setCustomerCodes(get(responseCustomerCodes, 'data', [])?.reverse());
      }
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    const unsubscribe = window.customEventEmitter.subscribe(
      BridgeConstants.BACK_BUTTON,
      (nativeData) => {
        navigationPage(-1);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!deviceId)
      ObjectStorage.setItem(StorageConstants.DEVICE_UNIQUE_ID, { id: generateUniquieId() });
  }, []);
  useEffect(() => {
    ObjectStorage.setItem(Codes.CUSTOMCODETYPE, { value: CustomCodeTypes.FIXED });
  }, []);
  useEffect(() => {
    if (isEmpty(selectedStore) && isEmpty(selectedTerminal) && accessToken) {
      const role = currentSelectedRole();
      getStores(role);
    }
  }, [selectedStore, selectedTerminal, accessToken]);

  useEffect(() => {
    if (selectedStore && selectedTerminal) {
      getConfiguration();
    }
  }, [selectedStore, selectedTerminal]);

  useEffect(() => {
    if (isAllowEditAndDelete) {
      handleEditAndDeleteEnabletMode();
    }
  }, [selectedStore, selectedTerminal]);

  useEffect(() => {
    const { status } = ObjectStorage.getItem(StorageConstants.IS_ESTIMATE_WITH_NO_ITEMS) || {};
    setIsEstimateWithNoItemsEnable(status || false);
  }, []);

  const getPreviewOrderId = async () => {
    if (isManager) return;
    try {
      const response = await PRODUCTS_API.getPreviewOrderId();
      ObjectStorage.setItem(StorageConstants.PREVIEW_ID, { data: get(response, 'data.orderId') });
    } catch (e) {
      console.log(e);
    }
  };

  const handleOfflineToOnlineSync = async () => {
    if (!offlineToOnlineSyncing) return;

    const { data: localOrderList } = ObjectStorage.getItem(StorageConstants.ORDER_LIST);

    const sendDataLength = 10;

    let i = 0;

    const loopCount = Math.ceil((localOrderList?.length || 0) / sendDataLength);

    while (i < loopCount) {
      const { data: localOrderList } = ObjectStorage.getItem(StorageConstants.ORDER_LIST);
      try {
        const payload = slice(localOrderList, 0, 10);
        await PRODUCTS_API.postBulkOfflineOrders(payload);
        ObjectStorage.setItem(StorageConstants.ORDER_LIST, { data: slice(localOrderList, 10) });
        setOfflineOrdersListCount(slice(localOrderList, 10)?.length || 0);
        i++;
      } catch (error) {
        setOfflineToOnlineSyncing(false);
        break;
      }
    }
    if (isEmpty(ObjectStorage.getItem(StorageConstants.ORDER_LIST)?.data)) {
      setOfflineToOnlineSyncing(false);
      ObjectStorage.setItem(StorageConstants.OFFLINE, { status: false });
      setIsOffline(false);
      getPreviewOrderId();
    }
  };

  useEffect(() => {
    handleOfflineToOnlineSync();
  }, [offlineToOnlineSyncing]);

  useEffect(() => {
    if (accessToken && selectedStore) {
      getPreviewOrderId();
    }
  }, [accessToken, selectedStore]);

  useEffect(() => {
    const { status: offlineStatus } = ObjectStorage.getItem(StorageConstants.OFFLINE);
    setIsOffline(offlineStatus);

    const { data: localOrderList } = ObjectStorage.getItem(StorageConstants.ORDER_LIST);
    setOfflineOrdersListCount(localOrderList?.length || 0);
  }, []);

  const getAccountInformation = async () => {
    try {
      const res = await STORES_API.getAccountInfo({
        storeId: selectedStore,
        terminalId: selectedTerminal,
      });
      setIsMembershipEnable(get(res, 'data.dataValues.merchantSettings.memberShip.isActive'));
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (selectedStore && selectedTerminal) {
      getAccountInformation();
    }
  }, [selectedStore, selectedTerminal]);

  useEffect(() => {
    const usbPrinter = ObjectStorage.getItem(StorageConstants.SELETED_USB_PRINTER);
    if (usbPrinter) setSelectedUSBPrinter(usbPrinter);
    const blePrinter = ObjectStorage.getItem(StorageConstants.SELETED_BLE_PRINTER);
    if (blePrinter) setSelectedBLEPrinter(blePrinter);
    const lanPrinter = ObjectStorage.getItem(StorageConstants.SELETED_LAN_PRINTER);
    if (lanPrinter) setSelectedLANPrinter(lanPrinter);
  }, []);

  useEffect(() => {
    const { data: localHoldOnList } = ObjectStorage.getItem(StorageConstants.OFFLINE_HOLD_ON_LIST);
    setOfflineHoldOnList(localHoldOnList);
  }, []);

  useEffect(() => {
    const { startDate, endDate } = ObjectStorage.getItem(StorageConstants.SELECTED_DATES);
    if (startDate && endDate) {
      setStartDate(new Date(startDate));
      setEndDate(new Date(endDate));
    } else {
      const defaultStartTime = new Date();
      defaultStartTime.setHours(0, 0, 0, 0);

      const defaultEndTime = new Date();
      defaultEndTime.setHours(23, 59, 59, 999);

      setStartDate(defaultStartTime);
      setEndDate(defaultEndTime);
    }
  }, [accessToken, selectedStore]);

  const getWhatsappDetails = async () => {
    try {
      const resp = await SettingServices.getWhatsappDetails();
      setWhatsappDetails(get(resp, 'data'));
    } catch (err) {
      console.log('err', err);
      // toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const getBalance = async () => {
    try {
      const resp = await WHATSAPP_CREDITS.getBalance();
      setBalanceDetails(get(resp, 'data'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (accessToken && selectedStore) {
      getWhatsappDetails();
      getBalance();
    }
  }, [accessToken, selectedStore]);

  useEffect(() => {
    const { data: isShowBillingSummary } = ObjectStorage.getItem(
      StorageConstants.IS_SHOW_BILLING_SUMMARY
    );
    if (isBoolean(isShowBillingSummary)) {
      setIsShowBillingSummary(isShowBillingSummary);
    } else {
      setIsShowBillingSummary(true);
    }
  }, []);

  useEffect(() => {
    const { data: isPublishFD } = ObjectStorage.getItem(StorageConstants.IS_PUBLISH_FD);
    setIsPublishFD(!!isPublishFD);
  }, []);

  const getStoresDetails = async () => {
    try {
      const response = await ONLINE_STORES.onlineStoreDetails(selectedStore);
      if (response) {
        setStoresDetails(get(response, 'data.FDStoreSettings'));
      }
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (accessToken && selectedStore) {
      getStoresDetails();
    }
  }, [accessToken, selectedStore]);

  const getStoreList = async () => {
    if (accessToken && selectedStore) {
      try {
        const response = await ONLINE_STORES.getStoreAllList();
        const store = find(get(response, 'data'), (e) => e.storeId === selectedStore);
        setStoreReference(get(store, 'storeReference'));
        setStoreName(get(store, 'storeName'));
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    getStoreList();
  }, [accessToken, selectedStore]);

  return (
    <HelmetProvider>
      <SettingsProvider>
        <Toaster
          toastOptions={{
            success: {
              style: {
                border: `2px solid rgb(75,181,67) `,
                paddingTop: '2px',
                paddingBottom: '2px',
                height: '3.5rem',
                color: 'black',
                width: 'auto',
                maxWidth: '100%',
                backgroundColor: 'rgb(255,255,255)',
              },
              iconTheme: {
                primary: '#4BB543',
                secondary: 'white',
              },
            },
            error: {
              style: {
                paddingTop: '2px',
                paddingBottom: '2px',
                height: '3.5rem',
                border: '2px solid rgb(255,51,51)',
                backgroundColor: 'rgb(255,255,255)',
                color: 'black',
                width: ' auto',
                maxWidth: '100%',
              },
            },
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <Stack
                  flexDirection="row"
                  sx={{
                    width: '100%',
                    justifyContent: 'space-evenly',
                  }}
                >
                  <Stack flexDirection="row">
                    {icon}
                    {message}
                  </Stack>
                </Stack>
              )}
            </ToastBar>
          )}
        </Toaster>
        <ScrollToTop />
        <MotionLazyContainer>
          <ThemeProvider>
            <ThemeSettings>
              <ThemeLocalization>
                <SnackbarProvider>
                  <NavigateSetter />
                  <Router />
                  <AlertDialog />
                </SnackbarProvider>
              </ThemeLocalization>
            </ThemeSettings>
          </ThemeProvider>
        </MotionLazyContainer>
      </SettingsProvider>
    </HelmetProvider>
  );
}
