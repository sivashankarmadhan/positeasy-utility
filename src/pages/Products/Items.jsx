import { Helmet } from 'react-helmet-async';
// @mui
import {
  Box,
  Button,
  Card,
  Container,
  Dialog,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
// components
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { filter, find, forEach, get, groupBy, isEmpty, map } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import AutoCompleteChipWithCheckBox from 'src/components/AutoCompleteChipWithCheckBox';
import Categories from 'src/components/Categories';
import S3ImageCaching from 'src/components/S3ImageCaching';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  SYNC_UP_CONSTANTS,
  SYNC_UP_CONTENT,
  SortingConstants,
  StatusConstants,
  hideScrollbar,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { inventoryTourConfig } from 'src/constants/TourConstants';
import {
  allConfiguration,
  allProducts,
  currentProduct,
  currentStoreId,
  products,
} from 'src/global/recoilState';
import { filterShortCode } from 'src/helper/filterShortCode';
import { PATH_DASHBOARD } from 'src/routes/paths';
import SettingServices from 'src/services/API/SettingServices';
import PRODUCTS_API from 'src/services/products';
import { fCurrency } from 'src/utils/formatNumber';
import { useSettingsContext } from '../../components/settings';
import DeleteProduct from './DeleteProduct';
import HandleItemDrawer from './HandleItemDrawer';
import InventoryProduct from './InventoryProduct';
import ItemsHeader from './ItemsHeader';
import ManageProductStock from './ManageProductStock';
import STORES_API from 'src/services/stores';

export default function Items() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { themeStretch } = useSettingsContext();
  const currentStore = useRecoilValue(currentStoreId);
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [addonList, setAddonList] = useState([]);
  const [addonOpenDialog, setAddonOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newProduct, setNewProduct] = useState(false);
  const [sortingOrder, setSortingOrder] = useState(SortingConstants.OLDEST);
  const [currentProductData, setCurrentProduct] = useRecoilState(currentProduct);
  const [currentProductAddon, setCurrentProductAddon] = useState([]);
  const [stockOpenDialog, setStockOpenDialog] = useState(false);
  const [currentProductStock, setCurrentProductStock] = useState({});
  const resetCurrentProduct = useResetRecoilState(currentProduct);
  const [allProductsWithUnits, setAllProductsWithUnits] = useRecoilState(allProducts);
  const [formattedProducts, setFormattedProducts] = useState([]);
  const headerRef = useRef(null);
  const [dataStatusState, setDataStatusState] = useState(StatusConstants.ACTIVE);
  const [openAddonDelinkConfirmDialog, setOpenAddonDelinkConfirmDialog] = useState(false);
  const [selectedValues, setSelectedValues] = useState([]); // State to store the selected values
  const [isUnitEnable, setIsUnitEnable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState({ loading: false, productId: '' });
  const [productUnitDetails, setProductUnitDetails] = useState([]);
  const resetProductList = useResetRecoilState(allProducts);
  const resetProducts = useResetRecoilState(products);
  const [addMoreUnits, setAddMoreUnits] = useState(false);
  const [openDeleteProduct, setOpenDeleteProduct] = useState(false);
  const filteredProducts = filter(formattedProducts, (e) => e.status === dataStatusState);
  const groupedProducts = groupBy(filteredProducts, 'category');
  const isNotShowCreateProduct =
    dataStatusState !== StatusConstants.INACTIVE && dataStatusState !== StatusConstants.SOLDOUT;
  const handleSubmitLinkAddon = async () => {
    try {
      let options = [];
      forEach(selectedValues, (e) => {
        options.push({ productId: currentProductData.productId, addOnId: e.addOnId });
      });
      const response = await PRODUCTS_API.linkAddon(options);
      if (response) {
        handleCloseAddOnDialog();
        toast.success(SuccessConstants.ADDON_ADDED);
        syncUpProducts();
      }
    } catch (e) {
      console.log(e);
      handleCloseAddOnDialog();
    }
  };
  const handleSetLoading = (productId) => {
    setIsProductLoading({ loading: true, productId: productId });
  };
  const handleUnsetLoading = () => {
    setIsProductLoading({ loading: false, productId: '' });
  };
  const handleSubmitDeLinkAddon = async (addOnId) => {
    try {
      handleSetLoading(currentProductData.productId);
      const response = await PRODUCTS_API.deLinkAddon(addOnId, currentProductData.productId);
      if (response) {
        handleCloseAddOnDialog();
        setOpenAddonDelinkConfirmDialog(false);
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        handleUnsetLoading();
        syncUpProducts();
      }
    } catch (e) {
      console.log(e);
      handleCloseAddOnDialog();
      handleUnsetLoading();
      setOpenAddonDelinkConfirmDialog(false);
    }
  };
  const handleOpenAddonDialog = (e) => {
    if (isEmpty(addonList)) {
      navigate(PATH_DASHBOARD.addon, { replace: true });
    } else if (!isEmpty(addonList)) {
      const addOnData = find(allProductsWithUnits, (d) => d.productId === e.productId);
      setAddonOpenDialog(true);
      setCurrentProductAddon(get(addOnData, 'addOn', []));
      setCurrentProduct(e);
    }
  };
  const handleOpenStockDialog = async (e) => {
    setCurrentProductStock(e);
    setStockOpenDialog(true);
  };
  const handleCloseAddOnDialog = () => {
    setAddonOpenDialog(false);
    resetCurrentProduct({});
    setSelectedValues([]);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    resetCurrentProduct();
    setEditMode(false);
    setAddMoreUnits(false);
    setNewProduct(false);
    setOpenDeleteProduct(false);
  };
  const handleOpenDrawer = () => {
    setOpenDrawer(true);
  };

  const initialFetch = async () => {
    try {
      const resp = await SettingServices.getConfiguration();
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
      const response = await PRODUCTS_API.getAddons(dataStatusState, sortingOrder);
      if (response) setAddonList(response.data);
      console.log(response);
    } catch (e) {
      console.log(e);
      setAddonList([]);
    }
  };
  const getProductsWithUnits = async () => {
    try {
      const options = {
        page: 1,
        size: 50,
      };
      const response = await PRODUCTS_API.getInventoryProducts(options);
      if (response) setAllProductsWithUnits(response.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleItem = (e) => {
    setCurrentProduct(e);
    handleOpenDrawer();
  };
  const handleOpenNewProduct = () => {
    handleOpenDrawer();
    resetCurrentProduct();
    setNewProduct(true);
    setEditMode(true);
  };
  const handleChangeProductStatus = async (event, id) => {
    try {
      handleSetLoading(id);
      const options = {
        productId: id,
        status: event.target.value,
      };
      const response = await PRODUCTS_API.updateProductStatus(options);

      if (response) toast.success(SuccessConstants.STATUS_CHANGED);
      handleUnsetLoading();
    } catch (e) {
      handleUnsetLoading();
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_CHANGE_STATUS);
    }
  };
  const handleSelectedAddon = (e, value) => {
    setSelectedValues(value);
  };
  const getAllData = async () => {
    try {
      setIsLoading(true);
      await initialFetch();
      resetProductList();
      resetProducts();
      await getProductsWithUnits();
      await getAddonList();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  const syncUpProducts = async () => {
    getAllData();
    return;
  };
  useEffect(() => {
    if (!isEmpty(allProductsWithUnits)) {
      const formatted = filterShortCode(allProductsWithUnits);
      setFormattedProducts(formatted);
    }
  }, [allProductsWithUnits]);
  useEffect(() => {
    if (currentStore)
      if (isEmpty(allProductsWithUnits)) getAllData();
      else syncUpProducts();
  }, [dataStatusState, sortingOrder, currentStore]);
  if (isLoading) return <LoadingScreen />;
  return (
    <>
      <Helmet>
        <title> Inventory | POS_IT_EASY</title>
      </Helmet>

      <Container className="inventoryStep1" maxWidth={themeStretch ? false : 'xl'}>
        <ItemsHeader
          dataStatusState={dataStatusState}
          setDataStatusState={setDataStatusState}
          setEditMode={setEditMode}
          setNewProduct={setNewProduct}
          sortingOrder={sortingOrder}
          setSortingOrder={setSortingOrder}
          handleOpenDrawer={handleOpenDrawer}
          intialFetch={getAllData}
          allProductsWithUnits={allProductsWithUnits}
        />
        <Card
          sx={{
            position: 'relative',
            overflow: 'auto',
          }}
        >
          <Box
            ref={headerRef}
            sx={{
              minHeight: '15rem',
              height: 'calc(100vh - 12rem)',
              overflow: 'auto',
              ...hideScrollbar,
            }}
          >
            {!isEmpty(groupedProducts) && (
              <Categories headerRef={headerRef} groupedProducts={groupedProducts} isInventoryFlow />
            )}
            <div style={{ height: 40 }} />
            {isEmpty(allProductsWithUnits) && !isNotShowCreateProduct && (
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
                No {dataStatusState?.toLowerCase()} products
              </div>
            )}
            {isEmpty(allProductsWithUnits) && isNotShowCreateProduct && (
              <>
                <Tooltip title="Click to add new product">
                  <Stack
                    direction={'column'}
                    onClick={() => handleOpenNewProduct()}
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
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.lighter, 0.4) },
                    }}
                  >
                    <AddCircleIcon fontSize="large" sx={{ mr: 1 }} />
                    <Typography noWrap variant="h6">
                      Create new product
                    </Typography>
                  </Stack>
                </Tooltip>
              </>
            )}
            <div style={{ height: 40 }} />
            {map(groupedProducts, (dishes, category) => (
              <Stack flexDirection={'column'} sx={{ mt: 2, p: 1 }}>
                <Typography sx={{ fontWeight: 'bold', ml: 2, mb: 2 }}>
                  {category?.toUpperCase()}
                </Typography>
                <Grid container spacing={2}>
                  {map(dishes, (item) => {
                    return (
                      <InventoryProduct
                        key={get(dishes, 'id')}
                        item={item}
                        category={category}
                        handleItem={handleItem}
                        handleOpenAddonDialog={handleOpenAddonDialog}
                        handleChangeProductStatus={handleChangeProductStatus}
                        handleOpenStockDialog={handleOpenStockDialog}
                        dataStatusState={dataStatusState}
                        sortingOrder={sortingOrder}
                        isLoading={isProductLoading}
                      />
                    );
                  })}
                </Grid>
              </Stack>
            ))}
          </Box>
        </Card>
        <HandleItemDrawer
          newProduct={newProduct}
          editMode={editMode}
          isMembershipEnable={isMembershipEnable}
          setEditMode={setEditMode}
          openDrawer={openDrawer}
          handleCloseDrawer={handleCloseDrawer}
          isUnitEnable={isUnitEnable}
          setIsUnitEnable={setIsUnitEnable}
          productUnitDetails={productUnitDetails}
          setProductUnitDetails={setProductUnitDetails}
          addMoreUnits={addMoreUnits}
          setAddMoreUnits={setAddMoreUnits}
          setOpenDeleteProduct={setOpenDeleteProduct}
          syncUpProducts={syncUpProducts}
        />
        {!isEmpty(currentProductStock) && (
          <ManageProductStock
            handleClose={() => {
              setStockOpenDialog(false);
              setCurrentProductStock({});
            }}
            open={stockOpenDialog}
            syncUpProducts={syncUpProducts}
            currentProductStock={currentProductStock}
          />
        )}
        {console.log(addonList)}
        {!isEmpty(addonList) && (
          <Dialog open={addonOpenDialog}>
            <Card
              sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Grid container sx={{ width: '100%', mb: 1 }}>
                {currentProductAddon &&
                  map(currentProductAddon, (e) => (
                    <Grid
                      sm={5.5}
                      lg={5.5}
                      xs={12}
                      item
                      sx={{
                        border: 1,
                        borderColor: alpha(
                          theme.palette.primary.main,
                          theme.palette.action.selectedOpacity
                        ),
                        m: 1,
                        padding: 1,
                        borderRadius: 1,
                      }}
                    >
                      <Grid container sx={{ alignItems: 'center' }}>
                        <Grid item xs={4} sm={4} lg={4}>
                          <S3ImageCaching
                            src={get(e, 'addOnImage')}
                            alt={get(e, 'name')}
                            style={{ height: 50, width: 50, borderRadius: 10 }}
                          />
                        </Grid>
                        <Grid item xs={6} sm={6} lg={6}>
                          <Stack
                            flexDirection={'column'}
                            sx={{ display: 'flex', justifyContent: 'space-between' }}
                          >
                            <Typography sx={{ fontSize: '15px' }}>{get(e, 'name')}</Typography>
                            <Typography sx={{ fontWeight: 'bold' }}>
                              {fCurrency(get(e, 'price'))}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid
                          item
                          xs={2}
                          sm={2}
                          lg={2}
                          sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                          <IconButton>
                            <CancelIcon
                              color="error"
                              onClick={() => setOpenAddonDelinkConfirmDialog(true)}
                            />
                          </IconButton>
                        </Grid>
                      </Grid>{' '}
                      <Dialog open={openAddonDelinkConfirmDialog}>
                        <Paper
                          sx={{
                            p: 2,
                          }}
                        >
                          <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                            Are you sure you want to remove the Addon on this product? This action
                            cannot be undone.
                          </Typography>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                              onClick={() => setOpenAddonDelinkConfirmDialog(false)}
                              sx={{ mr: 2 }}
                              variant="text"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleSubmitDeLinkAddon(get(e, 'addOnId'))}
                              variant="contained"
                            >
                              Ok
                            </Button>
                          </div>
                        </Paper>
                      </Dialog>
                    </Grid>
                  ))}
              </Grid>

              <Grid container sx={{ alignItems: 'center' }}>
                <Grid item>
                  <AutoCompleteChipWithCheckBox
                    selectedValues={selectedValues}
                    options={addonList}
                    onChange={handleSelectedAddon}
                    handleSubmit={handleSubmitLinkAddon}
                    currentProductAddon={currentProductAddon}
                  />
                </Grid>
                <Grid item>
                  <Button
                    onClick={() => handleSubmitLinkAddon()}
                    size="small"
                    variant="contained"
                    sx={{ m: 1, display: 'flex' }}
                  >
                    Add Addons
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Dialog>
        )}
        <TakeATourWithJoy config={inventoryTourConfig} />

        {!isEmpty(currentProductData) && (
          <DeleteProduct
            open={openDeleteProduct}
            product={currentProductData}
            handleClose={handleCloseDrawer}
            syncUpProducts={syncUpProducts}
          />
        )}
      </Container>
    </>
  );
}
