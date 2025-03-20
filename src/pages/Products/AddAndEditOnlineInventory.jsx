import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import * as Yup from 'yup';
import {
  Box,
  Grid,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Autocomplete,
  InputAdornment,
  Card,
  Stack,
  Typography,
  Dialog,
  IconButton,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FormProvider, {
  RHFAutocomplete,
  RHFAutocompleteObjOptions,
  RHFCheckbox,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
} from 'src/components/hook-form';
import MultiTextFields from 'src/components/hook-form/MultiTextFields';
import { includes, map, get, isEmpty, find, filter, isEqual, forEach, some, set } from 'lodash';
import ONLINE_ITEMS from 'src/services/onlineItemsServices';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import {
  ALWAYS_AVAILABLE,
  restrictedKeywords,
  requiredDescriptionKeywords,
  VALIDATE_CONSTANTS,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { useLocation, useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import UploadImage from 'src/components/upload/UploadImage';
import { S3Service } from 'src/services/S3Service';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { currentStoreId, currentTerminalId, isPublishFDState } from 'src/global/recoilState';
import { StorageConstants } from 'src/constants/StorageConstants';
import ObjectStorage from 'src/modules/ObjectStorage';
import useFDPublish from 'src/hooks/useFDPublish';
import PRODUCTS_API from 'src/services/products';

const AddAndEditOnlineInventory = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { updatePublish } = useFDPublish();

  let { data, productId, storeReference, selectedInventoryData } = location?.state;

  const [onlineCategoryList, setOnlineCategoryList] = useState([]);

  const halfGSTPercentage = toFixedIfNecessary(selectedInventoryData?.GSTPercent / 2 || 0, 2);

  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [onlineItemsList, setOnlineItemsList] = useState([]);

  const removedCurrentProductIdData = filter(onlineItemsList, (_item) => {
    return get(_item, 'productId') !== productId;
  });

  function isArrayOfString(arr) {
    return Array.isArray(arr) && arr.every((item) => typeof item === 'string');
  }

  useEffect(() => {
    if (!isEmpty(onlineCategoryList) && isArrayOfString(get(data, 'itemList.category_ref_ids'))) {
      set(
        data,
        'itemList.category_ref_ids',
        !isEmpty(onlineCategoryList)
          ? map(data?.itemList?.category_ref_ids, (_id) => {
              const findData = find(onlineCategoryList, (_category) => {
                return get(_category, 'id') === _id;
              });
              return {
                label: get(findData, 'name') || '',
                id: get(findData, 'id') || '',
              };
            })
          : []
      );
    }
  }, [onlineCategoryList]);

  const itemFieldsDefaultStructure = {
    title: selectedInventoryData?.name || '',
    available: true,
    ref_title: '',
    description: '',
    sold_at_store: true,
    markup_price: 0,
    serves: 0,
    price: toFixedIfNecessary(selectedInventoryData?.price, 2) || 0,
    external_price: 0,
    weight: 0,
    current_stock: ALWAYS_AVAILABLE,
    recommended: false,
    food_type: '',
    category_ref_ids: [],
    // translations: [
    //   {
    //     language: '',
    //     title: '',
    //     description: '',
    //   },
    // ],
    // tags: {
    //   zomato: [],
    //   swiggy: [],
    // },
    fulfillment_modes: [],
    included_platforms: ['swiggy', 'zomato'],
    images: [
      {
        tag: 'zomato',
        url: '',
      },
      {
        tag: 'swiggy',
        url: '',
      },
    ],
    img_url: '',
  };

  const defaultValues = {
    itemList: itemFieldsDefaultStructure,
  };

  // Schema for itemFieldsDefaultStructure
  const itemFieldsSchema = Yup.object().shape({
    title: Yup.string()
      .required('Title is required')

      // This prevents titles that are only numbers
      .matches(/^(?!^\d+$).*$/, 'Title cannot be only numbers')

      // Test 2: Title should not contain some restricted words"
      .test('no-restricted-words', 'Title cannot contain some restricted words', (value) => {
        if (!value) return true;
        const restrictedRegex = new RegExp(restrictedKeywords.join('|'), 'i'); // Create a case-insensitive regex
        return !restrictedRegex.test(value);
      })

      // Test 3: Title should not be in the product list
      .test('not-in-product-list', 'Title cannot be a existing product name', (value) => {
        if (!value) return true;
        return !removedCurrentProductIdData.some(
          (product) =>
            product.name
              .toLowerCase()
              ?.replace?.(/\s\d+\b/g, '')
              ?.trim() ===
            value
              .toLowerCase()
              ?.replace?.(/\s\d+\b/g, '')
              ?.trim()
        );
      }),

    ref_title: Yup.string()
      .required('Alternative title is required')

      // This prevents titles that are only numbers
      .matches(/^(?!^\d+$).*$/, 'Alternative title cannot be only numbers')

      // Test 1: Alternative title should not contain some restricted words"
      .test(
        'no-restricted-words',
        'Alternative title cannot contain some restricted words',
        (value) => {
          if (!value) return true;
          const restrictedRegex = new RegExp(restrictedKeywords.join('|'), 'i'); // Create a case-insensitive regex
          return !restrictedRegex.test(value);
        }
      )

      // Test 2: Alternative title should not be in the product list
      .test(
        'not-in-product-list',
        'Alternative title cannot be a existing product name',
        (value) => {
          if (!value) return true;
          return !removedCurrentProductIdData.some(
            (product) =>
              product.name
                .toLowerCase()
                ?.replace?.(/\s\d+\b/g, '')
                ?.trim() ===
              value
                .toLowerCase()
                ?.replace?.(/\s\d+\b/g, '')
                ?.trim()
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

    price: Yup.number()
      .required('Price is required')
      .moreThan(-1, 'Price should be greater than 0')
      .lessThan(5001, 'Price should not be more than 5000')
      .transform((value) => (Number.isNaN(value) ? null : value))
      .test('Is positive?', 'Price must be greater than ', (value) => value > -1),

    markup_price: Yup.number()
      .nullable() // Allows empty values
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .lessThan(5001, 'Markup price should not be more than 5000'),

    external_price: Yup.number()
      .nullable() // Allows empty values
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .lessThan(5001, 'External price should not be more than 5000'),

    current_stock: Yup.mixed()
      .required('Current stock is required')
      .test(
        'is-valid-stock',
        'Current stock must be a positive number or "available everything"',
        (value) => Number(value) > 0 || value === ALWAYS_AVAILABLE
      )
      .transform((value, originalValue) => (Number.isNaN(value) ? originalValue : value)),

    ['images.0.url']: Yup.string().when(['recommended', 'isDefaultImage'], {
      is: (recommended, isDefaultImage) => recommended && !isDefaultImage,
      then: (schema) => schema.required('Upload zomato image'),
      otherwise: (schema) => schema.notRequired(),
    }),

    ['images.1.url']: Yup.string().when(['recommended', 'isDefaultImage'], {
      is: (recommended, isDefaultImage) => recommended && !isDefaultImage,
      then: (schema) => schema.required('Upload swiggy image'),
      otherwise: (schema) => schema.notRequired(),
    }),
    img_url: Yup.string().when(['recommended', 'isDefaultImage'], {
      is: (recommended, isDefaultImage) => recommended && isDefaultImage,
      then: (schema) => schema.required('Upload default image'),
      otherwise: (schema) => schema.notRequired(),
    }),

    recommended: Yup.boolean(),
    isDefaultImage: Yup.boolean(),
    food_type: Yup.string().required('Food type is required'),
    category_ref_ids: Yup.array().of(
      Yup.object().shape({
        id: Yup.string().required('ID is required'),
        label: Yup.string(),
      })
    ),

    category_ref_ids: Yup.array()
      .min(1, 'Atleast 1 associated category is required') // Custom error message for array length
      .of(
        Yup.object().shape({
          id: Yup.string().required('ID is required'),
          label: Yup.string(),
        })
      ),

    // translations: Yup.array().of(
    //   Yup.object().shape({
    //     language: Yup.string().required('Language is required'),
    //     title: Yup.string().required('Translation title is required'),
    //     description: Yup.string(),
    //   })
    // ),
    // tags: Yup.object().shape({
    //   zomato: Yup.array().of(Yup.string()),
    //   swiggy: Yup.array().of(Yup.string()),
    // }),

    fulfillment_modes: Yup.array()
      .min(1, 'At least one fulfillment mode is required')
      .of(Yup.string().oneOf(['delivery', 'pickup'], 'Invalid fulfillment modes selected')),
    included_platforms: Yup.array()
      .min(1, 'At least one platform is required')
      .of(Yup.string().oneOf(['swiggy', 'zomato'], 'Invalid platform selected')),
  });

  // itemFieldsSchema
  //   .validate(formData, { abortEarly: false, context: { recommended: formData.recommended } }) // Pass recommended as context
  //   .catch((err) => console.log(err.errors));

  // Combined schema for defaultValues
  const defaultValuesSchema = Yup.object().shape({
    itemList: itemFieldsSchema,
  });

  const methods = useForm({
    resolver: yupResolver(defaultValuesSchema),
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

  console.log('valuesaaa', values, data);

  const isEditData = isEqual(values, data);

  const watchName = watch('itemList.title');
  const watchTranslations = watch('itemList.translations');
  const watchIncludedPlatforms = watch('itemList.included_platforms');
  const watchIsDefaultImage = watch('itemList.isDefaultImage');
  const watchCategoryRefIds = watch('itemList.category_ref_ids');

  const isAvailableZomato = !includes(watchIncludedPlatforms, 'zomato');
  const isAvailableSwiggy = !includes(watchIncludedPlatforms, 'swiggy');

  const uploadImage = async (image) => {
    try {
      if (typeof image === 'object' && image !== null) {
        const linkResponse = await S3Service.getOnlineItemImageLink();
        const payload = {
          s3URL: get(linkResponse, 'data.URL'),
          file: image,
        };
        const imageResponse = await S3Service.sendFile(payload);
        return get(imageResponse, 'url').split('?')[0];
      }
    } catch (e) {
      new Error(e);
    }
  };

  console.log('error', errors);

  const onSubmit = async (data) => {
    const removedCategoryIds = [];
    let addCategoryIds = [];

    const formatPrevCategoryRefIds = !isEmpty(onlineCategoryList)
      ? map(selectedInventoryData?.FDSettings?.category_ref_ids, (_id) => {
          const findData = find(onlineCategoryList, (_list) => {
            return get(_list, 'id') === _id;
          });
          return findData;
        })
      : [];

    if (!isEmpty(data?.itemList?.category_ref_ids) && !isEmpty(formatPrevCategoryRefIds)) {
      forEach(data?.itemList?.category_ref_ids, (_curr) => {
        const findData = find(formatPrevCategoryRefIds, (_prev) => _prev?.id !== _curr?.id);
        if (findData) {
          addCategoryIds.push(_curr?.id);
        }
      });

      forEach(formatPrevCategoryRefIds, (_prev) => {
        const isRemoved = !some(
          data?.itemList?.category_ref_ids,
          (_curr) => _curr?.id === _prev?.id
        );

        if (isRemoved) {
          removedCategoryIds.push(_prev?.id);
        }
      });
    } else if (!isEmpty(data?.itemList?.category_ref_ids)) {
      addCategoryIds = map(data?.itemList?.category_ref_ids, (_curr) => {
        return _curr?.id;
      });
    }

    try {
      const itemListSingleData = {
        ...get(data, 'itemList'),
        category_ref_ids: map(get(data, 'itemList.category_ref_ids'), (_item) => {
          return get(_item, 'id');
        }),
        ref_id: productId,
        current_stock:
          get(data, 'itemList.current_stock') === ALWAYS_AVAILABLE
            ? -1
            : Number(get(data, 'itemList.current_stock')),
        ...(get(data, 'itemList.markup_price')
          ? { markup_price: Number(get(data, 'itemList.markup_price')) }
          : {}),
        ...(get(data, 'itemList.external_price')
          ? { external_price: Number(get(data, 'itemList.external_price')) }
          : {}),
        ...(get(data, 'itemList.serves') ? { serves: Number(get(data, 'itemList.serves')) } : {}),
        ...(get(data, 'itemList.weight') ? { weight: Number(get(data, 'itemList.weight')) } : {}),
      };

      const imagesData = [];

      if (!get(data, 'itemList.isDefaultImage')) {
        for (const _image of get(data, 'itemList.images')) {
          if (get(_image, 'url')) {
            const imageUrl = await uploadImage(_image);
            imagesData.push(imageUrl);
          }
        }
      }

      if (get(data, 'itemList.img_url') && get(data, 'itemList.isDefaultImage')) {
        const imageUrl = await uploadImage(get(data, 'itemList.img_url'));
        itemListSingleData.img_url = imageUrl;
      } else {
        delete itemListSingleData?.img_url;
      }

      if (!isEmpty(imagesData)) {
        itemListSingleData.images = imagesData;
      } else {
        delete itemListSingleData?.images;
      }

      delete data?.itemList?.isDefaultImage;

      const formatOnlineData = {
        ...data,
        itemList: [itemListSingleData],
        storeReference: storeReference,
        productIds: [productId],
      };

      const filterItemCharges = filter(get(data, 'itemCharges'), (_item) => {
        return !!get(_item, 'structure.value');
      });

      const filterItemTaxes = filter(get(data, 'itemTaxes'), (_item) => {
        return !!get(_item, 'structure.value');
      });

      if (!isEmpty(filterItemCharges)) {
        formatOnlineData.itemCharges = map(filterItemCharges, (_tax, _index) => {
          return {
            ..._tax,
            structure: {
              ...(_index === 0 ? { applicable_on: 'item.quantity' } : {}),
              value: Number(get(_tax, 'structure.value')),
            },
          };
        });
      } else {
        delete formatOnlineData?.itemCharges;
      }

      if (!isEmpty(filterItemTaxes)) {
        formatOnlineData.itemTaxes = filterItemTaxes;
      } else {
        delete formatOnlineData?.itemTaxes;
      }

      const response = await ONLINE_ITEMS.createOnlineItem(formatOnlineData);

      if (!isEmpty(addCategoryIds)) {
        await ONLINE_ITEMS.postCategoryAssociateItem({
          itemAssociated: productId,
          categoryId: addCategoryIds,
          storeReference,
        });
      }

      if (!isEmpty(removedCategoryIds)) {
        await ONLINE_ITEMS.postCategoryDissociateItem({
          itemAssociated: productId,
          categoryId: removedCategoryIds,
          storeReference,
        });
      }

      if (response?.data?.recResponse?.message && response?.data?.recResponse?.status) {
        toast?.[response?.data?.recResponse?.status]?.(response?.data?.recResponse?.message);
      } else {
        toast.success(SuccessConstants.ADD_SUCCESSFUL);
      }
      await updatePublish();
      navigate(PATH_DASHBOARD.inventory.products, { replace: true });
    } catch (err) {
      toast.error(err?.response?.message || err?.errorResponse?.message);
    }
  };

  // useEffect(() => {
  //   if (watchTranslations[0].language) {
  //     setValue('itemList.translations[0].title', watchName);
  //   }
  // }, [watchTranslations[0].language]);

  useEffect(() => {
    if (selectedInventoryData?.FDSettings) {
      const formatCategoryRefIds = !isEmpty(onlineCategoryList)
        ? map(selectedInventoryData?.FDSettings?.category_ref_ids, (_id) => {
            const findData = find(onlineCategoryList, (_list) => {
              return get(_list, 'id') === _id;
            });
            return {
              label: findData?.name,
              id: findData?.id,
            };
          })
        : [];

      const formatCurrentStock =
        selectedInventoryData?.FDSettings?.current_stock === -1
          ? ALWAYS_AVAILABLE
          : selectedInventoryData?.FDSettings?.current_stock;

      console.log('formatCategoryRefIds', formatCategoryRefIds);

      reset({
        itemList: {
          ...selectedInventoryData?.FDSettings,
          category_ref_ids: formatCategoryRefIds,
          current_stock: formatCurrentStock,
          isDefaultImage: !!selectedInventoryData?.FDSettings?.img_url,
        },
      });
    }
  }, [location, onlineCategoryList]);

  const getAllItemsList = async () => {
    try {
      const resp = await PRODUCTS_API.getItemsProductList();
      setOnlineItemsList(get(resp, 'data'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const getAllOnlineCategoryList = async () => {
    try {
      const resp = await ONLINE_ITEMS.getAllOnlineCategoryListForItems(storeReference);
      setOnlineCategoryList(get(resp, 'data'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (currentTerminal && currentStore) {
      getAllItemsList();
      getAllOnlineCategoryList();
    }
  }, [currentTerminal, currentStore]);

  console.log('selectedInventoryData', selectedInventoryData);

  console.log('onlineItemsList', removedCurrentProductIdData);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
      <Stack
        sx={{
          p: 2,
        }}
      >
        <Grid container spacing={2} sx={{ height: '80vh', overflow: 'auto' }}>
          <Grid item xs={6} md={4}>
            <RHFAutocomplete
              multiple
              disabledSearchOnChange
              label={
                <div>
                  Included platforms <span style={{ color: 'red' }}>*</span>
                </div>
              }
              name="itemList.included_platforms"
              options={['swiggy', 'zomato']}
              variant="outlined"
              fullWidth
            />
          </Grid>

          <Grid item xs={6} md={4}>
            <RHFTextField
              label={
                <div>
                  Title <span style={{ color: 'red' }}>*</span>
                </div>
              }
              name="itemList.title"
              fullWidth
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <RHFTextField label="Alternative title" name="itemList.ref_title" fullWidth />
          </Grid>
          <Grid item xs={6} md={4}>
            <RHFTextField label="Description" name="itemList.description" fullWidth />
          </Grid>
          <Grid item xs={6} md={4}>
            <RHFTextField
              label={'Markup Price'}
              name="itemList.markup_price"
              type="number"
              onWheel={(e) => e.target.blur()}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <RHFTextField
              label={'Serves'}
              name="itemList.serves"
              fullWidth
              type="number"
              onWheel={(e) => e.target.blur()}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <RHFTextField
              label={
                <div>
                  Price <span style={{ color: 'red' }}>*</span>
                </div>
              }
              name="itemList.price"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              type="number"
              onWheel={(e) => e.target.blur()}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <RHFTextField
              label={'External Price'}
              name="itemList.external_price"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              type="number"
              onWheel={(e) => e.target.blur()}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <RHFTextField
              label={'Weight'}
              name="itemList.weight"
              fullWidth
              type="number"
              onWheel={(e) => e.target.blur()}
              InputProps={{
                endAdornment: <InputAdornment position="start">Grams</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <RHFAutocomplete
              label={
                <div>
                  Current stock <span style={{ color: 'red' }}>*</span>
                </div>
              }
              options={[ALWAYS_AVAILABLE]}
              name="itemList.current_stock"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <RHFSelect
              fullWidth
              name="itemList.food_type"
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
          </Grid>

          <Grid item xs={6} md={4}>
            <Stack flexDirection="row" gap={2} alignItems="center">
              <RHFAutocompleteObjOptions
                multiple
                disabledSearchOnChange
                options={map(onlineCategoryList, (_item) => {
                  return {
                    label: get(_item, 'name'),
                    id: get(_item, 'id'),
                  };
                })}
                label="Associated category"
                name="itemList.category_ref_ids"
                getOptionDisabled={(option) => {
                  const isAlreadySelected = some(watchCategoryRefIds, (e) => e.id === option?.id);
                  return isAlreadySelected;
                }}
              />
              <IconButton
                onClick={() => {
                  navigate(PATH_DASHBOARD.inventory.onlineCategory, {
                    replace: true,
                    state: { isOpenAddCategoryDialog: true },
                  });
                }}
              >
                <AddIcon sx={{ fontSize: '30px' }} />
              </IconButton>
            </Stack>
          </Grid>

          <Grid item xs={6} md={4}>
            <RHFAutocomplete
              multiple
              disabledSearchOnChange
              label={
                <div>
                  Fulfillment modes <span style={{ color: 'red' }}>*</span>
                </div>
              }
              name="itemList.fulfillment_modes"
              options={['delivery', 'pickup']}
              variant="outlined"
              fullWidth
            />
          </Grid>

          {/* <Grid item xs={12}>
            <Card>
              <Stack flexDirection="column" sx={{ ml: 2, py: 3 }}>
                <Stack
                  sx={{
                    // padding: 2,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ fontWeight: 'semibold' }} mb={2}>
                    Tags
                  </Typography>
                </Stack>

                <Stack flexDirection="row" gap={2}>
                  <Grid item xs={6} md={4}>
                    <MultiTextFields
                      label="Zomato"
                      name="itemList.tags.zomato"
                      fullWidth
                      placeholder="Ex: snacks"
                      disabled={isAvailableZomato}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <MultiTextFields
                      label="Swiggy"
                      name="itemList.tags.swiggy"
                      fullWidth
                      placeholder="Ex: pop"
                      disabled={isAvailableSwiggy}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Stack>
              </Stack>
            </Card>
          </Grid> */}

          <Grid item xs={12}>
            <Card>
              <Stack flexDirection="column" sx={{ ml: 2, py: 3 }}>
                <Stack
                  sx={{
                    // padding: 2,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ fontWeight: 'semibold' }} mb={2}>
                    Images
                  </Typography>

                  <Stack
                    flexDirection={'row'}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography mr={1}>Default </Typography>
                    <RHFSwitch name="itemList.isDefaultImage" />
                  </Stack>
                </Stack>

                <Stack flexDirection="row" gap={2}>
                  {!watchIsDefaultImage && (
                    <>
                      <Grid item xs={6} md={4}>
                        <Stack flexDirection="column">
                          <Typography variant="overline" sx={{ fontWeight: 'lighter' }} mb={1}>
                            Zomato
                          </Typography>
                          <UploadImage
                            name="itemList.images[0].url"
                            setValue={setValue}
                            values={values}
                            isMiniSize
                            acceptTypes={{
                              'image/png': [],
                              'image/jpeg': [],
                            }}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6} md={4}>
                        <Stack flexDirection="column">
                          <Typography variant="overline" sx={{ fontWeight: 'lighter' }} mb={1}>
                            Swiggy
                          </Typography>
                          <UploadImage
                            name="itemList.images[1].url"
                            setValue={setValue}
                            values={values}
                            isMiniSize
                            acceptTypes={{
                              'image/png': [],
                              'image/jpeg': [],
                            }}
                          />
                        </Stack>
                      </Grid>
                    </>
                  )}

                  {watchIsDefaultImage && (
                    <Grid item xs={6} md={4}>
                      <Stack flexDirection="column">
                        <UploadImage
                          name="itemList.img_url"
                          setValue={setValue}
                          values={values}
                          isMiniSize
                          acceptTypes={{
                            'image/png': [],
                            'image/jpeg': [],
                          }}
                        />
                      </Stack>
                    </Grid>
                  )}
                </Stack>
              </Stack>
            </Card>
          </Grid>

          {/* <Grid item xs={12}>
            <Card>
              <Stack flexDirection="column" sx={{ ml: 2, py: 3 }}>
                <Stack
                  sx={{
                    // padding: 2,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ fontWeight: 'semibold' }} mb={2}>
                    Translations
                  </Typography>
                </Stack>

                <Stack flexDirection="column" gap={2}>
                  {map(watchTranslations, (_item, _index) => {
                    return (
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3.75}>
                          <RHFSelect
                            fullWidth
                            name={`itemList.translations[${_index}].language`}
                            label={
                              <div>
                                Language <span style={{ color: 'red' }}>*</span>
                              </div>
                            }
                            variant="outlined"
                          >
                            <MenuItem value={'en'}>EN</MenuItem>
                          </RHFSelect>
                        </Grid>
                        <Grid item xs={3.75}>
                          <RHFTextField
                            label={
                              <div>
                                Title <span style={{ color: 'red' }}>*</span>
                              </div>
                            }
                            name={`itemList.translations[${_index}].title`}
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={3.75}>
                          <RHFTextField
                            label="Description"
                            name={`itemList.translations[${_index}].description`}
                            fullWidth
                            multiline
                            row={1}
                          />
                        </Grid>
                      </Grid>
                    );
                  })}
                </Stack>
              </Stack>
            </Card>
          </Grid> */}

          <Grid item xs={6} md={4}>
            <RHFCheckbox label="Recommended" name="itemList.recommended" fullWidth />
          </Grid>
        </Grid>

        <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
          <Button
            size="large"
            variant="text"
            onClick={() => {
              navigate(PATH_DASHBOARD.inventory.products, { replace: true });
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={isEditData && data}
          >
            {data ? 'Update' : 'Add'}
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default AddAndEditOnlineInventory;
