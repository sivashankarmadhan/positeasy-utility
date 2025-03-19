import {
  Box,
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
import { filter, get } from 'lodash';
import map from 'lodash/map';
import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import { formatDate } from 'src/utils/formatTime';
import PaymentTableRow from './PaymentTabelRow';
import StartAndEndDatePicker from './StartAndEndDatePicker';


export default function PaymentTable({ orderAnalytics }) {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [filterTable, setFilterTable] = useState([]);

  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);

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
            <StartAndEndDatePicker/>
          </Box>
          <TableContainer component={Paper} style={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Payment Id</TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Time</TableCell>
                  <TableCell align="center">Order Amount</TableCell>
                  <TableCell align="center">Reason</TableCell>
                  <TableCell align="center">Payment Status</TableCell>
                  <TableCell align="center">Payment Type</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {map(filterTable, (row, index) => (
                  <PaymentTableRow row={row} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      {isMobile && (
        <Carousel axis="horizontal" showIndicators={false} showThumbs={false}>
          {map(transactionData, (row, index) => (
            <PaymentTableRow row={row} />
          ))}
        </Carousel>
      )}
    </>
  );
}
