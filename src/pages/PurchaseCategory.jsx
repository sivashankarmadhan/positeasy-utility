import AddIcon from '@mui/icons-material/Add';
import {
  Card,
  CardHeader,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
  MenuItem,
  Popover,
  Fab,
} from '@mui/material';
import { get, isEmpty, map } from 'lodash';
import { purchaseCategoryTableColumns, SettingsSections } from '../constants/AppConstants';
import { useEffect, useState } from 'react';
import AddPurchaseCategory from 'src/sections/PurchaseOrders/AddPurchaseCategory';
import {
  alertDialogInformationState,
  currentStoreId,
  currentTerminalId,
} from 'src/global/recoilState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import PRODUCTS_API from 'src/services/products';
import PurchaseCategoryTableBody from 'src/sections/PurchaseOrders/PurchaseCategoryTableBody';
import Iconify from 'src/components/iconify';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';

const PurchaseCategory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [isOpenAddCategoryModal, setIsOpenAddCategoryModal] = useState(false);
  let [CategoryData, setCategoryData] = useState([]);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [totalCategory, setTotalCategory] = useState('');
  const [editCategory, setEditCategory] = useState({});
  const [paginationData, setPaginationData] = useState({
    size: 10,
    page: 1,
  });

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const defaultValue = { open: false, event: {}, data: {} };
  const [open, setOpen] = useState(defaultValue);

  const handleCloseMenu = () => {
    setOpen(defaultValue);
  };

  const closeCategoryModal = () => {
    setEditCategory(null);
    setIsOpenAddCategoryModal(false);
  };

  const initialFetch = async () => {
    if (currentStore && currentTerminal) {
      try {
        const responseCategoryCodes = await PRODUCTS_API.getPurchaseCategory({
          size: get(paginationData, 'size'),
          page: get(paginationData, 'page'),
        });
        setCategoryData(responseCategoryCodes?.data?.data);
        setTotalCategory(responseCategoryCodes?.data?.totalItems);
      } catch (err) {
        toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      }
    }
  };

  function handlePageChange(event, newPage) {
    setPaginationData((prev) => ({ ...prev, page: newPage + 1 }));
  }

  function handleOnRowsPerPageChange(event, data) {
    setPaginationData({ page: 1, size: data.props.value });
  }

  const renderHeading = (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="h6">Category</Typography>
    </Stack>
  );

  useEffect(() => {
    if (currentStore && currentTerminal) {
      initialFetch();
    }
  }, [paginationData, currentStore, currentTerminal]);

  const handleItem = (data) => {
    console.log('data', data);
    setEditCategory(data);
    handleCloseMenu();
    setIsOpenAddCategoryModal(true);
  };

  const handleDelete = async (data, onClose) => {
    try {
      await PRODUCTS_API.deleteCategory(data?.categoryId);
      initialFetch();
      handleCloseMenu();
      onClose();
      toast.success(SuccessConstants.DELETED_SUCCESSFUL);
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
    }
  };

  const handleDeleteCategory = (data) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure you want to delete category?`,
      actions: {
        primary: {
          text: 'yes',
          onClick: (onClose, onLoading) => {
            handleDelete(data, onClose, onLoading);
          },
          sx: {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
            },
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          sx: {
            color: '#000',
          },
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };


  return (
    <>
      <Card sx={{ m: 2 }}>
        <Tooltip title="Add new online category">
          <Fab
            onClick={() => setIsOpenAddCategoryModal(true)}
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: 12, right: 16 }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
        <CardHeader
          className="customerStep1"
          title={renderHeading}
          sx={{ mb: 3, px: !isMobile ? 2 : null, pl: isMobile ? 2 : null }}
        />
        <TableContainer sx={{ height: 'calc(100vh - 250px)' }}>
          <Table stickyHeader>
            <TableHead sx={{ marginLeft: '4px !important' }}>
              <TableRow
                sx={{
                  '& .MuiTableCell-head': {
                    background: theme.palette.primary.lighter,
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {map(purchaseCategoryTableColumns, (headCell) => {
                  return (
                    <TableCell
                      key={headCell.id}
                      align={headCell.alignRight ? 'right' : 'left'}
                      sx={{
                        ...headCell.style,
                      }}
                    >
                      {headCell.label}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {map(CategoryData, (_category, _index) => (
                <PurchaseCategoryTableBody data={_category} setOpen={setOpen} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            '& .MuiTablePagination-actions': {
            },
          }}
          labelRowsPerPage=""
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalCategory}
          rowsPerPage={get(paginationData, 'size')}
          page={get(paginationData, 'page') - 1}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleOnRowsPerPageChange}
        />
        <Popover
          open={Boolean(get(open, 'open'))}
          anchorEl={get(open, 'eventData')}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              p: 1,
              width: 160,
              '& .MuiMenuItem-root': {
                px: 1,
                typography: 'body2',
                borderRadius: 0.75,
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleItem(get(open, 'data'));
            }}
          >
            <Iconify icon={'uil:edit'} sx={{ mr: 1, color: theme.palette.primary.main }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDeleteCategory(get(open, 'data'));
            }}
          >
            <Iconify
              icon={'fluent:delete-48-filled'}
              sx={{ mr: 1, color: theme.palette.primary.main }}
            />
            Delete
          </MenuItem>
        </Popover>
      </Card>
      {isOpenAddCategoryModal && (
        <AddPurchaseCategory
          isOpenAddCategoryModal={isOpenAddCategoryModal}
          closeCategoryModal={closeCategoryModal}
          editCategory={
            !isEmpty(editCategory)
              ? {
                  categoryName: get(editCategory, 'categoryName'),
                  categoryId: get(editCategory, 'categoryId'),
                  description: get(editCategory, 'description'),
                  image: get(editCategory, 'image'),
                }
              : null
          }
          categoryId={get(editCategory, 'categoryId')}
          initialFetch={initialFetch}
        />
      )}
    </>
  );
};

export default PurchaseCategory;
