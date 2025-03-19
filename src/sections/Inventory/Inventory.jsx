import { sentenceCase } from 'change-case';
import { clone, compact, debounce, filter, findIndex, get, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import {
  Box,
  Checkbox,
  Container,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
// sections
import { InventoryListHead, InventoryListToolbar } from 'src/sections/Inventory/headers';
// mock
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import {
  InventoryTableColumns,
  NAVIGATION_STATE_KEY,
  StatusConstants,
  hideScrollbar,
  ROLES_WITHOUT_STORE_STAFF,
  defaultOrderTypes,
  ROLES_DATA,
} from 'src/constants/AppConstants';
import { base64_images } from 'src/constants/ImageConstants';
import {
  alertDialogInformationState,
  allAddons,
  allCategories,
  allProducts,
  currentProduct,
  currentStoreId,
  currentTerminalId,
  isMembershipState,
} from 'src/global/recoilState';
import HandleItemDrawer from 'src/pages/Products/HandleItemDrawer';
import PRODUCTS_API from 'src/services/products';
// @mui
import { useTheme } from '@mui/material';
// components
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExtensionIcon from '@mui/icons-material/Extension';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { find } from 'lodash';
import { useLocation, useNavigate } from 'react-router';
import { useSetRecoilState } from 'recoil';
import { SeverErrorIllustration } from 'src/assets/illustrations';
import LinkAddOnDialog from 'src/components/LinkAddOnDialog';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import VegNonIcon from 'src/components/VegNonIcon';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { SortingConstants } from 'src/constants/AppConstants';
import { inventoryTourConfig } from 'src/constants/TourConstants';
import { allConfiguration } from 'src/global/recoilState';
import DeleteProduct from 'src/pages/Products/DeleteProduct';
import ManageProductStock from 'src/pages/Products/ManageProductStock';
import { PATH_DASHBOARD } from 'src/routes/paths';
import SettingServices from 'src/services/API/SettingServices';
import { useSettingsContext } from '../../components/settings';
import GenerateQRBarCodeDialog from 'src/components/GenerateQRBarCodeDialog';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AuthService from '../../services/authService';
import { formatAmountToIndianCurrency } from '../../utils/formatNumber';
import InventoryTable from './InventoryTable';
import RawMaterialTable from 'src/sections/RawMaterials/RawMaterial';
import COUNTERS_API from 'src/services/counters';
import { Icon } from '@iconify/react';
import LinkIngredientDialog from 'src/components/LinkIngredientDialog';
import LinkProductDialog from 'src/components/LinkProductDialog';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import DatasetLinkedIcon from '@mui/icons-material/DatasetLinked';
import DatasetIcon from '@mui/icons-material/Dataset';
import CounterBulkActionDialog from './Counters/CounterBulkActionDialog';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WeekandTimeDialog from 'src/components/WeekandTimeDialog';
import UnlinkCount from 'src/pages/Products/UnlinkCount';
import STORES_API from 'src/services/stores';
import { formatOrderTypeDataStrucutre } from 'src/utils/formatOrderTypeDataStrucutre';
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
function sortArray(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function Inventory() {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const isMobile = useMediaQuery('(max-width:600px');
  const isDesktop = useMediaQuery('(min-width:1469px');
  const location = useLocation();
  const defaultValue = { open: false, event: {}, data: {} };
  const [open, setOpen] = useState(defaultValue);
  const [page, setPage] = useState(0);
  const [isMembershipEnable, setIsMembershipEnable] = useRecoilState(isMembershipState);
  const [allProductsWithUnits, setAllProductsWithUnits] = useRecoilState(allProducts);
  const [categoriesList, setCategoriesList] = useRecoilState(allCategories);
  const setProductCategoryList = useSetRecoilState(allCategories);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  console.log('allProductsWithUnits', allProductsWithUnits);

  const [filterStatus, setFilterStatus] = useState([
    StatusConstants.ACTIVE,
    StatusConstants.SOLDOUT,
  ]);
  const [filterStockMonitor, setFilterStockMonitor] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const theme = useTheme();
  const navigate = useNavigate();
  const { themeStretch } = useSettingsContext();
  const currentStore = useRecoilValue(currentStoreId);
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [addonList, setAddonList] = useRecoilState(allAddons);
  const [addonOpenDialog, setAddonOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newProduct, setNewProduct] = useState(false);
  const [currentProductData, setCurrentProduct] = useRecoilState(currentProduct);    
  const [currentProductAddon, setCurrentProductAddon] = useState([]);
  const [stockOpenDialog, setStockOpenDialog] = useState(false);
  const [openIngredientsDialog, setOpenIngredientsDialog] = useState(false);
  const [openProductsDialog, setOpenProductsDialog] = useState(false);

  const [currentProductStock, setCurrentProductStock] = useState({});
  const resetCurrentProduct = useResetRecoilState(currentProduct);
  const [selectedValues, setSelectedValues] = useState([]);
  const [isUnitEnable, setIsUnitEnable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [productUnitDetails, setProductUnitDetails] = useState([]);
  const [addMoreUnits, setAddMoreUnits] = useState(false);
  const [openDeleteProduct, setOpenDeleteProduct] = useState(false);
  const [openUnlinkProduct, setOpenUnlinkProduct] = useState(false);
  const [filterSearchStatus, setFilterSearchStatus] = useState(false);
  const [currentTerminal, setSelectedTerminal] = useRecoilState(currentTerminalId);
  const [isView, setIsView] = useState(false);
  const defaultLinkAddonDialogValue = { isOpen: false, data: [] };
  const [linkBulkAddon, setLinkBulkAddon] = useState(defaultLinkAddonDialogValue);
  const [openGenerateQR, setOpenGenerateQR] = useState({ isOpen: false, data: {} });
  const [selected, setSelected] = useState([]);
  const [countersList, setCountersList] = useState([]);
  const [counter, setCounter] = useState([]);
  const [category, setCategory] = useState([]);
  const counterSettings = get(configuration, 'counterSettings', {});
  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false);
  const isShowMRP = get(configuration, 'featureSettings.isMRP', false);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const [openLinkBulkCounters, setOpenLinkBulkCounters] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [IsSessionDialog, setIsSessionDialog] = useState(false);
  console.log(isHover, 'hover');
  const [submittedSessionData, setSubmittedSessionData] = useState({});
  const isOrderTypeEnable = get(configuration, 'isOrderType.isActive', false);
  const previouseOrderTypeList = get(configuration, 'isOrderType.orderTypes', defaultOrderTypes);
  const orderTypesList = formatOrderTypeDataStrucutre(previouseOrderTypeList);
  const mouseEnterFunction = () => {
    setIsHover(true);
  };

 
  const mouseLeaveFunction = () => {
    setIsHover(false);
  };
  const handleOpenSession = () => {
    setSubmittedSessionData(get(open, 'data.sessionInfo') || {});
    setIsSessionDialog(true);
  };
  const handleCloseSession = (isClose) => {
    setIsSessionDialog(false);
  };
  const handleOpenAddonDialog = (e) => {
    if (isEmpty(addonList)) {
      navigate(PATH_DASHBOARD.inventory.addon, { replace: true });
    } else if (!isEmpty(addonList)) {
      const addOnData = find(allProductsWithUnits, (d) => d.productId === e.productId);
      setAddonOpenDialog(true);
      setCurrentProductAddon(get(addOnData, 'addOn', []));
      setCurrentProduct(e);
    }
  };

  const getAccountInformation = async () => {
    if (!currentStore && !currentTerminal) return;
    try {
      const res = await STORES_API.getAccountInfo({
        storeId: currentStore,
        terminalId: currentTerminal,
      });
      setIsMembershipEnable(get(res, 'data.dataValues.merchantSettings.memberShip.isActive'));
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  useEffect(() => {
    getAccountInformation();
  }, []);

  const handleOpenStockDialog = async (e) => {
    handleCloseMenu();
    setCurrentProductStock(e);
    setStockOpenDialog(true);
  };
  const handleOpenIngredientsDialog = async (e) => {
    handleCloseMenu();
    setCurrentProduct(e);
    setOpenIngredientsDialog(true);
  };
  const handleCloseIngredientsDialog = async (e) => {
    setCurrentProductStock({});
    setOpenIngredientsDialog(false);
  };
  const handleOpenProductsDialog = async (e) => {
    handleCloseMenu();
    setCurrentProduct(e);
    setOpenProductsDialog(true);
  };
  const handleCloseProductsDialog = async (e) => {
    setCurrentProductStock({});
    setOpenProductsDialog(false);
  };
  const handleDeleteStockDialog = async (e) => {
    handleCloseMenu();
    setCurrentProduct(e);
    setOpenDeleteProduct(true);
  };

  const handleCloseAddOnDialog = () => {
    handleCloseMenu();
    setAddonOpenDialog(false);
    setCurrentProductAddon([]);
    resetCurrentProduct({});
    setSelectedValues([]);
    setLinkBulkAddon(defaultLinkAddonDialogValue);
    setTimeout(() => {
      setIsView(false);
    }, 100);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    resetCurrentProduct();
    setEditMode(false);
    setAddMoreUnits(false);
    setNewProduct(false);
    setOpenDeleteProduct(false);
    navigate(PATH_DASHBOARD.inventory.products, {
      state: {},
    });
  };
  const handleCloseUnlink = () => {
    setOpenUnlinkProduct(false);
  };
  const handleOpenUnlink = (e) => {
    setCurrentProduct(e);
    setOpenUnlinkProduct(true);
  };

  const handleOpenDrawer = () => {
    handleCloseMenu();
    setOpenDrawer(true);
  };
  const initialFetch = async () => {
    try {
      let resp = {}
      if( currentRole === ROLES_DATA.store_staff.role) {
        resp = await SettingServices.getViewConfiguration();
      } else {
        resp = await SettingServices.getConfiguration();
      }
      if (resp) {
        setConfiguration({
          ...(configuration || {}),
          ...(get(resp, 'data.0') || {}),
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getAddonList = async () => {
    try {
      const response = await PRODUCTS_API.getAddons(
        StatusConstants.ACTIVE,
        SortingConstants.OLDEST
      );
      if (response) setAddonList(response.data);
    } catch (e) {
      console.log(e);
    }
  };
  const getCountersList = async () => {
    try {
      const response = await COUNTERS_API.getAllCounters();
      setCountersList(get(response, 'data'));
    } catch (e) {
      setCountersList([]);
      console.log(e);
    }
  };
  const getProductCategoryList = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      const response = await PRODUCTS_API.getInventoryProductCategoryList({ status: filterStatus });
      if (response) setCategoriesList(response.data);
      setProductCategoryList(get(response, 'data'));
    } catch (e) {
      console.log(e);
      setCategoriesList([]);
    }
  };
  const getProductsWithUnits = async (filterName) => {
    try {
      const options = {
        page: page + 1,
        size: rowsPerPage,
        status: filterStatus,
        stockMonitor: filterStockMonitor,
        category: map(category, (e) => e.id),
        prodName: filterName,
        counterId: map(counter, (e) => e.id),
      };
      if (filterName || filterStatus || category || filterStockMonitor || counter)
        setFilterSearchStatus(true);
      const response = await PRODUCTS_API.getInventoryProducts(options);
      if (response) {
        setAllProductsWithUnits(get(response, 'data.data', []));
        setTotalRowCount(get(response, 'data.totalItems', 0));
      } else {
        setAllProductsWithUnits([]);
        setTotalRowCount(0);
      }
      setFilterSearchStatus(false);
    } catch (e) {
      console.log(e);
      setAllProductsWithUnits([]);
    }
  };

  const handleItem = (e) => {
    setCurrentProduct(e);
    setEditMode(true);
    handleOpenDrawer();
  };
  const handleOpenNewProduct = () => {
    setCurrentProduct({});
    handleOpenDrawer();
    resetCurrentProduct();
    setNewProduct(true);
    setEditMode(true);
  };

  const getAllData = async () => {
    try {
      setIsLoading(true);
      await initialFetch();
      await fetchProducts();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchProducts = async () => {
    await getProductsWithUnits();
    await getProductCategoryList();
    await getCountersList();
    await getAddonList();
  };
  const handleSubmitBulkAction = async (data = {}) => {
    try {
      let options = [];

      options.push({
        ...data,
        productId: get(open, 'data.productId'),
        storeId: currentStore,
      });
      const response = await PRODUCTS_API.putBulkSession(options);
      if (response) toast.success(SuccessConstants.SESSION_SUCCESSFUL);
      handleCloseSession();
      handleCloseMenu();
      getAllData();
    } catch (e) {
      console.log(e);
    }
  };
  const handleOpenMenu = (event, product) => {
    setOpen({ open: true, eventData: event.currentTarget, data: product });
  };

  const handleCloseMenu = () => {
    setOpen(defaultValue);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = allProductsWithUnits.map((n) => n.productId);
      setSelected(newSelecteds);
      return;
    } else setSelected([]);
  };
  const handleChangeCounter = (e) => {
    setPage(0);
    setCounter(e);
  };
  const handleChangeCategory = (e) => {
    setPage(0);
    setCategory(e);
  };
  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);

    if (!isEmpty(selected)) {
      setSelected([])
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = debounce((event) => {
    setPage(0);
    getProductsWithUnits(event.target.value);
  }, 1000);

  const handleFilterByStatus = (event) => {
    setPage(0);
    setFilterStatus((prev) => {
      if (event.target.checked) {
        return [...prev, event.target.name];
      } else {
        return prev.filter((category) => category !== event.target.name);
      }
    });
  };
  const handleFilterByStockMonitor = (event) => {
    setPage(0);
    setPage(0);
    setFilterStockMonitor((prev) => {
      if (event.target.checked) {
        return [...prev, event.target.name];
      } else {
        return prev.filter((category) => category !== event.target.name);
      }
    });
  };

  const sorted = sortArray(allProductsWithUnits, getComparator(order, orderBy));

  useEffect(() => {
    const data = location?.state;
    if (get(data, 'navigateFor') === NAVIGATION_STATE_KEY.ADD_PRODUCT) {
      handleOpenNewProduct();
    }
  }, [location]);

  useEffect(() => {
    if (currentStore && (!isEmpty(allProductsWithUnits) || filterSearchStatus)) fetchProducts();
  }, [currentStore, page, rowsPerPage, filterStatus, filterStockMonitor, category, counter]);
  useEffect(() => {
    if (currentStore && isEmpty(allProductsWithUnits) && !filterSearchStatus) getAllData();
  }, [currentStore, page, rowsPerPage, filterStatus, filterStockMonitor, category, counter]);

  const isNotFound = !allProductsWithUnits.length && !!filterSearchStatus;

  const isSinglePage = rowsPerPage >= totalRowCount;

  useEffect(() => {
    if (location?.state?.isDrawerOpen) {
      handleOpenNewProduct();
    }
  }, [location]);


  useEffect(() => {
    if (page) {
      setSelected()
    }
  }, [page]) 

  const formatHeaderList = () => {
    const filterInventoryTableColumns = filter(InventoryTableColumns, (_item) => {
      if (!isCountersEnabled || !isShowMRP) {
        if (!isCountersEnabled && !isShowMRP) {
          return get(_item, 'id') !== 'counterId' && get(_item, 'id') !== 'mrp';
        }
        if (!isCountersEnabled) {
          return get(_item, 'id') !== 'counterId';
        }
        if (!isShowMRP) {
          return get(_item, 'id') !== 'mrp';
        }
      }
      return true;
    });
    const clonedColumns = clone(filterInventoryTableColumns);
    const findedIndex = findIndex(clonedColumns, (e) => e.id === 'memberPrice');

    let formatted = compact(
      map(orderTypesList, (e) => {
        if (!defaultOrderTypes.includes(e))
          return {
            label: `${e} price `,
            id: `${e}`,
            alignRight: false,
            style: { minWidth: 130 },
          };
      })
    );
    const filterColumnsWithDynamicPrice = [
      ...clonedColumns.slice(0, findedIndex + 1),
      ...formatted,
      ...clonedColumns.slice(findedIndex + 1, clonedColumns.length),
    ];
    console.log('formatted', formatted);
    return ROLES_WITHOUT_STORE_STAFF.includes(currentRole)
      ? filterColumnsWithDynamicPrice
      : filter(filterColumnsWithDynamicPrice, (_item) => {
          return get(_item, 'id') !== 'basePrice';
        });
  };
  const handleOpenLinkBulkCounters = () => {
    setOpenLinkBulkCounters(true);
  };

  const handleCloseLinkBulkCounters = () => {
    setOpenLinkBulkCounters(false);
  };
  const handleChangeProductStatus = async (productId, status, onClose) => {
    try {
      const options = {
        productId,
        status: status,
      };
      const response = await PRODUCTS_API.updateProductStatus(options);
      if (response) toast.success(SuccessConstants.STATUS_CHANGED);
      getAllData();
      onClose();
      handleCloseMenu();
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_CHANGE_STATUS);
    }
  };
  const handleAlertDialog = ({ title, status, productId }) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to ${title}`,
      actions: {
        primary: {
          text: title,
          onClick: (onClose) => {
            handleChangeProductStatus(productId, status, onClose);
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
  return (
    <>
      <Helmet>
        <title> INVENTORY | POSITEASY </title>
      </Helmet>
      <Container
        className="inventoryStep1"
        maxWidth={themeStretch ? false : 'xxl'}
        sx={{
          '&.MuiContainer-root': {
            p: 1.5,
            maxHeight: '90vh',
          },
        }}
      >
        {isEmpty(allProductsWithUnits) &&
          !filterSearchStatus &&
          isEmpty(counter) &&
          isEmpty(filterStatus) &&
          isEmpty(category) && (
            <Tooltip title="Click to add products to inventory">
              <Stack
                direction={'column'}
                onClick={handleOpenNewProduct}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  cursor: 'pointer',
                  alignItems: 'center',
                  border: `1.5px dotted ${theme.palette.primary.main}`,
                  padding: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.lighter, 0.4),
                  },
                }}
              >
                <AddCircleIcon fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">Create new product</Typography>
              </Stack>
            </Tooltip>
          )}
        {/* {isEmpty(allProductsWithUnits) &&
          (filterSearchStatus ||
            !isEmpty(counter) ||
            !isEmpty(filterStatus) ||
            !isEmpty(category)) && (
            <Tooltip title="Not found">
              <Stack
                direction={'column'}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '55%',
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 'bold',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">
                  {!isEmpty(filterStatus) || !isEmpty(counter) || !isEmpty(category)
                    ? `Filtered  products not found`
                    : 'Products not found'}
                </Typography>
              </Stack>
            </Tooltip>
          )} */}
        <InventoryListToolbar
          category={category}
          setCategory={setCategory}
          setLinkBulkAddon={setLinkBulkAddon}
          addonList={addonList}
          setFilterSearchStatus={setFilterSearchStatus}
          numSelected={get(selected, "length", 0)}
          onFilterName={handleFilterByName}
          handleOpenNewProduct={handleOpenNewProduct}
          allProductsWithUnits={allProductsWithUnits}
          intialFetch={getAllData}
          selected={selected}
          setSelected={setSelected}
          filterStatus={filterStatus}
          onFilterStatus={handleFilterByStatus}
          filterStockMonitor={filterStockMonitor}
          onFilterStockMonitor={handleFilterByStockMonitor}
          categoriesList={categoriesList}
          setFilterStatus={setFilterStatus}
          setFilterStockMonitor={setFilterStockMonitor}
          countersList={countersList}
          getCountersList={getCountersList}
          counter={counter}
          handleChangeCounter={handleChangeCounter}
          handleChangeCategory={handleChangeCategory}
          configuration={configuration}
        />

        {isEmpty(allProductsWithUnits) &&
          (filterSearchStatus ||
            !isEmpty(counter) ||
            !isEmpty(filterStatus) ||
            !isEmpty(category)) && (
            <Stack
              direction={'column'}
              sx={{
                minWidth: '100%',
                maxHeight: isMobile ? 640 : isDesktop ? 690 : 540,
                minHeight: isMobile ? 640 : isDesktop ? 690 : 540,
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                alignItems: 'center',
              }}
            >
              <Tooltip title="Not found">
                <Typography variant="h6">
                  {!isEmpty(filterStatus) || !isEmpty(counter) || !isEmpty(category)
                    ? `Filtered  products not found`
                    : 'Products not found'}
                </Typography>
              </Tooltip>
            </Stack>
          )}
        {(!isEmpty(allProductsWithUnits) || filterSearchStatus) && (
          <Scrollbar>
            <TableContainer
              sx={{
                minWidth: '100%',
                maxHeight: isMobile ? 640 : isDesktop ? 690 : 540,
                minHeight: isMobile ? 640 : isDesktop ? 690 : 540,
              }}
            >
              <Table stickyHeader>
                <InventoryListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={formatHeaderList()}
                  rowCount={rowsPerPage}
                  numSelected={get(selected, "length", 0)}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {map(sorted, (row) => {
                    const {
                      merchantId,
                      storeId,
                      productId,
                      shortCode,
                      name,
                      description,
                      basePrice,
                      price,
                      productImage,
                      category,
                      tag,
                      attributes,
                      discount,
                      offerPrice,
                      stockMonitor,
                      stockQuantity,
                      unitsEnabled,
                      unit,
                      unitName,
                      counter,
                      GSTPercent,
                      status,
                      createdAt,
                      updatedAt,
                      addOn,
                      StockAlert,
                    } = row;

                    return (
                      <InventoryTable
                        row={row}
                        setIsView={setIsView}
                        setCurrentProductAddon={setCurrentProductAddon}
                        setAddonOpenDialog={setAddonOpenDialog}
                        selected={selected}
                        setOpen={setOpen}
                        setSelected={setSelected}
                        order={order}
                        orderBy={orderBy}
                        setOpenGenerateQR={setOpenGenerateQR}
                        countersList={countersList}
                        setOpenIngredientsDialog={setOpenIngredientsDialog}
                      />
                    );
                  })}
                </TableBody>
                {isNotFound && (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'text.secondary',
                        fontWeight: 'bold',
                        fontSize: '20px',
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        whiteSpace: 'nowrap',
                        flexDirection: 'column',
                        textAlign: 'center',
                      }}
                    >
                      <Box display={'inline-block'} sx={{ justifyContent: 'center' }}>
                        <SeverErrorIllustration />
                        No products found!
                      </Box>
                    </Box>
                  </>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>
        )}
        {(!isEmpty(allProductsWithUnits) || filterSearchStatus) && (
          <TablePagination
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              '& .MuiTablePagination-actions': {
                // display: isSinglePage ? 'none' : 'block',
              },
            }}
            labelRowsPerPage=""
            rowsPerPageOptions={[5, 10, 25, 50, 100, 250, 500]}
            component="div"
            count={totalRowCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Container>
      <Popover
        open={Boolean(get(open, 'open'))}
        anchorEl={get(open, 'eventData')}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 165,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        {get(open, 'data.status') !== StatusConstants.INACTIVE && (
          <MenuItem
            onClick={() => {
              handleAlertDialog({
                title: 'mark as inactive',
                status: StatusConstants.INACTIVE,
                productId: get(open, 'data.productId'),
              });
            }}
          >
            <GpsNotFixedIcon sx={{ color: theme.palette.primary.main, mr: 1 }} /> Mark as inactive
          </MenuItem>
        )}
        {get(open, 'data.status') !== StatusConstants.ACTIVE && (
          <MenuItem
            onClick={() => {
              handleAlertDialog({
                title: 'mark as active',
                status: StatusConstants.ACTIVE,
                productId: get(open, 'data.productId'),
              });
            }}
          >
            <GpsFixedIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
            Mark as active
          </MenuItem>
        )}
        {get(open, 'data.status') !== StatusConstants.SOLDOUT && (
          <MenuItem
            onClick={() => {
              handleAlertDialog({
                title: 'mark as soldout',
                status: StatusConstants.SOLDOUT,
                productId: get(open, 'data.productId'),
              });
            }}
          >
            <GpsOffIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
            Mark as soldout
          </MenuItem>
        )}
        {isCountersEnabled && (
          <MenuItem onClick={handleOpenLinkBulkCounters}>
            <DatasetLinkedIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
            Link to Counter
          </MenuItem>
        )}
        {isCountersEnabled && (
          <MenuItem onClick={() => handleOpenUnlink(get(open, 'data'))}>
            <DatasetIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
            Unlink to Counter
          </MenuItem>
        )}
        <MenuItem onClick={handleOpenSession}>
          <AccessTimeIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          Add Session
        </MenuItem>
        <MenuItem onClick={() => handleOpenStockDialog(get(open, 'data'))}>
          <Iconify
            icon={'fluent-mdl2:quantity'}
            sx={{ mr: 1, color: theme.palette.primary.main }}
          />
          Manage stock
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOpenGenerateQR({ isOpen: true, data: get(open, 'data') });
            handleCloseMenu();
          }}
        >
          <QrCodeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          QR
        </MenuItem>
        <MenuItem onClick={() => handleItem(get(open, 'data'))}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 1, color: theme.palette.primary.main }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteStockDialog(get(open, 'data'))}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 1, color: theme.palette.primary.main }} />
          Delete
        </MenuItem>
      </Popover>
      {!isEmpty(currentProductStock) && (
        <ManageProductStock
          handleClose={() => {
            setStockOpenDialog(false);
            setCurrentProductStock({});
          }}
          setCurrentProductStock={setCurrentProductStock}
          open={stockOpenDialog}
          syncUpProducts={fetchProducts}
          currentProductStock={currentProductStock}
        />
      )}
      {!isEmpty(currentProductData) && (
        <DeleteProduct
          open={openDeleteProduct}
          product={currentProductData}
          handleClose={handleCloseDrawer}
          syncUpProducts={fetchProducts}
        />
      )}
      {openUnlinkProduct && (
        <UnlinkCount
          open={openUnlinkProduct}
          product={currentProductData}
          intialFetch={() => {
            getAllData();
            handleCloseMenu();
          }}
          handleClose={handleCloseUnlink}
          syncUpProducts={fetchProducts}
          selected={[get(open, 'data.productId')]}
          setSelected={setSelected}
        />
      )}
      {!isEmpty(addonList) && (
        <LinkAddOnDialog
          bulkUpdate={linkBulkAddon}
          isView={isView}
          addonOpenDialog={addonOpenDialog}
          handleCloseAddOnDialog={handleCloseAddOnDialog}
          currentProductAddon={currentProductAddon}
          selectedValues={selectedValues}
          setSelectedValues={setSelectedValues}
          addonList={addonList}
          currentProductData={currentProductData}
          syncUpProducts={fetchProducts}
        />
      )}
      {get(openGenerateQR, 'isOpen') && (
        <GenerateQRBarCodeDialog
          data={get(openGenerateQR, 'data')}
          open={get(openGenerateQR, 'isOpen')}
          handleClose={() => setOpenGenerateQR({ isOpen: false, data: {} })}
        />
      )}
      {openIngredientsDialog && (
        <LinkIngredientDialog
          open={openIngredientsDialog}
          handleClose={handleCloseIngredientsDialog}
          productData={currentProductData}
          syncUpProducts={fetchProducts}
        />
      )}
      {openProductsDialog && (
        <LinkProductDialog
          open={openProductsDialog}
          handleClose={handleCloseProductsDialog}
          productData={currentProductData}
          syncUpProducts={fetchProducts}
        />
      )}
      {openLinkBulkCounters && (
        <CounterBulkActionDialog
          selected={[get(open, 'data.productId')]}
          open={openLinkBulkCounters}
          countersList={countersList}
          intialFetch={() => {
            getAllData();
            handleCloseMenu();
          }}
          setSelected={setSelected}
          handleClose={handleCloseLinkBulkCounters}
        />
      )}
      {IsSessionDialog && (
        <WeekandTimeDialog
          open={IsSessionDialog}
          previousData={get(submittedSessionData, 'timeSlots')}
          handleClose={handleCloseSession}
          setSubmittedSessionData={handleSubmitBulkAction}
        />
      )}
      <HandleItemDrawer
        newProduct={newProduct}
        editMode={editMode}
        setEditMode={setEditMode}
        openDrawer={openDrawer}
        handleCloseDrawer={handleCloseDrawer}
        isUnitEnable={isUnitEnable}
        setIsUnitEnable={setIsUnitEnable}
        productUnitDetails={productUnitDetails}
        isMembershipEnable={isMembershipEnable}
        setProductUnitDetails={setProductUnitDetails}
        addMoreUnits={addMoreUnits}
        setAddMoreUnits={setAddMoreUnits}
        setOpenDeleteProduct={setOpenDeleteProduct}
        syncUpProducts={fetchProducts}
        countersList={countersList}
        getCountersList={getCountersList}
      />
      <TakeATourWithJoy config={inventoryTourConfig} />
    </>
  );
}
