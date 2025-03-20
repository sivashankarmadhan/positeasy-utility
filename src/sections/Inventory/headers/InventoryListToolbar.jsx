import PropTypes from 'prop-types';
// @mui
import {
  Button,
  Divider,
  Fab,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Popover,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  MenuItem,
  TextField,
  Autocomplete,
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
// component
import AddIcon from '@mui/icons-material/Add';
import ExtensionIcon from '@mui/icons-material/Extension';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { every, find, forEach, get, isEmpty, map, some, startCase, includes } from 'lodash';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import FullScreenInventoryAdd from 'src/components/FullScreenInventoryAdd';
import FullScreenStockView from 'src/components/FullScreenStockView';
import InventoryAddOptions from 'src/components/InventoryAddOptions';
import UploadDialog from 'src/components/UploadDialog';
import * as XLSX from 'xlsx';
import { useRecoilState } from 'recoil';
import {
  IMPORT_EXPORT_TOOLBAR,
  StatusArrayConstants,
  StatusConstants,
  StockMonitorArrayConstants,
  StockMonitorConstants,
  hideScrollbar,
  SWIGGY,
  ZOMATO,
  ENABLE,
  ElementNames,
  DISABLE,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import {
  alertDialogInformationState,
  allProducts,
  currentStoreId,
  currentProduct,
  products,
  fdSelectedStoreDetailsState,
  terminalConfigurationState,
  storeNameState,
} from 'src/global/recoilState';
import { PATH_DASHBOARD } from 'src/routes/paths';
import PRODUCTS_API from 'src/services/products';
import Iconify from '../../../components/iconify';
import CounterDialog from '../Counters/CounterDialog';
import CounterBulkActionDialog from '../Counters/CounterBulkActionDialog';
import DatasetLinkedIcon from '@mui/icons-material/DatasetLinked';
import DatasetIcon from '@mui/icons-material/Dataset';
import WeekandTimeDialog from 'src/components/WeekandTimeDialog';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import { generateFilename } from 'src/helper/generateFilename';
import DownloadMenuDialog from 'src/components/DownloadMenuDialog';
import PreviewIcon from '@mui/icons-material/Preview';
import ViewInventoryDialog from './ViewInventoryDialog';
import UnlinkCount from 'src/pages/Products/UnlinkCount';
import COUNTERS_API from 'src/services/counters';
import moment from 'moment';
import ONLINE_ITEMS from 'src/services/onlineItemsServices';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import FDAutoEnableDialog from 'src/components/FDAutoEnableDialog';

// ----------------------------------------------------------------------

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: { xs: 125, sm: 96 },
  display: 'flex',
  justifyContent: 'space-between',
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

// ----------------------------------------------------------------------

InventoryListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterCategory: PropTypes.object,
  onFilterName: PropTypes.func,
  filterStatus: PropTypes.string,
  onFilterStatus: PropTypes.func,
  onFilterCategory: PropTypes.func,
  handleOpenNewProduct: PropTypes.func,
  intialFetch: PropTypes.func,
  allProductsWithUnits: PropTypes.array,
  selected: PropTypes.array,
  filterStockMonitor: PropTypes.array,
  onFilterStockMonitor: PropTypes.func,
  categoriesList: PropTypes.array,
  setFilterCategory: PropTypes.func,
  setFilterStatus: PropTypes.func,
  setFilterStockMonitor: PropTypes.func,
  setFilterSearchStatus: PropTypes.bool,
  handleChangeCounter: PropTypes.func,
  counter: PropTypes.array,
  handleChangeCategory: PropTypes.func,
  category: PropTypes.array,
};

export default function InventoryListToolbar({
  numSelected,
  onFilterName,

  handleOpenNewProduct,
  allProductsWithUnits,
  intialFetch,
  selected,
  setSelected,
  filterStatus,
  onFilterStatus,
  onFilterStockMonitor,
  filterStockMonitor,
  categoriesList,
  setFilterStatus,
  setFilterStockMonitor,
  setFilterSearchStatus,
  countersList,
  getCountersList,
  configuration,
  addonList,
  setLinkBulkAddon,
  handleChangeCounter,
  counter,
  category,
  handleChangeCategory,
  isOnline,
  handleIsOnline,
  storeReference,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const totalProducts = useRecoilValue(allProducts);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [openImport, setOpenImport] = useState(false);
  const defaultValueInventoryDialog = { isOpen: false, forUpload: '' };
  const [openPartnerImport, setOpenPartnerImport] = useState(defaultValueInventoryDialog);
  const [openQRImport, setOpenQRImport] = useState(false);
  const [openStockExport, setOpenStockExport] = useState(false);
  const defaultValue = { open: false, event: {}, data: {} };
  const [open, setOpen] = useState(defaultValue);
  const [openBulkAction, setOpenBulkAction] = useState(defaultValue);
  const [openCounters, setOpenCounters] = useState(false);
  const [selectAllCategory, setSelectAllCategory] = useState(true);
  const [selectAllCounters, setSelectAllCounters] = useState(true);
  const [selectAllStatus, setSelectAllStatus] = useState(false);
  const [selectAllStockMonitor, setSelectAllStockMonitor] = useState(true);
  const [openFloat, setOpenFloat] = useState(false);
  const [openLinkBulkCounters, setOpenLinkBulkCounters] = useState(false);
  const [openSession, setOpenSession] = useState(false);
  const counterSettings = get(configuration, 'counterSettings', {});
  const [terminalConfiguration, setTerminalConfiguration] = useRecoilState(
    terminalConfigurationState
  );
  const isDisableCounter = get(terminalConfiguration, 'isDisableCounter', false);

  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false);
  const defaultStateMenuDialog = { isOpen: false, data: [] };
  const [openDownloadMenu, setOpenDownloadMenu] = useState(defaultStateMenuDialog);
  const [openViewInventory, setOpenViewInventory] = useState(false);
  const [openUnlinkProduct, setOpenUnlinkProduct] = useState(false);
  const [currentProductData, setCurrentProduct] = useRecoilState(currentProduct);
  const currentStore = useRecoilValue(currentStoreId);
  const storeName = useRecoilValue(storeNameState);

  const storesDetails = useRecoilValue(fdSelectedStoreDetailsState);
  const isVisibleFD =
    storesDetails?.activeIn?.includes?.(SWIGGY) || storesDetails?.activeIn?.includes?.(ZOMATO);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const fetchProducts = async () => {
    await getProductsWithUnits();
    await getProductCategoryList();
    await getCountersList();
    await getAddonList();
  };
  const handleFloat = () => {
    setOpenFloat(!openFloat);
  };
  const handleOpenDownloadMenu = (data) => {
    setOpenDownloadMenu({ isOpen: true, data: data });
  };
  const handleCloseDownloadMenu = (data) => {
    setOpenDownloadMenu(defaultStateMenuDialog);
  };
  const handleOpenStockExport = () => {
    setOpenStockExport(true);
  };
  const handleCloseStockExport = () => {
    setOpenStockExport(false);
  };
  const handleOpenMenu = (event, product) => {
    setOpen({ open: true, eventData: event.currentTarget, data: product });
  };

  const handleCloseMenu = () => {
    setOpen(defaultValue);
  };
  const handleOpenBulkMenu = (event, product) => {
    setOpenBulkAction({ open: true, eventData: event.currentTarget });
  };
  const handleCloseBulkMenu = () => {
    setOpenBulkAction(defaultValue);
  };
  const handleOpenCounters = (event, product) => {
    setOpenCounters(true);
  };

  const handleOpenViewInventory = (event, product) => {
    setOpenViewInventory(true);
  };

  const handleCloseCounters = () => {
    setOpenCounters(false);
  };
  const handleOpenLinkBulkCounters = () => {
    setOpenLinkBulkCounters(true);
  };

  const handleCloseLinkBulkCounters = () => {
    setOpenLinkBulkCounters(false);
  };
  const handleOpenSession = () => {
    setOpenSession(true);
  };

  const handleCloseSession = () => {
    setOpenSession(false);
  };
  const handleOpenImport = () => {
    setOpenImport(true);
  };
  const handleGetMenu = async () => {
    if (!currentStore) return;
    try {
      const response = await PRODUCTS_API.getInventoryProducts({
        page: 1,
        size: 2000,
      });
      const formatData = map(get(response, 'data.data'), (e, index) => {
        return {
          storeId: get(e, 'storeId'),
          productId: get(e, 'productId'),
          shortCode: get(e, 'shortCode'),
          name: get(e, 'name'),
          description: get(e, 'description', ''),
          basePrice: get(e, 'basePrice', null),
          price: get(e, 'price'),
          category: get(e, 'category'),
          tag: get(e, 'tag'),
          attributes: get(e, 'attributes'),
          discount: get(e, 'discount'),
          offerPrice: get(e, 'offerPrice'),
          stockMonitor: get(e, 'stockMonitor'),
          stockQuantity: get(e, 'stockQuantity'),
          unitsEnabled: get(e, 'unitsEnabled'),
          unit: get(e, 'unit'),
          unitName: get(e, 'unitName'),
          counter: get(e, 'counter'),
          GSTPercent: get(e, 'GSTPercent'),
          GSTInc: get(e, 'GSTInc'),
          status: get(e, 'status'),
        };
      });
      handleOpenDownloadMenu(formatData);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSelectImportOptions = (e) => {
    handleCloseImport();
    if (e === IMPORT_EXPORT_TOOLBAR.PARTNER_INVENTORY) {
      handleOpenPartnerImport(e);
    }
    if (e === IMPORT_EXPORT_TOOLBAR.QR) {
      handleOpenQRImport();
    }
    if (e === IMPORT_EXPORT_TOOLBAR.STOCK) {
      handleOpenStockExport();
    }
    if (e === IMPORT_EXPORT_TOOLBAR.IMPORT_INVENTORY) {
      handleOpenPartnerImport(e);
    }
    if (e === IMPORT_EXPORT_TOOLBAR.EXPORT_MENU) {
      handleGetMenu();
    }
    if (e === IMPORT_EXPORT_TOOLBAR.IMPORT_ONLINE_STOCK) {
      handleOpenPartnerImport(e);
    }
  };

  const handleCloseImport = () => {
    setOpenImport(false);
  };
  const handleOpenPartnerImport = (e) => {
    setOpenPartnerImport({ isOpen: true, forUpload: e });
  };
  const handleClosePartnerImport = () => {
    setOpenPartnerImport(defaultValueInventoryDialog);
  };
  const handleOpenQRImport = () => {
    setOpenQRImport(true);
  };
  const handleCloseQRImport = (e) => {
    setOpenQRImport(false);
  };

  const handleUnlinkCounter = async (onClose) => {
    console.log('clicked');

    try {
      const options = {
        productId: selected,
      };

      const response = await COUNTERS_API.unlinkCounter(options);

      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        onClose();
        intialFetch();
        setSelected([]);
      } else {
        toast.error('No response from the API');
      }
    } catch (e) {
      toast.error(e?.errorResponse?.message || 'Unable to unlink to counter, Try Again');
    }
  };

  const handleOpenUnlink = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to unlink the counter ?`,
      actions: {
        primary: {
          text: 'Unlink',
          onClick: (onClose) => {
            handleUnlinkCounter(onClose);
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

  const handleCloseUnlink = () => {
    setOpenUnlinkProduct(false);
  };

  const handleSelectAllStatus = () => {
    if (!selectAllStatus) setFilterStatus([...StatusArrayConstants]);
    if (selectAllStatus) setFilterStatus([]);
    setSelectAllStatus(!selectAllStatus);
  };
  const handleSelectStockMontitor = () => {
    if (!selectAllStockMonitor) setFilterStockMonitor([...StockMonitorArrayConstants]);
    if (selectAllStockMonitor) setFilterStockMonitor([]);
    setSelectAllStockMonitor(!selectAllStockMonitor);
  };
  const deleteAllProduct = async (onClose) => {
    try {
      const options = {
        productId: selected,
      };
      const response = await PRODUCTS_API.deleteProduct(options);
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        intialFetch();
        onClose();
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || 'Unable to Delete Product, Try Again');
    }
  };
  const handleChangeProductStatus = async (status, onClose) => {
    try {
      const options = {
        productId: selected,
        status: status,
      };
      const response = await PRODUCTS_API.updateProductStatus(options);
      if (response) toast.success(SuccessConstants.STATUS_CHANGED);
      intialFetch();
      setSelected([]);
      onClose();
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_CHANGE_STATUS);
    }
  };
  const checkIsStatusAll = (status) => {
    const check = some(
      totalProducts,
      (e) => includes(selected, e.productId) && e.status === status
    );
    if (!check) return true;
    return false;
  };
  const checkIsAddonEmptyAll = () => {
    let check = true;
    if (check) {
      map(selected, (e) => {
        const product = find(totalProducts, (d) => d.productId === e);
        if (!isEmpty(product?.addOn)) {
          check = false;
        }
      });
    }
    return check;
  };
  const isInactiveAll = checkIsStatusAll(StatusConstants.INACTIVE);
  const isActiveAll = checkIsStatusAll(StatusConstants.ACTIVE);
  const isSoldOutAll = checkIsStatusAll(StatusConstants.SOLDOUT);
  const isAddonNA = checkIsAddonEmptyAll();

  const FDEnableItems = [];
  const FDDisableItems = [];
  const otherItems = [];

  forEach(allProductsWithUnits, (_product) => {
    const activeFDIcon =
      _product?.FDSettings?.available ||
      (_product?.FDSettings?.turnOnAt
        ? _product?.FDSettings?.turnOnAt >= moment().unix() * 1000
        : false);

    if (selected.includes(get(_product, 'productId'))) {
      if (get(_product, 'FDSettings') && activeFDIcon) {
        FDEnableItems.push(_product);
      } else if (get(_product, 'FDSettings') && !activeFDIcon) {
        FDDisableItems.push(_product);
      } else {
        otherItems.push(_product);
      }
    }
  });

  const isCheckAllEnableItems =
    !isEmpty(FDEnableItems) && isEmpty(otherItems) && isEmpty(FDDisableItems)
      ? every(FDEnableItems, (_product) => {
          const activeFDIcon =
            _product?.FDSettings?.available ||
            (_product?.FDSettings?.turnOnAt
              ? _product?.FDSettings?.turnOnAt >= moment().unix() * 1000
              : false);
          return activeFDIcon;
        })
      : false;

  const isCheckAllDisableItems =
    !isEmpty(FDDisableItems) && isEmpty(otherItems) && isEmpty(FDEnableItems)
      ? every(FDDisableItems, (_product) => {
          const activeFDIcon =
            _product?.FDSettings?.available ||
            (_product?.FDSettings?.turnOnAt
              ? _product?.FDSettings?.turnOnAt >= moment().unix() * 1000
              : false);
          return !activeFDIcon;
        })
      : false;

  const handleAlertDialog = ({ title, status }) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to ${title}`,
      actions: {
        primary: {
          text: title,
          onClick: (onClose) => {
            handleChangeProductStatus(status, onClose);
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
  const handleOpenLinkAddon = () => {
    setLinkBulkAddon({ isOpen: true, data: selected });
  };
  const checkCurrentCounterId = (counterId) => {
    const data = some(counter, (e) => e.id === counterId);
    return data;
  };
  const checkCurrentCategory = (name) => {
    const data = some(category, (e) => e.id === name);
    return data;
  };
  const handleDeleteAllProduct = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to delete products ?`,
      actions: {
        primary: {
          text: 'Delete',
          onClick: (onClose) => {
            deleteAllProduct(onClose);
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

  const toggleOnlineItem = async ({ status, onClose, event, onLoading } = {}) => {
    try {
      // onLoading?.(true);
      let dateWithTime;

      if (status === DISABLE) {
        dateWithTime = event.view.document.getElementsByName(
          ElementNames.DISABLE_ONLINE_ITEM_DATE_AND_TIME
        )?.[0]?.value;
      }

      const payload = {
        storeReference,
        itemList: selected,
        action: status,
        ...(dateWithTime
          ? { turnOnAt: moment(dateWithTime, 'YY-MM-DD hh:mm A').unix() * 1000 }
          : {}),
        actionType: 'TOGGLE_ITEM',
        storeName,
      };
      const response = await ONLINE_ITEMS.toggleOnlineItems(payload);

      if (response?.data?.recResponse?.message && response?.data?.recResponse?.status) {
        toast?.[response?.data?.recResponse?.status]?.(response?.data?.recResponse?.message);
      } else {
        toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
      }
      setSelected([]);
      intialFetch();
      // onLoading?.(false);
      onClose();
    } catch (err) {
      console.log('err', err);
      toast.error(err?.response?.message || err?.errorResponse?.message);
      // onLoading?.(false);
    }
  };

  const toggleOnlineItemWithAlertDialog = (status) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: (
        <Stack flexDirection="column" gap={1.5}>
          <Typography>Are you sure You want to {status} online items</Typography>
          {status === DISABLE && (
            <FDAutoEnableDialog
              DateTimePickerName={ElementNames.DISABLE_ONLINE_ITEM_DATE_AND_TIME}
            />
          )}
        </Stack>
      ),
      actions: {
        primary: {
          text: startCase(status),
          onClick: (onClose, onLoading, event) => {
            toggleOnlineItem({ status, onClose, event, onLoading });
          },
          sx: {
            backgroundColor: status === ENABLE ? 'green' : 'red',
            '&:hover': {
              backgroundColor: status === ENABLE ? 'green' : 'red',
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

  return (
    <>
      {/* <InventoryFloatingMenu
        open={openFloat}
        handleClose={handleFloat}
        handleOpenImport={handleOpenImport}
        handleOpenNewProduct={handleOpenNewProduct}
      /> */}
      <Tooltip title="Add new product">
        <Fab
          onClick={handleOpenNewProduct}
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 12, right: 16 }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      {(!isEmpty(allProductsWithUnits) || setFilterSearchStatus) && (
        <StyledRoot
          sx={{
            ...(numSelected > 0 && {
              color: 'common.white',
              bgcolor: 'primary.main',
              mt: 2,
            }),
            '&.MuiToolbar-root': {
              px: 0,
            },
          }}
        >
          <Stack
            sx={{
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              marginLeft: '-3px',
            }}
          >
            {numSelected > 0 ? (
              <Typography
                component="div"
                variant="subtitle1"
                marginLeft={1}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {numSelected} selected
              </Typography>
            ) : (
              <StyledSearch
                sx={{ width: { xs: '100% !important', sm: '50% !important' }, paddingLeft: '7px' }}
                className="inventoryStep3"
                size="small"
                onChange={onFilterName}
                placeholder="Search products..."
                startAdornment={
                  <InputAdornment position="start">
                    <Iconify
                      icon="eva:search-fill"
                      sx={{ color: 'text.disabled', width: 20, height: 20 }}
                    />
                  </InputAdornment>
                }
              />
            )}

            <Stack sx={{ width: '100%' }}>
              {numSelected > 0 ? (
                <Stack flexDirection={'row'} sx={{ alignItems: 'center', gap: 2 }}>
                  <Stack
                    sx={{
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 1,
                      width: '100%',
                    }}
                  >
                    <Popover
                      open={Boolean(get(openBulkAction, 'open'))}
                      anchorEl={get(openBulkAction, 'eventData')}
                      onClose={handleCloseBulkMenu}
                      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      PaperProps={{
                        sx: {
                          p: 1,
                          width: 170,
                          '& .MuiMenuItem-root': {
                            px: 1,
                            typography: 'body2',
                            borderRadius: 0.75,
                          },
                        },
                      }}
                    >
                      {isInactiveAll && (
                        <MenuItem
                          onClick={() => {
                            handleAlertDialog({
                              title: 'mark as inactive',
                              status: StatusConstants.INACTIVE,
                            });
                          }}
                        >
                          <GpsNotFixedIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />{' '}
                          Mark as inactive
                        </MenuItem>
                      )}
                      {isActiveAll && (
                        <MenuItem
                          onClick={() => {
                            handleAlertDialog({
                              title: 'mark as active',
                              status: StatusConstants.ACTIVE,
                            });
                          }}
                        >
                          <GpsFixedIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />
                          Mark as active
                        </MenuItem>
                      )}
                      {isSoldOutAll && (
                        <MenuItem
                          onClick={() => {
                            handleAlertDialog({
                              title: 'mark as soldout',
                              status: StatusConstants.SOLDOUT,
                            });
                          }}
                        >
                          <GpsOffIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />
                          Mark as soldout
                        </MenuItem>
                      )}
                      {isCountersEnabled && (
                        <MenuItem onClick={handleOpenLinkBulkCounters}>
                          <DatasetLinkedIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />
                          Link to Counter
                        </MenuItem>
                      )}
                      {isCountersEnabled && (
                        <MenuItem onClick={() => handleOpenUnlink(get(open, 'data'))}>
                          <DatasetIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />
                          Unlink to Counter
                        </MenuItem>
                      )}
                      {/* {!isEmpty(addonList) && isAddonNA && (
                        <MenuItem onClick={handleOpenLinkAddon}>
                          <ExtensionIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />
                          Link Addon
                        </MenuItem>
                      )} */}
                      <MenuItem onClick={handleOpenSession}>
                        <AccessTimeIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />
                        Add Session
                      </MenuItem>
                      <MenuItem onClick={handleDeleteAllProduct}>
                        <DeleteIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />
                        Delete All
                      </MenuItem>

                      {isVisibleFD && (
                        <>
                          <MenuItem
                            disabled={!isCheckAllDisableItems}
                            onClick={() => {
                              toggleOnlineItemWithAlertDialog(ENABLE);
                            }}
                          >
                            <img
                              src={
                                !isCheckAllDisableItems
                                  ? '/assets/swiggy-zomato-logo-disabled.svg'
                                  : '/assets/swiggy-zomato-logo.svg'
                              }
                              style={{ width: 23, height: 23, marginRight: 10 }}
                            />
                            Enable Items
                          </MenuItem>
                          <MenuItem
                            disabled={!isCheckAllEnableItems}
                            onClick={() => {
                              toggleOnlineItemWithAlertDialog('disable');
                            }}
                          >
                            <img
                              src={
                                !isCheckAllEnableItems
                                  ? '/assets/swiggy-zomato-logo-disabled.svg'
                                  : '/assets/swiggy-zomato-logo.svg'
                              }
                              style={{ width: 23, height: 23, marginRight: 10 }}
                            />
                            Disable Items
                          </MenuItem>
                        </>
                      )}
                    </Popover>
                  </Stack>

                  <Tooltip title="Bulk action">
                    <IconButton className="inventoryStep2" onClick={handleOpenBulkMenu}>
                      <Iconify
                        icon="mi:options-horizontal"
                        color="#FFFFFF"
                        width="60"
                        height="60"
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ) : (
                <Stack
                  sx={{
                    alignItems: 'center',
                    gap: 1,
                    flexDirection: { xs: 'column', sm: 'row', lg: 'row' },
                    width: '100%',
                  }}
                >
                  <Autocomplete
                    multiple
                    size="small"
                    filterSelectedOptions
                    options={map(categoriesList, (_item) => ({
                      label: _item,
                      id: _item,
                    }))}
                    filterOptions={(options, { inputValue }) => {
                      const searchTerm = inputValue.toLowerCase();
                      return options.filter((option) =>
                        option.label.toLowerCase().startsWith(searchTerm)
                      );
                    }}
                    value={category}
                    getOptionDisabled={(option) => checkCurrentCategory(option.id)}
                    onChange={(event, newValue) => handleChangeCategory(newValue)}
                    sx={{ minWidth: 200, width: '100%', flexWrap: 'nowrap' }}
                    renderInput={(params) => (
                      <TextField variant="filled" {...params} label={'Category'} />
                    )}
                  />
                  {!isDisableCounter && (
                    <Autocomplete
                      multiple
                      size="small"
                      filterSelectedOptions
                      options={map(countersList, (_item) => ({
                        label: get(_item, 'name'),
                        id: get(_item, 'counterId'),
                      }))}
                      value={counter}
                      filterOptions={(options, { inputValue }) => {
                        const searchTerm = inputValue.toLowerCase();
                        return options.filter((option) =>
                          option.label.toLowerCase().startsWith(searchTerm)
                        );
                      }}
                      getOptionDisabled={(option) => checkCurrentCounterId(option.id)}
                      onChange={(event, newValue) => handleChangeCounter(newValue)}
                      sx={{ minWidth: 200, width: '100%', flexWrap: 'nowrap' }}
                      renderInput={(params) => (
                        <TextField variant="filled" {...params} label={'Counter'} />
                      )}
                    />
                  )}

                  <Stack
                    sx={{
                      alignItems: 'center',
                      gap: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      width: '100%',
                    }}
                  >
                    <Tooltip title={isOnline ? 'Online products' : 'Offline products'}>
                      <IconButton
                        color="primary"
                        onClick={() => {
                          handleIsOnline(!isOnline);
                        }}
                      >
                        {isOnline ? (
                          <img
                            src={`/assets/swiggy-zomato-logo.svg`}
                            style={{ width: 23, height: 23, opacity: 20 }}
                          />
                        ) : (
                          <img
                            src={`/assets/swiggy-zomato-logo-disabled.svg`}
                            style={{ width: 23, height: 23, opacity: 20 }}
                          />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Inventory stock">
                      <IconButton color="primary" onClick={handleOpenViewInventory}>
                        <Iconify icon={'fluent-mdl2:quantity'} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Import/Export">
                      <IconButton color="primary" onClick={handleOpenImport}>
                        <ImportExportIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Filter list">
                      <IconButton className="inventoryStep2" onClick={handleOpenMenu}>
                        <Iconify icon="ic:round-filter-list" color="#5a0b45" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
        </StyledRoot>
      )}
      {openQRImport && (
        <FullScreenInventoryAdd open={openQRImport} handleClose={handleCloseQRImport} />
      )}
      {openDownloadMenu.isOpen && (
        <DownloadMenuDialog
          open={openDownloadMenu.isOpen}
          data={openDownloadMenu.data}
          handleClose={handleCloseDownloadMenu}
        />
      )}
      {openUnlinkProduct && (
        <UnlinkCount
          open={openUnlinkProduct}
          product={currentProductData}
          handleClose={handleCloseUnlink}
          syncUpProducts={fetchProducts}
        />
      )}
      {openStockExport && (
        <FullScreenStockView
          data={allProductsWithUnits}
          open={openStockExport}
          handleClose={handleCloseStockExport}
        />
      )}
      {openCounters && (
        <CounterDialog
          open={openCounters}
          handleClose={handleCloseCounters}
          countersList={countersList}
          getCountersList={getCountersList}
        />
      )}
      {openLinkBulkCounters && (
        <CounterBulkActionDialog
          selected={selected}
          open={openLinkBulkCounters}
          countersList={countersList}
          intialFetch={intialFetch}
          setSelected={setSelected}
          handleClose={handleCloseLinkBulkCounters}
        />
      )}
      <UploadDialog
        intialFetch={intialFetch}
        open={get(openPartnerImport, 'isOpen')}
        handleClose={handleClosePartnerImport}
        forUpload={get(openPartnerImport, 'forUpload')}
      />
      <WeekandTimeDialog
        isBulkAction={true}
        selected={selected}
        open={openSession}
        handleClose={handleCloseSession}
        intialFetch={intialFetch}
      />
      <InventoryAddOptions
        data={allProductsWithUnits}
        open={openImport}
        handleClose={handleSelectImportOptions}
      />

      {openViewInventory && (
        <ViewInventoryDialog
          isOpen={openViewInventory}
          onClose={() => {
            setOpenViewInventory(false);
          }}
        />
      )}

      <Popover
        open={Boolean(get(open, 'open'))}
        anchorEl={get(open, 'eventData')}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 160,
            maxHeight: 400,
            ...hideScrollbar,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          Status
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={false}
                checked={selectAllStatus}
                onChange={handleSelectAllStatus}
                name={'All'}
              />
            }
            label={'Select All'}
          />
          <FormControlLabel
            control={
              <Checkbox
                disabled={selectAllStatus}
                defaultChecked={true}
                checked={filterStatus.includes(StatusConstants.ACTIVE) || selectAllStatus}
                onChange={onFilterStatus}
                name={StatusConstants.ACTIVE}
              />
            }
            label="Active"
          />
          <FormControlLabel
            control={
              <Checkbox
                disabled={selectAllStatus}
                defaultChecked={false}
                checked={filterStatus.includes(StatusConstants.INACTIVE) || selectAllStatus}
                onChange={onFilterStatus}
                name={StatusConstants.INACTIVE}
              />
            }
            label="Inactive"
          />
          <FormControlLabel
            control={
              <Checkbox
                disabled={selectAllStatus}
                defaultChecked={true}
                checked={filterStatus.includes(StatusConstants.SOLDOUT) || selectAllStatus}
                onChange={onFilterStatus}
                name={StatusConstants.SOLDOUT}
              />
            }
            label="Soldout"
          />
        </FormGroup>
        <Divider />
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          Stock Monitor
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={selectAllStockMonitor}
                checked={selectAllStockMonitor}
                onChange={handleSelectStockMontitor}
                name={'All'}
              />
            }
            label={'Select All'}
          />
          <FormControlLabel
            control={
              <Checkbox
                disabled={selectAllStockMonitor}
                defaultChecked={selectAllStockMonitor}
                checked={
                  filterStockMonitor.includes(StockMonitorConstants.ENABLED) ||
                  selectAllStockMonitor
                }
                onChange={onFilterStockMonitor}
                name={StockMonitorConstants.ENABLED}
              />
            }
            label="Enabled"
          />
        </FormGroup>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                disabled={selectAllStockMonitor}
                defaultChecked={selectAllStockMonitor}
                checked={
                  filterStockMonitor.includes(StockMonitorConstants.DISABLED) ||
                  selectAllStockMonitor
                }
                onChange={onFilterStockMonitor}
                name={StockMonitorConstants.DISABLED}
              />
            }
            label="Disabled"
          />
        </FormGroup>
      </Popover>
    </>
  );
}
