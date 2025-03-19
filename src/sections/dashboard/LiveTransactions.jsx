import {
  Box,
  Typography,
  Chip,
  Card,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  useTheme,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import startCase from 'lodash/startCase';
import map from 'lodash/map';
import get from 'lodash/get';
import { fCurrency } from '../../utils/formatNumber';
import { dateWithTimeFormatAMPM } from 'src/utils/formatTime';
import Scrollbar from '../../components/scrollbar';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import statusColor from 'src/utils/statusColor';
import SyncIcon from '@mui/icons-material/Sync';
import { IconButton } from '@mui/material';
import { useState } from 'react';
import React from 'react';
import { Tab } from '@mui/material';
import { Tabs } from '@mui/material';
import TransactionSkeletonLoader from 'src/components/dashboardSkeletonLoader/transactionLoader';

// ----------------------------------------------------------------------

export default function LiveTransactions({
  title,
  tableData,
  getRecentTransactions,
  selected,
  setSelected,
  recentTransaction,
  isCompleted,
  loading,
}) {
  const isMobile = useMediaQuery('(max-width:600px');
  const isDesktop = useMediaQuery('(min-width:1469px');
  const theme = useTheme();

  const onChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      setSelected('');
    }
  };

  return (
    <Card
      sx={{
        height: isMobile ? 400 : 350,
        p: 0.5,
        pb: 5,
        border: `1px solid ${theme.palette.grey[300]}`,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.15)',
        borderRadius: '10px',
      }}
    >
      <Stack
        flexDirection={'row'}
        sx={{
          marginX: 2,
          justifyContent: isMobile ? 'flex-start' : 'space-between',
          mb: 2,
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <Stack flexDirection="row" alignItems="center">
          <Typography variant="subtitle1">{title}</Typography>
          <IconButton
            sx={{ ml: 1 }}
            onClick={() => {
              getRecentTransactions();
            }}
          >
            <SyncIcon />
          </IconButton>
        </Stack>
        <Stack>
          <Tabs
            sx={{
              ml: 1,
              mb: 1,
              '& .MuiTabs-scroller': {
                borderBottom: '2px solid #ecebeb',
              },
              '& .MuiButtonBase-root': {
                color: '#a6a6a6',
              },
            }}
            value={selected}
            onChange={(event, newValue) => {
              setSelected(newValue);
            }}
            indicatorColor="primary"
          >
            {map(recentTransaction, (_tab) => {
              return <Tab value={get(_tab, 'value')} label={get(_tab, 'label')} />;
            })}
          </Tabs>
        </Stack>
      </Stack>
      {loading ? (
        <TransactionSkeletonLoader />
      ) : (
        <TableContainer
          sx={{
            overflow: 'auto',
            minWidth: '100%',
            maxHeight: 300,
            minHeight: 280,
          }}
        >
          <Table stickyHeader sx={{ overflow: 'auto', pb: 5 }}>
            <TableHead sx={{ pb: 2 }}>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'white', px: 2 }} align="left">
                  Order
                </TableCell>
                {isCompleted ? (
                  <TableCell sx={{ backgroundColor: 'white', px: 0 }} align="left">
                    Date
                  </TableCell>
                ) : (
                  ''
                )}
                <TableCell sx={{ backgroundColor: 'white', px: 1 }} align="left">
                  Order Amount
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {map(tableData, (row) => (
                <LiveTransactionRow key={row.orderId} row={row} isCompleted={isCompleted} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

function LiveTransactionRow({ row, isCompleted }) {
  console.log('rowwww', row?.date);
  return (
    <TableRow sx={{ py: 2 }}>
      <TableCell sx={{ px: 2 }}>
        <Box>
          <Typography variant="subtitle2">{`Order #${get(row, 'orderId')}`}</Typography>
          <Chip
            label={startCase(get(row, 'status')?.toLowerCase())}
            sx={{
              height: '17px',
              fontSize: '10px',
              width: 80,
            }}
            color={statusColor(get(row, 'status'))}
          />
        </Box>
      </TableCell>

      {isCompleted ? (
        <TableCell sx={{ px: 0, pt: '10px' }} align="left">
          {get(row, 'date') || '-'}
        </TableCell>
      ) : (
        ''
      )}

      <TableCell sx={{ px: 1 }} align="left">
        {fCurrency(get(row, 'orderAmount'))}
      </TableCell>
    </TableRow>
  );
}
