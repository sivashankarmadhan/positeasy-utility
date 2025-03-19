import { TableCell, TableRow } from '@mui/material';
import { get } from 'lodash';
import React from 'react';
import Label from 'src/components/label';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import { fDatesWithTimeStampWithDayjs } from 'src/utils/formatTime';

export default function RechargeHistoryView({ _item }) {
  return (
    <TableRow>
      <TableCell sx={{minWidth: 200}} align="left">{fDatesWithTimeStampWithDayjs(get(_item, 'updatedAt'))}</TableCell>
      <TableCell align="left">{get(_item, 'paymentId')}</TableCell>
      <TableCell align="left">{get(_item, 'reason') || '--'}</TableCell>
      <TableCell align="left">{get(_item, 'mode') || '--'}</TableCell>
      <TableCell align="left">
        {get(_item, 'paidAmount')
          ? `₹ ${toFixedIfNecessary(get(_item, 'paidAmount') / 100, 2)}`
          : '--'}
      </TableCell>
      <TableCell align="left">
        {
          <Label
            color={get(_item, 'paymentStatus') === 'COMPLETED' ? 'success' : 'error'}
            sx={{ fontSize: '10px', fontWeight: 'bold' }}
          >
            {get(_item, 'paymentStatus') === 'COMPLETED' ? 'Success' : 'Payment Failed'}
          </Label>
        }
      </TableCell>
    </TableRow>
  );
}
