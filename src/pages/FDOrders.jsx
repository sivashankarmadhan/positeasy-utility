import {
  Box,
  useTheme,
  Chip,
  Typography,
  IconButton,
  TextField,
  useMediaQuery,
  Tooltip,
  Stack,
  ListItemText,
  Autocomplete,
} from '@mui/material';
import CopyAllIcon from '@mui/icons-material/CopyAll';

import { find, get, isEmpty, isUndefined, map } from 'lodash';
import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';

import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  StockTableColumns,
  StockSortTable,
  hideScrollbar,
  PURCHASE_TO_SHOP,
  RequestFDLogsTableColumns,
  FDOrdersColumns,
  FD_STATUS_COLOR,
  StatusLabel,
  FD_STATUS_LABEL,
} from 'src/constants/AppConstants';

import { StocksReportTourConfig } from 'src/constants/TourConstants';

import StyledDataGrid from 'src/helper/StyledDataGrid';
import PRODUCTS_API from 'src/services/products';

import {
  fDates,
  fDatesWithTimeStampFromUtc,
  fDatesWithTimeStampWithDayjs,
  IndFormat,
} from 'src/utils/formatTime';
import { formatAmountToIndianCurrency } from '../utils/formatNumber';

import { currentStoreId, storeReferenceState, stores } from 'src/global/recoilState';

import { allConfiguration } from 'src/global/recoilState';
import ONLINE_STORES from 'src/services/onlineStoresServices';
import statusColor from 'src/utils/statusColor';
import FeedIcon from '@mui/icons-material/Feed';
import RequestLogResponseDialog from 'src/sections/RequestLogs/RequestLogResponseDialog';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';

const FDstatusColor = (status) => {
  if (status === FD_STATUS_COLOR.PLACED) {
    return {
      bg: '#FAEBD7',
      color: '#000',
    };
  } else if (status === FD_STATUS_COLOR.FOOD_READY) {
    return {
      bg: '#CD853F',
      color: '#fff',
    };
  } else if (status === FD_STATUS_COLOR.ACKNOWLEDGED) {
    return {
      bg: '#9061F9',
      color: '#fff',
    };
  } else if (status === FD_STATUS_COLOR.DELIVERED) {
    return {
      bg: '#8FBC8F',
      color: '#000',
    };
  } else if (status === FD_STATUS_COLOR.COMPLETED) {
    return {
      bg: '#008000',
      color: '#fff',
    };
  } else if (status === FD_STATUS_COLOR.CANCELLED) {
    return {
      bg: '#FF0000',
      color: '#fff',
    };
  } else
    return {
      bg: '#0088D1',
      color: '#fff',
    };
};

export default function FDOrders() {
  const theme = useTheme();
  const [loading, setLoading] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const currentStore = useRecoilValue(currentStoreId);

  const [FDOrders, setFDOrders] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const storeReference = useRecoilValue(storeReferenceState);

  const isMobile = useMediaQuery('(max-width:600px)');

  const [openRequestLogResponseDialog, setOpenRequestLogResponseDialog] = useState({
    isOpen: false,
    data: null,
  });

  const isSinglePage = size >= rowCount;

  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const [stockType, setStockType] = useState({
    label: PURCHASE_TO_SHOP.PRODUCT,
    id: PURCHASE_TO_SHOP.PRODUCT,
  });

  const [selectedStatus, setSelectedStatus] = useState({});
  const [selectedChannel, setSelectedChannel] = useState({});
  const [selectedUPOrderId, setSelectedUPOrderId] = useState('');

  const noSortableFields = StockSortTable;

  const columns = FDOrdersColumns.map((column) => ({
    headerName: column.title,
    field: column.field,
    flex: 1,
    ...(column.field === 'createdAt' || column.field === 'order_ref_id' ? { fontSize: '5px' } : {}),
    sortable: !noSortableFields.includes(column.field),
    minWidth: column.field === 'order_ref_id' ? 400 : column.field === 'createdAt' ? 200 : 140,
    ...(column.field === 'createdAt' && {
      valueFormatter: ({ value }) => fDatesWithTimeStampWithDayjs(value),
    }),
    ...(column.field === 'status' && {
      renderCell: (params) => {
        if (params.value === null) return '--';

        return (
          <Chip
            size="small"
            // color={statusColor(params.value)}
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '4px' },
              backgroundColor: FDstatusColor(params.value).bg,
              color: FDstatusColor(params.value).color,
            }}
            label={`${get(params, 'value')}`}
          />
        );
      },
    }),

    ...(column.field === 'order_ref_id' && {
      renderCell: (params) => {
        return (
          <Stack flexDirection="row" gap={2} alignItems="center">
            <Typography sx={{ width: '18rem' }}>{params.value}</Typography>
            <Tooltip title="Copy">
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText(params.value);
                  toast.success(SuccessConstants.COPY_CLIPBOARD);
                }}
              >
                <CopyAllIcon sx={{ fontSize: '20px' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        );
        return;
      },
    }),

    ...(column.field === 'UP_ref_orderId' && {
      renderCell: (params) => {
        return (
          <Stack flexDirection="row" gap={2} alignItems="center">
            <Typography>{params.value}</Typography>
            <Tooltip title="Copy">
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText(params.value);
                  toast.success(SuccessConstants.COPY_CLIPBOARD);
                }}
              >
                <CopyAllIcon sx={{ fontSize: '20px' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        );
        return;
      },
    }),

    ...(column.field === 'channel' && {
      renderCell: (params) => {
        if (params.value === 'swiggy') {
          return <img src="/assets/images/Swiggy.png" style={{ width: '80px' }} />;
        } else if (params.value === 'zomato') {
          return <img src="/assets/images/zomato.png" style={{ width: '60px' }} />;
        }
      },
    }),

    headerClassName: 'super-app-theme--header',
  }));

  const getFDOrdersList = async () => {
    if (isUndefined(currentStore) || currentStore === 'undefined') return;
    try {
      const options = {
        size,
        page,
        ...(selectedChannel?.id ? { channel: selectedChannel?.id } : {}),
        ...(selectedStatus?.id ? { status: selectedStatus?.id } : {}),
        ...(selectedUPOrderId ? { UP_ref_orderId: selectedUPOrderId } : {}),
        storeReference: storeReference,
      };
      setLoading(true);
      const response = await ONLINE_STORES.recentFDOrders(options);
      setLoading(false);
      if (response) {
        const formatOrders = map(get(response, 'data', []), (_item) => {
          return {
            createdAt: _item?.createdAt,
            order_ref_id: _item?.order_ref_id,
            UP_ref_orderId: _item?.UP_ref_orderId,
            status: _item?.status,
            channel: _item?.channel,
            orderAmount: _item?.orderDetails?.order?.details?.order_total,
          };
        });

        setFDOrders(formatOrders);
        // setFDOrders(get(response, 'data.data.rows', []));
        setRowCount(get(response, 'data.totalItems', []));
      }
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      console.log(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (currentStore && storeReference) getFDOrdersList();
  }, [
    currentStore,
    page,
    size,
    storeReference,
    selectedStatus,
    selectedChannel,
    selectedUPOrderId,
  ]);

  if (isLoading) return <LoadingScreen />;
  return (
    <>
      <Box
        sx={{
          height: 'calc(100vh - 7rem)',
          overflow: 'auto',
          ...hideScrollbar,
        }}
      >
        <Stack
          sx={{ display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, ml: 1, mt: 1 }}
          gap={2}
        >
          <Autocomplete
            size="small"
            disablePortal
            options={[
              {
                label: 'Swiggy',
                id: 'swiggy',
              },
              {
                label: 'Zomato',
                id: 'zomato',
              },
            ]}
            value={get(selectedChannel, 'label')}
            onChange={(event, newValue) => setSelectedChannel(newValue)}
            sx={{ width: { sm: '12rem', xs: '99%' } }}
            filterOptions={(options, { inputValue }) => {
              const searchTerm = inputValue.toLowerCase();
              return options.filter((option) => option.label.toLowerCase().startsWith(searchTerm));
            }}
            renderOption={(props, item) => (
              <li {...props} key={item.id}>
                <ListItemText>{item.label}</ListItemText>
              </li>
            )}
            renderInput={(params) => <TextField variant="filled" {...params} label={'Channel'} />}
          />

          <Autocomplete
            size="small"
            disablePortal
            options={FD_STATUS_LABEL}
            value={get(selectedStatus, 'label')}
            onChange={(event, newValue) => setSelectedStatus(newValue)}
            sx={{ width: { sm: '12rem', xs: '99%' } }}
            filterOptions={(options, { inputValue }) => {
              const searchTerm = inputValue.toLowerCase();
              return options.filter((option) => option.label.toLowerCase().startsWith(searchTerm));
            }}
            renderOption={(props, item) => (
              <li {...props} key={item.id}>
                <ListItemText>{item.label}</ListItemText>
              </li>
            )}
            renderInput={(params) => <TextField variant="filled" {...params} label={'Status'} />}
          />

          <TextField
            sx={{
              minWidth: { xs: '40%', sm: 85 },
              maxWidth: { sm: 115, xs: '99%' },
              '& .MuiInputBase-input': {
                height: 16,
              },
              '& .css-qa422o-MuiFormLabel-root-MuiInputLabel-root': {
                top: -1.5,
              },
            }}
            variant="outlined"
            size="medium"
            label="UP order ID"
            value={selectedUPOrderId}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                setSelectedUPOrderId('');
              } else if (Number(value)) {
                setSelectedUPOrderId(Number(value));
              }
            }}
          />
        </Stack>

        <Box
          className="step2"
          sx={{
            height: 'calc(100vh - 7rem)',
            width: '100%',
            '& .MuiDataGrid-columnHeaders': {
              minHeight: '60px !important',
              maxHeight: '70px !important',
            },
            '& .super-app-theme--header': {
              backgroundColor: theme.palette.primary.lighter,
              color: theme.palette.primary.main,
            },
          }}
        >
          <StyledDataGrid
            sx={{
              '& .MuiTablePagination-actions': {
                display: isSinglePage ? 'none' : 'block',
              },
            }}
            rows={map(FDOrders, (e, index) => {
              return { ...e, id: index + 1 };
            })}
            rowCount={rowCount}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: size, page: page - 1 } },
            }}
            pageSizeOptions={[10, 50, 100]}
            disableRowSelectionOnClick
            onPaginationModelChange={handlePagination}
            paginationMode="server"
            localeText={{ noRowsLabel: 'No FD orders reports found' }}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
            }
            autoHeight={true}
            loading={loading}
          />
        </Box>
      </Box>

      <RequestLogResponseDialog
        isOpen={openRequestLogResponseDialog?.isOpen}
        onClose={() => {
          setOpenRequestLogResponseDialog({ isOpen: false, data: null });
        }}
        data={openRequestLogResponseDialog?.data}
      />

      <TakeATourWithJoy config={StocksReportTourConfig} />
    </>
  );
}
