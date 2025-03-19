import { Card, Dialog, Grid, Stack, Typography, useTheme } from '@mui/material';
import { get, map } from 'lodash';
import React from 'react';
import { fCurrency } from 'src/utils/formatNumber';

export default function UnitsSelectionDialog(props) {
  const theme = useTheme();
  const { data, open, handleClose } = props;
  const onClose = (e) => {
    handleClose(e);
  };
  const handleCloseDialog = () => {
    handleClose();
  };
  return (
    <Dialog open={open}>
      <Card
        sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: 320 }}
      >
        <Typography sx={{ fontWeight: 'bold', fontSize: 15, mb: 2 }}>
          <Typography
            sx={{
              display: 'inline',
              fontWeight: 'bold',
              color: theme.palette.primary.light,
              fontSize: 17,
              mr: 1,
            }}
          >
            {get(data, '0.name')}
          </Typography>
          have a unit options, select below
        </Typography>
        <Grid container sx={{ gap: 1, ml: 2 }}>
          {map(data, (e) => (
            <Grid item onClick={() => onClose(e)}>
              <Stack
                sx={{
                  border: 1,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  borderStyle: 'dashed',
                  p: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.lighter,
                  },
                }}
              >
                <Typography noWrap sx={{ fontSize: 16, fontWeight: 'bold' }}>
                  {fCurrency(get(e, 'price'))}
                </Typography>
                <Typography noWrap sx={{ fontSize: 14 }}>{`${get(e, 'unit')}${get(
                  e,
                  'unitName'
                )}`}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Dialog>
  );
}
