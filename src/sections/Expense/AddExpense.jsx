import {
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { isEmpty, map, get } from 'lodash';
import React, { useEffect, useState } from 'react';
import FormProvider from 'src/components/FormProvider';
import { RHFAutocompleteObjOptions, RHFSelect, RHFTextField } from 'src/components/hook-form';
import RHFDatePicker from 'src/components/hook-form/RHFDatePicker';
import {
  hideScrollbar,
  PaymentModeTypeConstants,
  REQUIRED_CONSTANTS,
  VALIDATE_CONSTANTS,
} from 'src/constants/AppConstants';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import CloseIcon from '@mui/icons-material/Close';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import PRODUCTS_API from 'src/services/products';
import { currentStoreId, currentTerminalId } from 'src/global/recoilState';
import { useRecoilValue } from 'recoil';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from 'src/routes/paths';


const AddExpense = ({
  isOpenAddExpenseDrawer,
  setIsOpenAddExpenseDrawer,
  handleAddExpense,
  expense,
  expenseItemList,
  categoryList,
}) => {
  const theme = useTheme();

  const [expenseDate, setExpenseDate] = useState(dayjs());
  const [expenseCategory, setExpenseCategory] = useState([]);

  const isMobile = useMediaQuery('(max-width:600px)');

  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [countersList, setCountersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigationPage = useNavigate();

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

  const getExpenseCategory = async () => {
    if (currentStore && currentTerminal) {
      try {
        const responseCategoryCodes = await PRODUCTS_API.getExpenseCategory();
        setExpenseCategory(responseCategoryCodes?.data);
      } catch (err) {
        toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      }
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal) getProductCounterList();
  }, [currentStore, currentTerminal]);
  
  useEffect(() => {
    if (currentStore && currentTerminal) getExpenseCategory();
  }, [currentStore, currentTerminal]);

  const RegisterSchema = Yup.object().shape({
    name: Yup.object().shape({
      label: Yup.string().required(REQUIRED_CONSTANTS.NAME),
      id: Yup.string(),
    }),
    amountSpent: Yup.number()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .test('Is positive?', VALIDATE_CONSTANTS.PRICE_NOT_ZERO, (value) => value > 0)
      .required(REQUIRED_CONSTANTS.AMOUNT),

    additionalInfo: Yup.string().max(200, VALIDATE_CONSTANTS.INFO_MAX_30_CHAR),
    category: Yup.string().required(REQUIRED_CONSTANTS.CATEGORY),
    paymentType: Yup.string().required(REQUIRED_CONSTANTS.PAYMENT_TYPE),
  });

  const defaultValues = {
    name: { label: '', id: '' },
    category: '',
    amountSpent: '',
    id: '',
    additionalInfo: '',
    dateAndTime: '',
    counterId: { label: '', id: '' },
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const options = { ...data, expenseDate };

      handleAddExpense(options, reset, defaultValues);
    } catch (error) {
      setError('afterSubmit', ErrorConstants.SOMETHING_WRONG);
    }
  };

  return (
    <Drawer
      anchor={'right'}
      open={isOpenAddExpenseDrawer}
      PaperProps={{ sx: { width: isMobile ? '85%' : isTab ? '60%' : '30%', ...hideScrollbar } }}
    >
      <Box p={2} className="expenseStep2">
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack
            flexDirection={'row'}
            sx={{
              justifyContent: 'space-between',
              m: 1,
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              mb: 3,
            }}
          >
            <Typography variant="h6">Add Expense</Typography>
            <Stack flexDirection="row" gap={2} alignItems="center">
              <Stack flexDirection={'row'}>
                <Tooltip title="Close">
                  <IconButton
                    sx={{ color: theme.palette.primary.main, height: 40 }}
                    onClick={() => setIsOpenAddExpenseDrawer(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
          <Stack flexDirection={'row'}>
            <Stack flexDirection={'column'} sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ '& .MuiTextField-root': { width: '100%' } }}>
                  {/* <RHFDatePicker name="expenseDate" label={'Select Date'} /> */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker', 'DatePicker']}>
                      <DateTimePicker
                        format="DD-MM-YY hh:mm A"
                        label="Select expense date and time"
                        value={expenseDate}
                        onChange={(newValue) => setExpenseDate(newValue)}
                        name="dateAndTime"
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  {/* issue in date to be fix */}
                  <RHFAutocompleteObjOptions
                    name="name"
                    variant="outlined"
                    label="Expense name"
                    helperText={'Expense Name required'}
                    options={expenseItemList}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack flexDirection={'row'} gap={2}><RHFSelect name="category" variant="outlined" label="Category" fullWidth>
                    {map(expenseCategory, (e) => (
                      <MenuItem value={get(e, 'categoryName')}>
                        {get(e, 'categoryName')}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                  
                  {isEmpty(expenseCategory) && 
                  <IconButton
                    sx={{ color: theme.palette.primary.main}}
                    onClick={() =>  navigationPage(PATH_DASHBOARD.purchases.category, { replace: true })}
                  >
                    <AddBoxIcon  sx={{ fontSize: '2rem', cursor: 'pointer' }} />
                  </IconButton>}

                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <RHFSelect name="paymentType" variant="outlined" label="Payment Type" fullWidth>
                    {map(PaymentModeTypeConstants, (e) => (
                      <MenuItem value={e}>{e}</MenuItem>
                    ))}
                  </RHFSelect>
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField
                    name="amountSpent"
                    variant="outlined"
                    label="Expense Amount ( ₹ )"
                    helperText={'Expense Amount Required'}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField
                    fullWidth
                    name="additionalInfo"
                    variant="outlined"
                    label="Additional Info"
                  />
                </Grid>
                <Grid item xs={12}>
                  {/* <RHFAutocompleteObjOptions
                  name="counterId"
                  variant="outlined"
                  freeSolo={false}
                  label="Select counter"
                  fullWidth
                  options={map(countersList, (e) => {
                    return { label: get(e, 'name'), id: get(e, 'counterId') };
                  })}
                /> */}
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
              </Grid>
            </Stack>
          </Stack>
          <Stack mt={2}>
            <Button
              size="small"
              sx={{
                py: 3.4,
                px: 5,
                mb: 1,
                backgroundColor: theme.palette.primary.main,
              }}
              type="submit"
              variant="contained"
            >
              Save
            </Button>
          </Stack>
        </FormProvider>
      </Box>
    </Drawer>
  );
};

export default AddExpense;
