import {
  Box,
  useTheme,
  Chip,
  Typography,
  IconButton,
  TextField,
  useMediaQuery,
  Stack,
  Tooltip,
} from '@mui/material';

import { filter, find, get, isEmpty, isUndefined, map } from 'lodash';
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
import CopyAllIcon from '@mui/icons-material/CopyAll';
import TrimUUID from 'src/utils/TrimUUID';

export default function RequestFDLogs() {
  const theme = useTheme();
  const [loading, setLoading] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const currentStore = useRecoilValue(currentStoreId);

  const storeReference = useRecoilValue(storeReferenceState);

  const [requestLogsList, setRequestLogsList] = useState([]);
  const [rowCount, setRowCount] = useState(0);

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

  const noSortableFields = StockSortTable;

  const columns = RequestFDLogsTableColumns.map((column) => ({
    headerName: column.title,
    field: column.field,
    flex: 1,
    ...(column.field === 'createdAt' || column.field === 'action' ? { fontSize: '5px' } : {}),
    sortable: !noSortableFields.includes(column.field),
    minWidth: column.field === 'createdAt' ? 200 : column.field === 'action' ? 170 : 140,
    ...(column.field === 'createdAt' && {
      valueFormatter: ({ value }) => fDatesWithTimeStampWithDayjs(value),
    }),
    ...(column.field === 'comment' && {
      renderCell: (params) => {
        if (params.value === null) return '--';

        return (
          <TextField
            inputProps={{ readOnly: true }}
            focused
            size="small"
            value={`${params.value}` || '--'}
            sx={{
              '& input': { p: 1, fontSize: '14px !important' },
              width: isMobile ? 130 : 200,
              textAlign: 'center',
              fontSize: '3px !important',
              fontWeight: 400,
              '& .MuiOutlinedInput-notchedOutline': {
                backgroundColor: params.value ? '#919eab3d' : '',
                borderColor: 'transparent!important',
              },
            }}
          />
        );
      },
    }),
    ...(column.field === 'action' && {
      valueFormatter: ({ value }) => value || '--',
    }),
    ...(column.field === 'status' && {
      renderCell: (params) => {
        if (params.value === null) return '--';

        return (
          <Chip
            size="small"
            color={statusColor(params.value)}
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '4px' },
            }}
            label={`${get(params, 'value')}`}
          />
        );
      },
    }),

    ...(column.field === 'referenceId' && {
      renderCell: (params) => {
        return (
          <Stack flexDirection="row" gap={2} alignItems="center">
            <Typography sx={{ width: '5.5rem' }}>{TrimUUID(params.value)}</Typography>
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

    ...(column.field === 'response' && {
      renderCell: (params) => {
        const removedPublishTimeObject = filter(params?.row?.receivedLog, (_item) => {
          return !get(_item, 'publishTime');
        });

        return (
          <IconButton
            onClick={() => {
              setOpenRequestLogResponseDialog({
                isOpen: true,
                data: params?.row,
              });
            }}
            disabled={!removedPublishTimeObject?.length}
          >
            <FeedIcon />
          </IconButton>
        );
      },
    }),

    headerClassName: 'super-app-theme--header',
  }));

  const getRequestLogsList = async () => {
    if (isUndefined(currentStore) || currentStore === 'undefined') return;
    try {
      const options = {
        size,
        page,
        storeReference: storeReference,
      };
      setLoading(true);
      const response = await ONLINE_STORES.requestsFDLogs(options);
      setLoading(false);
      if (response) {
        setRequestLogsList(get(response, 'data.data.rows', []));
        setRowCount(get(response, 'data.totalItems', []));
      }
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      console.log(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (currentStore && storeReference) getRequestLogsList();
  }, [currentStore, page, size, storeReference]);

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
            rows={map(requestLogsList, (e, index) => {
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
            localeText={{ noRowsLabel: 'No stock  reports found' }}
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
