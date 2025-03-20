import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, {
  RHFAutocomplete,
  RHFAutocompleteObjOptions,
  RHFCheckbox,
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
import { get, isArray, isEmpty, isEqual, map } from 'lodash';
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

function AddOptions({
  isOpenAddOptionModal,
  closeOptionModal,
  editOption,
  optionId,
  initialFetch,
  storeReference,
  storeName,
}) {
  const { updatePublish } = useFDPublish();

  const [optionGroupList, setOptionGroupList] = useState([]);
  const currentStore = useRecoilValue(currentStoreId);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole;

  // Define the Yup schema
  const schema = Yup.object().shape({
    title: Yup.string()
      .required(ErrorConstants.NAME_IS_REQUIRED)
      .test('no-restricted-words', 'Title cannot contain some restricted words', (value) => {
        if (!value) return true;
        const restrictedRegex = new RegExp(restrictedKeywords.join('|'), 'i'); // Create a case-insensitive regex
        return !restrictedRegex.test(value);
      }),

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
    price: Yup.number()
      .required(ErrorConstants.PRICE_IS_REQUIRED)
      .moreThan(0, ErrorConstants.PRICE_SHOULD_BE_GREATER_THAN_0)
      .transform((value) => (Number.isNaN(value) ? null : value))
      .test('Is positive?', ErrorConstants.PRICE_SHOULD_BE_GREATER_THAN_0, (value) => value > 0),
    foodType: Yup.string().required(ErrorConstants.FOOD_TYPE_IS_REQUIRED),
    OptionsGroup: Yup.array()
      .min(1, ErrorConstants.AT_LEAST_ONE_OPTION_GROUP_IS_REQUIRED) // Custom error message for array length
      .of(
        Yup.object().shape({
          id: Yup.string().required(ErrorConstants.OPTION_GROUP_IS_REQUIRED), // Custom error message here
          label: Yup.string(),
        })
      ),

    // translations: Yup.array().of(
    //   Yup.object().shape({
    //     title: Yup.string().required(ErrorConstants.TRANSLATION_NAME_IS_REQUIRED),
    //     language: Yup.string().required(ErrorConstants.LANGUAGE_IS_REQUIRED),
    //   })
    // ),

    imageUrl: Yup.string().when('isRecommended', {
      is: true,
      then: (schema) => schema.required('Upload image'),
      otherwise: (schema) => schema.notRequired(),
    }),
    isRecommended: Yup.boolean(),
  });

  const defaultValues = {
    title: '',
    weight: 0,
    foodType: '',
    price: '',
    OptionsGroup: [],
    description: '',
    // translations: [
    //   {
    //     title: '',
    //     language: '',
    //     description: '',
    //   },
    // ],
    imageUrl: null,
    isRecommended: false,
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: optionId ? editOption : defaultValues,
  });

  const getOptonsGroup = async () => {
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

  useEffect(() => {
    getOptonsGroup();
  }, []);

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

  const isEditData = isEqual(values, editOption);

  const watchTranslations = watch('translations');
  const watchName = watch('title');
  const watchDescription = watch('description');

  const onSubmit = async (data) => {
    console.log('dataaaa', data);
    try {
      let imageData = {};

      const ids = data?.OptionsGroup?.map((item) => ({
        title: item.label,
        groupId: item.id,
      }));

      if (typeof get(data, 'imageUrl') === 'object' && get(data, 'imageUrl') !== null) {
        const linkResponse = await S3Service.getOptionImageLink();
        const payload = {
          s3URL: get(linkResponse, 'data.URL'),
          file: get(data, 'imageUrl'),
        };
        const imageResponse = await S3Service.sendFile(payload);
        imageData = { imageUrl: get(imageResponse, 'url').split('?')[0] };
      }

      const payload = {
        ...data,
        storeReference,
        storeName,
        optionGroups: ids,
        ...imageData,
        ...(get(data, 'weight') ? { weight: Number(get(data, 'weight')) } : {}),
      };

      if (!payload?.imageUrl) {
        delete payload?.imageUrl;
      }

      delete payload?.OptionsGroup;

      let response;

      if (!isEmpty(editOption)) {
        response = await OptionsGroupServices.editOptions({
          ...payload,
          optionId: optionId,
        });
        if (response) {
          if (response?.data?.recResponse?.message && response?.data?.recResponse?.status) {
            toast?.[response?.data?.recResponse?.status]?.(response?.data?.recResponse?.message);
          } else {
            toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
          }
        }
      } else if (isEmpty(editOption)) {
        response = await OptionsGroupServices.addOptions(payload);
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
        closeOptionModal();
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

  return (
    <Dialog open={isOpenAddOptionModal} onClose={closeOptionModal}>
      <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
        <Card sx={{ p: 2, width: { xs: 325, sm: 500 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add Option
          </Typography>
          <Stack gap={2} sx={{ height: 'calc(100vh - 280px)', overflow: 'auto', pt: 1 }}>
            <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }} gap={2}>
              <RHFTextField
                size="small"
                label={
                  <div>
                    Title <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                name="title"
                sx={{ width: '100%' }}
              />
              <RHFTextField
                size="small"
                label="Weight"
                name="weight"
                sx={{ width: '100%' }}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="start">Grams</InputAdornment>,
                }}
              />
            </Stack>
            <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }} gap={2}>
              <RHFSelect
                size="small"
                fullWidth
                name="foodType"
                label={
                  <div>
                    Food type <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                variant="outlined"
              >
                <MenuItem value={1}>Vegetarian</MenuItem>
                <MenuItem value={2}>Non-vegetarian</MenuItem>
                {/* <MenuItem value={3}>Eggetarian</MenuItem> */}
                <MenuItem value={4}>Not specified</MenuItem>
              </RHFSelect>

              <RHFTextField
                size="small"
                label={
                  <div>
                    Price <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                name="price"
                sx={{ width: '100%' }}
              />
            </Stack>

            <RHFAutocompleteObjOptions
              multiple
              disabledSearchOnChange
              options={map(optionGroupList, (_item) => ({
                label: _item?.title,
                id: _item?.groupId,
              }))}
              label={
                <div>
                  Options Group <span style={{ color: 'red' }}>*</span>
                </div>
              }
              name="OptionsGroup"
            />

            <RHFTextField
              size="small"
              label="Description"
              name="description"
              multiline
              rows={5}
              sx={{ width: '100%' }}
            />

            <RHFCheckbox label="Recommended" name="isRecommended" fullWidth />

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
                        InputLabelProps={{ shrink: _item?.name || watchName }}
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

            <UploadImage
              name={'imageUrl'}
              setValue={setValue}
              values={values}
              acceptTypes={{
                'image/png': [],
                'image/jpeg': [],
              }}
            />
          </Stack>
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button size="large" variant="text" onClick={closeOptionModal}>
              Cancel
            </Button>
            <LoadingButton
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={isEditData && editOption}
            >
              Submit
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Dialog>
  );
}

export default AddOptions;
