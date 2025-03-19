import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Stack,
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
  Autocomplete,
  TextField,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import Box from '@mui/material/Box';
import { get, isEmpty, map, reduce, remove, some } from 'lodash';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import CustomerView from 'src/components/CustomerView';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import RouterConstants from 'src/constants/RouterConstants';
import { CustomerInfoTourConfig, CustomerTourConfig } from 'src/constants/TourConstants';
import { SelectedSection } from 'src/global/SettingsState';
import {
  alertDialogInformationState,
  allConfiguration,
  currentStoreId,
  currentTerminalId,
  isTourOpenState,
} from 'src/global/recoilState';
import AddCustomer from 'src/sections/Customer/AddCustomer';
import SettingServices from 'src/services/API/SettingServices';
import {
  BILLS_STATUS_CONSTANTS,
  ORDERS_STATUS_CONSTANTS,
  PURCHASE_ORDERS_TABS,
  SettingsSections,
} from 'src/constants/AppConstants';
import Label from 'src/components/label';
import { PATH_DASHBOARD } from 'src/routes/paths';
import VendorServices from 'src/services/API/VendorServices';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import VendorView from 'src/sections/Vendors/VendorView';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import ViewPurchaseOrder from 'src/sections/PurchaseOrders/ViewPurchaseOrder';
import { Icon } from '@iconify/react';
import { fDatesWithTimeStamp, fDatesWithTimeStampWithDayjs } from 'src/utils/formatTime';
import statusColor, { purchaseOrderStatusColor } from 'src/utils/statusColor';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import KebabMenu from 'src/components/KebabMenu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const ViewPurchaseBills = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const [allPurchaseOrderList, setAllPurchaseOrderList] = useState([]);
  const [totalPurchaseOrders, setTotalPurchaseOrders] = useState(0);
  const [paginationData, setPaginationData] = useState({
    size: 10,
    page: 1,
  });
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [selectedStatusList, setSelectedStatusList] = useState([]);
  const [openMenu, setOpenMenuActions] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  function handlePageChange(event, newPage) {
    setPaginationData((prev) => ({ ...prev, page: newPage + 1 }));
  }

  function handleOnRowsPerPageChange(event, data) {
    setPaginationData({ page: 1, size: data.props.value });
  }

  const handleEditPurchaseOrder = (referenceId) => {
    navigate(`${PATH_DASHBOARD.purchases.editPurchaseOrder}/${referenceId}`);
  };

  const renderHeading = (
    <Stack direction="row" alignItems="center" spacing={1}>
      {/* <Typography variant="h6">Purchase Order</Typography>
      <Label variant="soft" color="success">
        {totalPurchaseOrders}
      </Label> */}
    </Stack>
  );

  const getAllPurchaseOrders = async (newPaginationData, isLoading) => {
    if (isLoading) {
      setIsLoading(true);
    }
    try {
      const ApiCall = PurchaseOrderServices.getAllPurchaseBills;

      const response = await ApiCall(
        {
          size: get(newPaginationData || paginationData, 'size'),
          page: get(newPaginationData || paginationData, 'page'),
        },
        map(selectedStatusList, (e) => e?.id)
      );
      setAllPurchaseOrderList(get(response, 'data.data', []));
      setTotalPurchaseOrders(get(response, 'data.totalItems') || 0);
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal) {
      getAllPurchaseOrders();
    }
  }, [currentStore, currentTerminal, paginationData]);

  const refetchData = () => {
    setPaginationData({ size: 10, page: 1 });
  };

  useEffect(() => {
    refetchData();
  }, []);

  const handleDeleteOrder = async (referenceId) => {
    try {
      await PurchaseOrderServices.deletePurchase({
        referenceId,
      });
      toast.success(SuccessConstants.PURCHASE_ORDER_DELETED_SUCCESSFULLY);
      getAllPurchaseOrders();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleDeleteOrderWithAlert = (referenceId) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to clear ?`,
      actions: {
        primary: {
          text: 'Clear',
          onClick: async (onClose) => {
            handleDeleteOrder(referenceId);
            onClose();
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

  const sumPaidAmount = (data) => {
    console.log('data', data);
    const sum = reduce(
      get(data, 'purchaseBills'),
      function (previousValue, current) {
        return previousValue + (get(current, 'paidAmount') || 0);
      },
      0
    );
    return sum;
  };

  const BillsTableData = [
    {
      label: 'Purchase ID',
      field: 'purchaseId',
      align: 'left',
      minWidth: 120,
    },
    {
      label: 'Date',
      field: 'date',
      align: 'left',
      renderData: (data) => {
        return fDatesWithTimeStampWithDayjs(get(data, 'updatedAt'));
      },
      minWidth: 180,
    },
    {
      label: 'Status',
      field: 'status',
      align: 'left',
      renderData: (data) => {
        return (
          <Chip
            size="small"
            sx={{
              ml: 0.5,
              fontSize: '11px',
              fontWeight: 800,
              '&.MuiChip-root': { borderRadius: '4px' },
              backgroundColor: purchaseOrderStatusColor(get(data, 'status'))?.bgColor,
              color: purchaseOrderStatusColor(get(data, 'status'))?.color,
            }}
            label={`${get(data, 'status') || 'Status not found'}`}
          />
        );
      },
      minWidth: 100,
    },
    {
      label: 'Order Amount (₹)',
      field: 'amount',
      align: 'left',
      renderData: (data) => {
        return toFixedIfNecessary(get(data, 'amount') / 100, 2);
      },
      minWidth: 150,
    },
    {
      label: 'Paid Total (₹)',
      field: 'paidTotal',
      align: 'left',
      renderData: (data) => {
        return toFixedIfNecessary(sumPaidAmount(data) / 100, 2);
      },
      minWidth: 130,
    },
    {
      label: 'Payables (₹)',
      field: 'payableAmount',
      align: 'left',
      renderData: (data) => {
        return toFixedIfNecessary((get(data, 'amount') - sumPaidAmount(data)) / 100, 2);
      },
      minWidth: 130,
    },
    {
      label: 'Reference ID',
      field: 'referenceId',
      align: 'left',
      minWidth: 100,
    },
    {
      label: '',
      field: '',
      align: 'left',
      renderData: (data) => {
        return (
          <IconButton
            onClick={() => {
              navigate(
                `${PATH_DASHBOARD.purchases.viewPurchaseOrdersDetails}/${get(data, 'referenceId')}`,
                {
                  state: { flow: 'bills' },
                }
              );
            }}
          >
            <KeyboardDoubleArrowRightIcon
              sx={{
                color: theme.palette.primary.main,
              }}
            />
          </IconButton>
        );
      },
      minWidth: 100,
      sticky: true,
    },
  ];

  const tableData = BillsTableData;

  const statusList = BILLS_STATUS_CONSTANTS;

  const checkCurrentStatusList = (status) => {
    const data = some(selectedStatusList, (e) => e.id === status);
    return data;
  };

  const handleChangeStatus = (e) => {
    setPaginationData({ size: 10, page: 1 });
    setSelectedStatusList(e);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <Card sx={{ m: 2 }}>
      <CardHeader
        title={
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
            <Autocomplete
              multiple
              size="small"
              filterSelectedOptions
              options={map(statusList, (value) => ({
                label: value,
                id: value,
              }))}
              value={selectedStatusList}
              getOptionDisabled={(option) => checkCurrentStatusList(option.id)}
              onChange={(event, newValue) => handleChangeStatus(newValue)}
              // sx={{ minWidth: 150, width: '50%', flexWrap: 'nowrap' }}
              sx={{ width: isMobile ? '10rem' : '12rem' }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter(option =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderInput={(params) => <TextField variant="filled" {...params} label={'Status'} />}
              ListboxProps={{
                sx: {
                  padding: 1, 
                  margin: 0, 
                  '& .MuiAutocomplete-option': {
                    minHeight: '30px', 
                    padding: '4px 10px',
                  },
                },
              }}
            />
          </Stack>
        }
        sx={{ mb: 2, px: !isMobile ? 2 : null, pl: isMobile ? 2 : null }}
      />
      <TableContainer sx={{ height: isMobile ? 630 : 550 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {map(tableData, (_item) => {
                return (
                  <TableCell
                    align={get(_item, 'align')}
                    sx={{
                      minWidth: get(_item, 'minWidth'),
                      position: get(_item, 'sticky') ? 'sticky' : 'static',
                      right: 0,
                      zIndex: 99,
                      backgroundColor: 'white',
                    }}
                  >
                    {get(_item, 'label')}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {map(allPurchaseOrderList, (_purchaseOrder) => (
              <ViewPurchaseOrder
                _item={_purchaseOrder}
                refetchData={refetchData}
                tableData={tableData}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        labelRowsPerPage=""
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalPurchaseOrders}
        rowsPerPage={get(paginationData, 'size')}
        page={get(paginationData, 'page') - 1}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleOnRowsPerPageChange}
      />
    </Card>
  );
};

export default ViewPurchaseBills;
