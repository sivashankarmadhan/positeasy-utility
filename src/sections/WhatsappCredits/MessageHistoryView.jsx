import { TableCell, TableRow } from '@mui/material';
import { get } from 'lodash';
import React from 'react';
import Label from 'src/components/label';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import { fDatesWithTimeStampWithDayjs } from 'src/utils/formatTime';

export default function MessageHistoryView({ _item }) {
  console.log('_item', _item);
  return (
    <TableRow>
      <TableCell sx={{ minWidth: 200 }} align="left">
        {fDatesWithTimeStampWithDayjs(get(_item, 'updatedAt'))}
      </TableCell>
      <TableCell align="left">{get(_item, 'paymentId') || '--'}</TableCell>
      <TableCell sx={{ minWidth: 250 }} align="left">
        {get(_item, 'messageId') || '--'}
      </TableCell>
      <TableCell align="left">{get(_item, 'contactNumber') || '--'}</TableCell>
      <TableCell align="left">{get(_item, 'channel') || '--'}</TableCell>
      <TableCell sx={{ fontSize: '11px' }} align="left">
        {get(_item, 'type') || '--'}
      </TableCell>
      {/* <TableCell align="left">
        {get(_item, 'paidAmount')
          ? `₹ ${toFixedIfNecessary(get(_item, 'paidAmount') / 100, 2)}`
          : '--'}
      </TableCell> */}
      <TableCell align="left">
        {
          <Label
            color={
              get(_item, 'status') === 'delivered'
                ? 'success'
                : get(_item, 'status') === 'enqueued'
                ? 'error'
                : get(_item, 'status') === 'send'
                ? 'error'
                : 'info'
            }
            sx={{ fontSize: '10px', fontWeight: 'bold' }}
          >
            {get(_item, 'status')}
          </Label>
        }
      </TableCell>
    </TableRow>
  );
}
