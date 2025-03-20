import AddLinkIcon from '@mui/icons-material/AddLink';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import HelpIcon from '@mui/icons-material/Help';
import PreviewIcon from '@mui/icons-material/Preview';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import {
  Card,
  CardHeader,
  Dialog,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { IMPORT_EXPORT_TOOLBAR } from 'src/constants/AppConstants';
import InventoryIcon from '@mui/icons-material/Inventory';
// import DialogWrapper from './DialogWrapper';
import CloseIcon from '@mui/icons-material/Close';

export default function InventoryAddOptions(props) {
  const { open, handleClose, data } = props;
  const [openPetpoojaExportInformation, setOpenPetpoojaExportInformation] = useState(false);
  const theme = useTheme();
  const isNotShowExport = isEmpty(data);
  const StyledCard = ({ children, isDisabledBorderHover }) => (
    <Card
      sx={{
        p: 2,
        minWidth: { xs: 150, sm: 180 },
        minHeight: { xs: 100, sm: 120 },
        maxWidth: { xs: 150, sm: 180 },
        maxHeight: { xs: 100, sm: 120 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px dashed',
        textAlign: 'center',
        borderColor: theme.palette.primary.main,
        '&:hover': !isDisabledBorderHover
          ? {
              border: '1px solid',
            }
          : {},
        cursor: 'pointer',
      }}
    >
      {children}{' '}
    </Card>
  );
  const handleOpenPetpoojaInfo = () => {
    setOpenPetpoojaExportInformation(true);
  };
  const handleClosePetpoojaInfo = () => {
    setOpenPetpoojaExportInformation(false);
  };
  const handlePartnerInventory = (e) => {
    e.stopPropagation();
    handleOpenPetpoojaInfo();
  };
  return (
    <Dialog open={open}>
      <Card sx={{ p: 2 }}>
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
          }}
        >
          <Typography variant="subtitle1">Select inventory options below</Typography>

          <Tooltip title="Close">
            <IconButton sx={{ color: theme.palette.main }} onClick={() => handleClose()}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack
          sx={{
            height: '56vh',
            // overflowY: 'scroll',
            overflow: 'auto',
            // ...hideScrollbar,
          }}
        >
          <Stack
            gap={1}
            sx={{
              width: '100%',
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
            }}
          >
            <Stack
              sx={{ position: 'relative' }}
              flexDirection={'column'}
              onClick={() => handleClose(IMPORT_EXPORT_TOOLBAR.QR)}
            >
              <StyledCard>
                <QrCodeScannerIcon sx={{ color: theme.palette.primary.main, fontSize: 40 }} />
                <Typography variant="caption">Add by QR or Barcode </Typography>
              </StyledCard>
            </Stack>
            <Stack
              flexDirection={'column'}
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => handleClose(IMPORT_EXPORT_TOOLBAR.PARTNER_INVENTORY)}
            >
              <StyledCard>
                <div
                  onClick={handlePartnerInventory}
                  style={{ position: 'absolute', top: 3, right: 5 }}
                >
                  <HelpIcon sx={{ color: theme.palette.primary.main, fontSize: 30 }} />
                </div>
                <AddLinkIcon sx={{ color: theme.palette.primary.main, fontSize: 40 }} />
                <Typography variant="caption">Add from partner inventory</Typography>
                <Typography variant="caption">{`(Petp∅∅ja)`}</Typography>
              </StyledCard>
            </Stack>
            <Stack
              flexDirection={'column'}
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => handleClose(IMPORT_EXPORT_TOOLBAR.IMPORT_INVENTORY)}
            >
              <StyledCard>
                <BrowserUpdatedIcon sx={{ color: theme.palette.primary.main, fontSize: 40 }} />{' '}
                <Typography variant="caption">Import inventory</Typography>
              </StyledCard>
            </Stack>
            <Stack
              flexDirection={'column'}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                ...(isNotShowExport ? { pointerEvents: 'none', opacity: 0.3 } : {}),
              }}
              onClick={() => handleClose(IMPORT_EXPORT_TOOLBAR.EXPORT_MENU)}
            >
              <StyledCard>
                <DownloadForOfflineIcon sx={{ color: theme.palette.primary.main, fontSize: 40 }} />{' '}
                <Typography variant="caption">Export Menu</Typography>
              </StyledCard>
            </Stack>
          </Stack>

          <Typography variant="subtitle1" sx={{ my: 2 }}>
            Stock upload
          </Typography>

          <Stack
            gap={1}
            sx={{
              width: '100%',
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
            }}
          >
            <Stack sx={{ position: 'relative' }}>
              <Stack
                flexDirection={'column'}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  filter: true ? 'blur(4px)' : '',
                }}
                onClick={() => handleClose(IMPORT_EXPORT_TOOLBAR.IMPORT_INVENTORY)}
              >
                <StyledCard isDisabledBorderHover>
                  <InventoryIcon sx={{ color: theme.palette.primary.main, fontSize: 40 }} />{' '}
                </StyledCard>
              </Stack>
              <Typography
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '70%',
                  transform: 'translate(-50%, 0)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  textWrap: 'nowrap',
                }}
              >
                COMING SOON OFFLINE
              </Typography>
            </Stack>

            <Stack
              flexDirection={'column'}
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => handleClose(IMPORT_EXPORT_TOOLBAR.IMPORT_ONLINE_STOCK)}
            >
              <StyledCard>
                <InventoryIcon sx={{ color: theme.palette.primary.main, fontSize: 40 }} />{' '}
                <Typography variant="caption">Online</Typography>
              </StyledCard>
            </Stack>
          </Stack>
        </Stack>
      </Card>
      <Dialog open={openPetpoojaExportInformation}>
        <Card sx={{ p: 2, width: 340, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            How to export {`in Petp∅∅ja`}!
          </Typography>
          <Typography variant="caption" sx={{ mb: 2 }}>
            Goto side bar&nbsp;
            {`>`}&nbsp; <b>Menu management</b>&nbsp;
            {`>`} &nbsp;<b>Menu & Discounts</b>
          </Typography>

          <Typography variant="caption" sx={{ mb: 2 }}>
            Click &nbsp;
            <b>Base menu</b>&nbsp;option&nbsp;{`>`}&nbsp; under&nbsp;
            <b>Menu & Discounts</b>
          </Typography>

          <Typography variant="caption" sx={{ mb: 2 }}>
            Under <b>Quick action button</b>&nbsp;
            {`>`}&nbsp; you can find <b>Download Base Menu[Backup]</b>
          </Typography>

          <Typography variant="caption" sx={{ mb: 2 }}>
            <b>Note:</b>&nbsp; Make sure you are in admin dashboard{' '}
          </Typography>
        </Card>
      </Dialog>
    </Dialog>
  );
}
