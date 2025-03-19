import AddIcon from '@mui/icons-material/Add';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {
  Box,
  Button,
  Dialog,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  TablePagination,
} from '@mui/material';
import { currentStoreId, stores } from 'src/global/recoilState';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import useMediaQuery from '@mui/material/useMediaQuery';
import dayjs from 'dayjs';
import { compact, find, get, isEmpty } from 'lodash';
import map from 'lodash/map';
import moment from 'moment';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router';
import { useRecoilValue } from 'recoil';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { createExpensesTourConfig, expensesTourConfig } from 'src/constants/TourConstants';
import { isTourOpenState } from 'src/global/recoilState';
import ExpenseServices from 'src/services/API/ExpenseServices';
import PRODUCTS_API from 'src/services/products';
import AddExpense from './AddExpense';
import ExpenseTableRow from './ExpenseTableRow';
import HandleExpenseDrawer from './HandleExpenseDrawer';

export default function ExpenseTable({
  expense,
  getExpense,
  totalExpenses,
  paginationData,
  setPaginationData,
}) {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [expenseItemList, setExpenseItemList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newExpense, setNewExpense] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState('');
  const isTourOpen = useRecoilValue(isTourOpenState);
  const currentStore = useRecoilValue(currentStoreId);
  const location = useLocation();

  const storesList = useRecoilValue(stores);

  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);
  const [isOpenAddExpenseDrawer, setIsOpenAddExpenseDrawer] = useState(false);

  useEffect(() => {
    if (location?.state?.isDrawerOpen) {
      setIsOpenAddExpenseDrawer(true);
    }
  }, [location]);
  const handlePageChange = (event, newPage) => {
    setPaginationData((prev) => ({ ...prev, page: newPage + 1 }));
    getExpense();
  };

  const handleOnRowsPerPageChange = (event) => {
    setPaginationData({ page: 1, size: parseInt(event.target.value, 10) });
    getExpense();
  };

  const handleEdit = (e) => {
    setCurrentExpenseId(e);
    setOpenEdit(true);
  };
  const handleOpenNewExpense = () => {
    setOpenEdit(true);
    setNewExpense(true);
  };
  const getExpenseById = (expenseId) => {
    const expenseData = find(expense, (e) => e.expenseId === expenseId);
    return expenseData;
  };
  const handleDelete = async (expenseId) => {
    try {
      const response = await PRODUCTS_API.deleteExpense(expenseId);
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        getExpense();
        setCurrentExpenseId('');
        handleCloseDeleteDrawer();
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_DELETE);
    }
  };
  const handleCloseDeleteDrawer = () => {
    setCurrentExpenseId('');
    setOpen(false);
  };
  const handleOpenDeleteDrawer = (id) => {
    setCurrentExpenseId(id);
    setOpen(true);
  };
  const handleCloseDrawer = () => {
    setOpenEdit(false);
    setNewExpense(false);
  };
 
  const handleAddExpense = async (options, reset, defaultValues) => {
    try {
      const formatOptions = {    
        name: get(options, 'name.label', '').trim(),
        amountSpent: get(options, 'amountSpent', 0) * 100,
        date: dayjs(get(options, 'expenseDate')),
        additionalInfo: get(options, 'additionalInfo', '').trim(),
        category: get(options, 'category', '').trim(),
        paymentType: get(options, 'paymentType', '').trim(),
        counterId: get(options, 'counterId.id', '').trim(),
      };
      const response = await PRODUCTS_API.addExpenses(formatOptions);
      if (get(response, 'data')) {
        reset({ ...defaultValues, expenseDate: new Date(get(options, 'expenseDate')) });
        toast.success(SuccessConstants.EXPENSE_ADDED);
        getExpense();
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_ADD);
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
  const getCategoryList = async () => {
    try {
      const response = await ExpenseServices.getCategoryList();
      const formatItemList = map(compact(get(response, 'data')), (_item) => {
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
    if (!isEmpty(expense)) {
      getExpenseItemList();
      getCategoryList();
    }
  }, [expense, storeName]);

  const theme = useTheme();
  const headers = ['Date', 'Expense', 'Category', 'Payment Type','Counter Name', 'Price(₹)', 'Created On', 'Info'];

  useEffect(() => {
    if (location?.state?.isDrawerOpen) {
      setIsOpenAddExpenseDrawer(true);
    }
  }, [location]);

  return (
    <>
      <Box className="expenseStep1">
        {isEmpty(expense) && (
          <Tooltip title="Click to add new expenses">
            <Stack
              direction={'column'}
              onClick={() => handleOpenNewExpense()}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                cursor: 'pointer',
                alignItems: 'center',
                border: `1.5px dotted ${theme.palette.primary.main}`,
                padding: 2,
                borderRadius: 2,
                '&:hover': { backgroundColor: alpha(theme.palette.primary.lighter, 0.4) },
              }}
            >
              <Stack className="createExpenseStep1" sx={{ alignItems: 'center' }}>
                <AddCircleIcon fontSize="large" sx={{ mr: 1 }} />
                <Typography noWrap variant="h6">
                  Create new expense
                </Typography>
              </Stack>
            </Stack>
          </Tooltip>
        )}
        <Card sx={{ m: 2 }}>
          <CardHeader
            className="customerStep1"
            title="Recent expenses"
            sx={{ mb: 3, px: !isMobile ? 2 : null, pl: isMobile ? 2 : null }}
            action={
              isMobile ? (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'lightgray',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onClick={() => setIsOpenAddExpenseDrawer(true)}
                >
                  <AddIcon color="primary" />
                </Box>
              ) : (
                <Button
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => setIsOpenAddExpenseDrawer(true)}
                >
                  New expense
                </Button>
              )
            }
          />
          <TableContainer sx={{ height: isMobile ? 630 : 550 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {map(headers, (e, index) => (
                    <TableCell
                      key={index} 
                      style={{
                        color: theme.palette.primary.main,
                        minWidth: index === 4 ? 150 : index === 0 || index === 5 ? 250 : 186,
                      }}
                    >
                      {e}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ color: theme.palette.primary.main }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {map(expense, (row, index) => (
                  <ExpenseTableRow
                    key={index} // Ensure a key for each row
                    row={row}
                    handleOpenDeleteDrawer={handleOpenDeleteDrawer}
                    handleEdit={handleEdit}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalExpenses}
            rowsPerPage={paginationData.size}
            page={paginationData.page - 1}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleOnRowsPerPageChange}
          />
        </Card>

        <Dialog open={open}>
          <Paper
            sx={{
              p: 2,
            }}
          >
            <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
              Are you sure you want to delete this expense? This action cannot be undone.
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpen(false)} sx={{ mr: 2 }} variant="text">
                Cancel
              </Button>
              <Button onClick={() => handleDelete(currentExpenseId)} variant="contained">
                Delete
              </Button>
            </div>
          </Paper>
        </Dialog>
        <HandleExpenseDrawer
          expense={getExpenseById(currentExpenseId)}
          openDrawer={openEdit}
          newExpense={newExpense}
          handleCloseDrawer={handleCloseDrawer}
          handleDelete={handleDelete}
          getExpenseDashboard={getExpense}
        />
        <AddExpense
          isOpenAddExpenseDrawer={isOpenAddExpenseDrawer}
          setIsOpenAddExpenseDrawer={setIsOpenAddExpenseDrawer}
          handleAddExpense={handleAddExpense}
          expense={expense}
          expenseItemList={expenseItemList}
          categoryList={categoryList}
        />
        {isTourOpen && (
          <TakeATourWithJoy
            config={!isEmpty(expense) ? expensesTourConfig : createExpensesTourConfig}
          />
        )}
      </Box>
    </>
  );
}
