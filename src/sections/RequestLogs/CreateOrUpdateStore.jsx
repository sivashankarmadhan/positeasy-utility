import React, { useEffect, useState } from 'react';
import {
  Chip,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useRecoilValue } from 'recoil';
import { currentStoreId, currentTerminalId, storeReferenceState } from 'src/global/recoilState';
import OptionsGroupServices from 'src/services/API/OptionsGroupServices';
import { find, get, map } from 'lodash';
import convertTo12Hour from 'src/utils/convertTo12Hour';

const CreateOrUpdateStore = ({ receivedLog }) => {
  console.log('receivedLogaaa', receivedLog);

  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const storeReference = useRecoilValue(storeReferenceState);

  const [onlineOptionsList, setOnlineOptionsList] = useState([]);

  const getAllOnlineOptionsList = async () => {
    try {
      const resp = await OptionsGroupServices.allOptions({ page: 1, size: 50 });
      setOnlineOptionsList(get(resp, 'data.optionData'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (currentTerminal && currentStore && storeReference) {
      getAllOnlineOptionsList();
    }
  }, [currentTerminal, currentStore, storeReference]);

  return (
    <Stack>
      <Stack flexDirection="row" gap={1} mb={2} justifyContent="center">
        <Chip
          color={'error'}
          variant="outlined"
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            '&.MuiChip-root': { borderRadius: '15px' },
          }}
          label={`${receivedLog?.stats?.errors || 0} Errors`}
        />
        <Chip
          color={'success'}
          variant="outlined"
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            '&.MuiChip-root': { borderRadius: '15px' },
          }}
          label={`${receivedLog?.stats?.created || 0} Created`}
        />

        <Chip
          color={'error'}
          variant="outlined"
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            '&.MuiChip-root': { borderRadius: '15px' },
          }}
          label={`${receivedLog?.stats?.updated || 0} Updated`}
        />
      </Stack>

      <Stack sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 15rem)' }}>
        <Stack
          flexDirection={'column'}
          sx={{
            gap: 1,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  City
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.city')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Name
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.name')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Ref ID
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.ref_id')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Contact phone
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.contact_phone')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Notification phones
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.notification_phones')?.join(', ')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Min delivery time (sec)
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.min_delivery_time')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Min pickup time (sec)
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.min_pickup_time')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Min order value (₹)
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.min_order_value')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Geo latitude
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.geo_latitude')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Geo longitude
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.geo_longitude')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Address
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.address')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Notification emails
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.notification_emails')?.join(', ')}
                </Typography>
              </Stack>
            </Grid>
            {/* <Grid item xs={12} sm={6} gap={5}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Zip codes
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(receivedLog, 'stores.0.zip_codes')?.join(', ')}
                    </Typography>
                  </Stack>
                </Grid> */}

            <Grid item xs={12} sm={6} gap={5}>
              <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                  Included platforms
                </Typography>
                <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                  {get(receivedLog, 'stores.0.included_platforms')?.join(', ')}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          {get(receivedLog, 'isActive') && (
            <>
              <Divider sx={{ border: '0.5px solid #F0F0F0', mt: 1, mb: 2, width: '100%' }} />
              <Stack gap={2}>
                <Stack gap={2} flexDirection={'row'} alignItems={'center'}>
                  <Typography variant="subtitle1" sx={{ textAlign: 'start' }}>
                    Sound configuration :
                  </Typography>

                  <audio
                    ref={(el) => (audioRefs.current[1] = el)}
                    controls
                    controlsList="nodownload noremoteplayback nofullscreen"
                    onPlay={() => handleAudioPlay(1)}
                  >
                    <source
                      src={`https://audio-pos.s3.ap-south-1.amazonaws.com/ringtone-${get(
                        receivedLog,
                        'soundKeyValue'
                      )}.mp3`}
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                </Stack>

                <Divider sx={{ border: '0.5px solid #F0F0F0', mt: 1, mb: 2, width: '100%' }} />
              </Stack>
            </>
          )}

          {/* <Typography variant="subtitle1" sx={{ textAlign: 'start' }}>
                Translations
              </Typography>

              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                        align="left"
                      >
                        Language
                      </TableCell>
                      <TableCell
                        sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                        align="left"
                      >
                        Name
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {map(
                      get(receivedLog, 'stores.0.translations'),
                      (_item, _index) => (
                        <TableRow>
                          <TableCell
                            sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                            align="left"
                          >
                            {get(_item, 'language')}
                          </TableCell>
                          <TableCell
                            sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                            align="left"
                          >
                            {get(_item, 'name')}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer> */}

          <Divider sx={{ border: '0.5px solid #F0F0F0', mt: 1, mb: 2, width: '100%' }} />

          <Typography variant="subtitle1" sx={{ textAlign: 'start' }}>
            Platform data
          </Typography>

          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                    align="left"
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                    align="left"
                  >
                    URL
                  </TableCell>
                  <TableCell
                    sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                    align="left"
                  >
                    platform store ID
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {map(get(receivedLog, 'stores.0.platform_data'), (_item, _index) => (
                  <TableRow>
                    <TableCell
                      sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                      align="left"
                    >
                      {get(_item, 'name')}
                    </TableCell>
                    <TableCell
                      sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                      align="left"
                    >
                      {get(_item, 'url')}
                    </TableCell>
                    <TableCell
                      sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                      align="left"
                    >
                      {get(_item, 'platform_store_id')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ border: '0.5px solid #F0F0F0', mt: 1, mb: 2, width: '100%' }} />

          {map(get(receivedLog, 'stores.0.timings'), (_item) => {
            return (
              <>
                <Typography variant="subtitle1" sx={{ textAlign: 'start' }}>
                  Slot{' '}
                  <span style={{ color: 'gray', fontSize: '14px' }}>({get(_item, 'day')})</span>
                </Typography>

                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                          align="left"
                        >
                          Start time
                        </TableCell>
                        <TableCell
                          sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                          align="left"
                        >
                          End time
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {map(get(_item, 'slots'), (_slot) => (
                        <TableRow>
                          <TableCell
                            sx={{ color: '#212B36', fontWeight: 700, fontSize: '13px' }}
                            align="left"
                          >
                            {convertTo12Hour(get(_slot, 'start_time'))}
                          </TableCell>
                          <TableCell
                            sx={{ color: '#212B36', fontWeight: 700, fontSize: '13px' }}
                            align="left"
                          >
                            {convertTo12Hour(get(_slot, 'end_time'))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default CreateOrUpdateStore;
