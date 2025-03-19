import { Box, Button, Card, Dialog, TextField, Typography } from '@mui/material';
import React from 'react';

const EnterValueDialog = ({ open, onClose, name, value, setValue, onCancel, onSubmit }) => {
  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, minHeight: 100 }}>
        <Typography sx={{ fontWeight: 'bold' }}>Edit</Typography>
        <TextField
          sx={{ mt: 2 }}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          type="number"
          label={name}
          onWheel={(e) => e.target.blur()}
          autoFocus
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onCancel} sx={{ mr: 2 }} variant="text">
            Cancel
          </Button>
          <Button onClick={onSubmit} variant="contained">
            Submit
          </Button>
        </Box>
      </Card>
    </Dialog>
  );
};

export default EnterValueDialog;
