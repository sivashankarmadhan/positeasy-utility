import AddCircleIcon from '@mui/icons-material/AddCircle';
import {
  Box,
  Container,
  MenuItem,
  Popover,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { debounce, filter, get, isEmpty, map, noop } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { SeverErrorIllustration } from 'src/assets/illustrations';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import {
  MaterialTableColumns,
  NAVIGATION_STATE_KEY,
  StatusConstants,
} from 'src/constants/AppConstants';
import {
  alertDialogInformationState,
  allMaterialCategories,
  currentRawProduct,
  currentStoreId,
  totalRawProductState,
} from 'src/global/recoilState';
import DeleteProduct from 'src/pages/Products/DeleteProduct';
import { PATH_DASHBOARD } from 'src/routes/paths';
import RAW_PRODUCTS_API from 'src/services/rawproducts';
import AddEditMaterial from './AddEdit/AddEditMaterial';
import ManageRawMaterialStock from './ManageRawMaterialStock';
import RawMaterialListHead from './RawMaterialListHead';
import RawMaterialListToolbar from './RawMaterialListToolbar';
import RawMaterialTable from './RawMaterialTable';
import LinkProductDialog from 'src/components/LinkProductDialog';
import ViewStockDialog from './ViewStockDialog';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import PRODUCTS_API from 'src/services/products';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
export default function RawMaterial() {
  const { themeStretch } = useSettingsContext();
  const [totalRawProducts, setTotalRawProducts] = useRecoilState(totalRawProductState);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const isMobile = useMediaQuery('(max-width:600px');
  const isDesktop = useMediaQuery('(min-width:1469px');
  const theme = useTheme();
  const isNotFound = false;
  const [page, setPage] = useState(0);
  const [productCategoryList, setProductCategoryList] = useRecoilState(allMaterialCategories);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [openDeleteProduct, setOpenDeleteProduct] = useState(false);
  const [currentProductData, setCurrentProduct] = useRecoilState(currentRawProduct);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selected, setSelected] = useState([]);
  const [newProduct, setNewProduct] = useState(false);
  const defaultValue = { open: false, event: {}, data: {} };
  const [openDrawer, setOpenDrawer] = useState(false);
  const [open, setOpen] = useState(defaultValue);
  const [isUnitEnable, setIsUnitEnable] = useState(false);
  const currentStore = useRecoilValue(currentStoreId);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState([
    StatusConstants.ACTIVE,
    StatusConstants.SOLDOUT,
  ]);
  const [category, setCategory] = useState([]);
  const [filterSearchStatus, setFilterSearchStatus] = useState(false);
  const [currentProductStock, setCurrentProductStock] = useState({});
  const [stockOpenDialog, setStockOpenDialog] = useState(false);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [isOpenViewStockDialog, setIsOpenViewStockDialog] = useState(false);
  const [openProductsDialog, setOpenProductsDialog] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location?.state?.isDrawerOpen) {
      setStockOpenDialog(true);
    }
  }, [location]);

  const resetCurrentProduct = () => noop;
  const formatHeaderList = () => {
    const filterInventoryTableColumns = filter(MaterialTableColumns, (_item) => {
      return true;
    });
    return filterInventoryTableColumns;
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
  const handleSelectAllClick = (event) => {
    if (event.target.checked && isEmpty(selected)) {
      const newSelecteds = map(totalRawProducts, (n) => n.productId);
      setSelected(newSelecteds);
      return;
    } else setSelected([]);
  };
  const handleFilterByName = debounce((event) => {
    setPage(0);
    fetchProducts(event.target.value);
  }, 1000);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };
  const handleDeleteStockDialog = async (e) => {
    console.log('reached', e);
    handleCloseMenu();
    setCurrentProduct(e);
    setOpenDeleteProduct(true);
  };
  const handleCloseMenu = () => {
    setOpen(defaultValue);
  };
  const handleCloseProductsDialog = async (e) => {
    setCurrentProductStock({});
    setOpenProductsDialog(false);
  };
  const handleOpenDrawer = () => {
    handleCloseMenu();
    setOpenDrawer(true);
  };
  const handleItem = (e) => {
    console.log('currentProductDataaaa', e);
    setCurrentProduct(e);
    handleOpenDrawer();
  };
  const handleOpenNewProduct = () => {
    console.log('reached');
    handleOpenDrawer();
    resetCurrentProduct();
    setNewProduct(true);
  };
  const handleOpenStock = () => {
    setIsOpenViewStockDialog(true);
  };
  const handleChangeCategory = (e) => {
    setPage(0);
    setCategory(e);
  };
  const handleCloseDrawer = () => {
    setOpenDeleteProduct(false);
    setOpenDrawer(false);
    resetCurrentProduct();
    setNewProduct(false);
    navigate(PATH_DASHBOARD.inventory.rawMaterials, {
      state: {},
    });
  };

  const handleOpenStockDialog = async (e) => {
    setOpen(defaultValue);
    setCurrentProductStock(e);
    setStockOpenDialog(true);
  };

  const fetchProducts = async (filterName) => {
    try {
      const options = {
        page: page + 1,
        size: rowsPerPage,
        status: filterStatus,
        prodName: filterName,
        ...(!isEmpty(category) ? { category: map(category, (e) => e.id) } : {}),
      };
      if (filterName || category || filterStatus) setFilterSearchStatus(true);
      const response = await RAW_PRODUCTS_API.getProducts(options);
      setTotalRawProducts(get(response, 'data.data', []));
      const categoryResponse = await RAW_PRODUCTS_API.getCategories();
      setProductCategoryList(get(categoryResponse, 'data', []));
      if (response) {
        setTotalRawProducts(get(response, 'data.data', []));
        setTotalRowCount(get(response, 'data.totalItems', 0));
      } else {
        setTotalRawProducts([]);
        setTotalRowCount(0);
      }
      setFilterSearchStatus(false);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChangeProductStatus = async (productId, status, onClose) => {
    try {
      const options = {
        productId,
        status: status,
      };
      const response = await RAW_PRODUCTS_API.updateProductStatus(options);
      if (response) toast.success(SuccessConstants.STATUS_CHANGED);
      fetchProducts();
      setSelected([]);
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
  useEffect(() => {
    const data = location?.state;
    if (get(data, 'navigateFor') === NAVIGATION_STATE_KEY.ADD_PRODUCT) {
      handleOpenNewProduct();
    }
  });
  useEffect(() => {
    if (location?.state?.isDrawerOpen) {
      handleOpenNewProduct();
    }
  }, [location]);

  useEffect(() => {}, []);

  useEffect(() => {
    if (currentStore) fetchProducts();
  }, [currentStore, page, rowsPerPage, filterStatus, category]);

  useEffect(() => {
    if (isEmpty(totalRawProducts) && currentStore) {
      fetchProducts();
    }
  }, [currentStore]);

  return (
    <>
      <Helmet>
        <title> RAW MATERIALS | POSITEASY </title>
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
        {isEmpty(totalRawProducts) && !filterSearchStatus && isEmpty(filterStatus) && (
          <Tooltip title="Click to add raw materials for inventory">
            <Stack
              direction={'column'}
              onClick={handleOpenNewProduct}
              sx={{
                position: 'absolute',
                zIndex: 99,
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
              <Typography variant="h6">Create new material</Typography>
            </Stack>
          </Tooltip>
        )}
        {isEmpty(totalRawProducts) && (filterSearchStatus || !isEmpty(filterStatus)) && (
          <Tooltip title="Not found">
            <Stack
              direction={'column'}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontWeight: 'bold',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">
                {!isEmpty(totalRawProducts)
                  ? `Filtered  material not found`
                  : 'Materials not found'}
              </Typography>
            </Stack>
          </Tooltip>
        )}
        <RawMaterialListToolbar
          onFilterStatus={handleFilterByStatus}
          numSelected={selected.length}
          handleOpenNewProduct={handleOpenNewProduct}
          onFilterName={handleFilterByName}
          selected={selected}
          totalRawProducts={totalRawProducts}
          setFilterStatus={setFilterStatus}
          filterStatus={filterStatus}
          intialFetch={fetchProducts}
          setSelected={setSelected}
          setFilterSearchStatus={setFilterSearchStatus}
          handleOpenStock={handleOpenStock}
          category={category}
          handleChangeCategory={handleChangeCategory}
          categoriesList={productCategoryList}
        />
        <Scrollbar>
          <TableContainer
            sx={{
              minWidth: '100%',
              maxHeight: isMobile ? 640 : isDesktop ? 690 : 540,
              minHeight: isMobile ? 640 : isDesktop ? 690 : 540,
            }}
          >
            <Table stickyHeader>
              <RawMaterialListHead
                order={order}
                orderBy={orderBy}
                headLabel={formatHeaderList()}
                rowCount={rowsPerPage}
                numSelected={selected?.length}
                onRequestSort={handleRequestSort}
                onSelectAllClick={handleSelectAllClick}
              />
              <TableBody>
                {map(totalRawProducts, (row) => {
                  return (
                    <RawMaterialTable
                      selected={selected}
                      setSelected={setSelected}
                      row={row}
                      setOpen={setOpen}
                      order={order}
                      orderBy={orderBy}
                      setOpenProductsDialog={setOpenProductsDialog}
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
            width: 160,
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
        <MenuItem onClick={() => handleOpenStockDialog(get(open, 'data'))}>
          <Iconify
            icon={'fluent-mdl2:quantity'}
            sx={{ mr: 1, color: theme.palette.primary.main }}
          />
          Manage stock
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
        <ManageRawMaterialStock
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
          syncUpProducts={() => {
            fetchProducts();
            setCurrentProduct({});
          }}
          isRawMaterial={true}
        />
      )}
      <AddEditMaterial
        newProduct={newProduct}
        openDrawer={openDrawer}
        handleCloseDrawer={handleCloseDrawer}
        isUnitEnable={isUnitEnable}
        setIsUnitEnable={setIsUnitEnable}
        syncUpProducts={fetchProducts}
      />
      {openProductsDialog && (
        <LinkProductDialog
          open={openProductsDialog}
          handleClose={handleCloseProductsDialog}
          currentProductData={currentProductData}
          syncUpProducts={fetchProducts}
        />
      )}
      {isOpenViewStockDialog && (
        <ViewStockDialog
          isOpen={isOpenViewStockDialog}
          onClose={() => {
            setIsOpenViewStockDialog(false);
          }}
        />
      )}
    </>
  );
}
