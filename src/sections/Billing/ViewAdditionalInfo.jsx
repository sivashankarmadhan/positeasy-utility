import { Box, Card, Dialog, IconButton, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

const ViewAdditionalInfo = ({ open, setOpen, data }) => {
  return (
    <Dialog
      open={open}
      
    >
      <Card sx={{ p: 2, minHeight: 200, minWidth: 300 }}>
        <Stack flexDirection="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Additional Info</Typography>
          <IconButton
            onClick={() => {
              setOpen(false);
            }}
          >
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>
        <TextField sx={{ my: 2, width: '100%' }} minRows={5} disabled value={data} multiline />
      </Card>
    </Dialog>
  );
};

export default ViewAdditionalInfo;
