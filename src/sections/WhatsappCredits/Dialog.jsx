import React from 'react';
import { Card, Dialog, Divider, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DialogComponent = ({ open, onClose, children, title, customMinWidth }) => {
  return (
    <Dialog open={open}>
      <Card
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: customMinWidth || 440,
        }}
      >
        <Stack sx={{ width: '100%' }}>
          <Stack
            sx={{ width: '100%' }}
            flexDirection="row"
            alignItems="flex-end"
            justifyContent="space-between"
            pb={0.5}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <IconButton sx={{ color: '#7C7C7C' }} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ border: '0.9px dashed #A6A6A6' }} />
        </Stack>
        {children}
      </Card>
    </Dialog>
  );
};

export default DialogComponent;
