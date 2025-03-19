import {
  Card,
  Dialog,
  IconButton,
  Stack,
  Typography,
  useTheme,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { get, map } from 'lodash';
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

const ViewInventoryDialog = ({ isOpen, onClose }) => {
  const [stockList, setStockList] = useState([]);

  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);

  const theme = useTheme();

  const getStocks = async () => {
    try {
      const res = await PRODUCTS_API.getStocks();
      setStockList(get(res, 'data'));
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    getStocks();
  }, []);

  const pdfDownload = async () => {
    try {
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/stock-inventory-PDF${query}`;
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
        await PRODUCTS_API.exportInventoryListAsPdf(options);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_PDF);
    }
  };

  return (
    <Dialog open={isOpen}>
      <Card
        sx={{
          p: 2,
          width: { xs: '100%', sm: 450, md: 600, lg: 800 },
          maxWidth: '100%',
        }}
      >
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            Inventory Stock List
          </Typography>

          <Stack flexDirection="row" alignItems="center" gap={1}>
            <IconButton onClick={pdfDownload} sx={{ color: 'primary.main' }}>
              <PictureAsPdfIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>

        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="left"
                  sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                >
                  Name
                </TableCell>
                <TableCell
                  align="left"
                  sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                >
                  Stock Quantity
                </TableCell>
                <TableCell
                  align="left"
                  sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                >
                  Unit Price
                </TableCell>
                <TableCell
                  align="left"
                  sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                >
                  Total Value
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {map(stockList, (_item) => (
                <TableRow key={get(_item, 'id')} sx={{ borderBottom: '1px solid #ced4da' }}>
                  <TableCell align="left">{get(_item, 'name')}</TableCell>
                  <TableCell align="left">
                    {get(_item, 'stockQuantity')} {get(_item, 'unitName')}
                  </TableCell>
                  <TableCell align="left">{get(_item, 'price')}</TableCell>
                  <TableCell align="left">
                    {toFixedIfNecessary(get(_item, 'stockQuantity', 0) * get(_item, 'price', 0), 2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Dialog>
  );
};

export default ViewInventoryDialog;
