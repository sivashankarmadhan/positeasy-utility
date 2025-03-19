import { Button, Card, Dialog, Grid, Stack, Typography, alpha, useTheme } from '@mui/material';
import { get, isEmpty, map } from 'lodash';
import React from 'react';
import S3ImageCaching from './S3ImageCaching';
import { fCurrency } from 'src/utils/formatNumber';

export default function RepeatLastCustomizationDialog(props) {
  const theme = useTheme();
  const {
    open,
    incrementOrderData,
    groupedIncrementData,
    handleIncrementOrder,
    setOpenAlreadyAddedAddonDialog,
    handleOpenNewCustomization,
  } = props;

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, minWidth: 450 }}>
        {!isEmpty(incrementOrderData) && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Repeat last customization? Select below Options
            </Typography>
            {map(groupedIncrementData, (i, data) => (
              <Grid
                key={i}
                onClick={() => {
                  handleIncrementOrder(i[0]);
                  setOpenAlreadyAddedAddonDialog(false);
                }}
                container
                sx={{
                  alignItems: 'center',
                  border: 1,
                  mb: 1,
                  borderColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.activatedOpacity
                  ),
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `1px 2px 5px ${theme.palette.primary.main}`,
                  },
                  cursor: 'pointer',
                  borderStyle: 'dashed',
                }}
              >
                {map(get(i[0], 'addOn'), (d) => (
                  <Grid
                    xs={5.75}
                    sm={5.75}
                    item
                    container
                    sx={{
                      alignItems: 'center',
                      m: 0.5,
                      p: 1,
                      border: 0.3,

                      borderRadius: 1,
                      borderColor: alpha(
                        theme.palette.primary.main,
                        theme.palette.action.activatedOpacity
                      ),
                    }}
                  >
                    <Grid item xs={4} sm={4} lg={4}>
                      <S3ImageCaching
                        src={d.addOnImage}
                        alt={d.name}
                        style={{ height: 50, width: 50, borderRadius: 10 }}
                      />
                    </Grid>
                    <Grid item xs={8} sm={8} lg={8}>
                      <Stack
                        flexDirection={'column'}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          ml: 1,
                        }}
                      >
                        <Typography sx={{ fontSize: '15px' }}>{d.name}</Typography>
                        <Typography sx={{ fontWeight: 'bold' }}>
                          {fCurrency(d.price)} x {d?.quantity}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            ))}
          </>
        )}
        <Button
          onClick={() => handleOpenNewCustomization(incrementOrderData[0])}
          sx={{ mt: 1 }}
          fullWidth
          variant="outlined"
        >
          Add new customization
        </Button>
      </Card>
    </Dialog>
  );
}
