import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { Box, Button, Stack, Tab, Tabs, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  BANKING_DETAILS,
  REQUIRED_CONSTANTS,
  vendorDetailsSections,
  ADDRESS,
  PURCHASE_ORDER_PAYMENT_TYPE,
  PURCHASE_PAYMENT_MODE,
  PURCHASE_ORDER_STATUS,
  STORE_PURCHASE_CONSTANTS,
} from 'src/constants/AppConstants';
import { forEach, get, isEmpty, isEqual, isObject, map, omit, set } from 'lodash';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import toast from 'react-hot-toast';
import VendorServices from 'src/services/API/VendorServices';
import { useNavigate, useParams } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import filterChangedValueInObj from 'src/utils/filterChangedValueInObj';
import PurchaseOrderBasicDetailsFields from 'src/sections/PurchaseOrders/PurchaseOrderBasicDetailsFields';
import PurchaseOrderProductList from 'src/sections/PurchaseOrders/PurchaseOrderProductList';
import moment from 'moment';
import RegexValidation from 'src/constants/RegexValidation';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';

const CreateAndEditPurchaseOrder = () => {
  const params = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const [productList, setProductList] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [finalDeliveryCharges, setFinalDeliveryCharges] = useState(0);
  const [finalDiscount, setFinalDiscount] = useState(0);
  const [purchaseOrderId, setPurchaseOrderId] = useState('');

  const referenceId = get(params, 'referenceId');

  const defaultValues = {
    vendor: null,
    date: moment(),
    type: null,
    mode: PURCHASE_PAYMENT_MODE.CASH,
    status: PURCHASE_ORDER_STATUS.RECEIVED,
    advance: null,
  };

  const schema = Yup.object().shape({
    vendor: Yup.object().shape({
      label: Yup.string().required(REQUIRED_CONSTANTS.VENDOR_IS_REQUIRED),
      id: Yup.string().required(REQUIRED_CONSTANTS.VENDOR_IS_REQUIRED),
    }),
    type: Yup.object().shape({
      label: Yup.string().required(REQUIRED_CONSTANTS.PAYMENT_TYPE_IS_REQUIRED),
      id: Yup.string().required(REQUIRED_CONSTANTS.PAYMENT_TYPE_IS_REQUIRED),
    }),
    advance: Yup.string().when('type', {
      is: (value) => get(value, 'id') === PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL,
      then: () =>
        Yup.string()
          .required(ErrorConstants.CREDIT_AMOUNT_IS_REQUIRED)
          .matches(
            RegexValidation.POSITIVE_NUMBER_WITH_EMPTY,
            ErrorConstants.CREDIT_AMOUNT_SHOULD_BE_VALID
          ),
      otherwise: () => Yup.string().nullable(),
    }),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { reset, handleSubmit, watch, setValue } = methods;

  const watchVendor = watch('vendor');
  const watchPaymentType = watch('type');
  const watchAdvance = watch('advance');

  const onSubmit = async (data) => {
    if (isOpenModal) return;
    if (isEmpty(productList)) return toast.error(STORE_PURCHASE_CONSTANTS.ADD_PRODUCT);
    const payload = {
      date: moment.utc(get(data, 'date')).format(),
      ...(get(data, 'type.id') === PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL
        ? { advance: Number(get(data, 'advance') || 0) * 100 }
        : {}),
      type: get(data, 'type.id'),
      vendorId: get(data, 'vendor.id'),
      orders: map(productList, (_item) => {
        let payload = {
          ...omit(_item, 'rate'),
          name: get(_item, 'name'),
          price: get(_item, 'rate') * 100,
          quantity: get(_item, 'quantity'),
          GSTInc: !get(_item, 'GSTPercent') ? null : get(_item, 'GSTInc'),
          GSTPercent: get(_item, 'GSTPercent'),
          ...(get(_item, 'unit') ? { units: get(_item, 'unit') } : {}),
        }

        if(!get(_item, 'counterId.id')){
          payload  =  omit(payload, 'counterId')
        }else {
          set(payload,'counterId',get(_item, 'counterId.id'))
        }



        return payload
      }),
      purchaseId: purchaseOrderId,
      discount: Number(finalDiscount || 0) * 100,
      deliveryCharges: Number(finalDeliveryCharges || 0) * 100,
      ...([PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT, PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL].includes(
        get(watchPaymentType, 'id')
      )
        ? { mode: get(data, 'mode') }
        : {}),
      status: get(data, 'status'),
    };
    setIsLoading(true);
    try {
      await PurchaseOrderServices.addPurchaseOrder(payload);
      toast.success(SuccessConstants.ADDED_PURCHASE_ORDER_SUCCESSFULLY);
      navigate(PATH_DASHBOARD.purchases.viewPurchaseOrders);
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  const getPurchaseOrderDetails = async () => {
    try {
      const res = await PurchaseOrderServices.getPurchaseOrderDetails({ referenceId });
      reset({
        vendor: { id: get(res, 'data.data.vendorId'), label: get(res, 'data.data.vendorId') },
        date: moment(get(res, 'data.data.date')),
        type: get(res, 'data.purchaseBills.0.type'),
        mode: get(res, 'data.purchaseBills.0.type'),
        advance: null,
      });
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (referenceId) {
      getPurchaseOrderDetails();
    }
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          m: 2,
          mb: 6,
          height: 'calc(100vh - 170px)',
          overflow: 'auto',
        }}
      >
        <PurchaseOrderBasicDetailsFields
          watchVendor={watchVendor}
          watchPaymentType={watchPaymentType}
          purchaseOrderId={purchaseOrderId}
          setPurchaseOrderId={setPurchaseOrderId}
        />
        <PurchaseOrderProductList
          productList={productList}
          setProductList={setProductList}
          isOpenModal={isOpenModal}
          setIsOpenModal={setIsOpenModal}
          finalDeliveryCharges={finalDeliveryCharges}
          setFinalDeliveryCharges={setFinalDeliveryCharges}
          finalDiscount={finalDiscount}
          setFinalDiscount={setFinalDiscount}
          watchPaymentType={watchPaymentType}
          watchAdvance={watchAdvance}
        />
      </Box>
      <Stack
        sx={{ position: 'fixed', bottom: 20, right: 16 }}
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-end"
        gap={2}
        mt={2}
      >
        <Button size="large" type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
};

export default CreateAndEditPurchaseOrder;
