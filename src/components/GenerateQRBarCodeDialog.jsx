import { Icon } from '@iconify/react';
import { Button, Card, Dialog, IconButton, Stack, Typography, useTheme } from '@mui/material';
import html2canvas from 'html2canvas';
import { get } from 'lodash';
import { useRef, useState } from 'react';
import Barcode from 'react-barcode';
import { ErrorBoundary } from 'react-error-boundary';
import QRCode from 'react-qr-code';
import { generateFilename } from 'src/helper/generateFilename';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Close, CloseFullscreen } from '@mui/icons-material';
import { BILLING_SCAN_KEYS } from 'src/constants/AppConstants';
export default function GenerateQRBarCodeDialog(props) {
  const { open, handleClose, data } = props;
  const theme = useTheme();
  const [QRData, setQRData] = useState('');
  const [type, setType] = useState(BILLING_SCAN_KEYS.PRODUCT_ID);
  const QRString =
    type === BILLING_SCAN_KEYS.BARCODE
      ? get(data, 'attributes.barcode', '')
      : get(data, 'productId');
  const barcodeString =
    type === BILLING_SCAN_KEYS.BARCODE
      ? get(data, 'attributes.barcode', '')
      : get(data, 'productId');
  const qrCodeRef = useRef(null);
  const barcodeRef = useRef(null);
  const handleChangeType = (e) => {
    const { value } = e.target;
    setType(value);
  };
  const StyledCard = ({ children, ...props }) => (
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
      {...props}
    >
      {children}
    </Card>
  );
  const handleGenerate = () => {
    if (QRData === 'QR') {
      return (
        <ErrorBoundary FallbackComponent={<div />}>
          <div id="print" ref={qrCodeRef} style={{ width: '100%', padding: 5 }}>
            <QRCode level="H" value={QRString} />
          </div>
        </ErrorBoundary>
      );
    } else if (QRData === 'barcode') {
      return (
        <ErrorBoundary FallbackComponent={<div />}>
          <div id="print" ref={barcodeRef}>
            <Barcode displayValue={false} value={barcodeString} height={80} width={2} />
          </div>
        </ErrorBoundary>
      );
    } else {
      return <div>Sorry</div>;
    }
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

  const downloadBarcode = async () => {
    try {
      const filename = generateFilename('Barcode');
      html2canvas(barcodeRef.current).then((canvas) => {
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
    setQRData('');
    handleClose();
  };
  const handlePrint = () => {
    window.print();
  };
  return (
    <Dialog open={open}>
      <Card
        sx={{
          p: 2,
          minWidth: { xs: 230, sm: QRData === 'QR' ? 230 : QRData === 'barcode' ? 250 : 230 },
        }}
      >
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1" sx={{ textAlign: 'left' }}>
            {get(data, 'name')}
            {get(data, 'unit') ? `-${get(data, 'unit')}${get(data, 'unitName')}` : ''}
          </Typography>
          <IconButton onClick={() => handleCloseDialog()}>
            <Close />
          </IconButton>
        </Stack>
        {!QRData && (
          <Stack sx={{ flexDirection: 'column', gap: 2 }}>
            <FormControl>
              <RadioGroup
                sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={type}
                onChange={handleChangeType}
              >
                <FormControlLabel
                  value={BILLING_SCAN_KEYS.PRODUCT_ID}
                  control={<Radio />}
                  label="Product ID"
                />
                <FormControlLabel
                  value={BILLING_SCAN_KEYS.BARCODE}
                  disabled={!get(data, 'attributes.barcode')}
                  control={<Radio />}
                  label="Barcode"
                />
              </RadioGroup>
            </FormControl>

            <Stack
              flexDirection={'column'}
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}
            >
              <StyledCard onClick={() => setQRData('QR')}>
                <Icon icon="ic:twotone-qr-code-2" color="#5a0b45" width="50" height="50" />
                <Typography noWrap> Generate QR code</Typography>
              </StyledCard>
            </Stack>
            <Stack
              flexDirection={'column'}
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <StyledCard onClick={() => setQRData('barcode')}>
                <Icon icon="material-symbols:barcode" color="#5a0b45" width="50" height="50" />
                <Typography noWrap>Generate Barcode</Typography>
              </StyledCard>
            </Stack>
          </Stack>
        )}
        {QRData && renderComponent}
        {QRData && (
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
              onClick={() => (QRData === 'QR' ? downloadQRCode() : downloadBarcode())}
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
        )}
      </Card>
    </Dialog>
  );
}
