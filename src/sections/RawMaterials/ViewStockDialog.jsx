import { Card, Dialog, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { find, get, isEmpty, map } from 'lodash';
import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AuthService from 'src/services/authService';
import { ALL_CONSTANT, USER_AGENTS } from 'src/constants/AppConstants';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { generateFilename } from 'src/helper/generateFilename';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import PRODUCTS_API from 'src/services/products';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentEndDate, currentStartDate, currentStoreId, stores } from 'src/global/recoilState';
import Iconify from 'src/components/iconify';
import { Icon } from '@iconify/react';
import isUnderWeekDates from 'src/utils/isUnderWeekDates';

const ViewStockDialog = ({ isOpen, onClose }) => {
  const [rawMaterialListForStock, setRawMaterialListForStock] = useState([]);
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const currentStore = useRecoilValue(currentStoreId);
  const theme = useTheme();
  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const StoreName = getStoreName(currentStore);

  const getRawMaterialListForStock = async () => {
    try {
      const res = await PurchaseOrderServices.rawMaterialListForStock();
      setRawMaterialListForStock(get(res, 'data'));
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    getRawMaterialListForStock();
  }, []);
  const excelDownload = async () => {
    try {
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId, StoreName }
          : { ...options, storeId, terminalId, StoreName };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/raw-products/stock-inventory-xlsx${query}`;
        const filename = generateFilename('Rawmaterial_Report');
        handleCSVDownload({
          url,
          method: 'GET',
          headers: {
            Authorisation: `Bearer ${AuthService._getAccessToken()}`,
            deviceid: AuthService.getDeviceId(),
          },
          filename,
        });
      } else {
        await PRODUCTS_API.exportRawMaterialListAsExcel(options);
      }
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
    }
  };
  const pdfDownload = async () => {
    try {
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId, StoreName }
          : { ...options, storeId, terminalId, StoreName };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/raw-products/stock-inventory-PDF${query}`;
        const filename = generateFilename('Order_Report');
        handleCSVDownload({
          url,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${AuthService._getAccessToken()}`,
            deviceid: AuthService.getDeviceId(),
          },
          filename,
        });
      } else {
        await PRODUCTS_API.exportRawMaterialListAsPdf(options);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_PDF);
    }
  };
  const isUnderWeekDatesBol = isUnderWeekDates(startDate, endDate, true);

  return (
    <Dialog open={isOpen}>
      <Card sx={{ p: 2, width: { xs: 340, sm: 400 } }}>
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', mb: 2 }}
        >
          <Typography variant="h6">Raw material list</Typography>

          <Stack flexDirection="row" alignItems="center" gap={1}>
            <IconButton onClick={pdfDownload} sx={{ color: theme.palette.primary.main }}>
              <PictureAsPdfIcon />
            </IconButton>
            <IconButton ml={1} onClick={excelDownload} disabled={!isUnderWeekDatesBol}>
              <Icon
                icon="uiw:file-excel"
                style={
                  isUnderWeekDatesBol
                    ? { color: theme.palette.primary.main }
                    : { opacity: 0.5, color: 'gray' }
                }
                width="20"
                height="20"
              />
            </IconButton>

            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
        <Stack
          sx={{
            overflow: 'auto',
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',

              justifyContent: 'flex-start',
              alignItems: 'center',
              mb: 1,
              borderBottom: '1px solid #ced4da',
              pb: 1,
              gap: 3,
            }}
          >
            <Typography sx={{ flex: 2, minWidth: 100, fontWeight: 'bold', textAlign: 'left' }}>
              Name
            </Typography>
            <Typography sx={{ flex: 1, minWidth: 100, fontWeight: 'bold', textAlign: 'left' }}>
              Quantity
            </Typography>
            <Typography sx={{ flex: 1, minWidth: 150, fontWeight: 'bold', textAlign: 'left' }}>
              Total Average Value (₹)
            </Typography>
          </Stack>

          <Stack flexDirection="column" gap={2} sx={{ height: 400, pr: 2 }}>
            {map(rawMaterialListForStock, (_item, index) => {
              return (
                <Stack
                  key={index}
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    mb: 1,
                    gap: 3,
                  }}
                >
                  <Typography
                    sx={{ flex: 2, minWidth: 150, textAlign: 'left', whiteSpace: 'nowrap' }}
                  >
                    {get(_item, 'name')}
                  </Typography>
                  <Typography
                    sx={{ flex: 1, minWidth: 100, textAlign: 'left', whiteSpace: 'nowrap' }}
                  >
                    {toFixedIfNecessary(get(_item, 'current_stockQuantity', 0), 2)}{' '}
                    {get(_item, 'unitName')}
                  </Typography>
                  <Typography
                    sx={{ flex: 1, minWidth: 100, textAlign: 'left', whiteSpace: 'nowrap' }}
                  >
                    {toFixedIfNecessary(
                      get(_item, 'unitAverageValue', 0) * get(_item, 'current_stockQuantity', 0),
                      2
                    )}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Card>
    </Dialog>
  );
};

export default ViewStockDialog;
