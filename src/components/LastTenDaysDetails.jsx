import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import map from 'lodash/map';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import TransactionListTable from './TransactionListTable';

export default function LastTenDaysDetails({ orderAnalytics, color }) {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(false);
  const navigationPage = useNavigate();
  const tableData = orderAnalytics.data;
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const headers = ['Order id', 'Date','Order amount(₹)','Paid amount(₹)','Reason', 'Payment status', ''];
  return (
    <>
      <TableContainer component={Paper}>
        <Table
          stickyHeader
          sx={{ border: 1, borderColor: theme.palette.primary.lighter, borderRadius: 1 }}
        >
          <TableHead>
            <TableRow
              sx={{
                '& .MuiTableCell-head': {
                  background: theme.palette.primary.lighter,
                },
              }}
            >
              {map(headers, (e) => (
                <TableCell
                  sx={{
                    color: theme.palette.primary.main,
                    minWidth: e === 'Reason' ? '175px' : '145px',
                  }}
                  align="center"
                >
                  {e}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {map(tableData, (row, index) => (
              <TransactionListTable row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
