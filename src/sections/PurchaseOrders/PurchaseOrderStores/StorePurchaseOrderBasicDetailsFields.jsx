import { Box, Card, Stack, Typography } from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { filter, get, isEmpty, map } from 'lodash';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState } from 'recoil';
import { RHFAutocompleteObjOptions, RHFRadioGroup, RHFTextField } from 'src/components/hook-form';
import RHFDatePicker from 'src/components/hook-form/RHFDatePicker';
import {
  PURCHASE_ORDER_PAYMENT_TYPE,
  PURCHASE_ORDER_STATUS,
  PURCHASE_ORDER_STATUS_FOR_BTN_GRP,
  PURCHASE_PAYMENT_MODE,
  STORE_PURCHASE_ORDER_STATUS_FOR_BTN_GRP,
  STORE_PURCHASE_STATUS,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { currentStoreId } from 'src/global/recoilState';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import VendorServices from 'src/services/API/VendorServices';
import INTENT_API from 'src/services/IntentService';
import STORES_API from 'src/services/stores';

const StorePurchaseOrderBasicDetailsFields = ({
  watchPaymentType,
  purchaseOrderId,
  setPurchaseOrderId,
  selectedTab,
}) => {
  const [storeList, setStoreList] = useState([]);
  const [vendorDetails, setVendorDetails] = useState({});
  const isMobile = useMediaQuery('(max-width:600px)');
  const [selectedStore, setSelectedStore] = useRecoilState(currentStoreId);

  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;
  const getStoreNames = async () => {
    try {
      const response = await INTENT_API.getIntentStoreAllList(selectedStore);
      setStoreList(get(response, 'data'));
    } catch (e) {
    } finally {
    }
  };

  const getPurchaseOrderId = async () => {
    try {
      const response = await PurchaseOrderServices.getPurchaseLastOrder();
      setPurchaseOrderId(get(response, 'data'));
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    getStoreNames();
    getPurchaseOrderId();
  }, []);

  const phone = get(vendorDetails, 'contactNumber');
  const email = get(vendorDetails, 'email');
  const address = get(vendorDetails, 'vendorInfo.shippingAddress.address');
  const city = get(vendorDetails, 'vendorInfo.shippingAddress.city');
  const state = get(vendorDetails, 'vendorInfo.shippingAddress.state');
  const zipCode = get(vendorDetails, 'vendorInfo.shippingAddress.zipCode');
  const countryOrRegion = get(vendorDetails, 'vendorInfo.shippingAddress.countryOrRegion');

  const deliveryAddressContent = (
    <>
      {!isEmpty(get(vendorDetails, 'vendorInfo.shippingAddress')) && (
        <Stack
          flexDirection="row"
          gap={3}
          sx={{ flex: 1, p: isTab || isMobile ? 0 : 3, pl: isTab || isMobile ? 0 : 4 }}
        >
          <Typography sx={{ width: '9rem', fontSize: '15px' }}>Delivery Address</Typography>
          <Stack>
            <Typography sx={{ opacity: 0.7, width: '16rem', fontSize: '15px' }}>
              {address}, {city}, {state} - {zipCode}, {countryOrRegion}
            </Typography>
            <Typography sx={{ opacity: 0.7, width: '16rem', fontSize: '15px' }}>
              <span style={{ fontWeight: 'bold' }}>Contact Number </span>: {phone}
            </Typography>
            <Typography sx={{ opacity: 0.7, width: '16rem', fontSize: '15px' }}>
              <span style={{ fontWeight: 'bold' }}>Email </span>: {email}
            </Typography>
          </Stack>
        </Stack>
      )}
    </>
  );
  return (
    <Card
      sx={{
        m: 0.2,
        mt: 4,
        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
      }}
    >
      <Stack flexDirection="row">
        <Stack gap={3} sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)', flex: 1, p: 3, pr: 4 }}>
          <Stack flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 1 : 3}>
            <Typography sx={{ width: '9rem', fontSize: '15px', fontWeight: 'bold' }}>
              Store Name
            </Typography>
            <RHFAutocompleteObjOptions
              options={map(filter(storeList, (item) => get(item, 'storeId') !== selectedStore), (_item) => {
                return {
                  label: get(_item, 'storeName'),
                  id: get(_item, 'storeId'),
                };
              })}
              size="small"
              name="storeName"
              sx={{ width: '100%' }}
              freeSolo={false}
            />
          </Stack>
          {(isTab || isMobile) && deliveryAddressContent}
          <Stack flexDirection="row" gap={isMobile ? 1 : 0}>
            <Typography sx={{ width: '8.5rem', fontSize: '15px', fontWeight: 'bold' }}>
              Purchase Order
            </Typography>
            <Typography sx={{ opacity: 0.7, fontSize: '15px' }}>
              {purchaseOrderId || '-'}
            </Typography>
          </Stack>
          <Stack flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 1 : 3}>
            <Typography sx={{ width: '9rem', fontSize: '15px', fontWeight: 'bold' }}>
              Date
            </Typography>
            <RHFDatePicker name="date" size="small" sx={{ width: '100%' }} />
          </Stack>
          <Stack flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 1 : 3}>
            <Typography sx={{ width: '9rem', fontSize: '15px', fontWeight: 'bold' }}>
              Payment Type
            </Typography>
            <Stack flexDirection="column" sx={{ width: '100%' }}>
              <Stack flexDirection="row" gap={2} sx={{ width: '100%' }}>
                <RHFAutocompleteObjOptions
                  size="small"
                  sx={{
                    width:
                      get(watchPaymentType, 'id') === PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL
                        ? isMobile
                          ? '50%'
                          : '50%'
                        : isMobile
                        ? '100%'
                        : '100%',
                  }}
                  options={map(PURCHASE_ORDER_PAYMENT_TYPE, (_item) => {
                    return {
                      label: _item === PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL ? 'PARTIAL' : _item,
                      id: _item,
                    };
                  })}
                  name="type"
                  freeSolo={false}
                />
                {get(watchPaymentType, 'id') === PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL && (
                  <RHFTextField
                    size="small"
                    label="Advance Amount"
                    name="advance"
                    sx={{ width: '50%' }}
                  />
                )}
              </Stack>
              <Typography sx={{ fontSize: '12px', mt: 1 }}>
                {get(watchPaymentType, 'id') === PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT && (
                  <span>
                    <span style={{ fontWeight: 'bold' }}>*</span> purchase order will be marked as
                    <span style={{ fontWeight: 'bold' }}> paid </span>
                    and <span style={{ fontWeight: 'bold' }}> closed </span>
                  </span>
                )}

                {get(watchPaymentType, 'id') === PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL && (
                  <span>
                    <span style={{ fontWeight: 'bold' }}>*</span> purchase order will be marked as
                    <span style={{ fontWeight: 'bold' }}> partially billed </span>
                  </span>
                )}
                {get(watchPaymentType, 'id') === PURCHASE_ORDER_PAYMENT_TYPE.CREDIT && (
                  <span>
                    <span style={{ fontWeight: 'bold' }}>*</span> purchase order will be marked as
                    <span style={{ fontWeight: 'bold' }}> credit </span>( without bill )
                  </span>
                )}
              </Typography>
            </Stack>
          </Stack>

          {[PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT, PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL].includes(
            get(watchPaymentType, 'id')
          ) && (
            <Stack flexDirection={isMobile ? 'column' : 'row'} mt={-1.8} gap={isMobile ? 1 : 0}>
              <Typography sx={{ width: '9rem', fontSize: '15px' }}></Typography>
              <RHFRadioGroup
                sx={{ width: isMobile ? 'auto' : 440 }}
                row={true}
                name={'mode'}
                options={map(PURCHASE_PAYMENT_MODE, (_value) => {
                  return { label: _value, value: _value };
                })}
                isSmall
              />
            </Stack>
          )}

          {get(watchPaymentType, 'id') && (
            <Stack flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 1 : 3}>
              <Typography sx={{ width: '7rem', fontSize: '15px', fontWeight: 'bold' }}>
                Order Status
              </Typography>
              <RHFRadioGroup
                sx={{ width: isMobile ? 'auto' : 440 }}
                row={true}
                name={'status'}
                options={map(STORE_PURCHASE_STATUS, (_item) => {
                  let disabled = false;
                  if (
                    selectedTab === "byPass" &&
                    [PURCHASE_ORDER_STATUS.OPEN].includes(get(_item, 'name'))
                  ) {
                    disabled = true;
                  } else if (
                    selectedTab !== "byPass" &&
                    [PURCHASE_ORDER_STATUS.TRANSIT].includes(
                      get(_item, 'name')
                    )
                  ) {
                    disabled = true;
                  }

                  return { label: get(_item, 'name'), value: get(_item, 'name'), disabled };
                })}
                isSmall
              />
            </Stack>
          )}
        </Stack>
        {/* {!(isTab || isMobile) && deliveryAddressContent} */}
      </Stack>
    </Card>
  );
};

export default StorePurchaseOrderBasicDetailsFields;
