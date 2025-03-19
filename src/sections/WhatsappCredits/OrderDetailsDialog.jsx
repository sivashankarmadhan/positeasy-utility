import { Divider, Stack, Typography } from '@mui/material';
import { get, map } from 'lodash';
import React from 'react';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import DialogComponent from './Dialog';

const OrderListMockData = [
  {
    productName: 'Chicken Pizza',
    quantity: 2,
    orderedAmount: 32390,
  },
  {
    productName: 'Grill',
    quantity: 3,
    orderedAmount: 32390,
  },
  {
    productName: 'Coffee',
    quantity: 3,
    orderedAmount: 133,
  },
  {
    productName: 'Tea',
    quantity: 3,
    orderedAmount: 1233,
  },
  {
    productName: 'Pizza',
    quantity: 3,
    orderedAmount: 233,
  },
  {
    productName: 'Popcorn',
    quantity: 3,
    orderedAmount: 22333,
  },
  {
    productName: 'sandwich',
    quantity: 3,
    orderedAmount: 22333,
  },
  {
    productName: 'Black tea',
    quantity: 4,
    orderedAmount: 2333,
  },
  {
    productName: 'Black lemon',
    quantity: 3,
    orderedAmount: 4333,
  },
];

const OrderDetailsDialog = ({ open, onClose }) => {
  return (
    <DialogComponent open={open} onClose={onClose} title="Order ID : 12" customMinWidth={400}>
      <Stack
        sx={{
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mt: 2,
        }}
      >
        <Stack sx={{ width: '100%' }}>
          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              pb: 1,
              width: '100%',
            }}
          >
            <Typography sx={{ fontWeight: 'bold', width: '40%' }}>Product Name</Typography>
            <Typography sx={{ fontWeight: 'bold', width: '20%', textAlign: 'center' }}>
              Qty
            </Typography>
            <Typography sx={{ fontWeight: 'bold', width: '40%', textAlign: 'end' }}>
              Ordered Amount
            </Typography>
          </Stack>

          <Divider />
        </Stack>

        <Stack flexDirection="column" gap={2} sx={{ height: 400, overflow: 'auto', width: '100%' }}>
          {map(OrderListMockData, (_item) => {
            return (
              <>
                <Stack
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    // mb: 1,
                  }}
                >
                  <Typography sx={{ width: '40%' }}>{get(_item, 'productName')}</Typography>
                  <Typography sx={{ width: '20%', textAlign: 'center' }}>
                    {get(_item, 'quantity')}
                  </Typography>
                  <Typography sx={{ width: '40%', textAlign: 'end' }}>
                    ₹ {toFixedIfNecessary(get(_item, 'orderedAmount') / 100, 2) || '--'}
                  </Typography>
                </Stack>
                <Divider />
              </>
            );
          })}
        </Stack>
      </Stack>
    </DialogComponent>
  );
};

export default OrderDetailsDialog;
