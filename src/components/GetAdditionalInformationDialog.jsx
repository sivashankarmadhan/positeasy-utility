import { Button, Card, Dialog, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function GetAdditionalInformationDialog(props) {
  const { open, handleClose, setInfo, info, isProductwise, handleSubmit, itemInfo } = props;
  const [text, setText] = useState('');
  const handleCloseDialog = () => {
    handleClose();
    setText('');
  };
  const handleInfo = (e) => {
    setText(e.target.value);
  };
  const handleAdd = () => {
    setInfo(text);
    if (isProductwise) {
      handleSubmit(text);
      setInfo('');
    }
    handleCloseDialog();
  };

  useEffect(() => {
    if (open && isProductwise && itemInfo) {
      setInfo(itemInfo);
    }
  }, [isProductwise, itemInfo, open]);

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 360, sm: 400, minHeight: 200 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add Information
        </Typography>
        <TextField
          multiline
          onChange={handleInfo}
          fullWidth
          variant="outlined"
          label="Enter Info"
          rows={4}
          maxRows={14}
          defaultValue={info}
        />
        <Stack gap={1} flexDirection={'row'} sx={{ justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={handleCloseDialog} variant="text">
            Cancel
          </Button>
          <Button onClick={handleAdd} variant="contained">
            Add
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
