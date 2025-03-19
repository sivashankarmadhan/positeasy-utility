import {
  Drawer,
  Stack,
  useTheme,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled,
  Autocomplete,
  ListItem,
  TextField,
  Card,
  Box,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery, useResponsive } from '@poriyaalar/custom-hooks';
import { hideScrollbar, PaymentStatusConstants } from 'src/constants/AppConstants';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { dateFormat, timeFormat } from 'src/utils/formatTime';
import { fCurrency } from 'src/utils/formatNumber';
import { find, get, isEmpty, map } from 'lodash';
import RowContent from './RowContent';

const PaymentInfoDrawer = ({ openViewMoreDrawer, setOpenViewMoreDrawer, paymentsInfo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');

  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;

  return (
    <Stack>
      <Drawer
        PaperProps={{
          sx: { width: isMobile ? '100%' : isTab ? '70%' : '30%', ...hideScrollbar },
        }}
        anchor="right"
        open={openViewMoreDrawer}
        onClose={() => setOpenViewMoreDrawer(false)}
        onOpen={() => setOpenViewMoreDrawer(true)}
      >
        <Stack
          sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', p: 2 }}
          flexDirection={'row'}
          pr={0}
          mb={1}
          justifyContent={'space-between'}
        >
          <Typography variant="h5" fontWeight={600}>
            Payment Details
          </Typography>
          <CloseIcon onClick={() => setOpenViewMoreDrawer(false)} sx={{ cursor: 'pointer' }} />
        </Stack>

        <Stack gap={2}>
          {map(paymentsInfo, (_item) => {
            return (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  px: 1.5,
                  py: 2.5,
                  my: 1,
                  mx: 2,
                  boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
                }}
              >
                <RowContent title="Date" value={get(_item, 'date')} />
                <RowContent title="time" value={get(_item, 'time')} />
                <RowContent title="Payment ID" value={get(_item, 'paymentId')} />
                <RowContent title="Gateway Pay ID" value={_item?.['payments.gatewayPayId']} />
                <RowContent title="Gateway Source" value={_item?.['payments.gatewaySource']} />
                <RowContent title="Payment Mode" value={_item?.['payments.mode']} />
                <RowContent title="Paid Amount" value={_item?.['payments.paidAmount']} />

                <RowContent
                  title="Payment Status"
                  value={_item?.['payments.paymentStatus']}
                  isChip
                />

                <RowContent title="Reason" value={_item?.['payments.reason']} />
              </Box>
            );
          })}
        </Stack>
      </Drawer>
    </Stack>
  );
};

export default PaymentInfoDrawer;
