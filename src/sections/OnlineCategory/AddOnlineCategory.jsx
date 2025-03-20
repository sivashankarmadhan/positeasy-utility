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
import { filter, get, isArray, isEmpty, isEqual, map } from 'lodash';
import SettingServices from 'src/services/API/SettingServices';
import { useSetRecoilState } from 'recoil';
import { alertDialogInformationState, isPublishFDState } from 'src/global/recoilState';
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
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import useFDPublish from 'src/hooks/useFDPublish';

// ----------------------------------------------------------------------

function AddOnlineCategory({
  isOpenAddCategoryModal,
  closeCategoryModal,
  editCategory,
  categoryId,
  initialFetch,
  storeReference,
  storeName,
  onlineCategoryList,
  onlineParentCategoryList,
}) {
  const { updatePublish } = useFDPublish();

  const editCategoryWithoutCategoryId = getClone(editCategory);
  delete editCategoryWithoutCategoryId?.editCategory;

  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole;

  const formatOnlineCategoryList = filter(onlineCategoryList, (_item) => {
    return get(_item, 'name') !== get(editCategory, 'name');
  });

  const formatParentOnlineCategoryList = filter(onlineParentCategoryList, (_item) => {
    return get(_item, 'name') !== get(editCategory, 'name');
  });

  // Define the Yup schema
  const schema = Yup.object().shape({
    name: Yup.string()
      .required(ErrorConstants.NAME_IS_REQUIRED)

      .test('no-restricted-words', 'Name cannot contain some restricted words', (value) => {
        if (!value) return true;
        const restrictedRegex = new RegExp(restrictedKeywords.join('|'), 'i'); // Create a case-insensitive regex
        return !restrictedRegex.test(value);
      })

      .test('not-in-category-list', 'Name cannot be a existing category name', (value) => {
        if (!value) return true;
        return !formatParentOnlineCategoryList.some(
          (product) => product.name.toLowerCase() === value.toLowerCase()
        );
      }),
    attributes: Yup.object().shape({
      sortOrder: Yup.number()
        .required(ErrorConstants.SORT_ORDER_IS_REQUIRED)
        .transform((value) => (Number.isNaN(value) ? null : value))
        .test('Is positive?', ErrorConstants.PRICE_MUST_BE_POSITIVE_NUMBER, (value) => value >= 0),
      // translations: Yup.array().of(
      //   Yup.object().shape({
      //     name: Yup.string().required(ErrorConstants.TRANSLATION_NAME_IS_REQUIRED),
      //     language: Yup.string().required(ErrorConstants.LANGUAGE_IS_REQUIRED),
      //   })
      // ),
    }),
    image: Yup.mixed().nullable(),
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
          const name = context.parent.name || ''; // Get the title from the object
          const hasKeyword = requiredDescriptionKeywords.some((keyword) =>
            name.toLowerCase().includes(keyword)
          );

          if (hasKeyword) {
            return !!value; // Description is required if a keyword is found
          }
          return true; // Otherwise, it's optional
        }
      ),
  });

  const defaultValues = {
    name: '',
    description: '',
    parent_ref_id: { label: '', id: '' },
    attributes: {
      sortOrder: '',
      // translations: [
      //   {
      //     name: '',
      //     language: '',
      //     description: '',
      //   },
      // ],
    },
    image: null,
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: categoryId ? editCategory : defaultValues,
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

  const isEditData = isEqual(values, editCategory);

  const watchAttributes = watch('attributes');
  const watchName = watch('name');
  const watchDescription = watch('description');
  const watchTranslations = watch('attributes.translations');

  // useEffect(() => {
  //   if (isEmpty(editCategory)) {
  //     setValue('attributes.translations[0].description', watchDescription);
  //   }
  // }, [watchDescription]);

  const onSubmit = async (data) => {
    try {
      let imageData = {};

      if (typeof get(data, 'image') === 'object' && get(data, 'image') !== null) {
        const linkResponse = await S3Service.getCategoryImageLink();
        const payload = {
          s3URL: get(linkResponse, 'data.URL'),
          file: get(data, 'image'),
        };
        const imageResponse = await S3Service.sendFile(payload);
        imageData = { image: get(imageResponse, 'url').split('?')[0] };
      }

      let response;

      if (!isEmpty(editCategory)) {
        response = await OnlineCategoryServices.editCategory({
          ...data,
          parent_ref_id: get(data, 'parent_ref_id.id') || '',
          storeReference,
          storeName,
          categoryId,
          ...imageData,
        });
        if (response) {
          if (response?.data?.recResponse?.message && response?.data?.recResponse?.status) {
            toast?.[response?.data?.recResponse?.status]?.(response?.data?.recResponse?.message);
          } else {
            toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
          }
        }
      } else if (isEmpty(editCategory)) {
        response = await OnlineCategoryServices.addCategory({
          ...data,
          parent_ref_id: get(data, 'parent_ref_id.id') || '',
          storeReference,
          storeName,
          ...imageData,
        });
        if (response?.data?.recResponse?.message && response?.data?.recResponse?.status) {
          toast?.[response?.data?.recResponse?.status]?.(response?.data?.recResponse?.message);
        } else {
          toast.success(SuccessConstants.SAVE_SUCCESSFUL);
        }
      }

      if (response?.data?.recResponse?.status !== ERROR) {
        await updatePublish();
        initialFetch();
        reset();
        closeCategoryModal();
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse?.message', ErrorConstants.SOMETHING_WRONG));
    }
  };

  // useEffect(() => {
  //   if (watchTranslations[0].language) {
  //     setValue('attributes.translations[0].name', watchName);
  //   }
  // }, [watchTranslations[0].language]);

  console.log('editCategory', editCategory);

  return (
    <Dialog open={isOpenAddCategoryModal} onClose={closeCategoryModal}>
      <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
        <Card sx={{ p: 2, width: { xs: 325, sm: 500 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add Category
          </Typography>

          <Stack
            gap={2}
            sx={{
              height: 'calc(100vh - 280px)',
              overflow: 'auto',
              pt: 1,
            }}
          >
            <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }} gap={2}>
              <RHFTextField
                label={
                  <div>
                    Name <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                name="name"
                sx={{ width: '100%' }}
              />
              <RHFTextField
                label={
                  <div>
                    Sort order <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                name="attributes.sortOrder"
                sx={{ width: '100%' }}
                type="number"
                onWheel={(e) => e.target.blur()}
              />
            </Stack>

            <RHFAutocompleteObjOptions
              label="Parent category"
              variant="outlined"
              freeSolo={false}
              name={`parent_ref_id`}
              fullWidth
              options={map(formatOnlineCategoryList, (e) => {
                return { label: get(e, 'name'), id: get(e, 'id') };
              })}
            />

            <RHFTextField
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

                <IconButton sx={{ mb: 2 }} disabled onClick={() => {}}>
                  <AddIcon />
                </IconButton>
              </Stack>

              {map(watchAttributes?.translations, (_item, _index) => {
                return (
                  <Stack flexDirection="column" sx={{ width: '100%', mb: 2 }} gap={2}>
                    <Stack flexDirection="row" gap={1}>
                      <RHFSelect
                        name={`attributes.translations[${_index}].language`}
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
                        fullWidth
                        variant="outlined"
                        name={`attributes.translations[${_index}].name`}
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
                      name={`attributes.translations[${_index}].description`}
                      label="Description"
                      InputLabelProps={{ shrink: _item?.description || watchDescription }}
                      multiline
                      rows={5}
                    />

                    <Stack flexDirection="row" justifyContent="flex-end">
                      <Button sx={{ px: 2 }} size="small" variant="contained" disabled>
                        <DeleteForeverIcon sx={{ fontSize: '17px', mr: 0.4 }} /> Delete
                      </Button>
                    </Stack>
                  </Stack>
                );
              })}
            </Card> */}

            <UploadImage
              name={'image'}
              setValue={setValue}
              values={values}
              acceptTypes={{
                'image/png': [],
                'image/jpeg': [],
              }}
            />
          </Stack>

          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button size="large" variant="text" onClick={closeCategoryModal}>
              Cancel
            </Button>
            <LoadingButton
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={isEditData && editCategory}
            >
              Submit
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Dialog>
  );
}

export default AddOnlineCategory;
