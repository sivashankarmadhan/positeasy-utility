import { Icon } from '@iconify/react';
import { Button, Card, Dialog, Stack, Typography, useTheme } from '@mui/material';
import html2canvas from 'html2canvas';
import { get } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import Barcode from 'react-barcode';
import { ErrorBoundary } from 'react-error-boundary';
import QRCode from 'react-qr-code';
import { useRecoilValue } from 'recoil';
import { currentStoreId } from '../global/recoilState';
import { generateFilename } from '../helper/generateFilename';
import AuthService from '../services/authService';
import { Autocomplete } from '@mui/material';
import { TextField } from '@mui/material';
import TABLESERVICES_API from '../services/API/TableServices';
import toast from 'react-hot-toast';
import { ErrorConstants } from '../constants/ErrorConstants';
import { map } from 'lodash';
import { allConfiguration } from '../global/recoilState';
import { isEmpty } from 'lodash';

import login from '../layouts/login';

export default function GenerateQRCode(props) {
  const { open, handleClose, data, tableId } = props;

  const currentStore = useRecoilValue(currentStoreId);
  const [qrImage, setQrImage] = useState('');
  const theme = useTheme();
  const qrCodeRef = useRef(null);
  const { merchantId } =
    JSON.parse(window.atob(AuthService._getAccessToken()?.split?.('.')?.[1])) || '';
  const configuration = useRecoilValue(allConfiguration);
  const isEstimate = get(configuration, 'isEstimator');
  const featureSettings = get(configuration, 'featureSettings', {});
  const isTable = get(featureSettings, 'isTable', false);
  const [table, setTable] = useState([]);
  const [selectTable, setSelectTable] = useState({ label: '', value: '' });
  let QRString = `https://public.positeasy.in/?merchantId=${merchantId}&storeId=${currentStore}`;

  if (tableId) {
    QRString += `&tableId=${tableId}`;
  }

  const getTableList = async () => {
    try {
      const res = await TABLESERVICES_API.getTableList();
      setTable(get(res, 'data'));
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    getTableList();
  }, [currentStore]);

  const handleChangeTable = (e) => {
    if (e) {
      setSelectTable(e);
    } else {
      setSelectTable({ label: '', value: '' });
    }
  };

  const StyledCard = ({ children }) => (
    <Card
      sx={{
        p: 2,
        minWidth: { xs: 180, sm: 180 },
        minHeight: { xs: 120, sm: 120 },
        maxWidth: { xs: 180, sm: 180 },
        maxHeight: { xs: 120, sm: 120 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px dashed',
        textAlign: 'center',
        borderColor: theme.palette.primary.main,
        '&:hover': {
          border: '1px solid',
        },
        cursor: 'pointer',
      }}
    >
      {children}
    </Card>
  );
  const handleGenerate = () => {
    return (
      <ErrorBoundary FallbackComponent={<div />}>
        <div id="print" ref={qrCodeRef} style={{ width: '100%', padding: 5 }}>
          <QRCode level="H" value={QRString} />
        </div>
      </ErrorBoundary>
    );
  };

  const downloadQRCode = async () => {
    try {
      const filename = generateFilename('Qrcode');
      html2canvas(qrCodeRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    } catch (e) {
      console.log(e);
    }
  };

  const renderComponent = handleGenerate();
  const handleCloseDialog = () => {
    handleClose();
  };
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const image = handleGenerate();
    if (image) setQrImage(image);
  }, [selectTable]);

  return (
    <Dialog open={open}>
      <Card
        sx={{
          p: 2,
          minWidth: { xs: 230, sm: 230 },
          minHeight: { xs: 230, sm: 230 },
        }}
      >
        {qrImage}
        {QRString && (
          <Stack>
            {/* <Stack sx={{ mt: 2, mb: 2 }}>
              {!isEmpty(table) && isTable && (
                <Autocomplete
                  size="small"
                  disablePortal
                  options={map(table, (_item) => ({
                    label: get(_item, 'tableName'),
                    id: get(_item, 'tableId'),
                  }))}
                  value={selectTable}
                  onChange={(event, newValue) => handleChangeTable(newValue)}
                  sx={{ minWidth: 160 }}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label={'Table'} />
                  )}
                />
              )}
            </Stack> */}
            <Stack
              flexDirection={'row'}
              gap={1}
              justifyContent={'flex-end'}
              sx={{ displayPrint: 'none' }}
            >
              <Button
                onClick={handleCloseDialog}
                variant="text"
                sx={{ mt: 1, display: 'flex', justifySelf: 'flex-end' }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => downloadQRCode()}
                variant="outlined"
                sx={{ mt: 1, display: 'flex', justifySelf: 'flex-end' }}
              >
                Download
              </Button>
              <Button
                onClick={handlePrint}
                variant="contained"
                sx={{ mt: 1, display: 'flex', justifySelf: 'flex-end' }}
              >
                Print
              </Button>
            </Stack>
          </Stack>
        )}
      </Card>
    </Dialog>
  );
}
