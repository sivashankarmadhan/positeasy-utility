import { Chip, TableCell, TableRow } from '@mui/material';
import { get, isEmpty } from 'lodash';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { GstData } from 'src/global/SettingsState';
import statusColor from 'src/utils/statusColor';
import DrawerTransaction from './DrawerTransaction';

export default function GstTableRow({ row }) {
  const gstData = useRecoilValue(GstData);

  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {!isEmpty(row) && (
        <>
          <TableRow key={row.paymentId}>
            <TableCell align="left"> {row.paymentId} </TableCell>
            <TableCell align="center">{get(gstData, 'gstNumber')}</TableCell>
            <TableCell align="center">{get(gstData, 'gstPercent')}%</TableCell>
            <TableCell align="center">₹{(row.orderAmount - row.gstPrice) / 100}</TableCell>
            <TableCell align="center">₹{row.gstPrice / 100}</TableCell>
            <TableCell align="center">₹{row.paidAmount / 100}</TableCell>
            <TableCell align="center">
              <Chip
                size="small"
                color={statusColor(row.paymentStatus)}
                sx={{
                  fontSize: '11px',
                  fontWeight: 600,
                  '&.MuiChip-root': { borderRadius: '4px' },
                }}
                label={`${row.paymentStatus}`}
              />
            </TableCell>
            <TableCell align="center">{row.type ?? '-'}</TableCell>
            <TableCell align="center">
              <Chip
                size="small"
                onClick={handleOpen}
                variant="outlined"
                color="info"
                label="View Details"
                sx={{ cursor: 'pointer' }}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <DrawerTransaction
              handleOpen={handleOpen}
              open={open}
              handleClose={handleClose}
              row={row}
            />
          </TableRow>
        </>
      )}{' '}
    </>
  );
}
