import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, {
  RHFAutocompleteObjOptions,
  RHFCheckbox,
  RHFRadioGroup,
  RHFSwitch,
  RHFTextField,
} from 'src/components/hook-form';

// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  Dialog,
  IconButton,
  InputAdornment,
  ListItemText,
  Paper,
  Stack,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import RegexValidation from 'src/constants/RegexValidation';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { useEffect, useState } from 'react';
import { capitalize, find, get, isArray, isEmpty, map, omit, omitBy } from 'lodash';
import SettingServices from 'src/services/API/SettingServices';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  alertDialogInformationState,
  currentStoreId,
  currentTerminalId,
} from 'src/global/recoilState';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthService from 'src/services/authService';
import {
  PURCHASE_TO_SHOP,
  REQUIRED_CONSTANTS,
  ROLES_DATA,
  VALIDATE_CONSTANTS,
} from 'src/constants/AppConstants';
import GetAppIcon from '@mui/icons-material/GetApp';
import uuid from 'react-uuid';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import PRODUCTS_API from 'src/services/products';

// ----------------------------------------------------------------------

function StoreAddAndEditProduct({ isOpenModal, closeModal, editProductDetails, onSubmit, receiverStoreId }) {
  const theme = useTheme();

  const [isGSTEnabled, setIsGSTEnabled] = useState(false);
  const [productListForStock, setProductListForStock] = useState([]);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const [countersList, setCountersList] = useState([]);

  const schema = Yup.object().shape({
    productOrRawMaterial: Yup.object().shape({
      label: Yup.string().required(REQUIRED_CONSTANTS.PRODUCT_NAME),
      id: Yup.string(),
    }),
    quantity: Yup.number()
      .required(ErrorConstants.QUANTITY_IS_REQUIRED)
      .transform((value) => (Number.isNaN(value) ? null : value))
      .test('Is positive?', VALIDATE_CONSTANTS.QUANTITY_NOT_ZERO, (value) => value > 0),
  });

  const defaultValues = {
    type: PURCHASE_TO_SHOP.PRODUCT,
    productOrRawMaterial: null,
    quantity: '',
    autoAdd: false,
    counterId: { label: '', id: '' },
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { isSubmitting, errors },
    clearErrors,
  } = methods;
  const values = watch();

  const getProductCounterList = async () => {
    try {
      // setLoading(true);
      const response = await PRODUCTS_API.getProductCounterList(receiverStoreId);
      if (response) setCountersList(response.data);
    } catch (e) {
      setCountersList([]);
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal && get(values, 'type') === PURCHASE_TO_SHOP.RAW_MATERIAL)
      getProductCounterList();
  }, [currentStore, currentTerminal, get(values, 'type')]);

  const watchQuantity = watch('quantity');
  const watchRate = watch('rate');
  const watchAmount = watch('price');
  const watchType = get(values, 'type');
  const watchProductOrRawMaterial = get(values, 'productOrRawMaterial');

  useEffect(() => {
    setValue('price', (watchQuantity || 0) * (watchRate || 0));
  }, [watchQuantity, watchRate]);

  console.log('editProductDetails', editProductDetails);

  useEffect(() => {
    if (isEmpty(editProductDetails)) return;
    const { GSTInc, GSTPercent, autoAdd, name, price, productId, quantity, rate, type, unit } = get(
      editProductDetails,
      'data'
    );
    reset({
      type,
      productOrRawMaterial: {
        id: productId || '',
        label: name,
      },
      quantity,
      rate,
      GSTPercent,
      GSTInc,
      autoAdd,
    });
    if (get(editProductDetails, 'data.GSTPercent')) {
      setIsGSTEnabled(true);
    }
  }, [editProductDetails]);

  const getListForStock = async () => {
    try {
      let res = {};
      if (get(values, 'type') === PURCHASE_TO_SHOP.PRODUCT) {
        res = await PurchaseOrderServices.productStoreListForPurchase({storeId : receiverStoreId})
      } else {
        res = await PurchaseOrderServices.rawMaterialListForStock({storeId : receiverStoreId})
      }
      setProductListForStock(get(res, 'data'));
    } catch (e) {
      setProductListForStock([]);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (get(editProductDetails, 'data.type') === watchType) {
      reset({
        ...getValues(),
        productOrRawMaterial: {
          id: get(editProductDetails, 'data.productId') || '',
          label: get(editProductDetails, 'data.name'),
        },
      });
    } else {
      reset({
        ...getValues(),
        productOrRawMaterial: null,
      });
    }
    getListForStock();
  }, [watchType]);

  const selectedProductForStock = find(productListForStock, (_item) => {
    return get(_item, 'productId') === get(watchProductOrRawMaterial, 'id');
  });

  const isDisabledAutoAdd = !watchProductOrRawMaterial?.id && watchProductOrRawMaterial !== null;
console.log('watchProductOrRawMaterial', watchProductOrRawMaterial);
  useEffect(() => {
    if (isDisabledAutoAdd && get(values, 'type') === PURCHASE_TO_SHOP.PRODUCT) {
      setValue('autoAdd', false);
    }
  }, [watchProductOrRawMaterial]);

  useEffect(() => {
    if (watchType === PURCHASE_TO_SHOP.PRODUCT) {
      const { data: autoAdd } = ObjectStorage.getItem(StorageConstants.AUTO_ADD_TO_STOCKS);
      setValue('autoAdd', autoAdd);
    }
  }, [watchType]);

  return (
    <Dialog open={isOpenModal}>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit((data, event) => {
          const formatData = omit(
            {
              ...data,
              ...(get(data, 'productOrRawMaterial.id')
                ? { productId: get(data, 'productOrRawMaterial.id') }
                : {}),
              ...(get(values, 'type') === PURCHASE_TO_SHOP.RAW_MATERIAL
                ? { counterId: get(data, 'counterId') }
                : get(selectedProductForStock, 'counterId')
                ? {
                    counterId: {
                      label: selectedProductForStock.counterName,
                      id: selectedProductForStock.counterId,
                    },
                  }
                : {}),
              name: get(data, 'productOrRawMaterial.label'),
              unit: get(selectedProductForStock, 'unitName'),
            },
            get(values, 'type') === PURCHASE_TO_SHOP.PRODUCT
              ? ['productOrRawMaterial']
              : ['productOrRawMaterial', 'autoAdd']
          );
          console.log('formatData', formatData);
          if(!data?.productOrRawMaterial?.id ) return toast.error(ErrorConstants.VALID_PRODUCT);
          onSubmit(
            isGSTEnabled ? formatData : omit(formatData, ['GSTPercent', 'GSTInc']),
            get(values, 'type') === PURCHASE_TO_SHOP.PRODUCT
          );
          setIsGSTEnabled(false);
          reset(defaultValues);
        })}
      >
        <Card sx={{ p: 2, width: { xs: 325, sm: 500 } }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {isEmpty(editProductDetails)
              ? `Add ${capitalize(watchType)}`
              : `Update ${capitalize(watchType)}`}
          </Typography>

          <RHFRadioGroup
            row={true}
            name={'type'}
            options={map(PURCHASE_TO_SHOP, (_value) => {
              return {
                label: _value?.replace('_', ' '),
                value: _value,
              };
            })}
            sx={{ mb: 1 }}
          />

          <Stack gap={2}>
            <Stack sx={{ flexDirection: { xs: 'column', sm: 'column' } }} gap={2}>
              <RHFAutocompleteObjOptions
                size="small"
                options={map(productListForStock, (_item) => {
                  return {
                    label: get(_item, 'name'),
                    id: get(_item, 'productId'),
                  };
                })}
                renderOption={(props, item) => (
                  <li {...props} key={item.id}>
                    <ListItemText>{item.label}</ListItemText>
                  </li>
                )}
                freeSolo={true}
                name="productOrRawMaterial"
                label={capitalize(get(values, 'type'))?.replace('_', ' ')}
              />

              <RHFTextField
                size="small"
                label="Quantity"
                name="quantity"
                sx={{ width: '100%' }}
                InputProps={{
                  ...(get(selectedProductForStock, 'unitName')
                    ? {
                        endAdornment: (
                          <InputAdornment position="end">
                            {get(selectedProductForStock, 'unitName')}
                          </InputAdornment>
                        ),
                      }
                    : {}),
                }}
              />
            </Stack>
      
            {get(values, 'type') === PURCHASE_TO_SHOP.RAW_MATERIAL && (
              <RHFAutocompleteObjOptions
                name="counterId"
                variant="outlined"
                label="Select counter"
                fullWidth
                options={map(countersList, (e) => ({
                  label: get(e, 'name'),
                  id: get(e, 'counterId'),
                }))}
                disableClearable
                renderOption={(props, item) => (
                  <li {...props} key={item.id}>
                    <ListItemText>{item.label}</ListItemText>
                  </li>
                )}
                freeSolo={false}
                filterOptions={(options, state) =>
                  options.filter((option) =>
                    option.label.toLowerCase().includes(state.inputValue.toLowerCase())
                  )
                }
              />
            )}
            {get(values, 'type') === PURCHASE_TO_SHOP.PRODUCT &&
              !isEmpty(selectedProductForStock) && (
                <Stack sx={{ alignItems: 'end' }}>
                  <Typography sx={{ fontSize: '11px' }}>
                    <span style={{ fontWeight: 'bold' }}>Counter Name:</span>{' '}
                    {get(selectedProductForStock, 'counterName')
                      ? get(selectedProductForStock, 'counterName')
                      : 'N/A'}{' '}
                  </Typography>
                </Stack>
              )}
           

            {get(values, 'type') === PURCHASE_TO_SHOP.PRODUCT && (
              <Card sx={{ p: 1 }}>
                <Stack flexDirection="row" alignItems="center" gap={1}>
                  <Typography>Auto add to stocks</Typography>
                  <RHFCheckbox name="autoAdd" disabled={isDisabledAutoAdd} />
                </Stack>
                <Typography sx={{ fontSize: '9px' }}>
                  * Add product directly to your stock inventory while creating purchase order (
                  except in OPEN status)
                </Typography>
              </Card>
            )}
          </Stack>
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button
              size="large"
              variant="text"
              onClick={() => {
                closeModal();
                setIsGSTEnabled(false);
                reset(defaultValues);
              }}
            >
              Cancel
            </Button>
            <Button size="large" type="submit" variant="contained">
              Submit
            </Button>
          </Stack>
        </Card>
      </FormProvider>
    </Dialog>
  );
}

export default StoreAddAndEditProduct;
