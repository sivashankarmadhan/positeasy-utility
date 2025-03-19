import { useTheme } from '@emotion/react';
import { Divider, Drawer, Stack, Typography, useMediaQuery } from '@mui/material';
import { capitalize, get, map, reduce } from 'lodash';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { hideScrollbar } from 'src/constants/AppConstants';
import RowContent from './RowContent';
import { toFixedIfNecessary } from 'src/utils/formatNumber';

const DrawerTransaction = ({ open, handleOpen, handleClose, selectedEndShiftReport }) => {
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
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
      >
        <Stack
          flexDirection={'row'}
          pr={0}
          justifyContent={'space-between'}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            padding: 2,
          }}
        >
          <Typography fontSize={'18px'} fontWeight={600}>
            SplitUp
          </Typography>
          <CloseIcon onClick={handleClose} sx={{ cursor: 'pointer' }} />
        </Stack>

        <Stack mt={2}>
          <Stack gap={1}>
            <Typography variant="subtitle1" color="primary" ml={2}>
              Cashier
            </Typography>
            <Stack>
              <RowContent name="Cash" value={get(selectedEndShiftReport, 'cash')} />
              <RowContent name="Card" value={get(selectedEndShiftReport, 'card')} />
              <RowContent name="UPI" value={get(selectedEndShiftReport, 'upi')} />
              <RowContent name="Swiggy" value={get(selectedEndShiftReport, 'swiggy')} />
              <RowContent name="Zomato" value={get(selectedEndShiftReport, 'zomato')} />
              <RowContent name="No bill" value={get(selectedEndShiftReport, 'noBill')} />
              <RowContent name="Expense" value={get(selectedEndShiftReport, 'shiftExpense')} />
              <RowContent
                name="Total Amount"
                value={get(selectedEndShiftReport, 'totalAmount')}
                isBold
              />
            </Stack>
          </Stack>
          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack gap={1} mt={3}>
            <Typography variant="subtitle1" color="primary" ml={2}>
              Billed
            </Typography>
            <Stack>
              {map(get(selectedEndShiftReport, 'saleSplitUp'), (_item) => {
                return (
                  <RowContent
                    name={
                      get(_item, 'mode') !== 'UPI'
                        ? capitalize(get(_item, 'mode'))
                        : get(_item, 'mode')
                    }
                    value={get(_item, 'amount')}
                  />
                );
              })}

              <RowContent
                name="Total Billed"
                value={toFixedIfNecessary(
                  reduce(
                    get(selectedEndShiftReport, 'saleSplitUp'),
                    (acc, curr) => {
                      return acc + get(curr, 'amount');
                    },
                    0
                  ),
                  2
                )}
                isBold
              />
            </Stack>
          </Stack>
          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack gap={1} mt={3}>
            <Typography variant="subtitle1" color="primary" ml={2}>
              Overall
            </Typography>
            <Stack>
              <RowContent name="Total Sale" value={get(selectedEndShiftReport, 'totalAmount')} />
              <RowContent name="Total Billed" value={get(selectedEndShiftReport, 'saleToday')} />

              <RowContent
                name="Difference"
                value={get(selectedEndShiftReport, 'difference')}
                isBold
                color={Number(get(selectedEndShiftReport, 'difference')) > 0 ? 'green' : 'red'}
              />
            </Stack>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />
        </Stack>
      </Drawer>
    </Stack>
  );
};

export default DrawerTransaction;
