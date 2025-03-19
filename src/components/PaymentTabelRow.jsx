import { Chip, TableCell, TableRow } from '@mui/material';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { dateFormat, timeFormat } from 'src/utils/formatTime';
import statusColor from 'src/utils/statusColor';
import DrawerTransaction from './DrawerTransaction';

export default function PaymentTableRow({ row, allData }) {
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
            <TableCell align="center">{dateFormat(row.date)}</TableCell>
            <TableCell align="center">{timeFormat(row.time)}</TableCell>
            <TableCell align="center">{row.orderAmount / 100}</TableCell>
            <TableCell align="center">{row.reason}</TableCell>
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
          <DrawerTransaction
            handleOpen={handleOpen}
            open={open}
            handleClose={handleClose}
            row={row}
          />
        </>
      )}{' '}
    </>
  );
}
