import { QrCodeScanner } from '@mui/icons-material';
import { Box, Grid, Stack, Typography, alpha, useTheme } from '@mui/material';
import { get, isEmpty, map } from 'lodash';
import { hideScrollbar } from 'src/constants/AppConstants';
import { convertToRupee } from 'src/helper/ConvertPrice';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
export default function ViewBillingOrderList(props) {
  const {
    orderDetails,
    selectedOrderList,
    getPriceWithGST,
    calculateTotalParcelCharges,
    selectedList,
  } = props;

  const theme = useTheme();

  const data = selectedList;

  return (
    <Box>
      {!isEmpty(orderDetails) && (
        <Grid
          container
          spacing={2}
          sx={{
            overflow: 'auto',
            ...hideScrollbar,
            p: 0.2,
            mt: 0.2,
            ml: -2,
          }}
        >
          {map(orderDetails, (e, index) => {
            let parcelCharges = 0;
            if (e?.parcelCharges) {
              const parcelChargesGstValue = e?.parcelCharges * (e?.GSTPercent / 100) || 0;
              if (e?.GSTInc) {
                parcelCharges += e?.parcelCharges - parcelChargesGstValue;
              } else {
                parcelCharges += e?.parcelCharges;
              }
            }

            return (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Stack flexDirection={'column'}>
                  <Stack
                    flexDirection={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="subtitle1">
                      {get(e, 'name') || get(e, 'productInfo.name') || get(e, 'productId')}
                    </Typography>
                    <Stack
                      flexDirection={'row'}
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      {get(e, 'productInfo.addByScanning') && (
                        <Typography
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyItems: 'center',

                            fontSize: 10,
                          }}
                        >
                          {<QrCodeScanner sx={{ fontSize: 15, mr: 0.5 }} />}
                          {get(e, 'productInfo.addByScanning')}
                        </Typography>
                      )}
                    </Stack>
                    <Stack flexDirection={'row'} alignItems={'center'} gap={2}>
                      <Typography variant="subtitle1">
                        {fCurrency(getPriceWithGST(e) * get(e, 'quantity'))}
                      </Typography>
                      <Stack
                        flexDirection={'row'}
                        sx={{ color: '#01A389', minWidth: '70px', justifyContent: 'flex-end' }}
                      >
                        <Typography variant="caption">{get(e, 'quantity')}</Typography>
                        <Typography variant="caption" sx={{ mx: 1 }}>
                          x
                        </Typography>
                        <Typography variant="caption" sx={{ minWidth: '30px', textAlign: 'right' }}>
                          ₹
                          {toFixedIfNecessary(
                            getTotalPriceAndGst({
                              price: e?.price,
                              GSTPercent: e?.GSTPercent,
                              GSTInc: e?.GSTInc,
                              fullData: e,
                            })?.withoutGstAmount / 100,
                            2
                          )}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  {!!get(e, 'parcelCharges') && (
                    <Stack
                      flexDirection={'row'}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#212B36', fontSize: '10px' }}>
                        Parcel charges
                      </Typography>
                      <Stack
                        flexDirection={'row'}
                        sx={{ minWidth: '70px', justifyContent: 'flex-end' }}
                      >
                        <Typography variant="caption">{get(e, 'quantity')}</Typography>
                        <Typography variant="caption" sx={{ mx: 1 }}>
                          x
                        </Typography>
                        <Typography variant="caption" sx={{ minWidth: '30px', textAlign: 'right' }}>
                          {fCurrency(parcelCharges / 100)}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}

                  {get(e, 'GSTPercent') > 0 && (
                    <Stack
                      flexDirection={'row'}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#212B36', fontSize: '10px' }}>
                        GST :{e.GSTPercent}% ({e?.GSTInc ? 'inclusive' : 'exclusive'})
                      </Typography>
                      <Stack
                        flexDirection={'row'}
                        sx={{ minWidth: '70px', justifyContent: 'flex-end' }}
                      >
                        <Typography variant="caption">{get(e, 'quantity')}</Typography>
                        <Typography variant="caption" sx={{ mx: 1 }}>
                          x
                        </Typography>
                        <Typography variant="caption" sx={{ minWidth: '30px', textAlign: 'right' }}>
                          ₹
                          {toFixedIfNecessary(
                            getTotalPriceAndGst({
                              price: e?.price,
                              GSTPercent: e?.GSTPercent,
                              GSTInc: e?.GSTInc,
                              fullData: e,
                            })?.gstPercentageValue / 100,
                            2
                          )}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                </Stack>
                {!isEmpty(get(e, 'addOns.addons')) && (
                  <>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      Addons:
                    </Typography>

                    {map(get(e, 'addOns.addons'), (h) => (
                      <Stack flexDirection={'column'}>
                        <Stack
                          flexDirection={'row'}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '10px' }}>
                            {get(h, 'name') || get(h, 'title')}
                          </Typography>
                          <Stack flexDirection={'row'}>
                            <Typography variant="caption" sx={{ fontSize: '10px' }}>
                              {get(h, 'quantity')}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '10px', mx: 1 }}>
                              x
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontSize: '10px', minWidth: '30px', textAlign: 'right' }}
                            >
                              {fCurrency(get(h, 'price'))}
                            </Typography>
                          </Stack>
                        </Stack>
                        {get(h, 'GSTPercent') > 0 && (
                          <Stack
                            flexDirection={'row'}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="caption" sx={{ fontSize: '10px' }}>
                              Addon- GST {get(h, 'GSTPercent')}%
                            </Typography>
                            <Stack flexDirection={'row'}>
                              <Typography variant="caption" sx={{ fontSize: '10px' }}>
                                {get(h, 'quantity')}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '10px', mx: 1 }}>
                                x
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ fontSize: '10px', minWidth: '30px', textAlign: 'right' }}
                              >
                                {fCurrency(
                                  (convertToRupee(get(h, 'price')) * get(h, 'GSTPercent')) / 100
                                )}
                              </Typography>
                            </Stack>
                          </Stack>
                        )}
                      </Stack>
                    ))}
                  </>
                )}

                {!isEmpty(get(data, 'additionalInfo.0.orderComment')) &&
                  get(data, `additionalInfo.0.orderComment.${get(e, 'productId')}`) && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 1,
                        alignItems: 'center',
                        fontSize: '12px',
                        ml: 0.8,
                      }}
                    >
                      <Typography>-</Typography>
                      <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>Note:</Typography>
                      <Typography sx={{ fontSize: '12px' }}>
                        {get(data, `additionalInfo.0.orderComment.${get(e, 'productId')}`)}
                      </Typography>
                    </Box>
                  )}

                {get(data, 'additionalInfo.0.info') && (
                  <Box sx={{ gridColumn: 'span 12' }}>
                    <Box
                      sx={{
                        border: '1px dashed',
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        p: 0.5,
                        mt: 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="caption" fontWeight="bold">
                          Additional Information
                        </Typography>
                        <Typography variant="caption">
                          {`- ${get(data, 'additionalInfo.0.info')}`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
