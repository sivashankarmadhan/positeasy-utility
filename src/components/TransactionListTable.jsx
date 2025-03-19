import { Chip, TableCell, TableRow, useTheme } from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { useState } from 'react';
import { dateFormat, fDates, timeFormat } from 'src/utils/formatTime';
import DrawerTransaction from './DrawerTransaction';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import statusColor from 'src/utils/statusColor';

export default function TransactionListTable({ row, allData }) {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <TableRow key={row.orderId}>
        <TableCell align="center"> {row.orderId} </TableCell>
        <TableCell align="center">{`${fDates(row.date)} ${timeFormat(row.time)}`}</TableCell>
        <TableCell align="right">{toFixedIfNecessary(row.orderAmount / 100, 2)}</TableCell>
        <TableCell align="right">{toFixedIfNecessary(row.paidAmount / 100, 2)}</TableCell>
        <TableCell align="center">{row.reason ?? '-'}</TableCell>
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
  );
}
