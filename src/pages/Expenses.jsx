import { useTheme } from '@mui/material';
import { get } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { useRecoilValue } from 'recoil';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { currentStoreId, currentTerminalId } from 'src/global/recoilState';
import ExpenseTable from 'src/sections/Expense/ExpenseTable';
import PRODUCTS_API from 'src/services/products';

const Expenses = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const [expense, setExpense] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [paginationData, setPaginationData] = useState({
    size: 10,
    page: 1,
  });
  const [totalExpenses, setTotalExpenses] = useState(0);



  const getExpenseList = async () => {
    try {
      setIsLoading(true);
      const { size, page } = paginationData;
      const response = await PRODUCTS_API.getLastTenExpenses({ size, page });

      if (response) {
        setExpense(get(response, 'data.data', []));
        setTotalExpenses(get(response, 'data.totalItems', 0));
      }
    } catch (error) {
      toast.error(error?.message || error?.errorResponse?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal) getExpenseList();
  }, [currentStore, currentTerminal, paginationData]);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <ExpenseTable
        expense={expense}
        getExpense={getExpenseList}
        totalExpenses={totalExpenses}
        paginationData={paginationData}
        setPaginationData={setPaginationData}
      />
    </>
  );
};

export default Expenses;
