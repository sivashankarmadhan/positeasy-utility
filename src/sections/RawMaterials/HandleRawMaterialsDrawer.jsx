import { yupResolver } from '@hookform/resolvers/yup';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import {
  Button,
  Card,
  Dialog,
  Drawer,
  Grid,
  InputAdornment,
  MenuItem,
  useTheme,
  Typography,
  tableCellClasses,
  Stack,
  Tooltip,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableRow,
  Divider,
  TableBody,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { compact, get, isEmpty, isEqual, isObject, map } from 'lodash';
import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import FormProvider from 'src/components/FormProvider';
import { RHFAutocompleteObjOptions, RHFSelect, RHFTextField } from 'src/components/hook-form';
import RHFDatePicker from 'src/components/hook-form/RHFDatePicker';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  PaymentModeTypeConstants,
  REQUIRED_CONSTANTS,
  VALIDATE_CONSTANTS,
  hideScrollbar,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import ExpenseServices from 'src/services/API/ExpenseServices';
import PRODUCTS_API from 'src/services/products';
import * as Yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import moment from 'moment';
import { dateWithTimeFormat } from 'src/utils/formatTime';
import ExpenseDrawerHeader from '../Expense/ExpenseDrawerHeader';

export default function HandleRawMaterialsDrawer({
  openDrawer,
  handleCloseDrawer,
  expense,
  orderDetails,
}) {
  console.log('expense', expense, orderDetails);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [expenseDate, setExpenseDate] = useState(dayjs());

  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [expenseItemList, setExpenseItemList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const theme = useTheme();

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.lighter,
      color: 'white',
    },
  }));
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.primary.lighter,
      border: 0,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  if (isLoading) return <LoadingScreen />;
  return (
    <Drawer
      anchor={'right'}
      open={openDrawer}
      PaperProps={{ sx: { width: isMobile ? '85%' : isTab ? '60%' : '30%', ...hideScrollbar } }}
    >
      <Stack>
        <Stack
          flexDirection={'row'}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
            // mb: 3,
            backgroundColor: theme.palette.primary.main,
            p: 2,
            position: 'sticky',
            top: 0,
            zIndex: 999,
            width: '100%',
          }}
        >
          <Typography fontWeight={600} sx={{ color: '#fff' }}>
            Raw materials details
          </Typography>
          <Stack flexDirection={'row'} pr={0} justifyContent={'space-between'}>
            <CloseIcon
              fontSize="small"
              onClick={handleCloseDrawer}
              sx={{ cursor: 'pointer', color: '#fff' }}
            />
          </Stack>
        </Stack>
        {/* {orderDetails?.productInfo &&  */}
        <Stack p={2} gap={2}>
          <Stack flexDirection={'row'} justifyContent={'space-between'}>
            <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
              Name
            </Typography>
            <Typography sx={{ fontWeight: 700, color: 'gray' }} variant="subtitle2">
              {orderDetails?.productInfo?.name || '-'}
            </Typography>
          </Stack>
          <Stack flexDirection={'row'} justifyContent={'space-between'}>
            <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
              Category
            </Typography>
            <Typography sx={{ fontWeight: 700, color: 'gray' }} variant="subtitle2">
              {orderDetails?.productInfo?.category || '-'}
            </Typography>
          </Stack>
          <Stack flexDirection={'row'} justifyContent={'space-between'}>
            <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
              Price
            </Typography>
            <Typography sx={{ fontWeight: 700, color: 'gray' }} variant="subtitle2">
            ₹{(orderDetails?.price/100).toFixed(2) || '-'}
            </Typography>
          </Stack>
        </Stack>
        <Divider/>
        {!isEmpty(expense[0]?.rawIngredients) ? (
          <TableContainer style={{ maxWidth: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell
                    style={{ backgroundImage: 'none', color: theme.palette.primary.main }}
                  >
                    <Typography sx={{ display: 'inline', fontWeight: 700 }} variant="caption">
                      Raw material name
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell
                    style={{ backgroundImage: 'none', color: theme.palette.primary.main }}
                    align="right"
                  >
                    <Typography sx={{ display: 'inline', fontWeight: 700 }} variant="caption">
                      Quantity
                    </Typography>
                  </StyledTableCell>
                  {/* <StyledTableCell
                    style={{ backgroundImage: 'none', color: theme.palette.primary.main }}
                    align="right"
                  >
                    <Typography sx={{ display: 'inline', fontWeight: 700 }} variant="caption">
                      Category
                    </Typography>
                  </StyledTableCell> */}

                  <StyledTableCell
                    style={{ backgroundImage: 'none', color: theme.palette.primary.main }}
                    align="center"
                  >
                    <Typography sx={{ display: 'inline', fontWeight: 700 }} variant="caption">
                      Unit name
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell
                    style={{ backgroundImage: 'none', color: theme.palette.primary.main }}
                    align="center"
                  />
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {map(expense[0]?.rawIngredients, (e, index) => {
                  console.log('eeeeeeeeee', e);

                  return (
                    <>
                      <TableRow>
                        <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="left">
                          {/* {e.name && ( */}
                          <Typography sx={{ display: 'inline' }} variant="caption">
                            {e.name}
                          </Typography>
                          {/* )} */}
                        </TableCell>
                        <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                          {orderDetails?.quantity * e.quantity}
                        </TableCell>
                        {/* <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                          {e.category}
                        </TableCell> */}
                        <TableCell sx={{ lineHeight: '1.5', paddingY: '6px' }} align="center">
                          {e.unitName}
                        </TableCell>
                      </TableRow>
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Stack alignItems={'center'} height={'80vh'} justifyContent={'center'}>
            {' '}
            <Typography variant="h6">No items found</Typography>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}
