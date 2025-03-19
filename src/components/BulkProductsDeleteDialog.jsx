import { Button, Card, Dialog, Typography, Stack } from '@mui/material';
import React from 'react';

const BulkProductsDeleteDialog = ({
  open,
  handleCloseDialog,
  handleDeleteBulkOrdersWithStock,
  handleDeleteBulkOrdersWithoutStock,
}) => {
  return (
    <Dialog open={open}>
      <Card sx={{ p: 3, width: { xs: 320, sm: 400 } }}>
        <Stack flexDirection="row" alignItems="start">
          <Typography variant="h6" sx={{ mb: 2 }}>
            Would you like to restock products from deleted orders?
          </Typography>
        </Stack>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            sx={{
              mr: 2,
              color: 'red',
            }}
            variant="text"
            onClick={handleCloseDialog}
          >
            Cancel
          </Button>
          <Stack flexDirection="row" alignItems="center" gap={0.5}>
            <Button
              sx={{ mr: 1.5 }}
              variant="outlined"
              onClick={() => handleDeleteBulkOrdersWithoutStock()}
            >
              No
            </Button>
            <Button variant="contained" onClick={() => handleDeleteBulkOrdersWithStock()}>
              Yes
            </Button>
          </Stack>
        </div>
      </Card>
    </Dialog>
  );
};

export default BulkProductsDeleteDialog;
