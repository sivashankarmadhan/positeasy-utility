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
  Typography,
} from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { compact, get, isEqual, isObject, map } from 'lodash';
import { useEffect, useState } from 'react';
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
import ExpenseDrawerHeader from './ExpenseDrawerHeader';
import { LoadingButton } from '@mui/lab';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRecoilValue } from 'recoil';
import { currentStoreId, currentTerminalId } from 'src/global/recoilState';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function HandleExpenseDrawer({
  openDrawer,
  handleCloseDrawer,
  expense,
  handleDelete,
  newExpense,
  getExpenseDashboard,
}) {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [expenseDate, setExpenseDate] = useState(dayjs());
  const [expenseCategory, setExpenseCategory] = useState([]);

  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;
  const [countersList, setCountersList] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expenseItemList, setExpenseItemList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const RegisterSchema = Yup.object().shape({
    name: Yup.object().shape({
      label: Yup.string().required(REQUIRED_CONSTANTS.NAME),
      id: Yup.string(),
    }),
    amountSpent: Yup.number()
      .required(REQUIRED_CONSTANTS.AMOUNT)
      .transform((value) => (Number.isNaN(value) ? null : value))
      .test('Is positive?', VALIDATE_CONSTANTS.PRICE_NOT_ZERO, (value) => value > 0),
    additionalInfo: Yup.string().max(200, VALIDATE_CONSTANTS.INFO_MAX_30_CHAR),
    category: Yup.string().required(REQUIRED_CONSTANTS.CATEGORY),
    paymentType: Yup.string().required(REQUIRED_CONSTANTS.PAYMENT_TYPE),
  });

  const defaultValues = {
    name: { label: '', id: '' },
    category: { label: '', id: '' },
    amountSpent: '',
    id: '',
    additionalInfo: '',
    paymentType: '',
    counterId: { label: '', id: '' },
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });
  const { reset, setError, handleSubmit } = methods;
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (newExpense) {
        handleAddExpense(data);
      } else {
        handleUpdateExpense(data);
      }
    } catch (error) {
      setError('afterSubmit', 'Something Went Wrong');
    }
  };
  const handleAddExpense = async (options) => {
    try {
      const formatOptions = {
        name: get(options, 'name.label'),
        amountSpent: get(options, 'amountSpent') * 100,
        date: dayjs(expenseDate),
        additionalInfo: get(options, 'additionalInfo'),
        category: get(options, 'category.label'),
        paymentType: get(options, 'paymentType'),
        counterId: get(options, 'counterId.id'),
      };

      const response = await PRODUCTS_API.addExpenses(formatOptions);
      if (get(response, 'data')) {
        toast.success(SuccessConstants.EXPENSE_ADDED);
        setIsLoading(false);
        handleCloseDrawer();
        reset();
        getExpenseDashboard();
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_ADD);
    }
  };

  const handleUpdateExpense = async (data) => {
    const options = {
      name: get(data, 'name.label'),
      amountSpent: Number(get(data, 'amountSpent')) * 100,
      additionalInfo: get(data, 'additionalInfo'),
      category: get(data, 'category'),
      paymentType: get(data, 'paymentType'),
      expenseId: get(expense, 'expenseId'),
      counterId: get(data, 'counterId.id'),
    };
    const obj1 = {
      name: get(expense, 'name'),
      amountSpent: get(expense, 'amountSpent'),
      additionalInfo: get(expense, 'additionalInfo'),
      category: get(expense, 'category'),
      paymentType: get(expense, 'paymentType'),
      counterId: get(expense, 'counterId.id'),
    };
    const obj2 = options;

    var newObj = {};
    Object.keys(obj2).forEach((key) => {
      if (isObject(obj2[key])) {
        if (!isEqual(obj1[key], obj2[key])) {
          newObj[key] = obj2[key];
        }
      } else if (obj1[key] !== obj2[key]) {
        newObj[key] = obj2[key];
      }
    });
    try {
      let istDate = dayjs
        .utc(dayjs(expenseDate))
        .tz('Asia/Kolkata')
        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

      const response = await PRODUCTS_API.updateExpense({
        ...newObj,
        dateTz: istDate,
      });
      if (response) {
        toast.success(SuccessConstants.EXPENSE_UPDATED);
        setIsLoading(false);
        handleCloseDrawer();
        reset();
        getExpenseDashboard();
      }
    } catch (e) {
      console.log('eeeee', e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
      setIsLoading(false);
    }
  };
  const getExpenseItemList = async () => {
    try {
      const itemList = await ExpenseServices.getExpenseItemList();
      const formatItemList = map(compact(get(itemList, 'data')), (_item) => {
        return {
          label: _item,
          id: _item,
        };
      });
      setExpenseItemList(formatItemList);
    } catch (error) {
      toast.error(error?.errorResponse?.message ?? ErrorConstants.SOMETHING_WRONG);
    }
  };
  const getProductCounterList = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;

    try {
      setLoading(true);
      const response = await PRODUCTS_API.getProductCounterList(currentStore);
      if (response) setCountersList(response.data);
    } catch (e) {
      console.log(e);
      setCountersList([]);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal) getProductCounterList();
  }, [currentStore, currentTerminal]);
  const getCategoryList = async () => {
    try {
      const response = await ExpenseServices.getCategoryList();
      const formatItemList = map(get(response, 'data'), (_item) => {
        return {
          label: _item,
          id: _item,
        };
      });
      setCategoryList(formatItemList);
    } catch (error) {
      toast.error(error?.errorResponse?.message ?? ErrorConstants.SOMETHING_WRONG);
    }
  };
  useEffect(() => {
    if (open) {
      getExpenseItemList();
      getCategoryList();
    }
  }, [open]);

  useEffect(() => {
    if (expense) {
      reset({
        name: {
          label: get(expense, 'name'),
          id: get(expense, 'name'),
        },
        category: expense.category,
        amountSpent: expense.amountSpent / 100,
        additionalInfo: expense.additionalInfo ? expense.additionalInfo : '',
        paymentType: expense.paymentType,
        counterId: expense.counterName,
      });

      setExpenseDate(
        dayjs(
          `${get(expense, 'dateTz')?.split?.('T')?.[0]} ${
            get(expense, 'dateTz')?.split?.('T')[1]?.split?.('.')?.[0]
          }`
        )
      );
    }
  }, [expense]);

  const getExpenseCategory = async () => {
    if (currentStore && currentTerminal) {
      try {
        const responseCategoryCodes = await PRODUCTS_API.getExpenseCategory();
        setExpenseCategory(responseCategoryCodes?.data);
      } catch (err) {
        toast.error(err?.errorResponse?.message ?? ErrorConstants.SOMETHING_WRONG);
      }
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal) getExpenseCategory();
  }, [currentStore, currentTerminal]);

  if (isLoading) return <LoadingScreen />;
  return (
    <Drawer
      anchor={'right'}
      open={openDrawer}
      PaperProps={{ sx: { width: isMobile ? '85%' : isTab ? '60%' : '30%', ...hideScrollbar } }}
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <ExpenseDrawerHeader
          editMode={editMode}
          newExpense={newExpense}
          setEditMode={setEditMode}
          handleCloseDrawer={handleCloseDrawer}
        />
        <Grid
          container
          spacing={2}
          sx={{
            mt: 1,
            width: '95%',
            mx: 'auto',
            ml: 1,
          }}
        >
          <Grid item xs={12} sx={{ '& .MuiTextField-root': { width: '100%' } }}>
            {/* <RHFDatePicker name="expenseDate" /> */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker', 'DatePicker']}>
                <DateTimePicker
                  format="YY-MM-DD hh:mm A"
                  label="Select expense date and time"
                  value={expenseDate}
                  onChange={(newValue) => setExpenseDate(newValue)}
                  // disabled
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <RHFAutocompleteObjOptions
              name="name"
              variant="outlined"
              label="Enter Expense name"
              fullWidth
              options={expenseItemList}
            />
          </Grid>
          <Grid item xs={12}>
            <RHFSelect name="category" variant="outlined" label="Category" fullWidth>
              {map(expenseCategory, (e) => (
                <MenuItem value={get(e, 'categoryName')}>{get(e, 'categoryName')}</MenuItem>
              ))}
            </RHFSelect>
          </Grid>
          <Grid item xs={12} lg={12}>
            <RHFTextField
              name="amountSpent"
              variant="outlined"
              label="Enter Price "
              fullWidth
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupeeIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <RHFSelect name="paymentType" variant="outlined" label="Select Payment Type" fullWidth>
              {map(PaymentModeTypeConstants, (e) => (
                <MenuItem value={e}>{e}</MenuItem>
              ))}
            </RHFSelect>
          </Grid>
          <Grid item xs={12} lg={12}>
            <RHFTextField
              fullWidth
              name="additionalInfo"
              variant="outlined"
              label="Enter Additional Info"
            />
          </Grid>
          <Grid item xs={12} lg={12}>
            <RHFAutocompleteObjOptions
              name="counterId"
              variant="outlined"
              label="Select counter"
              fullWidth
              options={map(countersList, (e) => ({
                label: get(e, 'name'),
                id: get(e, 'counterId'),
              }))}
              disableClearable
              freeSolo={false}
              filterOptions={(options, state) =>
                options.filter((option) =>
                  option.label.toLowerCase().includes(state.inputValue.toLowerCase())
                )
              }
            />
          </Grid>
          <Grid item xs={12} lg={12}>
            <LoadingButton fullWidth loading={isLoading} type="submit" variant="contained">
              {!newExpense ? 'Update item' : 'Add item'}
            </LoadingButton>
          </Grid>{' '}
        </Grid>
      </FormProvider>

      <Dialog open={open}>
        <Card sx={{ p: 2, minHeight: 100 }}>
          <Typography sx={{ mb: 2, fontWeight: 'bold' }}>Are you sure want to Delete?</Typography>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpen(false)} sx={{ mr: 2 }} variant="text">
              Cancel
            </Button>
            <Button onClick={() => console.log} variant="contained">
              Delete
            </Button>
          </div>
        </Card>
      </Dialog>
    </Drawer>
  );
}
