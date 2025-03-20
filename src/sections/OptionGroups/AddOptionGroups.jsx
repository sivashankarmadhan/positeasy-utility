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
  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import RegexValidation from 'src/constants/RegexValidation';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { useEffect, useState } from 'react';
import { filter, find, get, isArray, isEmpty, isEqual, map, some } from 'lodash';
import SettingServices from 'src/services/API/SettingServices';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  alertDialogInformationState,
  currentStoreId,
  isPublishFDState,
} from 'src/global/recoilState';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthService from 'src/services/authService';
import {
  ERROR,
  requiredDescriptionKeywords,
  REQUIRED_CONSTANTS,
  restrictedKeywords,
  ROLES_DATA,
  VALIDATE_CONSTANTS,
} from 'src/constants/AppConstants';
import GetAppIcon from '@mui/icons-material/GetApp';
import UploadImage from 'src/components/upload/UploadImage';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import OnlineCategoryServices from 'src/services/API/OnlineCategoryServices';
import getClone from 'src/utils/getClone';
import { S3Service } from 'src/services/S3Service';
import OptionsGroupServices from 'src/services/API/OptionsGroupServices';
import PRODUCTS_API from 'src/services/products';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import useFDPublish from 'src/hooks/useFDPublish';

// ----------------------------------------------------------------------

function AddOptionGroups({
  isOpenAddOptionGroupModal,
  closeOptionGroupModal,
  editOptionGroup,
  groupId,
  initialFetch,
  storeReference,
  storeName,
}) {
  const { updatePublish } = useFDPublish();

  const [optionGroupList, setOptionGroupList] = useState([]);
  const [optionGroupListWithAssociatedItems, setOptionGroupListWithAssociatedItems] = useState([]);

  const [productList, setProductList] = useState([]);
  const currentStore = useRecoilValue(currentStoreId);
  console.log('editOptionGroup', editOptionGroup);

  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole;

  const formatOptionGroupList = filter(optionGroupList, (_item) => {
    return get(_item, 'title') !== get(editOptionGroup, 'title');
  });

  // Define the Yup schema

  const schema = Yup.object().shape({
    title: Yup.string()
      .required(ErrorConstants.NAME_IS_REQUIRED)
      .test('no-restricted-words', 'Title cannot contain some restricted words', (value) => {
        if (!value) return true;
        const restrictedRegex = new RegExp(restrictedKeywords.join('|'), 'i'); // Create a case-insensitive regex
        return !restrictedRegex.test(value);
      })
      .test(
        'not-in-options-group-list',
        'Title cannot be a existing options group name',
        (value) => {
          if (!value) return true;
          return !formatOptionGroupList.some(
            (_item) => _item.title.toLowerCase() === value.toLowerCase()
          );
        }
      ),
    description: Yup.string()
      .test('no-restricted-words', 'Description cannot contain some restricted words', (value) => {
        if (!value) return true;
        const restrictedRegex = new RegExp(restrictedKeywords.join('|'), 'i'); // Create a case-insensitive regex
        return !restrictedRegex.test(value);
      })
      .test(
        'required-if-keyword',
        "Description is required for items with 'meals', 'platter', 'combo', 'box', or 'thalis'",
        (value, context) => {
          const title = context.parent.title || ''; // Get the title from the object
          const hasKeyword = requiredDescriptionKeywords.some((keyword) =>
            title.toLowerCase().includes(keyword)
          );

          if (hasKeyword) {
            return !!value; // Description is required if a keyword is found
          }
          return true; // Otherwise, it's optional
        }
      ),

    // translations: Yup.array().of(
    //   Yup.object().shape({
    //     title: Yup.string().required(ErrorConstants.TRANSLATION_NAME_IS_REQUIRED),
    //     language: Yup.string().required(ErrorConstants.LANGUAGE_IS_REQUIRED),
    //   })
    // ),
    sortOrder: Yup.number()
      .required(ErrorConstants.SORT_ORDER_IS_REQUIRED)
      .transform((value) => (Number.isNaN(value) ? null : value))
      .test('Is positive?', ErrorConstants.PRICE_MUST_BE_POSITIVE_NUMBER, (value) => value >= 0),

    minSelectable: Yup.number()
      .transform(
        (value, originalValue) => (originalValue === '' ? null : value) // Convert empty string to null
      )
      .moreThan(0, 'Min selectable must be greater than 0')
      .required('Min selectable is required'),

    maxSelectable: Yup.number()
      .transform(
        (value, originalValue) => (originalValue === '' ? null : value) // Convert empty string to null
      )
      .min(
        Yup.ref('minSelectable'),
        'Max selectable must be greater than or equal to Min selectable'
      )
      .required('Max selectable is required'),

    items: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.string().required(ErrorConstants.ITEM_IS_REQUIRED),
          label: Yup.string(),
        })
      )
      .test('is-array', 'Items must be an array', (value) => Array.isArray(value)) // Ensures it's an array
      .test(
        'max-associated-per-id-three',
        'An Item should not have associated more than 3 Variant groups',
        (value) => {
          if (!Array.isArray(value)) return false;

          return !some(value, (_optionGrp) => {
            const findData = find(optionGroupListWithAssociatedItems, (_value, _key) => {
              return get(_optionGrp, 'id') === _key && _value >= 3;
            });

            return findData;
          });
        }
      )
      .when(['minSelectable', 'maxSelectable'], {
        is: (minSelectable, maxSelectable) =>
          typeof minSelectable === 'number' &&
          typeof maxSelectable === 'number' &&
          minSelectable === 1 &&
          maxSelectable === 1,
        then: (schema) => schema.min(2, 'You must select at least 2 items'),
        otherwise: (schema) =>
          schema.when('minSelectable', {
            is: (minSelectable) => typeof minSelectable === 'number' && minSelectable > 0,
            then: (s) =>
              s.min(Yup.ref('minSelectable'), ({ min }) => `You must select at least ${min} items`),
            otherwise: (s) => s.min(1, ErrorConstants.AT_LEAST_ONE_ITEM_IS_REQUIRED),
          }),
      }),
  });

  const defaultValues = {
    title: '',
    description: '',
    // translations: [
    //   {
    //     title: '',
    //     language: '',
    //     description: '',
    //   },
    // ],
    sortOrder: '',
    minSelectable: '',
    maxSelectable: '',
    items: [],
    type: '',
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: groupId ? editOptionGroup : defaultValues,
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

  const watchMinSelectable = watch('minSelectable');
  const watchMaxSelectable = watch('maxSelectable');
  const watchItems = watch('items');

  const isEditData = isEqual(values, editOptionGroup);

  // const watchTranslations = watch('translations');
  // const watchName = watch('title');
  // const watchDescription = watch('description');

  const getProductList = async () => {
    try {
      const response = await PRODUCTS_API.getItemsProductList(currentStore);
      if (response) {
        setProductList(response.data);
      } else {
        setProductList([]);
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      setProductList([]);
    }
  };

  useEffect(() => {
    getProductList();
  }, []);

  // useEffect(() => {
  //   if (isEmpty(editOptionGroup)) {
  //     setValue('translations[0].description', watchDescription);
  //   }
  // }, [watchDescription]);

  const onSubmit = async (data) => {
    try {
      const ids = data?.items?.map((item) => ({
        name: item.label,
        productId: item.id,
      }));

      const payload = {
        ...data,
        storeReference,
        storeName,
        itemsAssociated: ids,
        sortOrder: Number(get(data, 'sortOrder')),
      };

      if (!get(payload, 'minSelectable')) {
        delete payload?.minSelectable;
      }
      if (!get(payload, 'maxSelectable')) {
        delete payload?.maxSelectable;
      }

      delete payload?.items;
      delete payload?.type;

      let response;

      if (!isEmpty(editOptionGroup)) {
        response = await OptionsGroupServices.editOptionsGroup({
          ...payload,
          groupId: groupId,
        });
        if (response) {
          if (response?.recResponse?.message && response?.recResponse?.status) {
            toast?.[response?.recResponse?.status]?.(response?.recResponse?.message);
          } else {
            toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
          }
        }
      } else if (isEmpty(editOptionGroup)) {
        response = await OptionsGroupServices.addOptionsGroup(payload);
        if (response?.recResponse?.message && response?.recResponse?.status) {
          toast?.[response?.recResponse?.status]?.(response?.recResponse?.message);
        } else {
          toast.success(SuccessConstants.SAVE_SUCCESSFUL);
        }
      }

      if (response?.recResponse?.status !== ERROR) {
        await updatePublish();
        initialFetch();
        reset();
        closeOptionGroupModal();
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse?.message', ErrorConstants.SOMETHING_WRONG));
    }
  };

  // useEffect(() => {
  //   if (watchTranslations[0].language) {
  //     setValue('translations[0].title', watchName);
  //   }
  // }, [watchTranslations[0].language]);

  useEffect(() => {
    if (watchMinSelectable == 1 && watchMaxSelectable == 1) {
      setValue('type', 'Variant');
    } else if (
      watchMinSelectable &&
      watchMaxSelectable &&
      watchMinSelectable <= watchMaxSelectable
    ) {
      setValue('type', 'Addons');
    } else {
      setValue('type', '');
    }
  }, [watchMinSelectable, watchMaxSelectable]);

  const getOptionsGroup = async () => {
    try {
      const response = await OptionsGroupServices.getOptionsGroupList(currentStore);

      if (response && response.data) {
        setOptionGroupList(response.data);
      } else {
        setOptionGroupList([]);
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      setOptionGroupList([]);
    }
  };

  const getOptionsGroupWithAssociatedItems = async () => {
    try {
      const response = await OptionsGroupServices.getOptionsGroupListWithAssociatedItems(
        storeReference
      );

      if (response && response.data) {
        setOptionGroupListWithAssociatedItems(response.data);
      } else {
        setOptionGroupListWithAssociatedItems([]);
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      setOptionGroupListWithAssociatedItems([]);
    }
  };

  useEffect(() => {
    getOptionsGroup();
    getOptionsGroupWithAssociatedItems();
  }, []);

  console.log('optionGroupListWithAssociatedItems', optionGroupListWithAssociatedItems);

  return (
    <Dialog open={isOpenAddOptionGroupModal} onClose={closeOptionGroupModal}>
      <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
        <Card sx={{ p: 2, width: { xs: 325, sm: 500 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add Options Group
          </Typography>
          <Stack
            gap={2}
            sx={{
              height: 'calc(100vh - 280px)',
              overflow: 'auto',
            }}
          >
            <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' }, pt: 1 }} gap={2}>
              <RHFTextField
                label={
                  <div>
                    Name <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                name="title"
                sx={{ width: '100%' }}
              />
              <RHFTextField
                label={
                  <div>
                    Sort order <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                name="sortOrder"
                sx={{ width: '100%' }}
                type="number"
                onWheel={(e) => e.target.blur()}
              />
            </Stack>
            <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }} gap={2}>
              <RHFTextField
                type="number"
                label={
                  <div>
                    Minimum Select <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                name="minSelectable"
                sx={{ width: '100%' }}
                onWheel={(e) => e.target.blur()}
              />
              <RHFTextField
                type="number"
                label={
                  <div>
                    Maximum Select <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                name="maxSelectable"
                sx={{ width: '100%' }}
                onWheel={(e) => e.target.blur()}
              />
            </Stack>

            <RHFTextField label="Type" name="type" sx={{ width: '100%' }} disabled />

            <RHFAutocompleteObjOptions
              multiple
              disabledSearchOnChange
              options={map(productList, (_item) => ({
                label: _item?.name,
                id: _item.productId,
              }))}
              label={
                <div>
                  Items <span style={{ color: 'red' }}>*</span>
                </div>
              }
              name="items"
              getOptionDisabled={(option) => {
                const isAlreadySelected = some(watchItems, (e) => e.id === option?.id);
                return isAlreadySelected;
              }}
            />

            <RHFTextField
              size="small"
              label="Description"
              name="description"
              multiline
              rows={5}
              sx={{ width: '100%' }}
            />

            {/* <Card
              sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                overflow: 'revert',
              }}
            >
              <Stack
                sx={{ width: '100%' }}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography sx={{ fontWeight: 'semibold' }} mb={2}>
                  Translations
                </Typography>
              </Stack>

              {map(watchTranslations, (_item, _index) => {
                return (
                  <Stack flexDirection="column" sx={{ width: '100%', mb: 2 }} gap={2}>
                    <Stack flexDirection="row" gap={1}>
                      <RHFSelect
                        size="small"
                        fullWidth
                        name={`translations[${_index}].language`}
                        label={
                          <div>
                            Language <span style={{ color: 'red' }}>*</span>
                          </div>
                        }
                        variant="outlined"
                      >
                        <MenuItem value={'en'}>EN</MenuItem>
                      </RHFSelect>

                      <RHFTextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        name={`translations[${_index}].title`}
                        label={
                          <div>
                            Name <span style={{ color: 'red' }}>*</span>
                          </div>
                        }
                      />
                    </Stack>
                    <RHFTextField
                      size="small"
                      fullWidth
                      variant="outlined"
                      name={`translations[${_index}].description`}
                      label="Description"
                      InputLabelProps={{ shrink: _item?.description || watchDescription }}
                      multiline
                      rows={5}
                    />
                  </Stack>
                );
              })}
            </Card> */}
          </Stack>
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button size="large" variant="text" onClick={closeOptionGroupModal}>
              Cancel
            </Button>
            <LoadingButton
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={isEditData && editOptionGroup}
            >
              Submit
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Dialog>
  );
}

export default AddOptionGroups;
