import { Button, Dialog, Paper, Typography } from '@mui/material';
import { get } from 'lodash';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import COUNTERS_API from 'src/services/counters';

export default function UnlinkCount(props) {
  const { open, product, handleClose, intialFetch, setSelected } = props;
  const handleUnlinkCounter = async () => {
    try {
      const options = {
        productId: [get(product, 'productId')],
      };

      const response = await COUNTERS_API.unlinkCounter(options);
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        handleClose();
        intialFetch()
        setSelected([])
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || 'Unable to unlink to counter, Try Again');
    }
  };
  return (
    <Dialog open={open}>
      <Paper
        sx={{
          p: 2,
        }}
      >
        <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
          Are you sure you want to unlink the counter
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} sx={{ mr: 2 }} variant="text">
            Cancel
          </Button>
          <Button onClick={handleUnlinkCounter} variant="contained">
            Ok
          </Button>
        </div>
      </Paper>
    </Dialog>
  );
}
