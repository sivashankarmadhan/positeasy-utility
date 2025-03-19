import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, {
  RHFAutocomplete,
  RHFAutocompleteObjOptions,
  RHFRadioGroup,
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';

// @mui
import { LoadingButton } from '@mui/lab';
import {
  Autocomplete,
  Button,
  Card,
  Dialog,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import RegexValidation from 'src/constants/RegexValidation';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { capitalize, find, findLastIndex, get, groupBy, map, reduce, sortBy } from 'lodash';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import { convertTimeTo12HourFormat, dateFormat, fDate, formatTime } from 'src/utils/formatTime';
import { useEffect, useState } from 'react';
import {
  PURCHASE_ORDER_PAYMENT_TYPE,
  PaymentModeTypeConstantsCart,
  PURCHASE_TO_SHOP,
  REQUIRED_CONSTANTS,
} from 'src/constants/AppConstants';
import {
  alertDialogInformationState,
  allCategories,
  currentStoreId,
  products,
} from 'src/global/recoilState';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import { isEmpty } from 'lodash';
import AddOrMatchProductOrRawMaterialModal from '../AddOrMatchProductOrRawMaterialModal';
import Label from 'src/components/label';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { lowerCase } from 'lodash';
import PRODUCTS_API from 'src/services/products';
import { SuccessConstants } from 'src/constants/SuccessConstants';
// ----------------------------------------------------------------------

function StoreAddProductOrRawMaterialToStore({ isOpenModal, closeModal, getPurchaseOrderDetails }) {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [selectedStore, setSelectedStore] = useRecoilState(currentStoreId);

  const Schema = Yup.object().shape({
    productOrRawMaterial: Yup.object()
      .shape({
        label: Yup.string().required(REQUIRED_CONSTANTS.PRODUCT_NAME),
        id: Yup.string().required(REQUIRED_CONSTANTS.PRODUCT_NAME),
      })
      .required(REQUIRED_CONSTANTS.PRODUCT_NAME),
  });
  // const productCategoryList = useRecoilValue(allCategories);
  const productList = useRecoilValue(products);

  const [productListForStock, setProductListForStock] = useState([]);
  const [isProductCheck, setIsProductCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allProductList, setAllProductList] = useState([]);
  const [productCategoryList, setProductCategoryList] = useState([]);
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  // const [productListForStock, setProductListForStock] = useState([]);
  const [isOpenAddOrMatchModal, setIsOpenAddOrMatchModal] = useState(false);
  const [manualEntryStocks, setManualEntryStocks] = useState('');
  console.log('productList', productList, productCategoryList);
  const defaultValues = {
    productOrRawMaterial: null,
  };

  const methods = useForm({
    resolver: yupResolver(Schema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  const watchProductOrRawMaterial = watch('productOrRawMaterial');

  const getListForStock = async () => {
    try {
      let res = {};
      if (isOpenModal?.data?.type === PURCHASE_TO_SHOP.PRODUCT) {
        res = await PurchaseOrderServices.productListForStock();
      } else {
        res = await PurchaseOrderServices.rawMaterialListForStock();
      }
      setProductListForStock(get(res, 'data'));
    } catch (e) {
      setProductListForStock([]);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const getProductList = async () => {
    try {
      let res = {};
      if (isOpenModal?.data?.type === PURCHASE_TO_SHOP.PRODUCT) {
        res = await PurchaseOrderServices.productStoreListForPurchase({
          storeId: selectedStore,
        });
        const dataArray = get(res, 'data');
        const isProductIdCheck = dataArray.some(
          (item) => item.productId === watchProductOrRawMaterial?.id
        );
        setIsProductCheck(isProductIdCheck);
        const categoryData = [...new Set(dataArray.map((item) => item.category))];
        setProductCategoryList(categoryData);
      } else {
        res = await PurchaseOrderServices.rawMaterialListForStock();
      }

      setAllProductList(get(res, 'data'));
    } catch (e) {
      setAllProductList([]);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const updateStockMonitor = async () => {
    try {
      const options = {
        storeId : selectedStore,
        productId : isOpenModal?.data?.productId
      }
      const res = await PurchaseOrderServices.updateStockProduct(options);
      toast.success("Stock Monitor enabled")
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleWarningWithAlert = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure you want enable stock monitor?`,
      actions: {
        primary: {
          text: 'yes',
          onClick: (onClose) => {
            updateStockMonitor();
            onClose();
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

  useEffect(() => {
    getListForStock();
  }, [isOpenModal]);

  useEffect(() => {
    getProductList();
  }, [watchProductOrRawMaterial]);

  useEffect(() => {
    if (!isEmpty(productListForStock) && isOpenModal?.data?.productId) {
      console.log('llllll', isOpenModal?.data);
      setValue('productOrRawMaterial', {
        label: isOpenModal?.data?.name,
        id: isOpenModal?.data?.productId,
      });
    }
  }, [productListForStock]);

  const selectedProductDetails = find(productListForStock, (_item) => {
    return get(_item, 'productId') === get(watchProductOrRawMaterial, 'id');
  });

  const onSubmit = async (data) => {
    const payload = {
      productId: data?.productOrRawMaterial?.id,
      price: (isOpenModal?.data?.price * data?.quantity) / 100,
      name: data?.productOrRawMaterial?.label,
      newQuantity: data?.quantity,
      referenceId: isOpenModal?.data?.referenceId,
      purchaseProductId: get(isOpenModal, 'data.productId', ''),
    };
    try {
      if (isOpenModal?.data?.type === PURCHASE_TO_SHOP.PRODUCT) {
        await PurchaseOrderServices.addToProductStock(payload);
      } else {
        await PurchaseOrderServices.addToRawMaterialStock(payload);
      }
      toast.success(
        `Added to ${lowerCase(isOpenModal?.data?.type)?.replace('_', ' ')} stock successfully`
      );
      reset();
      closeModal();
      getPurchaseOrderDetails();
    } catch (e) {
      if(e?.errorResponse?.message === "Stock monitor not enabled ") {
        handleWarningWithAlert()
      }
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  const handleUpdateProduct = async () => {
    setIsLoading(true);
    try {
      if (category && price) {
        const options = [
          {
            category,
            price,
            productId: watchProductOrRawMaterial?.id,
            name: isOpenModal?.data?.name,
          },
        ];
        const response = await PRODUCTS_API.addProduct(options);
        if (response) toast.success(SuccessConstants.PRODUCT_ADDED);
        getProductList();
      } else {
        toast.error(ErrorConstants.UNABLE_TO_ADD);
      }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleChangeCategory = (value) => {
    setCategory(value);
  };

  const isProductFlow = isOpenModal?.data?.type === PURCHASE_TO_SHOP.PRODUCT;
  console.log('productCategoryList', productCategoryList);
  return (
    <Dialog open={isOpenModal?.status}>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit((data) => {
          // if (manualEntryStocks) {
          //   setIsOpenAddOrMatchModal(true);
          // } else {
          onSubmit({ ...(data || {}), quantity: isOpenModal?.data?.quantity }, reset);
          // }
        })}
      >
        <Card sx={{ p: 2, width: { xs: 320, sm: 550 } }}>
          <Stack>
            <Stack
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography sx={{ fontSize: '17px', mt: 1 }}>
                Add{' '}
                <span style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  {isOpenModal?.data?.name}
                </span>{' '}
                <span style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  {isOpenModal?.data?.quantity}
                  {isOpenModal?.data?.unit}
                </span>{' '}
                to {isProductFlow ? 'inventory' : 'raw materials'}
              </Typography>
            </Stack>

            <RHFAutocompleteObjOptions
              freeSolo={false}
              options={map(allProductList, (_item) => {
                return {
                  label: get(_item, 'name'),
                  id: get(_item, 'productId'),
                };
              })}
              name="productOrRawMaterial"
              label={capitalize(isOpenModal?.data?.type)?.replace('_', ' ')}
              sx={{ mt: 3 }}
              {...(get(
                selectedProductDetails,
                isProductFlow ? 'stockQuantity' : 'current_stockQuantity'
              )
                ? {
                    endAdornment: (
                      <Stack flexDirection="row" gap={2} sx={{ position: 'relative', left: 20 }}>
                        {!isMobile && (
                          <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>
                            Current Stock
                          </Typography>
                        )}
                        <Label variant="soft" color="success">
                          {toFixedIfNecessary(
                            get(
                              selectedProductDetails,
                              isProductFlow ? 'stockQuantity' : 'current_stockQuantity'
                            ),
                            2
                          )}{' '}
                          {selectedProductDetails?.unitName}
                        </Label>
                      </Stack>
                    ),
                  }
                : {})}
            />
            <Typography sx={{ fontSize: '12px', mt: 1 }}>
              <span>
                <span style={{ fontWeight: 'bold' }}>*</span> Showing stock monitor enabled{' '}
                {lowerCase(isOpenModal?.data?.type)}
              </span>
            </Typography>
            {!isEmpty(selectedProductDetails) && (
              <>
                <Stack flexDirection="row" gap={2} justifyContent="flex-end">
                  <Typography mt={1} sx={{ opacity: 70, fontWeight: 'bold' }}>
                    Category :
                  </Typography>
                  <Typography mt={1} sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                    {get(selectedProductDetails, 'category')}
                  </Typography>
                </Stack>
              </>
            )}
            {!isProductCheck && isOpenModal?.data?.type === PURCHASE_TO_SHOP.PRODUCT && (
              <Stack>
                <Typography sx={{ fontSize: '12px', mt: 1, mb: 1, color: 'red' }}>
                  <span>
                    <span style={{ fontWeight: 'bold', paddingBottom: 2 }}>*</span> This{' '}
                    {isOpenModal?.data?.name} product is not available, so create new product in
                    given below {lowerCase(isOpenModal?.data?.type)}
                  </span>
                </Typography>
                <Divider />
              </Stack>
            )}
            {!isProductCheck && isOpenModal?.data?.type === PURCHASE_TO_SHOP.PRODUCT && (
              <Stack gap={1} pt={2} pb={2}>
                <Stack flexDirection={'row'} gap={1}>
                  <TextField
                    name="name"
                    value={isOpenModal?.data?.name}
                    disabled
                    variant="outlined"
                    label="Product name"
                    fullWidth
                  />
                </Stack>

                <Stack flexDirection={'row'} gap={1}>
                  <Autocomplete
                    onChange={(event, value) => handleChangeCategory(value)}
                    size="large"
                    fullWidth
                    value={category}
                    id="combo-box-demo"
                    options={productCategoryList}
                    renderInput={(params) => <TextField {...params} label="Category" />}
                  />
                  <TextField
                    name="price"
                    value={price}
                    variant="outlined"
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                    label="Price"
                    fullWidth
                    onWheel={(e) => e.target.blur()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {/* <RHFTextField
                    fullWidth
                    variant="outlined"
                    name="price"
                    type="number"
                    label="Price "
                    onWheel={(e) => e.target.blur()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon />
                        </InputAdornment>
                      ),
                    }}
                  /> */}
                </Stack>
              </Stack>
            )}
          </Stack>

          <Stack flexDirection={'row'} justifyContent="flex-end" mt={2} alignItems={'center'}>
            {!isProductCheck && (
              <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2}>
                <Button
                  size="large"
                  variant="text"
                  onClick={() => {
                    closeModal();
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <LoadingButton
                  size="large"
                  // fullWidth
                  loading={isLoading}
                  variant="contained"
                  onClick={() => {
                    handleUpdateProduct();
                  }}
                >
                  Create Product
                </LoadingButton>
              </Stack>
            )}
            {isProductCheck && (
              <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2}>
                <Button
                  size="large"
                  variant="text"
                  onClick={() => {
                    closeModal();
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <LoadingButton size="large" type="submit" variant="contained">
                  Add
                </LoadingButton>
              </Stack>
            )}
          </Stack>
        </Card>
      </FormProvider>
      {isOpenAddOrMatchModal && (
        <AddOrMatchProductOrRawMaterialModal
          isOpenAddOrMatchModal={isOpenAddOrMatchModal}
          setIsOpenAddOrMatchModal={setIsOpenAddOrMatchModal}
          manualEntryStocks={manualEntryStocks}
          currentStock={get(selectedProductDetails, 'stockQuantity')}
          selectedProductOrRawMaterial={isOpenModal?.data}
          onSubmit={(quantity) => {
            onSubmit({ ...(getValues() || {}), quantity: quantity }, () => {
              reset();
              setIsOpenAddOrMatchModal(false);
            });
          }}
        />
      )}
    </Dialog>
  );
}

export default StoreAddProductOrRawMaterialToStore;
