import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, {
  RHFAutocomplete,
  RHFAutocompleteObjOptions,
  RHFSelect,
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
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import RegexValidation from 'src/constants/RegexValidation';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { useEffect, useState } from 'react';
import { every, filter, find, get, isArray, isEmpty, isEqual, isString, map, some } from 'lodash';
import SettingServices from 'src/services/API/SettingServices';
import { useSetRecoilState } from 'recoil';
import { alertDialogInformationState, isPublishFDState } from 'src/global/recoilState';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthService from 'src/services/authService';
import {
  ERROR,
  REQUIRED_CONSTANTS,
  ROLES_DATA,
  VALIDATE_CONSTANTS,
} from 'src/constants/AppConstants';
import GetAppIcon from '@mui/icons-material/GetApp';
import UploadImage from 'src/components/upload/UploadImage';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import getClone from 'src/utils/getClone';
import { S3Service } from 'src/services/S3Service';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import useFDPublish from 'src/hooks/useFDPublish';
import PRODUCTS_API from 'src/services/products';
import OnlineTaxesAndChargesServices from 'src/services/API/OnlineTaxesAndChargesServices';

// ----------------------------------------------------------------------

function AddOnlineTaxesAndCharges({
  isOpenAddTaxModal,
  closeTaxModal,
  editTax,
  codeReference,
  initialFetch,
  storeReference,
  type,
  productList,
}) {
  const { updatePublish } = useFDPublish();

  const isTax = type === 'TAX';

  const taxCodesOptions = isTax
    ? [
        {
          label: 'CGST',
          value: 'CGST_P',
        },
        {
          label: 'SGST',
          value: 'SGST_P',
        },
        {
          label: 'VAT',
          value: 'VAT',
          isDisabled: true,
        },
      ]
    : [
        {
          label: 'Packaging Charge',
          value: 'PC_F',
        },
        {
          label: 'Delivery Charge (Self delivery)',
          value: 'DC_F',
          isDisabled: true,
        },
      ];

  //vat

  // Define the Yup schema
  const schema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
    code: Yup.string()
      .required('Code is required')
      .transform((value) => value),
    structure: Yup.object().shape({
      value: Yup.number()
        .transform(
          (value, originalValue) => (originalValue === '' ? null : value) // Convert empty string to null
        )
        .typeError('Percentage must be a number')
        .required('Percentage is required') // Ensure it's not empty or null
        .min(0, 'Percentage cannot be less than 0')
        .max(100, 'Percentage cannot be more than 100'),
    }),
    associatedItems: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.string().required('ID is required'),
          label: Yup.string(),
        })
      )
      .min(1, 'At least one item is required'), // Ensures the array has at least one item
    ...(!isTax
      ? {
          attributes: Yup.object().shape({
            fulfillment_modes: Yup.array()
              .min(1, 'At least one fulfillment mode is required')
              .of(Yup.string().oneOf(['delivery', 'pickup'], 'Invalid fulfillment modes selected')),
            included_platforms: Yup.array()
              .min(1, 'At least one platform is required')
              .of(Yup.string().oneOf(['swiggy', 'zomato'], 'Invalid platform selected')),
          }),
        }
      : {}),
  });

  const defaultValues = {
    code: get(taxCodesOptions, '0.value'),
    description: '',
    structure: {
      value: '',
      ...(!isTax
        ? {
            applicable_on: 'item.quantity',
          }
        : {}),
    },
    associatedItems: [],
    ...(!isTax
      ? {
          attributes: {
            fulfillment_modes: ['delivery', 'pickup'],
            included_platforms: ['swiggy', 'zomato'],
          },
        }
      : {}),
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: codeReference ? editTax : defaultValues,
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

  const isEditData = isEqual(values, editTax);

  const watchStructure = watch('structure');
  const watchCode = watch('code');
  const watchAssociatedItems = watch('associatedItems');

  useEffect(() => {
    if (!isEmpty(watchAssociatedItems)) {
      const isAvailableAll = some(watchAssociatedItems, (_item) => get(_item, 'id') === 'all');
      if (isAvailableAll) {
        setValue('associatedItems', [{ label: 'All', id: 'all' }]);
      }
    }
  }, [watchAssociatedItems]);

  const onSubmit = async (data) => {
    const title = find(taxCodesOptions, (_option) => {
      return get(_option, 'value') === get(data, 'code');
    })?.label;

    const payload = {
      ...data,
      storeReference: storeReference,
      title: title === 'Packaging Charge' ? 'Restaurant Packaging Charge' : title,
      associatedItems: map(get(data, 'associatedItems'), (item) => item.id),
      type: type,
      ...(!isEmpty(editTax) ? { codeReference } : {}),
      structure: {
        ...get(data, 'structure'),
        ...(!isTax ? { applicable_on: get(data, 'structure.applicable_on') } : {}),
      },
    };

    try {
      let response;

      if (!isEmpty(editTax)) {
        response = await OnlineTaxesAndChargesServices.editTax(payload);
      } else if (isEmpty(editTax)) {
        response = await OnlineTaxesAndChargesServices.addTax(payload);
      }

      if (response?.data?.recResponse?.message && response?.data?.recResponse?.status) {
        toast?.[response?.data?.recResponse?.status]?.(response?.data?.recResponse?.message);
      } else {
        toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
      }

      if (response?.data?.recResponse?.status !== ERROR) {
        await updatePublish();
        initialFetch();
        reset();
        closeTaxModal();
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.message', ErrorConstants.SOMETHING_WRONG));
    }
  };

  useEffect(() => {
    if (Number(watchStructure.value)) {
      const title = find(taxCodesOptions, (_option) => {
        return get(_option, 'value') === watchCode;
      })?.label;

      setValue(`description`, `${watchStructure.value}% ${title || ''} on all items`);
    } else {
      setValue(`description`, '');
    }
  }, [watchStructure.value, watchCode]);

  return (
    <Dialog open={isOpenAddTaxModal}>
      <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
        <Card sx={{ p: 2, width: { xs: 325, sm: 500 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add {type === 'TAX' ? 'tax' : 'charge'}
          </Typography>

          <Stack
            gap={2}
            sx={{
              // height: 'calc(100vh - 280px)',
              overflow: 'auto',
              pt: 1,
            }}
          >
            <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }} gap={2}>
              <RHFSelect
                name={`code`}
                label={
                  <div>
                    Code <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                variant="outlined"
              >
                {map(taxCodesOptions, (_option) => {
                  return (
                    <MenuItem value={get(_option, 'value')} disabled={get(_option, 'isDisabled')}>
                      {get(_option, 'label')}
                    </MenuItem>
                  );
                })}
              </RHFSelect>

              <RHFAutocompleteObjOptions
                multiple
                disabledSearchOnChange
                options={[
                  ...(!isEmpty(productList)
                    ? [
                        {
                          label: 'All',
                          id: 'all',
                        },
                      ]
                    : []),
                  ...(map(productList, (_item) => ({
                    label: _item?.name,
                    id: _item.productId,
                  })) || []),
                ]}
                label={
                  <div>
                    Items <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                name="associatedItems"
                getOptionDisabled={(option) => {
                  const isAlreadySelected = some(watchAssociatedItems, (e) => e.id === option?.id);
                  return get(watchAssociatedItems, '0.id') === 'all' || isAlreadySelected;
                }}
              />
            </Stack>

            <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }} gap={2}>
              <RHFTextField
                label={
                  <div>
                    Percentage <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                name="structure.value"
                sx={{ width: '100%' }}
              />

              <RHFTextField
                label={
                  <div>
                    Description <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                name="description"
                sx={{ width: '100%' }}
                disabled
              />
            </Stack>

            {!isTax && (
              <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }} gap={2}>
                <RHFAutocomplete
                  multiple
                  disabledSearchOnChange
                  label="Fulfillment modes"
                  name={`attributes.fulfillment_modes`}
                  options={['delivery', 'pickup']}
                  variant="outlined"
                  fullWidth
                />

                <RHFAutocomplete
                  multiple
                  disabledSearchOnChange
                  label={
                    <div>
                      Included platforms <span style={{ color: 'red' }}>*</span>
                    </div>
                  }
                  name={`attributes.included_platforms`}
                  options={['swiggy', 'zomato']}
                  variant="outlined"
                  fullWidth
                />
              </Stack>
            )}

            {!isTax && (
              <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }} gap={2}>
                <RHFSelect
                  fullWidth
                  name="structure.applicable_on"
                  label="applicable on"
                  variant="outlined"
                >
                  <MenuItem value={'item.quantity'}>For each item</MenuItem>
                  <MenuItem value={'order.order_subtotal'}>Order Subtotal</MenuItem>
                </RHFSelect>
              </Stack>
            )}
          </Stack>

          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button size="large" variant="text" onClick={closeTaxModal}>
              Cancel
            </Button>
            <LoadingButton
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={isEditData && editTax}
            >
              Submit
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Dialog>
  );
}

export default AddOnlineTaxesAndCharges;
