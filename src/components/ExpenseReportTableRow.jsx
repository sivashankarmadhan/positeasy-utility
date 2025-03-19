import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Dialog,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { get, isEmpty } from 'lodash';
import { useState } from 'react';

import toast from 'react-hot-toast';
import PRODUCTS_API from 'src/services/products';
import HandleExpenseDrawer from '../sections/Expense/HandleExpenseDrawer';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KebabMenu from 'src/components/KebabMenu';

export default function ExpenseReportTableRow({ row, index, getExpenseDashboard }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState('');

  const [openMenu, setOpenMenuActions] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const handleOpenDeleteDrawer = (id) => {
    setCurrentExpenseId(id);
    setOpenDelete(true);
  };

  const handleCloseDeleteDrawer = () => {
    setOpenDelete(false);
    setCurrentExpenseId('');
  };

  const handleEdit = () => {
    setOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await PRODUCTS_API.deleteExpense(currentExpenseId);
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        getExpenseDashboard();
        handleCloseDeleteDrawer();
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_DELETE);
    }
  };
  const handleCloseDrawer = () => {
    setOpen(false);
  };

  return (
    <>
      {!isEmpty(row) && (
        <>
          <TableRow key={row.expenseId}>
            <TableCell align="left"> {row.date} </TableCell>
            <TableCell align="center">{row.name}</TableCell>
            <TableCell align="center">{row.category}</TableCell>
            <TableCell align="center">{row.paymentType}</TableCell>
            <TableCell align="center">{row.amountSpent / 100}</TableCell>
            <TableCell align="center">{row.additionalInfo}</TableCell>

            <KebabMenu
              open={openMenu}
              onOpen={handleOpenMenu}
              onClose={handleCloseMenu}
              actions={
                <>
                  <Stack
                    sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                    onClick={() => {
                      handleCloseMenu();
                      handleEdit();
                    }}
                  >
                    <EditIcon sx={{ fontSize: { xs: '18px', sm: '22px' } }} />
                    Edit
                  </Stack>

                  <Divider sx={{ borderStyle: 'dashed', my: { xs: 0.5, sm: 1 } }} />

                  <Stack
                    onClick={() => {
                      handleCloseMenu();
                      handleOpenDeleteDrawer(get(row, 'expenseId'));
                    }}
                    sx={{
                      color: 'error.main',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 0.5,
                      cursor: 'pointer',
                    }}
                  >
                    <DeleteOutlineIcon
                      sx={{
                        fontSize: { xs: '18px', sm: '22px' },
                      }}
                    />
                    Delete
                  </Stack>
                </>
              }
            />
          </TableRow>
        </>
      )}
      <HandleExpenseDrawer
        expense={row}
        openDrawer={open}
        handleCloseDrawer={handleCloseDrawer}
        handleDelete={handleDelete}
        getExpenseDashboard={getExpenseDashboard}
      />
      <Dialog open={openDelete}>
        <Paper
          sx={{
            p: 2,
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
            Are you sure you want to delete this expense? This action cannot be undone.
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseDeleteDrawer} sx={{ mr: 2 }} variant="text">
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="contained">
              Delete
            </Button>
          </div>
        </Paper>
      </Dialog>
    </>
  );
}
