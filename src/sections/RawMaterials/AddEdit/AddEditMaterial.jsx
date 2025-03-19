import { yupResolver } from '@hookform/resolvers/yup';
import { Dialog, Grid, Stack } from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { find, forEach, get, groupBy, isEmpty, isEqual, isObject, map, sortBy } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import FormProvider from 'src/components/FormProvider';
import { RHFAutocompleteObjOptions } from 'src/components/hook-form';
import { REQUIRED_CONSTANTS, ROLES_WITHOUT_STORE_STAFF } from 'src/constants/AppConstants';

import { LoadingButton } from '@mui/lab';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import {
  allCategories,
  allMaterialCategories,
  allMaterialProducts,
  currentRawProduct,
  totalRawProductState,
} from 'src/global/recoilState';
import { S3Service } from 'src/services/S3Service';
import * as Yup from 'yup';

import { omit, set } from 'lodash';
import { textReplaceAll } from 'src/helper/textReplaceAll';

import AuthService from 'src/services/authService';
import RAW_PRODUCTS_API from 'src/services/rawproducts';
import debounce from 'src/utils/debounce';
import { formatDate } from 'src/utils/formatTime';
import MaterialAddForm from './MaterialAddForm';
import MaterialDrawerHeader from './MaterialDrawerHeader';
import { toFixedIfNecessary } from 'src/utils/formatNumber';

export default function AddEditMaterial({
  openDrawer,
  handleCloseDrawer,
  newProduct,
  syncUpProducts,
}) {
  const productList = useRecoilValue(allMaterialProducts);
  const allProductsWithUnits = useRecoilValue(totalRawProductState);
  const isMobile = useMediaQuery('(max-width:600px)');
  const groupedProducts = groupBy(sortBy(productList, 'category'), 'category');
  const [productCategoryList, setProductCategoryList] = useRecoilState(allMaterialCategories);
  const [categoriesList, setNewCategoriesList] = useRecoilState(allCategories);
  const [isLoading, setIsLoading] = useState(false);
  const currentProductData = useRecoilValue(currentRawProduct);

  const [isAttributemode, setAttributeMode] = useState(false);
  const currentRole = AuthService.getCurrentRoleInLocal();

  const isNotStaff = ROLES_WITHOUT_STORE_STAFF.includes(currentRole);
  const resetCurrentProduct = useResetRecoilState(currentRawProduct);

  const [productIdLoading, setProductIdLoading] = useState(false);
  const [availableProductId, setIsAvailableProductId] = useState(null);
  const [batchIdLoading, setBatchIdLoading] = useState(false);
  const [isAvailableBatchId, setIsAvailableBatchId] = useState(null);
  const [filledProductData, setFilledProductData] = useState({});

  const RegisterSchema = Yup.object().shape({
    name: Yup.string().required(REQUIRED_CONSTANTS.ITEM),
    category: Yup.string()
      .required(REQUIRED_CONSTANTS.CATEGORY)
      .transform((value) => value),
    unitName: Yup.string().required(REQUIRED_CONSTANTS.UNIT_TYPE),
    isBatch: Yup.boolean(),
    batchId: Yup.string()
      .transform((value) => value?.toUpperCase?.())
      .nullable(),
    manufactureDate: Yup.string().when('isBatch', {
      is: (value) => value,
      then: () => Yup.string(),
      otherwise: () => Yup.string().nullable(),
    }),
    expiryDate: Yup.string().when('isBatch', {
      is: (value) => value,
      then: () => Yup.string(),
      otherwise: () => Yup.string().nullable(),
    }),

    productImage: Yup.mixed().nullable(),
    ...(newProduct
      ? {
          productId: Yup.string()
            .transform((value) => value?.toUpperCase())
            .nullable(),
        }
      : {}),
    rawValue: Yup.number()

      .moreThan(0, REQUIRED_CONSTANTS.VALUE)
      .transform((value) => (Number.isNaN(value) ? null : value)),
    stockQuantity: Yup.number()
      .required(REQUIRED_CONSTANTS.STOCK_QUANTITY_IS_REQUIRED)
      .moreThan(0, REQUIRED_CONSTANTS.STOCK_QUANTITY_SHOULD_BE_MORE_THAN_TO_0)
      .transform((value) => (Number.isNaN(value) ? null : value)),
  });

  const defaultValues = {
    name: '',
    description: '',
    isBatch: false,
    category: '',
    productId: '',
    batchId: '',
    manufactureDate: null,
    expiryDate: null,
    unitName: '',
    rawValue: 0,
    stockQuantity: 0,
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    setValue,
    getValues,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
    clearErrors,
  } = methods;

  useEffect(() => {
    if (!newProduct) return;
    if (availableProductId === false) {
      setError('productId', {
        type: 'custom',
        message: ErrorConstants.PRODUCT_ID_IS_ALREADY_EXISTS,
      });
    } else {
      clearErrors('productId');
    }
  }, [availableProductId, isSubmitting]);

  useEffect(() => {
    if (!newProduct) return;
    if (isAvailableBatchId === false) {
      setError('batchId', {
        type: 'custom',
        message: ErrorConstants.BATCH_ID_IS_ALREADY_EXISTS,
      });
    } else {
      clearErrors('batchId');
    }
  }, [isAvailableBatchId, isSubmitting]);

  const values = watch();
  const watchCategory = watch('category');
  const watchUnitName = watch('unitName');

  const formatProduct = (data) => {
    const {
      name,
      category,
      productImage,
      productId,
      batchId,
      manufactureDate,
      expiryDate,
      unitName,
      rawValue,
      stockQuantity,
    } = data;

    return {
      name,
      category,
      productImage,
      productId,
      unitName,
      rawValue,
      stockQuantity,
      ...(isShowBatchField
        ? {
            batchId,
            productInfo: {
              ...(!isEmpty(currentProductData) && !isEmpty(get(currentProductData, 'productInfo'))
                ? get(currentProductData, 'productInfo', {})
                : {}),
              batchInfo: {
                mfgDate: formatDate(manufactureDate),
                expDate: formatDate(expiryDate),
              },
            },
          }
        : {}),
    };
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      let updatedData = {
        ...data,
        productId: textReplaceAll(get(data, 'productId', ''), ' ', ''),
      };
      if (typeof get(data, 'productImage') === 'object' && get(data, 'productImage') !== null) {
        const linkResponse = await S3Service.getLink();
        const payload = {
          s3URL: get(linkResponse, 'data.URL'),
          file: get(data, 'productImage'),
        };
        const imageResponse = await S3Service.sendFile(payload);
        updatedData = { ...updatedData, productImage: get(imageResponse, 'url').split('?')[0] };
      }
      if (newProduct) {
        const options = [];
        forEach([updatedData], (item, index) => {
          options.push(formatProduct(item));
        });
        handleAddProduct(options);
      } else if (!newProduct) {
        const updateProducts = [formatProduct(updatedData)];
        handleUpdateAndAddAndDelete({ updateProducts });
      }
    } catch (error) {
      setError('afterSubmit', 'Something Went Wrong');
      setIsLoading(false);
    }
  };

  const getOnlyEditedProductDetails = ({ prevOrder, currentOrder }) => {
    const obj1 = prevOrder;
    const obj2 = currentOrder;

    var newObj = {};
    Object.keys(obj2).forEach((key) => {
      if (isObject(obj2[key])) {
        if (!isEqual(obj1[key], obj2[key])) {
          newObj[key] = obj2[key];
        }
      } else if (obj1[key] !== obj2[key]) {
        newObj[key] = obj2[key];
      }
    });

    set(newObj, 'storeId', get(currentOrder, 'storeId'));
    set(newObj, 'productId', get(currentOrder, 'productId'));

    const _NewObj = omit(newObj, ['productId', 'storeId', 'terminalId']);

    if (isEmpty(_NewObj)) {
      return {};
    }

    return newObj;
  };

  const handleAddProduct = async (options) => {
    try {
      const response = await RAW_PRODUCTS_API.addProduct(options);
      if (response) {
        setIsLoading(false);
        handleReset();
        syncUpProducts();
        handleCloseDrawer();
        setTimeout(() => {
          toast.success(SuccessConstants.PRODUCT_ADDED);
        }, 500);
      }
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
      setIsLoading(false);
    }
  };

  const handleUpdateAndAddAndDelete = async ({ updateProducts }) => {
    try {
      for (const _product of updateProducts) {
        const findProduct = find(allProductsWithUnits, (_item) => {
          return get(_item, 'productId') === get(_product, 'productId');
        });

        const onlyEditedProductDetails = getOnlyEditedProductDetails({
          prevOrder: findProduct,
          currentOrder: _product,
        });

        if (!isEmpty(onlyEditedProductDetails)) {
          await RAW_PRODUCTS_API.updateProduct(onlyEditedProductDetails);
        }
      }

      toast.success(SuccessConstants.PRODUCT_UPDATED);
      setIsLoading(false);
      handleReset();
      handleCloseDrawer();
      syncUpProducts();
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    reset(defaultValues);
    setIsAvailableProductId(null);
    setProductIdLoading(false);
    setBatchIdLoading(false);
    setFilledProductData({});
  };

  const checkProductIdAvailability = async () => {
    try {
      setProductIdLoading(true);
      if (methods.watch('productId')) {
        const response = await RAW_PRODUCTS_API.productIDAvailability(
          methods.watch('productId')?.toUpperCase?.()
        );

        const productIdList = map([filledProductData || {}], (_item) => {
          return get(_item, 'productId')?.toUpperCase?.();
        });

        if (
          response &&
          isEmpty(get(response, 'data', [])) &&
          !productIdList?.includes(methods.watch('productId')?.toUpperCase?.())
        ) {
          setIsAvailableProductId(true);
        } else {
          setIsAvailableProductId(false);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setProductIdLoading(false);
    }
  };

  const checkBatchIdAvailability = async () => {
    try {
      setBatchIdLoading(true);
      if (methods.watch('batchId')) {
        const response = await RAW_PRODUCTS_API.batchIDAvailability(
          methods.watch('batchId')?.toUpperCase?.()
        );

        const productBatchIdList = map([filledProductData || {}], (_item) => {
          return get(_item, 'batchId')?.toUpperCase?.();
        });

        if (
          response &&
          isEmpty(get(response, 'data', [])) &&
          !productBatchIdList?.includes(methods.watch('batchId')?.toUpperCase?.())
        ) {
          setIsAvailableBatchId(true);
        } else {
          setIsAvailableBatchId(false);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setBatchIdLoading(false);
    }
  };

  const handleAddCategories = () => {
    if (!isEmpty(groupedProducts)) {
      const data = [];
      map(groupedProducts || [], (dishes, category) => {
        data.push(category);
      });
      setNewCategoriesList(data);
    }
  };

  useEffect(() => {
    if (isEmpty(currentProductData)) {
      handleReset();
    } else {
      console.log('currentProductDataaaa', currentProductData);
      const unitAverageValue = get(currentProductData, 'unitAverageValue', 0);
      const stockQuantity = get(currentProductData, 'stockQuantity', 0);
      const rawValue = toFixedIfNecessary(unitAverageValue * stockQuantity, 2);

      reset({
        ...currentProductData,
        rawValue,

        isBatch:
          get(currentProductData, 'productInfo.batchInfo.mfgDate') &&
          get(currentProductData, 'productInfo.batchInfo.expDate')
            ? true
            : false,
      });
    }
  }, [currentProductData]);

  useEffect(() => {
    handleAddCategories();
  }, [productList]);

  useEffect(() => {
    if (!methods.watch('isBatch')) {
      setValue('batchId', '');
      setValue('manufactureDate', null);
      setValue('expiryDate', null);
    }
    if (methods.watch('isBatch')) {
      setValue('batchId', currentProductData?.batchId);
      setValue('manufactureDate', get(currentProductData, 'productInfo.batchInfo.mfgDate') || null);
      setValue('expiryDate', get(currentProductData, 'productInfo.batchInfo.expDate') || null);
    }
  }, [methods.watch('isBatch')]);

  useEffect(() => {
    debounce(() => {
      checkProductIdAvailability();
    }, 1000);
  }, [methods.watch('productId')]);

  useEffect(() => {
    debounce(() => {
      checkBatchIdAvailability();
    }, 1000);
  }, [methods.watch('batchId')]);

  const isShowBatchField = methods.watch('isBatch');

  const handleCancel = () => {
    handleCloseDrawer();
    resetCurrentProduct();
    setFilledProductData({});

    reset();
  };

  const handleClear = () => {
    if (newProduct) {
      reset({ ...defaultValues });
    } else {
      reset({ ...currentProductData });
    }
    setFilledProductData({});
  };

  const getProductName = () => {
    if (newProduct) {
      return 'Add new material';
    } else {
      return 'Edit material';
    }
  };
  return (
    <Dialog maxWidth={'lg'} open={openDrawer}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <MaterialDrawerHeader
          setValue={setValue}
          values={values}
          productName={getProductName()}
          handleCancel={handleCancel}
          handleClear={handleClear}
        />
        <Grid
          container
          sx={{
            px: 2,
            gap: '10px',
          }}
        >
          <MaterialAddForm
            methods={methods}
            availableProductId={availableProductId}
            productIdLoading={productIdLoading}
            isNotStaff={isNotStaff}
            setAttributeMode={setAttributeMode}
            isAttributemode={isAttributemode}
            errors={errors}
            newProduct={newProduct}
            productCategoryList={productCategoryList}
            RHFAutocompleteObjOptions={RHFAutocompleteObjOptions}
            isShowBatchField={isShowBatchField}
            isAvailableBatchId={isAvailableBatchId}
            batchIdLoading={batchIdLoading}
            watchUnitName={watchUnitName}
          />

          <Stack
            flexDirection={'row'}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              flexWrap: 'wrap',
              mb: 2,
            }}
          >
            <LoadingButton
              loading={isLoading}
              size="small"
              color="primary"
              variant="contained"
              type="submit"
              sx={{
                p: 3,
                ml: isMobile ? 0 : 2,
                flexGrow: 1,
                mt: isMobile ? 2 : 0,
              }}
            >
              {!newProduct ? 'Update material' : 'Add material'}
            </LoadingButton>
          </Stack>
        </Grid>
      </FormProvider>
    </Dialog>
  );
}
