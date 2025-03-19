import {
  Card,
  CardHeader,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  Autocomplete,
  TextField,
  Chip,
  Typography,
  Divider,
} from '@mui/material';
import { find, get, isEmpty, map, reduce, remove, some } from 'lodash';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  alertDialogInformationState,
  currentStoreId,
  currentTerminalId,
} from 'src/global/recoilState';
import { ORDERS_STATUS_CONSTANTS, STORE_PURCHASE_CONSTANTS } from 'src/constants/AppConstants';
import { PATH_DASHBOARD } from 'src/routes/paths';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import ViewPurchaseOrder from 'src/sections/PurchaseOrders/ViewPurchaseOrder';
import { fDatesWithTimeStamp, fDatesWithTimeStampWithDayjs } from 'src/utils/formatTime';
import statusColor, {
  purchaseOrderStatusColor,
  storePurchaseOrderStatusColor,
} from 'src/utils/statusColor';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import KebabMenu from 'src/components/KebabMenu';
import EditIcon from '@mui/icons-material/Edit';
import INTENT_API from 'src/services/IntentService';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import EditViewProducts from './PurchaseStoreOrders/EditViewProducts';
import ReceiveViewKebabMenu from './PurchaseStoreOrders/ReceiveViewKebabMenu';
import ViewLogsDialog from './PurchaseStoreOrders/ViewLogsDialog';

const ViewPurchaseOrdersReceives = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [storeReferenceList, setStoreReferenceList] = useState([]);
  const [editOnDialog, setEditOnDialog] = useState(false);
  const [allPurchaseOrderList, setAllPurchaseOrderList] = useState([]);
  const [totalPurchaseOrders, setTotalPurchaseOrders] = useState(0);
  const [paginationData, setPaginationData] = useState({
    size: 10,
    page: 1,
  });

  const [reason, setReason] = useState('');

  const [selectedStatusList, setSelectedStatusList] = useState([]);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const [openMenu, setOpenMenuActions] = useState(null);

  const getStoreReferenceId = async () => {
    try {
      const res = await INTENT_API.getStoreReference();
      setStoreReferenceList(res?.data);
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  useEffect(() => {
    getStoreReferenceId();
  }, []);

  const getToreReferenceId = (currentStore) => {
    return find(storeReferenceList, (item) => item.storeId === currentStore)?.storeReference;
  };

  function handlePageChange(event, newPage) {
    setPaginationData((prev) => ({ ...prev, page: newPage + 1 }));
  }

  function handleOnRowsPerPageChange(event, data) {
    setPaginationData({ page: 1, size: data.props.value });
  }

  const getAllPurchaseOrders = async (newPaginationData, isLoading) => {
    if (isLoading) {
      setIsLoading(true);
    }
    try {
      const ApiCall = INTENT_API.getAllPurchaseOrdersReceives;
      const response = await ApiCall(
        {
          size: get(newPaginationData || paginationData, 'size'),
          page: get(newPaginationData || paginationData, 'page'),
          receiverReference: getToreReferenceId(currentStore),
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
    if (currentStore && currentTerminal && !isEmpty(storeReferenceList)) {
      getAllPurchaseOrders();
    }
  }, [currentStore, currentTerminal, paginationData, storeReferenceList]);

  const refetchData = () => {
    setPaginationData({ size: 10, page: 1 });
  };

  useEffect(() => {
    refetchData();
  }, []);

  const handleApproveRejectRequest = (referenceId, status) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: (
        <Stack flexDirection="column" gap={1.5}>
          <Typography>{`Are you sure you want to ${
            status === 'REJECTED' ? 'Reject' : 'Approve'
          }?`}</Typography>
          {status === 'REJECTED' && (
            <TextField
              autoFocus
              fullWidth
              size="medium"
              variant="outlined"
              placeholder="Enter Reason"
              onChange={(e) => setReason(e.target.value)}
              InputProps={{
                style: { color: '#000000' },
              }}
            />
          )}
        </Stack>
      ),
      actions: {
        primary: {
          text: 'yes',
          onClick: (onClose) => {
            handleApproveReject(referenceId, status);
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
  const handleApproveReject = async (referenceId, status) => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        referenceId: referenceId,
        requestStatus: status,
        ...(status === 'REJECTED' ? { reason: reason } : {}),
      };
      await INTENT_API.updateReceivePurchaseStatus(options);
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const ordersTableData = [
    {
      label: 'Purchase ID',
      field: 'purchaseId',
      align: 'left',
      minWidth: 130,
    },
    {
      label: 'Date',
      field: 'date',
      align: 'left',
      renderData: (data) => {
        return fDatesWithTimeStampWithDayjs(get(data, 'date'));
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
              backgroundColor: storePurchaseOrderStatusColor(get(data, 'status'))?.bgColor,
              color: storePurchaseOrderStatusColor(get(data, 'status'))?.color,
            }}
            label={`${get(data, 'status') || 'Status not found'}`}
          />
        );
      },
      minWidth: 150,
    },
    {
      label: 'Amount (₹)',
      field: 'amount',
      align: 'left',
      renderData: (data) => {
        return toFixedIfNecessary(get(data, 'amount') / 100, 2);
      },
      minWidth: 150,
    },
    {
      label: 'Store name',
      field: 'storeNameReference',
      align: 'left',
      minWidth: 150,
    },
    
    {
      label: 'Request status',
      field: 'requestStatus',
      align: 'left',
      renderData: (data) => {
        return (
          <Stack flexDirection={'row'} gap={2} alignItems={'center'}>
            <Chip
              size="small"
              sx={{
                ml: 0.5,
                fontSize: '11px',
                fontWeight: 800,
                '&.MuiChip-root': { borderRadius: '4px' },
                backgroundColor:
                  get(data, 'requestStatus') === STORE_PURCHASE_CONSTANTS.APPROVED ? '#78cc8070' : '#f5c28770',
                color: get(data, 'requestStatus') === STORE_PURCHASE_CONSTANTS.APPROVED ? '#28692e' : '#ec8713',
              }}
              label={`${get(data, 'requestStatus') || 'Status not found'}`}
            />
          
           
          </Stack>
        );
      },
    },
    {
      label: '',
      field: '',
      align: 'left',
      renderData: (data) => {
        console.log('data', data);
        return (
          <ReceiveViewKebabMenu
            data={data}
            storePurchase={true}
            getAllPurchaseOrders={getAllPurchaseOrders}
          />
        );
      },
      minWidth: 100,
      sticky: true,
    },
  ];

  const tableData = ordersTableData;

  const statusList = ORDERS_STATUS_CONSTANTS;

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
        sx={{ mb: 3, px: !isMobile ? 2 : null, pl: isMobile ? 2 : null }}
        action={
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
              sx={{ width: isMobile ? '6rem' : '12rem' }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderInput={(params) => <TextField variant="filled" {...params} label={'Status'} />}
            />
          </Stack>
        }
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

export default ViewPurchaseOrdersReceives;
