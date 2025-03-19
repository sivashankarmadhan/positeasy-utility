import { Helmet } from 'react-helmet-async';
// @mui
import {
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
// components
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { debounce, filter, get, isEmpty, map, isBoolean } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import S3ImageCaching from 'src/components/S3ImageCaching';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import {
  addons,
  allCategories,
  currentAddon,
  currentProduct,
  currentStoreId,
  products,
} from 'src/global/recoilState';
import trimDescription from 'src/helper/trimDescription';
import FilterPopOver from 'src/layouts/dashboard/header/FilterPopOver';
import VegNonIcon from 'src/components/VegNonIcon';
import PRODUCTS_API from 'src/services/products';
import { fCurrency } from 'src/utils/formatNumber';
import { useSettingsContext } from '../../components/settings';
import AddonHeader from './AddonHeader';
import HandleAddonDrawer from './HandleAddonDrawer';
import {
  AddonsTableColumns,
  ROLES_WITHOUT_STORE_STAFF,
  ROWS_PER_PAGE,
  SortingConstants,
  StatusConstants,
} from 'src/constants/AppConstants';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteAddon from './DeleteAddon';
import { AddonListHead, AddonListToolbar } from 'src/sections/Inventory/addOnHeaders';
import AuthService from 'src/services/authService';
import Iconify from 'src/components/iconify/Iconify';
import { ErrorConstants } from 'src/constants/ErrorConstants';

export default function Addon() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const [addonList, setAddonList] = useRecoilState(addons);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [openDrawer, setOpenDrawer] = useState(false);
  const currentStore = useRecoilValue(currentStoreId);
  const [editMode, setEditMode] = useState(false);
  const [newAddon, setNewAddon] = useState(false);
  const [sortingOrder, setSortingOrder] = useState(SortingConstants.OLDEST);
  const [currentAddonData, setCurrentAddonData] = useRecoilState(currentAddon);
  const resetCurrentProduct = useResetRecoilState(currentAddon);
  const [openDeleteAddOn, setOpenDeleteAddOn] = useState(false);
  const [dataStatusState, setDataStatusState] = useState(StatusConstants.ACTIVE);
  const isNotShowCreateProduct =
    dataStatusState !== StatusConstants.INACTIVE && dataStatusState !== StatusConstants.SOLDOUT;
  const currentRole = AuthService.getCurrentRoleInLocal();
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const [page, setPage] = useState(0);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [selected, setSelected] = useState([]);
  const [newProduct, setNewProduct] = useState(false);
  const [filterStatus, setFilterStatus] = useState([StatusConstants.ACTIVE]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState([]);
  const [filterStockMonitor, setFilterStockMonitor] = useState([]);
  const [filterSearchStatus, setFilterSearchStatus] = useState(false);
  const [categoriesList, setCategoriesList] = useRecoilState(allCategories);
  const setProductCategoryList = useSetRecoilState(allCategories);
  const defaultValue = { open: false, event: {}, data: {} };
  const [open, setOpen] = useState(defaultValue);
  const [currentProductData, setCurrentProduct] = useRecoilState(currentProduct);
  const [openDeleteProduct, setOpenDeleteProduct] = useState(false);
  const [continueState, setContinueState] = useState(false);
  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    resetCurrentProduct();
    setEditMode(false);
    setNewAddon(false);
    setOpenDeleteAddOn(false);
  };
  const handleOpenDrawer = () => {
    setOpenDrawer(true);
  };

  const getAddonList = async (filterName) => {
    try {
      const options = {
        storeId: currentStore,
        page: page + 1,
        size: rowsPerPage,
        status: filterStatus,
        category: filterCategory,
        prodName: filterName,
      };
      if (filterName || filterStatus || filterCategory || filterStockMonitor)
        setFilterSearchStatus(true);
      const response = await PRODUCTS_API.getAddonsStatusWise(options);
      if (response.data) {
        setAddonList(get(response, 'data.data'));
        setTotalRowCount(get(response, 'data.totalItems'));
      } else {
        setAddonList([]);
      }
    } catch (e) {
      console.error(e);
      setAddonList([]);
    }
  };

  const getProductCategoryList = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      const response = await PRODUCTS_API.getProductCategoryList(currentStore);
      if (response) setCategoriesList(response.data.data);
      setProductCategoryList(get(response, 'data.data'));
    } catch (e) {
      console.log(e);
      setCategoriesList([]);
    }
  };
  const handleAddItems = () => {
    handleOpenDrawer();
    resetCurrentProduct();
    setNewAddon(true);
    setEditMode(true);
  };
  useEffect(() => {
    getAddonList();
  }, [dataStatusState, sortingOrder]);

  const handleItem = (e) => {
    setCurrentAddonData(e);
    handleOpenDrawer();
  };
  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleFilterByName = debounce((event) => {
    setPage(0);
    getAddonList(event.target.value);
  }, 1000);

  const handleFilterByCategory = (event) => {
    setPage(0);
    setFilterCategory((prev) => {
      if (event.target.checked) {
        return [...prev, event.target.name];
      } else {
        return prev.filter((category) => category !== event.target.name);
      }
    });
  };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = addonList.map((n) => n.addOnId);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleOpenNewProduct = () => {
    handleOpenDrawer();
    resetCurrentProduct();
    setNewAddon(true);
    setEditMode(true);
  };
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
  const getAllData = async () => {
    try {
      setIsLoading(true);
      await fetchProducts();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  function handleClick(name) {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex >= 0) {
      newSelected = newSelected.concat(
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  }

  const handleCloseMenu = () => {
    setOpen(defaultValue);
  };
  const handleDeleteStockDialog = async (e) => {
    try {
      if (!continueState) {
        const response = await PRODUCTS_API.deleteAddon(e.addOnId);
        if (response) {
          toast.success(SuccessConstants.DELETED_SUCCESSFUL);
          handleCloseMenu();
          getAddonList();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleOpenMenu = (event, product) => {
    setOpen({ open: true, eventData: event.currentTarget, data: product });
  };
  const formatHeaderList = (currentRole, AddonsTableColumns) => {
    return ROLES_WITHOUT_STORE_STAFF.includes(currentRole)
      ? AddonsTableColumns
      : filter(AddonsTableColumns, (_item) => {
          return get(_item, 'id') !== 'basePrice';
        });
  };

  const fetchProducts = async () => {
    await getAddonList();
    await getProductCategoryList();
  };
  useEffect(() => {
    if (currentStore && (!isEmpty(addonList) || filterSearchStatus)) fetchProducts();
  }, [currentStore, page, rowsPerPage, filterStatus, filterStockMonitor, filterCategory]);
  useEffect(() => {
    if (currentStore && isEmpty(addonList) && !filterSearchStatus) getAllData();
  }, [currentStore, page, rowsPerPage, filterStatus, filterStockMonitor, filterCategory]);

  return (
    <>
      <Helmet>
        <title> Addon | POS_IT_EASY</title>
      </Helmet>

      <Container
        maxWidth={themeStretch ? false : 'xxl'}
        sx={{
          '&.MuiContainer-root': {
            p: 1.5,
            maxHeight: '90vh',
          },
        }}
      >
        <AddonListToolbar
          numSelected={selected.length}
          onFilterName={handleFilterByName}
          filterCategory={filterCategory}
          onFilterCategory={handleFilterByCategory}
          handleOpenNewProduct={handleOpenNewProduct}
          addOnList={addonList}
          initialFetch={getAddonList}
          selected={selected}
          setSelected={setSelected}
          filterStatus={filterStatus}
          onFilterStatus={handleFilterByStatus}
          onFilterStockMonitor={handleFilterByStockMonitor}
          categoriesList={categoriesList}
          setFilterSearchStatus={setFilterSearchStatus}
          setFilterCategory={setFilterCategory}
          setFilterStatus={setFilterStatus}
          setFilterStockMonitor={setFilterStockMonitor}
        />
        {isEmpty(addonList) && !isNotShowCreateProduct && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '20px',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            No {dataStatusState?.toLowerCase()} Items
          </div>
        )}

        {isEmpty(addonList) && isNotShowCreateProduct && (
          <Tooltip title="Click to add new addon">
            <Stack
              direction={'column'}
              onClick={() => handleAddItems()}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                zIndex: '100',
                transform: 'translate(-50%, -50%)',
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                cursor: 'pointer',
                alignItems: 'center',
                border: `1.5px dotted ${theme.palette.primary.main}`,
                padding: 2,
                borderRadius: 2,
                '&:hover': { backgroundColor: alpha(theme.palette.primary.lighter, 0.4) },
              }}
            >
              <AddCircleIcon fontSize="large" sx={{ mr: 1 }} />
              <Typography noWrap variant="h6">
                Create new addon
              </Typography>
            </Stack>
          </Tooltip>
        )}
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <TableContainer
            sx={{
              minWidth: '100%',
              maxHeight: '60vh',
              minHeight: '60vh',
            }}
          >
            <Table stickyHeader>
              <AddonListHead
                order={order}
                orderBy={orderBy}
                headLabel={formatHeaderList(currentRole, AddonsTableColumns)}
                rowCount={rowsPerPage}
                numSelected={selected.length}
                onRequestSort={handleRequestSort}
                onSelectAllClick={handleSelectAllClick}
              />
              <TableBody>
                {!isEmpty(addonList) &&
                  addonList.map((e) => (
                    <TableRow
                      key={e.addOnId}
                      hover
                      tabIndex={-1}
                      role="checkbox"
                      selected={selected.indexOf(e.addOnId) !== -1}
                    >
                      <TableCell padding="checkbox" sx={{ py: '8px !important' }}>
                        <Checkbox
                          checked={selected.indexOf(e.addOnId) !== -1}
                          onChange={() => handleClick(e.addOnId)}
                        />
                      </TableCell>
                      <TableCell sx={{ py: '8px !important' }}>
                        <div
                          style={{
                            height: 60,
                            width: 60,
                            overflow: 'hidden',
                            borderRadius: 5,
                            opacity: e.status === StatusConstants.ACTIVE ? 1 : 0.3,
                          }}
                        >
                          <S3ImageCaching
                            style={{ height: '60%', width: '60%', objectFit: 'cover' }}
                            src={e.addOnImage}
                            alt="image"
                          />
                        </div>
                      </TableCell>
                      <TableCell sx={{ py: '8px !important' }}>
                        <Typography
                          noWrap
                          variant="subtitle1"
                          sx={{ fontSize: get(e, 'name').length > 12 ? 14 : 16 }}
                        >
                          {trimDescription(get(e, 'name'), 25)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: '8px !important' }}>
                        <Typography variant="caption">
                          {trimDescription(e.description, 100)}
                        </Typography>
                      </TableCell>
                      <TableCell align="left" sx={{ py: '8px !important' }}>
                        <Typography
                          sx={{
                            mt: 0.5,
                            fontSize: e.offerPrice ? '10px' : '16px',
                            fontWeight: 'bold',
                          }}
                        >
                          {e.price}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: '8px !important' }}>
                        <Typography>
                          {get(e, 'GSTPercent') || 0}
                          {!!isBoolean(get(e, 'GSTInc'))
                            ? !!(get(e, 'GSTInc') ? '(inclusive)' : '(exclusive)')
                            : ''}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        {!isEmpty(e.attributes) ? (
                          <VegNonIcon
                            text={get(e.attributes, 'isVeg')}
                            style={{ bottom: 20, position: 'relative' }}
                            firstIconStyle={{ fontSize: '30px' }}
                            circleIconStyle={{ fontSize: '10px', left: 10, top: 10 }}
                          />
                        ) : (
                          <Typography sx={{ ml: 1 }}>-</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: '8px !important' }}>
                        <IconButton
                          sx={{ padding: '0px !important' }}
                          size="large"
                          color="inherit"
                          onClick={(event) => handleOpenMenu(event, e)}
                        >
                          <Iconify icon={'eva:more-vertical-fill'} />
                        </IconButton>
                      </TableCell>
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
                            boxShadow: 1,
                            '& .MuiMenuItem-root': {
                              px: 1,
                              typography: 'body2',
                              borderRadius: 0.75,
                            },
                          },
                        }}
                      >
                        <MenuItem onClick={() => handleItem(get(open, 'data'))}>
                          <Iconify
                            icon={'eva:edit-fill'}
                            sx={{ mr: 1, color: theme.palette.primary.main }}
                          />
                          Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleDeleteStockDialog(get(open, 'data'))}>
                          <Iconify
                            icon={'eva:trash-2-outline'}
                            sx={{ mr: 1, color: theme.palette.primary.main }}
                          />
                          Delete
                        </MenuItem>
                      </Popover>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        {!isEmpty(addonList) && (
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
        <HandleAddonDrawer
          newAddon={newAddon}
          editMode={editMode}
          setEditMode={setEditMode}
          openDrawer={openDrawer}
          handleCloseDrawer={handleCloseDrawer}
          getAddonList={getAddonList}
          setOpenDeleteAddOn={setOpenDeleteAddOn}
        />
        {!isEmpty(currentAddonData) && (
          <DeleteAddon
            open={openDeleteAddOn}
            addOn={currentAddonData}
            handleClose={handleCloseDrawer}
            getAddons={getAddonList}
          />
        )}
      </Container>
    </>
  );
}
