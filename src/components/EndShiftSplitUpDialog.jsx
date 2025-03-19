import { useTheme } from '@emotion/react';
import {
  Card,
  Dialog,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { get, map, reduce } from 'lodash';
import RowContent from '../sections/ReportsAndAnalytics/EndShift/RowContent';
import { toFixedIfNecessary } from '../utils/formatNumber';

import CloseIcon from '@mui/icons-material/Close';
import { find } from 'lodash';
import RowContentShift from '../sections/ReportsAndAnalytics/EndShift/RowContentShift';

const EndShiftSplitUpDialog = ({ open, handleOpen, handleClose, selectedEndShiftReport }) => {
  const theme = useTheme();

  const isMobile = useMediaQuery('(max-width:600px)');
  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;

  const myArray = ['CASH', 'UPI', 'CARD', 'SWIGGY', 'ZOMATTO', 'NOBILL', 'EXPENSE'];

  return (
    <Dialog open={open} >
      <Card sx={{ p: 2, width: { xs: 340, sm: 480 } }}>
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', mb: 1 }}
        >
          <Typography variant="h6">End shift details</Typography>

          <Stack flexDirection="row" alignItems="center" gap={1}>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack
          flexDirection="column"
          sx={{
            height: { xs: 500, lg: 550 },
            overflowY: 'auto',
            overflowX: 'auto',
            pr: 2,
            m: 0.5,
            my: 2,
          }}
        >
          <Stack>
            <Card>
              <Stack gap={1}>
                <Typography variant="subtitle1" color="primary" ml={2}>
                  Cashier
                </Typography>
                <Stack>
                  <Stack flexDirection={'row'} width="100%" justifyContent="space-between">
                    <RowContentShift
                      name="Open Cash"
                      value={get(selectedEndShiftReport, 'openingCash')}
                    />
                    <RowContentShift
                      name="Close Cash"
                      value={get(selectedEndShiftReport, 'cash')}
                    />
                  </Stack>
                  <Stack flexDirection={'row'} width="100%" justifyContent="space-between">
                    <RowContentShift name="Card" value={get(selectedEndShiftReport, 'card')} />
                    <RowContentShift name="UPI" value={get(selectedEndShiftReport, 'upi')} />
                  </Stack>
                  <Stack flexDirection={'row'} width="100%" justifyContent="space-between">
                    <RowContentShift name="Swiggy" value={get(selectedEndShiftReport, 'swiggy')} />
                    <RowContentShift name="Zomato" value={get(selectedEndShiftReport, 'zomato')} />
                  </Stack>
                  <Stack flexDirection={'row'} width="100%" justifyContent="space-between">
                    <RowContentShift name="No bill" value={get(selectedEndShiftReport, 'noBill')} />
                    <RowContentShift
                      name="Expense"
                      value={get(selectedEndShiftReport, 'shiftExpense')}
                    />
                  </Stack>
                  <Stack flexDirection={'row'} width="100%" justifyContent="space-between">
                    <RowContentShift
                      name="Total Amount"
                      value={get(selectedEndShiftReport, 'totalAmount')}
                      isBold
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          <Stack sx={{}} gap={2} my={2}>
            <Card>
              <Stack gap={1} marginTop={1}>
                <Typography variant="subtitle1" color="primary" ml={2}>
                  Billed
                </Typography>
                <Stack>
                  <Grid width={'100%'} marginLeft={0} marginTop={1.1} container spacing={2}>
                    {map(myArray, (_item) => {
                      const findData = find(get(selectedEndShiftReport, 'saleSplitUp'), (_list) => {
                        return get(_list, 'mode') === _item;
                      });
                      return <RowContentShift name={_item} value={get(findData, 'amount') || 0} />;
                    })}
                  </Grid>

                  <RowContentShift
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
            </Card>

            <Card
              sx={{
                width: {
                  xs: '100%',
                  md: '50%',
                },
              }}
            >
              <Stack gap={1} mt={2}>
                <Typography variant="subtitle1" color="primary" ml={2}>
                  Overall
                </Typography>
                <Stack>
                  {/* <RowContent
                    name="Total Sale"
                    value={get(selectedEndShiftReport, 'totalAmount')}
                  />
                  <RowContent
                    name="Total Billed"
                    value={get(selectedEndShiftReport, 'saleToday')}
                  /> */}

                  <RowContent
                    name="Difference"
                    value={get(selectedEndShiftReport, 'difference')}
                    isBold
                    color={Number(get(selectedEndShiftReport, 'difference')) > 0 ? 'green' : 'red'}
                  />
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Stack>
      </Card>
    </Dialog>
  );
};

export default EndShiftSplitUpDialog;
