import { Chip, TableCell, TableRow, Typography, useTheme } from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { convertToRupee } from 'src/helper/ConvertPrice';

export default function ProductTableRow({ row, allData }) {
  return (
    <>
      {!isEmpty(row) && (
        <>
          <TableRow key={row.productId}>
            <TableCell align="left">
              {' '}
              {row.name}{' '}
              {row.unit && (
                <Typography sx={{ display: 'inline' }} variant="caption">
                  {` (${row.unit}${row.unitName})`}
                </Typography>
              )}{' '}
            </TableCell>
            <TableCell align="center">{row.category}</TableCell>
            <TableCell align="center">{row.quantity}</TableCell>
            <TableCell align="center">₹{convertToRupee(row.price / row.quantity)}</TableCell>
            <TableCell align="center">₹{convertToRupee(row.price)}</TableCell>
          </TableRow>
        </>
      )}{' '}
    </>
  );
}
