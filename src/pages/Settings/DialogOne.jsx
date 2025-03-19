import { Card, Dialog, Stack } from '@mui/material';

const DialogOne = ({ open, onClose, children, title, customMinWidth }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <Card
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          minWidth: customMinWidth || 450,
        }}
      >
        <Stack sx={{ width: '100%' }}>
          <Stack
            sx={{ width: '100%' }}
            flexDirection="row"
            alignItems="flex-end"
            justifyContent="space-between"
            pb={0.5}
          ></Stack>
        </Stack>
        {children}
      </Card>
    </Dialog>
  );
};

export default DialogOne;
