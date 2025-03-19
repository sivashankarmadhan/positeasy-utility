import { yupResolver } from '@hookform/resolvers/yup';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PercentIcon from '@mui/icons-material/Percent';
import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Dialog,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  styled,
  tableCellClasses,
  useTheme,
} from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import {
  filter,
  find,
  forEach,
  get,
  groupBy,
  isArray,
  isBoolean,
  isEmpty,
  isEqual,
  isObject,
  map,
  sortBy,
} from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from 'recoil';
import FormProvider from 'src/components/FormProvider';
import S3ImageCaching from 'src/components/S3ImageCaching';
import {
  RHFAutocomplete,
  RHFAutocompleteObjOptions,
  RHFCheckbox,
  RHFSwitch,
  RHFTextField,
} from 'src/components/hook-form';
import UploadImage from 'src/components/upload/UploadImage';
import {
  OrderTypeConstants,
  REQUIRED_CONSTANTS,
  ROLES_WITHOUT_STORE_STAFF,
  VALIDATE_CONSTANTS,
  defaultOrderTypes,
  hideScrollbar,
} from 'src/constants/AppConstants';

import { LoadingButton } from '@mui/lab';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import {
  allCategories,
  allConfiguration,
  currentProduct,
  currentStoreId,
  products,
} from 'src/global/recoilState';
import { S3Service } from 'src/services/S3Service';
import PRODUCTS_API from 'src/services/products';
import * as Yup from 'yup';
import DrawerHeader from './DrawerHeader';

import { set } from 'lodash';
import { textReplaceAll } from 'src/helper/textReplaceAll';
import AuthService from 'src/services/authService';
import debounce from 'src/utils/debounce';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import UnitsRow from './UnitsRow';
import WeekandTimeDialog from 'src/components/WeekandTimeDialog';
import { Icon } from '@iconify/react';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Delete, QrCodeScannerRounded } from '@mui/icons-material';
import { LANGUAGE_CONSTANTS, Language_labels } from 'src/constants/LanguageConstants';
import { formatOrderTypeDataStrucutre } from 'src/utils/formatOrderTypeDataStrucutre';
import { ErrorBoundary } from 'react-error-boundary';
import Barcode from 'react-barcode';
let isUpdateOfferPrice = true;
let isUpdateDiscount = true;

export default function HandleItemDrawer({
  openDrawer,
  handleCloseDrawer,
  editMode,
  setEditMode,
  newProduct,
  productUnitDetails,
  setProductUnitDetails,
  addMoreUnits,
  setAddMoreUnits,
  setOpenDeleteProduct,
  syncUpProducts,
  countersList,
  getCountersList,
  isMembershipEnable,
}) {
  const theme = useTheme();
  const productList = useRecoilValue(products);
  const isMobile = useMediaQuery('(max-width:600px)');
  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;
  const groupedProducts = groupBy(sortBy(productList, 'category'), 'category');

  const productCategoryList = useRecoilValue(allCategories);
  const [categoriesList, setNewCategoriesList] = useRecoilState(allCategories);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentProductData = useRecoilValue(currentProduct);
  const [items, setItems] = useState([]);
  const configuration = useRecoilValue(allConfiguration);
  const isProfitLossMode = get(configuration, 'featureSettings.isPLRatio', false);
  const [isAttributemode, setAttributeMode] = useState(false);
  const [productIdLoading, setProductIdLoading] = useState(false);
  const [availableProductId, setIsAvailableProductId] = useState(null);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const [IsSessionDialog, setIsSessionDialog] = useState(false);
  const [submittedSessionData, setSubmittedSessionData] = useState({});
  const isNotStaff = ROLES_WITHOUT_STORE_STAFF.includes(currentRole);
  const counterSettings = get(configuration, 'counterSettings', {});
  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false);
  const currentStore = useRecoilValue(currentStoreId);
  const isShowMRP = get(configuration, 'featureSettings.isMRP', false);
  const isOrderTypeEnable = get(configuration, 'isOrderType.isActive', false);
  const previouseOrderTypeList = get(configuration, 'isOrderType.orderTypes', defaultOrderTypes);
  const orderTypesList = formatOrderTypeDataStrucutre(previouseOrderTypeList);
  const [openBarcode, setOpenBarcode] = useState(false);
  const handleOpenSession = () => {
    setIsSessionDialog(true);
  };
  const handleCloseSession = (isClose) => {
    if (isClose && isEmpty(submittedSessionData)) {
      setValue('isSessionEnabled', false);
    }
    setIsSessionDialog(false);
  };
  const handleOpenViewBarcode = () => {
    setOpenBarcode(true);
  };
  const handleCloseViewBarcode = () => {
    setOpenBarcode(false);
  };
  const getNestedPropertyValue = (obj, propertyPath) => {
    return propertyPath.reduce(
      (nestedObj, prop) =>
        nestedObj && nestedObj[prop] !== 'undefined' ? nestedObj[prop] : undefined,
      obj
    );
  };

  // Custom Yup validation method for checking unique property values based on combination
  Yup.addMethod(Yup.array, 'uniqueProperties', function (propertyPaths, message) {
    return this.test('unique', message, function (list) {
      const errors = [];

      list.forEach((item, index) => {
        const propertyValues = propertyPaths.map((path) => getNestedPropertyValue(item, path));

        if (
          propertyValues.every((value) => value !== undefined) &&
          filter(
            list,
            (obj, objIndex) =>
              objIndex !== index &&
              propertyPaths.every((path, i) =>
                isEqual(getNestedPropertyValue(obj, path), propertyValues[i])
              )
          ).length > 0
        ) {
          propertyPaths.forEach((path) => {
            const pathString = path.reduce((acc, prop) => acc + `[${prop}]`, `[${index}]`);
            errors.push(
              this.createError({
                path: `${this.path}${pathString}`,
                message,
              })
            );
          });
        }
      });

      if (errors.length > 0) {
        throw new Yup.ValidationError(errors);
      }

      return true;
    });
  });

  Yup.addMethod(Yup.array, 'uniquePropertyPrice', function (propertyPath, message) {
    return this.test('uniquePrice', '', function (list) {
      const errors = [];

      list.forEach((item, index) => {
        const propertyValue = get(item, propertyPath);

        if (propertyValue && filter(list, [propertyPath, propertyValue]).length > 1) {
          errors.push(
            this.createError({
              path: `${this.path}[${index}].${propertyPath}`,
              message,
            })
          );
        }
      });

      if (!isEmpty(errors)) {
        throw new Yup.ValidationError(errors);
      }

      return true;
    });
  });

  const isUniqueArray = (array, key) => {
    if (!array || !key) return false;
    const unique = filter(
      map(array, (item) => get(item, `language.${key}`)),
      Boolean
    );
    return new Set(unique).size === unique.length;
  };

  const RegisterSchema = Yup.object().shape({
    name: Yup.string().required(REQUIRED_CONSTANTS.ITEM),
    description: Yup.string().nullable(),
    category: Yup.string()
      .required(REQUIRED_CONSTANTS.CATEGORY)
      .transform((value) => value),
    isSessionEnabled: Yup.boolean(),
    price: Yup.number().when('unitsEnabled', {
      is: (value) => value === true,
      then: () =>
        Yup.number()
          .transform((value) => (Number.isNaN(value) ? null : value))
          .nullable(),
      otherwise: () =>
        Yup.number()

          .required(REQUIRED_CONSTANTS.PRICE)
          .transform((value) => (Number.isNaN(value) ? null : value))
          .test('Is positive?', VALIDATE_CONSTANTS.PRICE_NOT_ZERO, (value) => value > 0),
    }),
    ...(isProfitLossMode && isNotStaff
      ? {
          basePrice: Yup.number().when('unitsEnabled', {
            is: (value) => value === true,
            then: () =>
              Yup.number()
                .transform((value) => (Number.isNaN(value) ? null : value))
                .nullable(),
            otherwise: () =>
              Yup.number()
                .required(REQUIRED_CONSTANTS.PRICE)
                .transform((value) => (Number.isNaN(value) ? null : value))
                .test('Is positive?', VALIDATE_CONSTANTS.PRICE_NOT_ZERO, (value) => value > 0),
          }),
        }
      : {}),
    isGST: Yup.boolean(),
    isParcelNotAllowed: Yup.boolean(),
    GSTPercent: Yup.number().when('isGST', {
      is: (value) => value === true,
      then: () =>
        Yup.number()
          .required(REQUIRED_CONSTANTS.GST)
          .transform((value) => (Number.isNaN(value) ? null : value))
          .test('Is positive?', VALIDATE_CONSTANTS.PERCENTAGE_NOT_BELOW, (value) => value > 0),
      otherwise: () =>
        Yup.number()
          .transform((value) => (Number.isNaN(value) ? null : value))
          .nullable()
          .test('Is positive?', VALIDATE_CONSTANTS.PERCENTAGE_NOT_BELOW, (value) => value > -1),
    }),
    tag: Yup.string()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .nullable(),
    parcelCharges: Yup.number()
      .transform((val, orig) => (orig == '' || orig == null ? undefined : val))
      .test('Is positive?', VALIDATE_CONSTANTS.PERCENTAGE_NOT_BELOW, (value) => {
        return value === undefined || value === null ? true : value > 0;
      }),
    ...(isCountersEnabled
      ? {
          counterId: Yup.object().shape({ id: Yup.string(), label: Yup.string() }).notRequired(),
        }
      : {}),
    ...(isAttributemode
      ? {
          isVeg: Yup.boolean(),
          ...(isShowMRP ? { mrp: Yup.string() } : {}),
        }
      : {}),
    HSNorSACCode: Yup.string(),
    barcode: Yup.string(),
    ...(newProduct ? { unitsEnabled: Yup.boolean() } : {}),
    productImage: Yup.mixed().nullable(),
    ...(editMode && !newProduct
      ? {
          discount: Yup.number()
            .transform((value) => (Number.isNaN(value) ? null : value))
            .nullable(),
          ...(addMoreUnits
            ? {
                items: Yup.array().when('unitsEnabled', {
                  is: (value) => value === true,
                  then: () =>
                    Yup.array()
                      .of(
                        Yup.object().shape({
                          units: Yup.number()
                            .required(REQUIRED_CONSTANTS.UNITS)
                            .moreThan(0, VALIDATE_CONSTANTS.ABOVE_ZERO_UNITS)
                            .transform((value) => (Number.isNaN(value) ? null : value)),
                          unitType: Yup.string().required(REQUIRED_CONSTANTS.UNIT_TYPE),
                          actualPrice: Yup.number()
                            .required(REQUIRED_CONSTANTS.PRICE)
                            .moreThan(0, VALIDATE_CONSTANTS.ABOVE_ZERO_PRICE)
                            .transform((value) => (Number.isNaN(value) ? null : value))
                            .test(
                              'Is positive?',
                              VALIDATE_CONSTANTS.PRICE_NOT_ZERO,
                              (value) => value > 0
                            ),
                          discount: Yup.number()
                            .transform((value) => (Number.isNaN(value) ? null : value))
                            .nullable(),
                          offerPrice: Yup.number()
                            .transform((value) => (Number.isNaN(value) ? null : value))
                            .nullable()
                            .test(
                              'is-less-than-price',
                              'Offer price cannot be greater than actual price',
                              function (value) {
                                const price = this.parent.price;
                                if (value == null) return true;
                                return value <= price;
                              }
                            ),

                          actualProductId: Yup.string()
                            .max(8, VALIDATE_CONSTANTS.MAXIMUM_8_CHAR)
                            .transform((value) => value?.toUpperCase())
                            .nullable(),
                          ...(isProfitLossMode && isNotStaff
                            ? {
                                actualBasePrice: Yup.number()
                                  .required(REQUIRED_CONSTANTS.PRICE)
                                  .moreThan(0, VALIDATE_CONSTANTS.ABOVE_ZERO_PRICE)
                                  .transform((value) => (Number.isNaN(value) ? null : value))
                                  .test(
                                    'Is positive?',
                                    VALIDATE_CONSTANTS.PRICE_NOT_ZERO,
                                    (value) => value > 0
                                  ),
                              }
                            : {}),
                        })
                      )
                      .min(1, REQUIRED_CONSTANTS.MINIMIM_UNIT)
                      .uniqueProperties([['unitType'], ['units']], VALIDATE_CONSTANTS.UNITS_ALREADY)
                      .uniquePropertyPrice('actualPrice', VALIDATE_CONSTANTS.PRICE_ALREADY)
                      .required(REQUIRED_CONSTANTS.UNITS),
                  otherwise: () => Yup.array(),
                }),
              }
            : {
                //unitName: Yup.string().required(REQUIRED_CONSTANTS.UNIT_TYPE),
                // unit: Yup.number().when('unitsEnabled', {
                //   is: (value) => value === true,
                //   then: () =>
                //     Yup.number()
                //       .required(REQUIRED_CONSTANTS.UNITS)
                //       .moreThan(0, VALIDATE_CONSTANTS.ABOVE_ZERO_UNITS)
                //       .transform((value) => (Number.isNaN(value) ? null : value)),
                //   otherwise: () =>
                //     Yup.number()
                //       .transform((value) => (Number.isNaN(value) ? null : value))
                //       .nullable(),
                // }),
              }),
        }
      : {
          productId: Yup.string()
            // .max(8, VALIDATE_CONSTANTS.MAXIMUM_8_CHAR)
            .transform((value) => value?.toUpperCase())
            .nullable(),
          category: Yup.string()
            .required(REQUIRED_CONSTANTS.CATEGORY)
            .transform((value) => value),
          offerPrice: Yup.number()
            .transform((value) => (Number.isNaN(value) ? null : value))
            .nullable()
            .test(
              'is-less-than-price',
              'Offer price cannot be greater than actual price',
              function (value) {
                const price = this.parent.price;
                if (value == null) return true;
                return value <= price;
              }
            ),
          items: Yup.array().when('unitsEnabled', {
            is: (value) => value === true,
            then: () =>
              Yup.array()
                .of(
                  Yup.object().shape({
                    units: Yup.number()
                      .required(REQUIRED_CONSTANTS.UNITS)
                      .moreThan(0, VALIDATE_CONSTANTS.ABOVE_ZERO_UNITS)
                      .transform((value) => (Number.isNaN(value) ? null : value)),
                    unitType: Yup.string().required(REQUIRED_CONSTANTS.UNIT_TYPE),
                    actualPrice: Yup.number()
                      .required(REQUIRED_CONSTANTS.PRICE)
                      .moreThan(0, VALIDATE_CONSTANTS.ABOVE_ZERO_PRICE)
                      .transform((value) => (Number.isNaN(value) ? null : value))
                      .test(
                        'Is positive?',
                        VALIDATE_CONSTANTS.PRICE_NOT_ZERO,
                        (value) => value > 0
                      ),
                    discount: Yup.number()
                      .transform((value) => (Number.isNaN(value) ? null : value))
                      .nullable(),
                    offerPrice: Yup.number()
                      .transform((value) => (Number.isNaN(value) ? null : value))
                      .nullable()
                      .test(
                        'is-less-than-price',
                        'Offer price cannot be greater than actual price',
                        function (value) {
                          const price = this.parent.price;
                          if (value == null) return true;
                          return value <= price;
                        }
                      ),
                    actualProductId: Yup.string()
                      .max(8, VALIDATE_CONSTANTS.MAXIMUM_8_CHAR)
                      .transform((value) => value?.toUpperCase())
                      .nullable(),
                    ...(isProfitLossMode && isNotStaff
                      ? {
                          actualBasePrice: Yup.number()
                            .required(REQUIRED_CONSTANTS.PRICE)
                            .moreThan(0, VALIDATE_CONSTANTS.ABOVE_ZERO_PRICE)
                            .transform((value) => (Number.isNaN(value) ? null : value))
                            .test(
                              'Is positive?',
                              VALIDATE_CONSTANTS.PRICE_NOT_ZERO,
                              (value) => value > 0
                            ),
                        }
                      : {}),
                  })
                )
                .min(1, REQUIRED_CONSTANTS.MINIMIM_UNIT)
                .uniqueProperties([['unitType'], ['units']], VALIDATE_CONSTANTS.UNITS_ALREADY)
                .uniquePropertyPrice('actualPrice', VALIDATE_CONSTANTS.PRICE_ALREADY)
                .required(VALIDATE_CONSTANTS.UNITS_ALREADY),
            otherwise: () => Yup.array(),
          }),
        }),
    productNameAlias: Yup.array()
      .of(
        Yup.object().shape({
          language: Yup.object().shape({
            label: Yup.string(),
            id: Yup.string(),
            lang_name: Yup.string(),
            lang_code: Yup.string(),
          }),
          alias: Yup.string(),
        })
      )
      .test(
        'unique-language-product-id',
        'Remove same language added multiple times',
        function (value) {
          return isUniqueArray(value, 'id');
        }
      ),
    categoryNameAlias: Yup.array()
      .of(
        Yup.object().shape({
          language: Yup.object().shape({
            label: Yup.string(),
            id: Yup.string(),
            lang_name: Yup.string(),
            lang_code: Yup.string(),
          }),
          alias: Yup.string(),
        })
      )
      .test(
        'unique-language-category-id',
        'Remove Same language added multiple times',
        function (value) {
          return isUniqueArray(value, 'id');
        }
      ),
  });

  const defaultValues = {
    name: '',
    description: '',
    price: 0,
    ...(isProfitLossMode && isNotStaff ? { basePrice: 0 } : {}),
    GSTPercent: 0,
    GSTInc: null,
    tag: '',
    parcelCharges: null,
    memberPrice: 0,
    ...(isCountersEnabled
      ? {
          counterId: { label: '', id: '' },
        }
      : {}),
    ...(isAttributemode ? {} : {}),
    unitsEnabled: false,
    isGST: false,
    isParcelNotAllowed: false,
    unitName: '',
    category: '',
    productId: '',
    discount: 0,
    offerPrice: 0,
    items: [],
    isSessionEnabled: false,
    sessionInfo: {},
    productNameAlias: [],
    categoryNameAlias: [],
  };
  const defaultValueUnits = {
    unitType: '',
    units: '',
    actualPrice: '',
    actualProductId: '',
    ...(isProfitLossMode && isNotStaff ? { actualBasePrice: '' } : {}),
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
    formState: { errors, isSubmitting },
    clearErrors,
    control,
  } = methods;
  // Managing dynamic product name aliases

  const {
    fields: productAliasFields,
    append: appendProductAlias,
    remove: removeProductAlias,
  } = useFieldArray({
    control,
    shouldUnregister: false,
    name: 'productNameAlias',
  });

  // Managing dynamic category name aliases
  const {
    fields: categoryAliasFields,
    append: appendCategoryAlias,
    remove: removeCategoryAlias,
  } = useFieldArray({
    control,
    shouldUnregister: false,
    name: 'categoryNameAlias',
  });

  const values = watch();

  const watchOfferPrice = watch('offerPrice');
  const watchDiscount = watch('discount');
  const watchSession = watch('isSessionEnabled');
  const watchPrice = watch('price');
  const watchGSTInc = watch('GSTInc');
  const watchGSTPercent = watch('GSTPercent');
  const formatAlias = (data) => {
    let format = {};
    forEach(data, (value) => {
      format[value.language.id] = value.alias;
    });
    return format;
  };
  const onSubmit = async (data) => {
    const isUnitEnable = get(data, 'unitsEnabled');

    try {
      setIsLoading(true);
      let updatedData = {
        ...data,
        productId: textReplaceAll(get(data, 'productId', ''), ' ', ''),
        description: textReplaceAll(get(data, 'description', ''), '\n', ','),
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
      let _priceVariant = {};
      map(updatedData, (value, key) => {
        if (orderTypesList.includes(key) || key === 'memberPrice') {
          _priceVariant = { ..._priceVariant, [key]: value };
        }
      });
      console.log('_priceVariant', _priceVariant);

      if (newProduct && !isUnitEnable) {
        const {
          name,
          category,
          description,
          price,
          basePrice,
          counterId,
          tag,
          parcelCharges,
          isParcelNotAllowed,
          isVeg,
          productImage,
          unitsEnabled,
          GSTPercent,
          GSTInc,
          productId,
          discount,
          offerPrice,
          isSessionEnabled,
          mrp,
          categoryNameAlias,
          productNameAlias,
          HSNorSACCode,
          barcode,
        } = updatedData;

        const options = [
          {
            name,
            category,
            description,
            price,
            ...(isCountersEnabled
              ? {
                  counterId: get(counterId, 'id') || null,
                }
              : {}),
            tag,
            ...(parcelCharges ? { parcelCharges } : {}),
            ...(!isEmpty(_priceVariant) ? { priceVariants: { ..._priceVariant } } : {}),
            ...(isProfitLossMode && isNotStaff ? { basePrice: basePrice } : {}),
            ...(isAttributemode
              ? {
                  attributes: {
                    ...(typeof isVeg === 'boolean' ? { isVeg: isVeg } : {}),
                    ...(isShowMRP ? { mrp: mrp } : {}),
                    ...(HSNorSACCode ? { HSNorSACCode: HSNorSACCode } : {}),
                    ...(barcode ? { barcode: barcode } : {}),
                    ...(isParcelNotAllowed ? { isParcelNotAllowed: isParcelNotAllowed } : {}),
                  },
                }
              : {
                  attributes: {
                    ...(HSNorSACCode ? { HSNorSACCode: HSNorSACCode } : {}),
                    ...(barcode ? { barcode: barcode } : {}),

                    ...(isParcelNotAllowed ? { isParcelNotAllowed: isParcelNotAllowed } : {}),
                  },
                }),
            productImage,
            unitsEnabled,
            GSTPercent,
            GSTInc,
            productId,
            discount,
            offerPrice,
            categoryAlias: !isEmpty(categoryNameAlias)
              ? { alias: formatAlias(categoryNameAlias) }
              : null,
            nameAlias: !isEmpty(productNameAlias) ? { alias: formatAlias(productNameAlias) } : null,
            ...(isSessionEnabled ? { ...submittedSessionData } : {}),
          },
        ];
        handleAddProduct(options);
      } else if (newProduct && isUnitEnable) {
        const {
          name,
          category,
          description,
          tag,
          parcelCharges,
          isParcelNotAllowed,
          isVeg,
          unitsEnabled,
          basePrice,
          items,
          counterId,
          productImage,
          GSTPercent,
          GSTInc,
          isSessionEnabled,
          mrp,
          categoryNameAlias,
          productNameAlias,
          HSNorSACCode,
          barcode,
        } = updatedData;
        const options = [];
        map(items, (item, index) => {
          const unit = get(item, 'units');
          const unitName = get(item, 'unitType');
          const price = get(item, 'actualPrice');
          const discount = get(item, 'discount');
          const offerPrice = get(item, 'offerPrice');
          const productId = textReplaceAll(get(item, 'actualProductId', ''), ' ', '');

          options.push({
            name,
            category,
            description,
            tag,
            ...(parcelCharges ? { parcelCharges } : {}),
            ...(!isEmpty(_priceVariant) ? { priceVariants: { ..._priceVariant } } : {}),
            ...(isCountersEnabled
              ? {
                  counterId: get(counterId, 'id') || null,
                }
              : {}),
            discount,
            offerPrice,
            ...(isAttributemode
              ? {
                  attributes: {
                    ...(typeof isVeg === 'boolean' ? { isVeg: isVeg } : {}),
                    ...(isShowMRP ? { mrp: mrp } : {}),
                    ...(HSNorSACCode ? { HSNorSACCode: HSNorSACCode } : {}),
                    ...(barcode ? { barcode: barcode } : {}),
                    ...(isParcelNotAllowed ? { isParcelNotAllowed: isParcelNotAllowed } : {}),
                  },
                }
              : {
                  attributes: {
                    ...(HSNorSACCode ? { HSNorSACCode: HSNorSACCode } : {}),
                    ...(barcode ? { barcode: barcode } : {}),
                    ...(isParcelNotAllowed ? { isParcelNotAllowed: isParcelNotAllowed } : {}),
                  },
                }),
            unitsEnabled,
            unitName,
            ...(isProfitLossMode && isNotStaff ? { basePrice: basePrice } : {}),
            unit,
            price,
            productImage: productImage,
            GSTPercent,
            GSTInc,
            productId,
            categoryAlias: !isEmpty(categoryNameAlias)
              ? { alias: formatAlias(categoryNameAlias) }
              : null,
            nameAlias: !isEmpty(productNameAlias) ? { alias: formatAlias(productNameAlias) } : null,
            ...(isSessionEnabled ? { ...submittedSessionData } : {}),
          });
        });

        handleAddProduct(options);
      } else if (!newProduct && !isUnitEnable) {
        const {
          productId,
          name,
          description,
          counterId,
          price,
          discount,
          basePrice,
          tag,
          parcelCharges,
          isParcelNotAllowed,
          isVeg,
          productImage,
          GSTPercent,
          GSTInc,
          category,
          isSessionEnabled,
          mrp,
          categoryNameAlias,
          productNameAlias,
          HSNorSACCode,
          SACCode,
          barcode,
        } = updatedData;
        const options = {
          productId: productId,
          name,
          discount,
          category,
          ...(isAttributemode
            ? {
                attributes: {
                  ...(typeof isVeg === 'boolean' ? { isVeg: isVeg } : {}),
                  ...(isShowMRP ? { mrp: mrp } : {}),
                  ...(HSNorSACCode ? { HSNorSACCode: HSNorSACCode } : {}),
                  ...(barcode ? { barcode: barcode } : {}),
                  ...(isParcelNotAllowed ? { isParcelNotAllowed: isParcelNotAllowed } : {}),
                },
              }
            : {
                attributes: {
                  ...(HSNorSACCode ? { HSNorSACCode: HSNorSACCode } : {}),
                  ...(barcode ? { barcode: barcode } : {}),
                  ...(isParcelNotAllowed ? { isParcelNotAllowed: isParcelNotAllowed } : {}),
                },
              }),
          ...(isCountersEnabled
            ? {
                counterId: get(counterId, 'id') || null,
              }
            : {}),
          ...(!isEmpty(_priceVariant) ? { priceVariants: { ..._priceVariant } } : {}),

          description,
          ...(isProfitLossMode && isNotStaff ? { basePrice: basePrice } : {}),
          price,
          tag,
          ...(currentProductData?.parcelCharges || parcelCharges
            ? { parcelCharges: parcelCharges || null }
            : {}),
          productImage: productImage,
          GSTPercent,
          GSTInc,
          categoryAlias: !isEmpty(categoryNameAlias)
            ? { alias: formatAlias(categoryNameAlias) }
            : null,
          nameAlias: !isEmpty(productNameAlias) ? { alias: formatAlias(productNameAlias) } : null,
          ...(isSessionEnabled ? { ...submittedSessionData } : {}),
        };
        handleUpdateProduct(options);
      } else if (!newProduct && isUnitEnable) {
        if (!addMoreUnits) {
          const {
            productId,
            name,
            description,
            counterId,
            price,
            discount,
            basePrice,
            tag,
            parcelCharges,
            isVeg,
            isParcelNotAllowed,
            productImage,
            GSTPercent,
            GSTInc,
            category,
            isSessionEnabled,
            mrp,
            categoryNameAlias,
            productNameAlias,
            HSNorSACCode,
            barcode,
            SACCode,
          } = updatedData;
          const options = {
            productId: productId,
            name,
            discount,
            category,
            ...(isAttributemode
              ? {
                  attributes: {
                    ...(typeof isVeg === 'boolean' ? { isVeg: isVeg } : {}),
                    ...(isShowMRP ? { mrp: mrp } : {}),
                    ...(HSNorSACCode ? { HSNorSACCode: HSNorSACCode } : {}),
                    ...(barcode ? { barcode: barcode } : {}),
                    ...(isParcelNotAllowed ? { isParcelNotAllowed: isParcelNotAllowed } : {}),
                  },
                }
              : {
                  attributes: {
                    ...(HSNorSACCode ? { HSNorSACCode: HSNorSACCode } : {}),
                    ...(barcode ? { barcode: barcode } : {}),
                    ...(isParcelNotAllowed ? { isParcelNotAllowed: isParcelNotAllowed } : {}),
                  },
                }),
            ...(isCountersEnabled
              ? {
                  counterId: get(counterId, 'id') || null,
                }
              : {}),
            ...(isProfitLossMode && isNotStaff ? { basePrice: basePrice } : {}),
            description,
            price,
            tag,
            ...(currentProductData?.parcelCharges || parcelCharges
              ? { parcelCharges: parcelCharges || null }
              : {}),
            ...(!isEmpty(_priceVariant) ? { priceVariants: { ..._priceVariant } } : {}),

            productImage: productImage,
            GSTPercent,
            GSTInc,
            categoryAlias: !isEmpty(categoryNameAlias)
              ? { alias: formatAlias(categoryNameAlias) }
              : null,
            nameAlias: !isEmpty(productNameAlias) ? { alias: formatAlias(productNameAlias) } : null,
            ...(isSessionEnabled ? { ...submittedSessionData } : {}),
          };
          handleUpdateProduct(options);
        }

        if (addMoreUnits) {
          const {
            name,
            description,
            category,
            basePrice,
            counterId,
            discount,
            tag,
            parcelCharges,
            isVeg,
            productImage,
            isParcelNotAllowed,
            items,
            shortCode,
            unitsEnabled,
            GSTPercent,
            GSTInc,
            isSessionEnabled,
            mrp,
            categoryNameAlias,
            productNameAlias,
            HSNorSACCode,
            SACCode,
            barcode,
          } = updatedData;
          const options = [];
          map(items, (item, index) => {
            const unit = get(item, 'units');
            const unitName = get(item, 'unitType');
            const price = get(item, 'actualPrice');
            const discountPercentage = get(item, 'discount');
            const offerPrice = get(item, 'offerPrice');
            const productId = textReplaceAll(get(item, 'actualProductId', ''), ' ', '');
            options.push({
              name,
              description,
              ...(isCountersEnabled
                ? {
                    counterId: get(counterId, 'id') || null,
                  }
                : {}),
              category,
              price,
              discount: discountPercentage,
              offerPrice,
              tag,
              ...(parcelCharges ? { parcelCharges } : {}),
              ...(!isEmpty(_priceVariant) ? { priceVariants: { ..._priceVariant } } : {}),

              ...(isProfitLossMode && isNotStaff ? { basePrice: basePrice } : {}),
              ...(isAttributemode
                ? {
                    attributes: {
                      ...(typeof isVeg === 'boolean' ? { isVeg: isVeg } : {}),
                      ...(isShowMRP ? { mrp: mrp } : {}),
                      ...(HSNorSACCode ? { HSNorSACCode: HSNorSACCode } : {}),
                      ...(barcode ? { barcode: barcode } : {}),
                      ...(isParcelNotAllowed ? { isParcelNotAllowed: isParcelNotAllowed } : {}),
                    },
                  }
                : {
                    attributes: {
                      ...(HSNorSACCode ? { HSNorSACCode: HSNorSACCode } : {}),
                      ...(barcode ? { barcode: barcode } : {}),
                      ...(isParcelNotAllowed ? { isParcelNotAllowed: isParcelNotAllowed } : {}),
                    },
                  }),
              unit,
              unitName,
              shortCode,
              GSTPercent,
              GSTInc,
              productId,
              productImage: productImage,
              categoryAlias: !isEmpty(categoryNameAlias)
                ? { alias: formatAlias(categoryNameAlias) }
                : null,
              nameAlias: !isEmpty(productNameAlias)
                ? { alias: formatAlias(productNameAlias) }
                : null,
              ...(isSessionEnabled ? { ...submittedSessionData } : {}),
              ...(index !== 0 && { unitsEnabled }),
            });
          });
          if (options.length > 1) {
            const payload = filter(options, (e, index) => index !== 0);
            handleUpdateAndAdd(options[0], payload);
          } else {
            handleUpdateProduct(options[0]);
          }
        }
      }
    } catch (error) {
      setError('afterSubmit', 'Something Went Wrong');
      setIsLoading(false);
    }
  };

  const handleUpdateAndAdd = async (updateOptions, addOptions) => {
    try {
      const response1 = await PRODUCTS_API.updateProduct(updateOptions);
      const response2 = await PRODUCTS_API.addProductUnitWise(addOptions);
      if (response1 && response2) toast.success(SuccessConstants.PRODUCT_UPDATED);
      setIsLoading(false);
      handleCloseDrawer();
      setSubmittedSessionData({});
      syncUpProducts();
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
      setIsLoading(false);
    }
  };
  const handleUpdateProduct = async (options) => {
    const obj1 = currentProductData;
    const obj2 = options;

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

    set(newObj, 'storeId', get(options, 'storeId'));
    set(newObj, 'productId', get(options, 'productId'));

    const offerPrice = get(obj2, 'price') - get(obj2, 'price') * (get(obj2, 'discount') / 100);

    if (get(obj2, 'discount')) {
      set(obj2, 'offerPrice', offerPrice);
    }

    if (!get(obj2, 'discount') || !get(obj2, 'discount')) {
      set(newObj, 'offerPrice', 0);
      set(newObj, 'discount', 0);
    } else {
      set(newObj, 'offerPrice', get(obj2, 'offerPrice'));
      set(newObj, 'discount', get(obj2, 'discount'));
    }

    if (
      get(obj1, 'GSTPercent') !== get(obj2, 'GSTPercent') ||
      get(obj1, 'GSTInc') !== get(obj2, 'GSTInc')
    ) {
      set(newObj, 'price', get(options, 'price'));
    }

    try {
      const response = await PRODUCTS_API.updateProduct(newObj);
      if (response) toast.success(SuccessConstants.PRODUCT_UPDATED);
      setIsLoading(false);
      handleCloseDrawer();
      setSubmittedSessionData({});
      syncUpProducts();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (options) => {
    try {
      const response = await PRODUCTS_API.addProduct(options);
      if (response) toast.success(SuccessConstants.PRODUCT_ADDED);
      setIsLoading(false);
      handleReset();
      syncUpProducts();
      handleCloseDrawer();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setSubmittedSessionData({});
    reset(defaultValues);
    setIsAvailableProductId(null);
    setProductIdLoading(false);
  };

  const checkProductIdAvailability = async () => {
    try {
      setProductIdLoading(true);
      if (methods.watch('productId')) {
        const response = await PRODUCTS_API.checkProductIdAvailability(
          methods.watch('productId')?.toUpperCase?.()
        );
        if (response && isEmpty(get(response, 'data', []))) {
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
  const handleAddCategories = () => {
    if (!isEmpty(groupedProducts)) {
      const data = [];
      map(groupedProducts || [], (dishes, category) => {
        data.push(category);
      });
      setNewCategoriesList(data);
    }
  };

  const getCounterLabel = (counterId) => {
    const counter = find(countersList, (e) => get(e, 'counterId') === counterId);
    return get(counter, 'name', '-');
  };
  useEffect(() => {
    if (isEmpty(currentProductData)) {
      handleReset();
    } else {
      reset({
        ...currentProductData,
        discount: get(currentProductData, 'discount') || '',
        offerPrice: get(currentProductData, 'offerPrice') || '',
        isVeg: get(currentProductData, 'attributes.isVeg') ? true : false,
        isParcelNotAllowed: get(currentProductData, 'attributes.isParcelNotAllowed') || false,
        mrp: get(currentProductData, 'attributes.mrp', ''),
        HSNorSACCode: get(currentProductData, 'attributes.HSNorSACCode', ''),
        barcode: get(currentProductData, 'attributes.barcode', ''),
        isGST: currentProductData.GSTPercent > 0 ? true : false,
        description: textReplaceAll(get(currentProductData, 'description', ''), ',', '\n'),

        productNameAlias: get(currentProductData, 'nameAlias.alias')
          ? map(get(currentProductData, 'nameAlias.alias', {}), (value, key) => {
              return { alias: value, language: { id: key, label: Language_labels[key] } };
            }) || []
          : [],

        categoryNameAlias: get(currentProductData, 'categoryAlias.alias')
          ? map(get(currentProductData, 'categoryAlias.alias', {}), (value, key) => {
              return { alias: value, language: { id: key, label: Language_labels[key] } };
            }) || []
          : [],

        ...(get(currentProductData, 'counterId') && isCountersEnabled
          ? {
              counterId: {
                id: get(currentProductData, 'counterId'),
                label: getCounterLabel(get(currentProductData, 'counterId')),
              },
            }
          : {}),
        ...(get(currentProductData, 'sessionInfo.isSessionEnabled')
          ? {
              isSessionEnabled: get(currentProductData, 'sessionInfo.isSessionEnabled'),
            }
          : {}),
        ...(!isEmpty(get(currentProductData, 'priceVariants'))
          ? {
              ...(get(currentProductData, 'priceVariants') || {}),
            }
          : {}),
      });

      if (get(currentProductData, 'sessionInfo.isSessionEnabled')) {
        setSubmittedSessionData({ sessionInfo: get(currentProductData, 'sessionInfo') });
      }
    }
  }, [currentProductData]);

  useEffect(() => {
    if (currentStore && isCountersEnabled) getCountersList();
  }, [currentStore, isCountersEnabled]);

  useEffect(() => {
    handleAddCategories();
  }, [productList]);

  useEffect(() => {
    if (!methods.watch('isGST')) {
      setValue('GSTPercent', 0);
      setValue('GSTInc', null);
    }
    if (methods.watch('isGST')) {
      setValue('GSTPercent', currentProductData.GSTPercent);
      setValue('GSTInc', currentProductData.GSTInc || false);
    }
  }, [methods.watch('isGST')]);

  useEffect(() => {
    if (!methods.watch('unitsEnabled')) {
      clearItems();
    }
  }, [methods.watch('unitsEnabled')]);
  useEffect(() => {
    checkProductIdAvailability();
  }, [methods.watch('productId')]);
  const addUnits = async () => {
    setItems([...items, defaultValueUnits]);
    const addItems = getValues('items');
    if (isArray(addItems)) {
      setValue('items', [...addItems, defaultValueUnits]);
    } else {
      setValue('items', [defaultValueUnits]);
    }
  };

  const removeUnits = (index) => async () => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    const delItems = getValues('items');
    delItems.splice(index, 1);
    for (let i = 0; i < delItems.length; i++) {
      setValue(`items[${i}].units`, delItems[i].units);
      setValue(`items[${i}].unitType`, delItems[i].unitType);
      setValue(`items[${i}].actualPrice`, delItems[i].actualPrice);
      setValue(`items[${i}].actualProductId`, delItems[i].actualProductId);
      if (isProfitLossMode && isNotStaff)
        setValue(`items[${i}].actualBasePrice`, delItems[i].actualBasePrice);
    }
    if (delItems.length < 1) {
      clearErrors();
    }
  };

  const clearItems = () => {
    setItems([]);
    setValue('items', []);
    clearErrors();
  };

  const setEditValueUnits = () => {
    setValue(`items[0].actualProductId`, currentProductData.productId);
    setValue(`items[0].units`, currentProductData.unit);
    setValue(`items[0].unitType`, currentProductData.unitName);
    setValue(`items[0].actualPrice`, currentProductData.price);
    setValue(`items[0].discount`, currentProductData.discount);
    setValue(`items[0].offerPrice`, currentProductData.offerPrice);
    setItems([
      {
        productId: currentProductData.productId,
        units: currentProductData.unit,
        unitType: currentProductData.unitName,
        actualPrice: currentProductData.price,
        discount: currentProductData.discount,
        offerPrice: currentProductData.offerPrice,
        ...(isProfitLossMode && isNotStaff
          ? { actualBasePrice: get(currentProductData, 'basePrice') }
          : {}),
      },
    ]);
    if (isProfitLossMode && isNotStaff)
      setValue(`items[0].actualBasePrice`, get(currentProductData, 'basePrice'));
  };
  const isShowPriceField = (!methods.watch('unitsEnabled') && newProduct) || !newProduct;
  const isShowGSTField = methods.watch('isGST');
  const isShowUnits = editMode && !newProduct && methods.watch('unitsEnabled');
  const showUnitEdit =
    (editMode && newProduct && methods.watch('unitsEnabled')) ||
    (editMode && !newProduct && methods.watch('unitsEnabled') && addMoreUnits);

  useEffect(() => {
    if (editMode && addMoreUnits && !newProduct) setEditValueUnits();
  }, [addMoreUnits]);

  const handleDiscountAmount = () => {
    const discount = Number(getValues('discount') || 0);
    const price = Number(getValues('price'));
    if (discount <= 100) {
      return toFixedIfNecessary((discount / 100) * price, 2);
    }
    return 0;
  };
  useEffect(() => {
    if (watchSession) {
      handleOpenSession();
    }
    if (!watchSession && newProduct) {
      setSubmittedSessionData({});
    }
  }, [watchSession]);
  useEffect(() => {
    if (!isUpdateOfferPrice) return;
    const offerPrice = Number(getValues('offerPrice'));
    const price = Number(getValues('price'));

    const discount = 100 - (100 * offerPrice) / price;

    setValue('discount', watchOfferPrice === '' ? '' : toFixedIfNecessary(discount, 2));
    isUpdateDiscount = false;
    debounce(() => {
      isUpdateDiscount = true;
    });
  }, [watchOfferPrice]);

  useEffect(() => {
    if (!isUpdateDiscount) return;
    const price = Number(getValues('price'));
    const offerPrice = price - handleDiscountAmount();
    if (Number(watchDiscount) >= 0 && watchDiscount !== '') {
      setValue('offerPrice', toFixedIfNecessary(offerPrice, 2));
    } else {
      setValue('offerPrice', '');
    }
    isUpdateOfferPrice = false;
    debounce(() => {
      isUpdateOfferPrice = true;
    });
  }, [watchDiscount]);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: '#DBDBDB',
      color: 'black',
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.primary.lighter,
      border: 0,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  useEffect(() => {
    if (editMode && !newProduct) {
      setValue('unitsEnabled', true);
    }
  }, [openDrawer]);

  useEffect(() => {
    if (!isEmpty(currentProductData.attributes)) {
      setAttributeMode(true);
    } else {
      setAttributeMode(false);
    }
  }, [currentProductData]);

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

  // if (isLoading) return <LoadingScreen />;

  return (
    <Drawer
      anchor={'right'}
      open={openDrawer}
      PaperProps={{
        sx: {
          width: isMobile ? '85%' : isTab ? '60%' : !editMode ? '38%' : '35%',
          ...hideScrollbar,
        },
      }}
    >
      <DrawerHeader
        newProduct={newProduct}
        reset={reset}
        defaultValues={defaultValues}
        setEditMode={setEditMode}
        editMode={editMode}
        purpose={currentProductData}
        handleCloseDrawer={handleCloseDrawer}
        setAddMoreUnits={setAddMoreUnits}
        setOpenDeleteProduct={setOpenDeleteProduct}
      />
      {!editMode && (
        <Grid
          container
          sx={{
            px: 2,
          }}
        >
          <Grid item xs={12} sm={12} sx={{ m: 1 }}>
            <S3ImageCaching
              src={get(currentProductData, 'productImage')}
              alt={get(currentProductData, 'name')}
              style={{ height: 300, width: '100%', borderRadius: 10 }}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} sx={{ m: 1 }}>
            <Typography variant="caption">Name</Typography>
            <Typography>{get(currentProductData, 'name')}</Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} sx={{ m: 1 }}>
            <Typography variant="caption">Description</Typography>
            <Typography>{get(currentProductData, 'description')}</Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={5.5}
            sx={{ display: editMode && !newProduct ? 'none' : 'block', m: 1 }}
          >
            <Typography variant="caption">Category</Typography>
            <Typography>{get(currentProductData, 'category')}</Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>
          {isCountersEnabled && (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={5.5}
              sx={{ display: editMode && !newProduct ? 'none' : 'block', m: 1 }}
            >
              <Typography variant="caption">Counter</Typography>
              <Typography>
                {get(currentProductData, 'counterId') ? get(currentProductData, 'counterId') : '-'}
              </Typography>
              <Divider sx={{ mt: 1 }} />
            </Grid>
          )}
          <Grid item xs={12} sm={12} md={12} lg={5.5} sx={{ m: 1 }}>
            <Typography variant="caption"> Tag</Typography>
            <Typography>
              {get(currentProductData, 'tag') ? get(currentProductData, 'tag') : '-'}
            </Typography>{' '}
            <Divider sx={{ mt: 1 }} />
          </Grid>
          {isProfitLossMode && isNotStaff && (
            <Grid item xs={12} sm={12} md={12} lg={5.5} sx={{ m: 1 }}>
              <Typography variant="caption">Base Price (₹)</Typography>
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {get(currentProductData, 'basePrice')}
              </Typography>
              <Divider sx={{ mt: 1 }} />
            </Grid>
          )}{' '}
          <Grid item xs={12} sm={12} md={12} lg={5.5} sx={{ m: 1 }}>
            <Typography variant="caption">
              {get(currentProductData, 'GSTPercent') > 0 ? `Price  without GST (₹)` : `Price (₹)`}
            </Typography>
            <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
              {get(currentProductData, 'price')}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>
          {get(currentProductData, 'GSTPercent') > 0 && (
            <Grid item xs={12} sm={12} md={12} lg={5.5} sx={{ m: 1 }}>
              <Typography variant="caption">GST (%)</Typography>
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {get(currentProductData, 'GSTPercent')}
              </Typography>{' '}
              <Divider sx={{ mt: 1 }} />
            </Grid>
          )}
          {get(currentProductData, 'GSTPercent') > 0 && (
            <Grid item xs={12} sm={12} md={12} lg={5.5} sx={{ m: 1 }}>
              <Typography variant="caption">Price with GST (₹)</Typography>
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {(get(currentProductData, 'price') * get(currentProductData, 'GSTPercent')) / 100 +
                  get(currentProductData, 'price')}
              </Typography>
              <Divider sx={{ mt: 1 }} />
            </Grid>
          )}
          {get(currentProductData, 'unitsEnabled') && (
            <Grid item xs={12} sm={12} md={12} lg={5.5} sx={{ m: 1 }}>
              <Typography variant="caption"> Unit</Typography>
              <Typography>
                {`${get(currentProductData, 'unit')} ${get(currentProductData, 'unitName')}`}
              </Typography>{' '}
              <Divider sx={{ mt: 1 }} />
            </Grid>
          )}
          {!get(currentProductData, 'unitsEnabled') && (
            <Grid item xs={12} sm={12} md={12} lg={5.5} sx={{ m: 1 }}>
              <Typography variant="caption">Discount (%)</Typography>
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {!get(currentProductData, 'discount') ? 0 : get(currentProductData, 'discount')}
              </Typography>{' '}
              <Divider sx={{ mt: 1 }} />
            </Grid>
          )}{' '}
          {!get(currentProductData, 'unitsEnabled') && (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={5.5}
              sx={{ m: 1, display: editMode ? 'none' : 'block' }}
            >
              <Typography variant="caption">Offer Price (₹)</Typography>
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {get(currentProductData, 'offerPrice', '-')}
              </Typography>{' '}
              <Divider sx={{ mt: 1 }} />
            </Grid>
          )}
          <Grid item xs={!editMode ? 12 : 5} sm={12} md={12} lg={5.5} sx={{ m: 1 }}>
            <Typography variant="caption">Veg/Non-Veg </Typography>
            <Typography>{get(currentProductData, 'isVeg') ? 'Veg' : 'Non Veg'}</Typography>{' '}
            <Divider sx={{ mt: 1 }} />
          </Grid>
        </Grid>
      )}
      {editMode && (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid
            container
            sx={{
              px: 2,
            }}
            gap={2}
          >
            {editMode && !addMoreUnits && isShowPriceField && (
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <RHFTextField
                  name="productId"
                  inputProps={{ readOnly: !editMode }}
                  variant="outlined"
                  label="Product ID"
                  placeholder={'Optional'}
                  fullWidth
                  InputProps={{
                    ...(methods.watch('productId') && isBoolean(availableProductId)
                      ? !productIdLoading && availableProductId
                        ? {
                            endAdornment: (
                              <InputAdornment position="end">
                                <CheckCircleIcon sx={{ color: 'green' }} size={20} />
                              </InputAdornment>
                            ),
                          }
                        : {
                            endAdornment: (
                              <InputAdornment position="end">
                                <CancelIcon size={20} sx={{ color: 'red' }} />
                              </InputAdornment>
                            ),
                          }
                      : {}),
                    ...(productIdLoading && methods.watch('productId')
                      ? {
                          endAdornment: (
                            <InputAdornment position="end">
                              <CircularProgress size={20} />
                            </InputAdornment>
                          ),
                        }
                      : {}),
                  }}
                  InputLabelProps={{ shrink: true }}
                  disabled={!newProduct}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <RHFTextField
                    name="name"
                    inputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    label="Product name"
                    fullWidth
                  />

                  {isEmpty(productAliasFields) && (
                    <Button
                      onClick={() => appendProductAlias({ language: '', alias: '' })}
                      variant="text"
                      startIcon={<AddIcon />}
                      sx={{ whiteSpace: 'nowrap', ml: 1, p: 2 }}
                    >
                      Add Alias
                    </Button>
                  )}
                </div>

                {map(productAliasFields, (field, index) => (
                  <div
                    key={field.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyItems: 'center',

                      marginTop: 10,
                    }}
                  >
                    <RHFAutocompleteObjOptions
                      size={'small'}
                      sx={{ mr: 1 }}
                      name={`productNameAlias[${index}].language`}
                      variant="outlined"
                      freeSolo={false}
                      label="Language"
                      fullWidth
                      options={LANGUAGE_CONSTANTS}
                    />
                    <RHFTextField
                      size={'small'}
                      sx={{}}
                      name={`productNameAlias[${index}].alias`}
                      inputProps={{ readOnly: !editMode }}
                      variant="outlined"
                      label="Product Alias"
                      fullWidth
                    />
                    <IconButton sx={{}} onClick={() => removeProductAlias(index)}>
                      <Delete />
                    </IconButton>
                  </div>
                ))}
                {errors?.productNameAlias?.type === 'unique-language-product-id' && (
                  <p style={{ color: 'red' }} role="alert">
                    {errors.productNameAlias?.message}
                  </p>
                )}
                {!isEmpty(productAliasFields) && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 5 }}>
                    <Button
                      onClick={() => appendProductAlias({ language: '', alias: '' })}
                      size="small"
                      variant="text"
                      sx={{ justifySelf: 'flex-end' }}
                    >
                      Add more alias
                    </Button>
                  </div>
                )}
              </div>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <RHFAutocomplete
                    label="Category"
                    options={productCategoryList}
                    name="category"
                    variant="outlined"
                    fullWidth
                    inputProps={{ readOnly: !editMode }}
                  />

                  {isEmpty(categoryAliasFields) && (
                    <Button
                      onClick={() => appendCategoryAlias({ language: '', alias: '' })}
                      variant="text"
                      startIcon={<AddIcon />}
                      sx={{ whiteSpace: 'nowrap', ml: 1, p: 2 }}
                    >
                      Add Alias
                    </Button>
                  )}
                </div>

                {map(categoryAliasFields, (field, index) => (
                  <div
                    key={field.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyItems: 'center',

                      marginTop: 10,
                    }}
                  >
                    <RHFAutocompleteObjOptions
                      size={'small'}
                      sx={{ mr: 1 }}
                      name={`categoryNameAlias[${index}].language`}
                      variant="outlined"
                      freeSolo={false}
                      label="Language"
                      fullWidth
                      options={LANGUAGE_CONSTANTS}
                    />
                    <RHFTextField
                      size={'small'}
                      sx={{}}
                      name={`categoryNameAlias[${index}].alias`}
                      inputProps={{ readOnly: !editMode }}
                      variant="outlined"
                      label="Category Alias"
                      fullWidth
                    />
                    <IconButton sx={{}} onClick={() => removeCategoryAlias(index)}>
                      <Delete />
                    </IconButton>
                  </div>
                ))}
                {errors?.categoryNameAlias?.type === 'unique-language-category-id' && (
                  <p style={{ color: 'red' }} role="alert">
                    {errors.categoryNameAlias?.message}
                  </p>
                )}
                {!isEmpty(categoryAliasFields) && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 5 }}>
                    <Button
                      onClick={() => appendCategoryAlias({ language: '', alias: '' })}
                      size="small"
                      variant="text"
                      sx={{ justifySelf: 'flex-end' }}
                    >
                      Add more alias
                    </Button>
                  </div>
                )}
              </div>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <RHFTextField
                fullWidth
                multiline
                inputProps={{ readOnly: !editMode }}
                variant="outlined"
                name="description"
                label="Description "
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Optional"
              />
            </Grid>
            {isShowPriceField && !addMoreUnits && isProfitLossMode && isNotStaff && (
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <RHFTextField
                  fullWidth
                  inputProps={{ readOnly: !editMode }}
                  variant="outlined"
                  name="basePrice"
                  type="number"
                  label="Base price "
                  onWheel={(e) => e.target.blur()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            {isShowPriceField && !addMoreUnits && (
              <>
                <Grid item xs={12} md={5.785}>
                  <RHFTextField
                    fullWidth
                    inputProps={{ readOnly: !editMode }}
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
                  />
                </Grid>
                <Grid item xs={12} md={5.785}>
                  <RHFTextField
                    fullWidth
                    inputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    name="offerPrice"
                    type="number"
                    label="Offer Price"
                    onWheel={(e) => {
                      e.target.blur();
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Optional"
                  />
                </Grid>
                <Grid item xs={12} md={5.785}>
                  <RHFTextField
                    fullWidth
                    inputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    name="discount"
                    label="Discount"
                    type="number"
                    placeholder="Optional"
                    onWheel={(e) => {
                      e.target.blur();
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          <PercentIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={5.785}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="discountAmount"
                    value={handleDiscountAmount()}
                    label="Discount Amount"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon />
                        </InputAdornment>
                      ),
                    }}
                    // placeholder="Optional"
                    disabled
                  />
                </Grid>
              </>
            )}
            {isCountersEnabled && (
              <Grid item xs={12} md={5.785}>
                <RHFAutocompleteObjOptions
                  name="counterId"
                  variant="outlined"
                  freeSolo={false}
                  label="Select counter"
                  fullWidth
                  options={map(countersList, (e) => {
                    return { label: get(e, 'name'), id: get(e, 'counterId') };
                  })}
                />
              </Grid>
            )}
            <Grid item xs={12} md={5.785}>
              <RHFTextField
                fullWidth
                inputProps={{ readOnly: !editMode }}
                variant="outlined"
                name="tag"
                label="Tag "
                placeholder="Optional"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOfferIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {isMembershipEnable && (
              <Grid item xs={12} md={5.785}>
                <RHFTextField
                  fullWidth
                  inputProps={{ readOnly: !editMode }}
                  variant="outlined"
                  name="memberPrice"
                  label="Member Price "
                  placeholder="Optional"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            {console.log('ordertypes', values)}
            {isOrderTypeEnable && !isEmpty(orderTypesList) && (
              <>
                {map(orderTypesList, (e) => {
                  if (!defaultOrderTypes.includes(e))
                    return (
                      <Grid item xs={12} md={5.785}>
                        <RHFTextField
                          type="number"
                          fullWidth
                          inputProps={{ readOnly: !editMode }}
                          variant="outlined"
                          name={`${e}`}
                          label={`${e} Price`}
                          placeholder="Optional"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CurrencyRupeeIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    );
                })}
              </>
            )}
            <Grid item xs={12} md={5.785}>
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography>Parcel Not allowed (optional) </Typography>
                <RHFSwitch inputProps={{ readOnly: !editMode }} name="isParcelNotAllowed" />
              </Stack>
            </Grid>
            <Grid item xs={12} md={5.785}>
              <RHFTextField
                fullWidth
                inputProps={{ readOnly: !editMode }}
                variant="outlined"
                name="parcelCharges"
                label="Parcel charges"
                placeholder="Optional"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="ph:package" width="25" height="25" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={5.785}>
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography>GST (optional) </Typography>
                <RHFSwitch inputProps={{ readOnly: !editMode }} name="isGST" />
              </Stack>
            </Grid>
            <Grid item xs={12} sx={{ display: isShowGSTField ? 'block' : 'none' }}>
              <Card
                sx={{
                  p: 2,
                }}
              >
                <Stack flexDirection="row" alignItems="center" gap={2}>
                  <RHFTextField
                    fullWidth
                    inputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    name="GSTPercent"
                    label="GST"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          <PercentIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <RHFCheckbox
                    inputProps={{ readOnly: !editMode }}
                    name="GSTInc"
                    label="Inclusive"
                  />
                </Stack>
                <Stack flexDirection="row" alignItems="center" gap={2} sx={{ mt: 2 }}>
                  <RHFTextField
                    fullWidth
                    inputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    name="HSNorSACCode"
                    label="HSN or SAC "
                  />
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={10.5} sm={12} md={12} lg={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      defaultChecked={isAttributemode}
                      checked={isAttributemode}
                      onChange={() => setAttributeMode(!isAttributemode)}
                      name={'attributeMode'}
                    />
                  }
                  label={'Attributes (optional)'}
                />
              </FormGroup>
            </Grid>
            {isAttributemode && (
              <Grid item xs={10.5} sm={12} md={12} lg={12}>
                <Stack
                  flexDirection={'row'}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '48.5%',
                  }}
                >
                  <Typography>Veg </Typography>
                  <RHFSwitch inputProps={{ readOnly: !editMode }} name="isVeg" />
                </Stack>
              </Grid>
            )}
            {isAttributemode && isShowMRP && (
              <Grid item xs={10.5} sm={12} md={12} lg={12}>
                <RHFTextField
                  name="mrp"
                  inputProps={{ readOnly: !editMode }}
                  variant="outlined"
                  label="Product MRP"
                  fullWidth
                  type="number"
                  onWheel={(e) => e.target.blur()}
                />
              </Grid>
            )}
            <Grid item xs={10.5} sm={12} md={12} lg={12}>
              <RHFTextField
                name="barcode"
                inputProps={{ readOnly: !editMode }}
                variant="outlined"
                label="Barcode"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCodeScannerRounded
                        style={{
                          cursor: get(values, 'barcode') ? 'pointer' : 'not-allowed',
                          color: get(values, 'barcode') ? '#5a0b45' : '',
                        }}
                        onClick={() => {
                          if (!get(values, 'barcode')) return;
                          handleOpenViewBarcode();
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* {editMode && newProduct && (
              <Grid item xs={!editMode ? 12 : 5} sm={12} md={5.8} lg={5.8}>
                <Stack
                  flexDirection={'row'}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Stack direction={'column'}>
                    <Typography>Units (Optional)</Typography>
                    {errors?.items?.type === 'min' && (
                      <p style={{ color: 'red' }} role="alert">
                        {errors.items?.message}
                      </p>
                    )}
                  </Stack>
                  <RHFSwitch inputProps={{ readOnly: !editMode }} name="unitsEnabled" />
                </Stack>
              </Grid>
            )} */}
            {/* {isShowUnits && !addMoreUnits && (
              <Grid item xs={!editMode ? 12 : 5} sm={12} md={5.8} lg={5.8}>
                <RHFTextField
                  name={'unit'}
                  variant="outlined"
                  label="Units"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                />
              </Grid>
            )}
            {isShowUnits && !addMoreUnits && (
              <Grid item xs={!editMode ? 12 : 5} sm={12} md={5.8} lg={5.8}>
                <RHFSelect name={'unitName'} variant="outlined" label="Unit Type">
                  {map(UNIT_TYPES, (e) => (
                    <MenuItem key={e.id} value={e.value}> 
                      {e.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>
            )} */}
            {isShowUnits && (
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Button
                  onClick={() => setAddMoreUnits(!addMoreUnits)}
                  sx={{
                    display: 'flex',
                    mt: 1,
                    ml: 'auto',
                  }}
                >
                  {addMoreUnits ? 'Cancel' : 'Add more units'}
                </Button>
              </Grid>
            )}
            {/* {showUnitEdit && (
              <Grid item sm={12} md={12} lg={12}>
                {methods.watch('unitsEnabled') && (
                  <Paper sx={{}}>
                    {map(items, (_, index) => {
                      const fieldName = `items[${index}]`;
                      return (
                        <Grid
                          container
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '2px dashed',
                            p: 1,
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                            mb: 1,
                            gap: 2,
                          }}
                        >
                          <Grid item xs={5.8}>
                            <RHFTextField
                              autoFocus
                              name={`${fieldName}.units`}
                              inputProps={{ readOnly: !editMode }}
                              variant="outlined"
                              label="Enter units"
                              type="number"
                              size="small"
                              onWheel={(e) => e.target.blur()}
                            />
                          </Grid>{' '}
                          <Grid item xs={5.8}>
                            <RHFSelect
                              name={`${fieldName}.unitType`}
                              variant="outlined"
                              label="Unit type"
                              size="small"
                            >
                              {map(UNIT_TYPES, (e) => (
                                <MenuItem key={e.id} value={e.value}>
                                  {e.label}
                                </MenuItem>
                              ))}
                            </RHFSelect>
                          </Grid>
                          {isProfitLossMode && (
                            <Grid item xs={5.8}>
                              <RHFTextField
                                inputProps={{ readOnly: !editMode }}
                                variant="outlined"
                                name={`${fieldName}.actualBasePrice`}
                                label="Enter Base Price "
                                size="small"
                                type="number"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CurrencyRupeeIcon />
                                    </InputAdornment>
                                  ),
                                }}
                                onWheel={(e) => e.target.blur()}
                              />
                            </Grid>
                          )}
                          <Grid item xs={5.8}>
                            <RHFTextField
                              inputProps={{ readOnly: !editMode }}
                              variant="outlined"
                              name={`${fieldName}.actualPrice`}
                              label="Enter Price "
                              size="small"
                              type="number"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CurrencyRupeeIcon />
                                  </InputAdornment>
                                ),
                              }}
                              onWheel={(e) => e.target.blur()}
                            />
                          </Grid>
                          {(newProduct || (addMoreUnits && index !== 0)) && (
                            <Grid item xs={5.8}>
                              <RHFTextField
                                inputProps={{ readOnly: !editMode }}
                                variant="outlined"
                                name={`${fieldName}.actualProductId`}
                                label="Product ID "
                                size="small"
                                placeholder={'Optional'}
                              />
                            </Grid>
                          )}
                          <Grid item xs={5.8}>
                            <Button variant="text" onClick={removeUnits(index)}>
                              remove
                            </Button>
                          </Grid>
                        </Grid>
                      );
                    })}

                    <Box sx={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={addUnits}
                        startIcon={<AddCircleOutlineIcon />}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Add Unit
                      </Button>
                      <Button
                        variant="outlined"
                        color=""
                        onClick={() => (addMoreUnits ? setEditValueUnits() : clearItems())}
                        startIcon={<ClearRoundedIcon />}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Clear All Units
                      </Button>
                    </Box>
                  </Paper>
                )}
              </Grid>
            )} */}
            {showUnitEdit && methods.watch('unitsEnabled') && (
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={addUnits}
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Add Unit
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => (addMoreUnits ? setEditValueUnits() : clearItems())}
                    startIcon={<ClearRoundedIcon />}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Clear All Units
                  </Button>
                </Box>

                <TableContainer
                  sx={{
                    width: '100%',
                    overflow: 'auto',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                  }}
                >
                  <Table stickyHeader>
                    <TableHead sx={{ position: 'sticky', top: 0, zIndex: 99 }}>
                      <StyledTableRow>
                        <StyledTableCell style={{ backgroundImage: 'none', minWidth: 120 }}>
                          Product ID
                        </StyledTableCell>
                        <StyledTableCell style={{ backgroundImage: 'none', minWidth: 120 }}>
                          Units
                        </StyledTableCell>
                        <StyledTableCell
                          style={{ backgroundImage: 'none', minWidth: 120 }}
                          align="center"
                        >
                          Unit Type
                        </StyledTableCell>
                        {isProfitLossMode && isNotStaff && (
                          <StyledTableCell
                            style={{ backgroundImage: 'none', minWidth: 120 }}
                            align="center"
                          >
                            Base Price
                          </StyledTableCell>
                        )}
                        <StyledTableCell
                          style={{ backgroundImage: 'none', minWidth: 120 }}
                          align="center"
                        >
                          Price
                        </StyledTableCell>
                        <StyledTableCell
                          style={{ backgroundImage: 'none', minWidth: 120 }}
                          align="center"
                        >
                          Offer Price
                        </StyledTableCell>
                        <StyledTableCell
                          style={{ backgroundImage: 'none', minWidth: 120 }}
                          align="center"
                        >
                          Discount (%)
                        </StyledTableCell>
                        <StyledTableCell
                          style={{ backgroundImage: 'none', minWidth: 150 }}
                          align="center"
                        >
                          Discount Amount
                        </StyledTableCell>
                        <StyledTableCell
                          style={{
                            backgroundImage: 'none',
                            minWidth: 120,
                            position: 'sticky',
                            right: 0,
                          }}
                          align="center"
                        >
                          Action
                        </StyledTableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      {map(items, (_, index) => {
                        const fieldName = `items[${index}]`;

                        return (
                          <UnitsRow
                            newProduct={newProduct}
                            addMoreUnits={addMoreUnits}
                            index={index}
                            editMode={editMode}
                            fieldName={fieldName}
                            isProfitLossMode={isProfitLossMode}
                            isNotStaff={isNotStaff}
                            removeUnits={removeUnits}
                            getValues={getValues}
                            setValue={setValue}
                            watch={watch}
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            {editMode && (
              <Grid item xs={!editMode ? 12 : 5} sm={12} md={5.8} lg={5.8}>
                <Stack
                  flexDirection={'row'}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Stack direction={'column'}>
                    <Typography>Session (Optional)</Typography>
                    {errors?.isSessionEnabled?.type === 'min' && (
                      <p style={{ color: 'red' }} role="alert">
                        {errors.isSessionEnabled?.message}
                      </p>
                    )}
                  </Stack>
                  <RHFSwitch inputProps={{ readOnly: !editMode }} name="isSessionEnabled" />
                  {watchSession && !isEmpty(submittedSessionData) && (
                    <Button variant="contained" onClick={handleOpenSession} sx={{ ml: 2 }}>
                      View
                    </Button>
                  )}
                </Stack>
              </Grid>
            )}
            <Grid item xs={12} sm={12} sx={{ m: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <UploadImage name={'productImage'} setValue={setValue} values={values} />
              </div>
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mx: 1 }}>
              <Alert icon={false} severity="success">
                <Stack flexDirection="row" alignItems="center" gap={3}>
                  <Stack flexDirection="row" alignItems="center" gap={1}>
                    <Typography variant="body1">Price :</Typography>
                    <Typography variant="subtitle1">
                      ₹{' '}
                      {toFixedIfNecessary(
                        getTotalPriceAndGst({
                          GSTInc: watchGSTInc,
                          price: watchOfferPrice || watchPrice,
                          GSTPercent: watchGSTPercent,
                        })?.withoutGstAmount,
                        2
                      )}
                    </Typography>
                    {!!watchGSTPercent && (
                      <Typography variant="caption">
                        ({watchGSTInc ? 'inclusive' : 'exclusive'} ₹{' '}
                        {toFixedIfNecessary(
                          getTotalPriceAndGst({
                            GSTInc: watchGSTInc,
                            price: watchOfferPrice || watchPrice,
                            GSTPercent: watchGSTPercent,
                          })?.gstPercentageValue,
                          2
                        )}
                        )
                      </Typography>
                    )}
                  </Stack>
                  {!!watchGSTPercent && (
                    <Stack flexDirection="row" alignItems="center" gap={1}>
                      <Typography variant="body1">Total Price :</Typography>
                      <Typography variant="subtitle1" color="primary">
                        ₹{' '}
                        {toFixedIfNecessary(
                          getTotalPriceAndGst({
                            GSTInc: watchGSTInc,
                            price: watchOfferPrice || watchPrice,
                            GSTPercent: watchGSTPercent,
                          })?.withGstAmount,
                          2
                        )}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Alert>
            </Grid>
            {editMode || isEmpty(currentProductData) ? (
              <LoadingButton
                loading={isLoading}
                type="submit"
                variant="contained"
                fullWidth
                sx={{ py: 2, my: 1, mx: 1 }}
                disabled={
                  !availableProductId && methods.watch('productId') && newProduct ? true : false
                }
              >
                {!newProduct ? 'Update item' : 'Add item'}
              </LoadingButton>
            ) : (
              <div />
            )}
          </Grid>
        </FormProvider>
      )}

      {IsSessionDialog && (
        <WeekandTimeDialog
          open={IsSessionDialog}
          previousData={get(submittedSessionData, 'sessionInfo.timeSlots')}
          handleClose={handleCloseSession}
          setSubmittedSessionData={setSubmittedSessionData}
        />
      )}
      {openBarcode && get(values, 'barcode') && (
        <Dialog open={openBarcode} onClose={handleCloseViewBarcode}>
          <Card
            sx={{
              p: 2,
              minWidth: { xs: 230, sm: 250 },
            }}
          >
            <ErrorBoundary FallbackComponent={<div />}>
              <div id="print">
                <Barcode
                  displayValue={false}
                  value={get(values, 'barcode')}
                  height={80}
                  width={2}
                />
                <Typography
                  sx={{
                    ml: 2,
                    textAlign: 'center',
                    letterSpacing: get(values, 'barcode') ? get(values, 'barcode')?.length / 2 : 0,
                  }}
                >
                  {get(values, 'barcode')}
                </Typography>
              </div>
            </ErrorBoundary>
            <Button
              onClick={handleCloseViewBarcode}
              variant="text"
              sx={{ mt: 1, display: 'flex', justifySelf: 'flex-end' }}
            >
              Close
            </Button>
          </Card>
        </Dialog>
      )}
    </Drawer>
  );
}
