// @mui
import { Alert, Button, Card, Dialog, Stack, Tooltip, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ErrorIcon from '../../assets/icons/ErrorIcon.png';
import SuccessIcon from '../../assets/icons/SuccessIcon.png';

// ----------------------------------------------------------------------

export default function PaymentDialog(props) {
  const { open, handleClose } = props;

  const handleCloseDialog = () => {
    handleClose();
    // reset();
  };

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 360, md: 400 } }}>
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
          }}
        >
          <img
            src={SuccessIcon}
            style={{
              width: '55px',
              height: '55px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          {/* <img
            src={ErrorIcon}
            style={{
              width: '55px',
              height: '55px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          /> */}
          {/* <CheckCircleOutlineIcon sx={{  }} /> */}
          {/* <HighlightOffIcon sx={{ mb: 1 }}/> */}
          <Typography variant="h6" sx={{ my: 2 }}>
            Payment Successful
            {/* Payment Failed */}
          </Typography>
          <Typography sx={{ mb: 2 }} variant="caption">
            A copy of your receipt has been sent to your mail.
            {/* Something went wrong  */}
          </Typography>
          <Button variant="contained">Completed
          {/* Try again later */}
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
