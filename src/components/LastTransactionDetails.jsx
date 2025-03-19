import {
  Box,
  Chip,
  makeStyles,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import map from 'lodash/map';
import { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import StartAndEndDatePicker from './StartAndEndDatePicker';
import { filter, get } from 'lodash';
import { formatDate } from 'src/utils/formatTime';
import TransactionListTable from './TransactionListTable';

export default function LastTransactionDetails({ orderAnalytics }) {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [filterTable, setFilterTable] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const transactionData = orderAnalytics.data;
  const headers = ['Order Id', 'Date', 'Time', 'Order Amount', 'Reason'];

  useEffect(() => {
    if (startDate && endDate) {
      const filterDataByDate = filter(transactionData, (_item) => {
        return (
          get(_item, 'date') >= formatDate(startDate) && get(_item, 'date') <= formatDate(endDate)
        );
      });
      setFilterTable(filterDataByDate);
    } else if (!startDate && !endDate) {
      setFilterTable(transactionData);
    }
  }, [startDate, endDate, orderAnalytics]);

  return (
    <>
      {!isMobile && (
        <>
          <Box my={2}>
            <StartAndEndDatePicker
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          </Box>
          <TableContainer component={Paper} style={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Order Id</TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Time</TableCell>
                  <TableCell align="center">Order Amount</TableCell>
                  <TableCell align="center">Reason</TableCell>
                  <TableCell align="center">
                    <Stack flexDirection={'row'} gap={1} justifyContent={'center'}>
                      <Typography fontSize={'14px'} fontWeight={600}>
                        Payment Status
                      </Typography>
                      {/* <ExpandCircleDownIcon fontSize='small' sx={{ cursor: 'pointer'}} /> */}
                    </Stack>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {map(filterTable, (row, index) => (
                  <TransactionListTable row={row} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      {isMobile && (
        <Carousel axis="horizontal" showIndicators={false} showThumbs={false}>
          {map(transactionData, (row, index) => (
            <TransactionListTable row={row} />
          ))}
        </Carousel>
      )}
    </>
  );
}
