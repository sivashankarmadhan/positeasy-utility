import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { isEmpty } from 'lodash';
import * as React from 'react';
import QRInventoryPreview from './QRInventoryPreview';
import UploadQRDialog from './UploadQRDialog';
import { Stack, Tooltip, useTheme } from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenInventoryAdd(props) {
  const { open, handleClose } = props;
  const theme = useTheme();
  const [data, setData] = React.useState([]);
  const [openQR, setOpenQR] = React.useState(false);
  const handleCloseQR = (e) => {
    setOpenQR(false);
    setData((prev) => [...prev, { ...e }]);
  };
  const handleOpenQR = (e) => {
    console.log(e);
    setOpenQR(true);
  };
  return (
    <Dialog fullScreen open={open}  TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Preview scanned product
          </Typography>
          <Button color="inherit" onClick={handleOpenQR}>
            Scan QR
          </Button>
          <Button disabled={isEmpty(data)} autoFocus color="inherit">
            Upload
          </Button>
        </Toolbar>
      </AppBar>
      {!isEmpty(data) && <QRInventoryPreview data={data} />}
      {openQR && <UploadQRDialog open={openQR} handleClose={handleCloseQR} />}
    </Dialog>
  );
}
