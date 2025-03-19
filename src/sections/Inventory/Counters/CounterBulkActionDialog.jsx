import { Close } from '@mui/icons-material';
import { Card, Dialog, Grid, IconButton, Paper, Stack, Tooltip, Typography, useTheme, } from '@mui/material';
import { get, isEmpty, map } from 'lodash';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import S3ImageCaching from 'src/components/S3ImageCaching';
import { StatusConstants } from 'src/constants/AppConstants';
import trimDescription from 'src/helper/trimDescription';
import COUNTERS_API from 'src/services/counters';

export default function CounterBulkActionDialog(props) {
  const { open, handleClose, countersList, selected, setSelected, intialFetch } = props;
  const theme = useTheme();
  const handleSubmit = async (data) => {
    try {
      let options = [];
      map(selected, (e) => {
        options.push({ productId: e, counterId: get(data, 'counterId') });
      });
      const response = await COUNTERS_API.linkCounter(options);
      intialFetch();
      handleClose();
      setSelected([]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open}>
      <Card
        sx={{
          p: 2,
          width: { xs: 360, md: 450 },
          minHeight: 300,
          maxHeight: 600,
          overflowY: 'scroll',
        }}
      >
       
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1">
          Selected products link to below any one counter{' '}
        </Typography>
          <Tooltip title="Close">
            <IconButton
              sx={{ color: theme.palette.main, height: 40 }}
              onClick={() => handleClose()}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </Stack>
        {isEmpty(countersList) ? (
          <Typography
            variant="subtitle1"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3 }}
          >
            Counters not found
          </Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {map(countersList, (e, index) => (
              <Grid key={get(e, 'counterId', index)} item xs={12} sm={12} md={12} lg={12}>
                <Paper
                  sx={{
                    border: 1,
                    borderColor: 'rgba(0,0,0,0.1)',
                    height: 100,
                    width: '100%',
                    p: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Stack
                    sx={{ cursor: 'pointer' }}
                    onClick={(event) => {
                      handleSubmit(e);
                    }}
                    flexDirection={'row'}
                  >
                    <Stack flexDirection={'row'}>
                      <div
                        style={{
                          height: 80,
                          minWidth: 80,
                          width: 80,
                          overflow: 'hidden',
                          borderRadius: 5,
                          opacity: get(e, 'status') === StatusConstants.ACTIVE ? 1 : 0.3,
                        }}
                      >
                        <S3ImageCaching
                          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                          src={get(e, 'counterImage')}
                          alt="image"
                        />
                      </div>
                      <Stack
                        sx={{
                          ml: 1,
                          flexDirection: 'column',
                          opacity: get(e, 'status') === StatusConstants.ACTIVE ? 1 : 0.3,
                        }}
                      >
                        <Typography
                          noWrap
                          variant="subtitle1"
                          sx={{ fontSize: get(e, 'name', '').length > 12 ? 14 : 16 }}
                        >
                          {trimDescription(get(e, 'name', ''), 25)}
                        </Typography>

                        <Typography variant="caption">
                          {trimDescription(get(e, 'description', ''), 100)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Card>
    </Dialog>
  );
}
