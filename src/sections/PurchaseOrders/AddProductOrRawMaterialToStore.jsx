import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, {
  RHFAutocompleteObjOptions,
  RHFRadioGroup,
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';

// @mui
import { LoadingButton } from '@mui/lab';
import { Button, Card, Dialog, MenuItem, Stack, Typography, useTheme } from '@mui/material';
import RegexValidation from 'src/constants/RegexValidation';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { capitalize, find, findLastIndex, get, map, reduce } from 'lodash';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import { convertTimeTo12HourFormat, dateFormat, fDate, formatTime } from 'src/utils/formatTime';
import { useEffect, useState } from 'react';
import {
  PURCHASE_ORDER_PAYMENT_TYPE,
  PaymentModeTypeConstantsCart,
  PURCHASE_TO_SHOP,
  REQUIRED_CONSTANTS,
} from 'src/constants/AppConstants';
import { alertDialogInformationState, currentStoreId } from 'src/global/recoilState';
import { useRecoilState, useSetRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import { isEmpty } from 'lodash';
import AddOrMatchProductOrRawMaterialModal from './AddOrMatchProductOrRawMaterialModal';
import Label from 'src/components/label';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { lowerCase } from 'lodash';
// ----------------------------------------------------------------------

function AddProductOrRawMaterialToStore({ isOpenModal, closeModal, getPurchaseOrderDetails }) {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const Schema = Yup.object().shape({
    productOrRawMaterial: Yup.object()
      .shape({
        label: Yup.string().required(REQUIRED_CONSTANTS.PRODUCT_NAME),
        id: Yup.string().required(REQUIRED_CONSTANTS.PRODUCT_NAME),
      })
      .required(REQUIRED_CONSTANTS.PRODUCT_NAME),
  });
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [productListForStock, setProductListForStock] = useState([]);
  const [isOpenAddOrMatchModal, setIsOpenAddOrMatchModal] = useState(false);
  const [selectedStore, setSelectedStore] = useRecoilState(currentStoreId);

  const [manualEntryStocks, setManualEntryStocks] = useState('');

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
  const updateStockMonitor = async () => {
    try {
      const options = {
        storeId : selectedStore,
        productId : isOpenModal?.data?.productId
      }
      const res = await PurchaseOrderServices.updateStockProduct(options);
    
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleWarningWithAlert = (_index) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `If click yes, then This product Stock monitor will enabled?`,
      actions: {
        primary: {
          text: 'yes',
          onClick: (onClose) => {
            updateStockMonitor()
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

  // TODO: we will use future
  // const getStockHistory = async () => {
  //   try {
  //     const res = await PurchaseOrderServices.stockHistory({
  //       productId: get(watchProductOrRawMaterial, 'id'),
  //       type: isOpenModal?.data?.type,
  //     });
  //     setManualEntryStocks(get(res, 'data.manualStock'));
  //   } catch (e) {
  //     toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
  //   }
  // };

  // TODO: we will use future
  // useEffect(() => {
  //   if (watchProductOrRawMaterial) {
  //     getStockHistory();
  //   }
  // }, [watchProductOrRawMaterial]);

  useEffect(() => {
    getListForStock();
  }, [isOpenModal]);

  useEffect(() => {
    if (!isEmpty(productListForStock) && isOpenModal?.data?.productId) {
      console.log('llllll', isOpenModal?.data);
      setValue('productOrRawMaterial', {
        label: isOpenModal?.data?.name,
        id: isOpenModal?.data?.productId,
      });
    }
  }, [productListForStock]);

  console.log('watchProductOrRawMaterial', watchProductOrRawMaterial);

  const selectedProductDetails = find(productListForStock, (_item) => {
    return get(_item, 'productId') === get(watchProductOrRawMaterial, 'id');
  });

  console.log('selectedProductDetails', selectedProductDetails);

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
      // if(e?.errorResponse?.message === "Stock monitor not enabled " ) {
      //   handleWarningWithAlert()
      // }
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const isProductFlow = isOpenModal?.data?.type === PURCHASE_TO_SHOP.PRODUCT;

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
          <Stack sx={{ height: 270 }}>
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
              options={map(productListForStock, (_item) => {
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
                {/* <Stack flexDirection="row" gap={2} justifyContent="flex-end">
                  <Typography mt={2} sx={{ opacity: 70, fontWeight: 'bold' }}>
                    Manual Entry Stocks :
                  </Typography>
                  <Typography mt={2} sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                    {manualEntryStocks || 0}
                  </Typography>
                </Stack> */}
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
          </Stack>

          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
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

export default AddProductOrRawMaterialToStore;
