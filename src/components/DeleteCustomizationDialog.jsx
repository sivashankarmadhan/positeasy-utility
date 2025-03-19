import { Card, Dialog, Grid, Stack, Typography, alpha, useTheme } from '@mui/material';
import { get, isEmpty, map } from 'lodash';
import S3ImageCaching from 'src/components/S3ImageCaching';
import { fCurrency } from 'src/utils/formatNumber';

export default function DeleteCustomizationDialog(props) {
  const theme = useTheme();
  const { open, decrementOrderData, handleDeleteByCartId, handleClose } = props;
  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, minWidth: 300 }}>
        <Typography sx={{ fontWeight: 'bold' }}>Which addon would you like to delete?</Typography>
        <Grid container direction={'column'}>
          {map(decrementOrderData, (e) => (
            <Grid
              item
              key={e.cartId}
              onClick={() => handleDeleteByCartId(e.cartId)}
              sx={{
                border: 1,
                borderRadius: 1,
                m: 0.5,
                p: 1,
                borderColor: alpha(
                  theme.palette.common.black,
                  theme.palette.action.activatedOpacity
                ),

                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: '1px 2px 5px #000000',
                },
                cursor: 'pointer',
              }}
            >
              <Stack
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <S3ImageCaching
                  src={e.productImage}
                  style={{ height: 30, width: 30, borderRadius: 2 }}
                />
                <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>{e.name}</Typography>
                <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {fCurrency(e.offerPrice > 0 ? e.offerPrice : e.price)}
                </Typography>
              </Stack>
              {!isEmpty(get(e, 'addOn')) &&
                map(get(e, 'addOn'), (d) => (
                  <Stack
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      m: 0.3,
                    }}
                  >
                    <S3ImageCaching
                      src={d.addOnImage}
                      style={{ height: 24, width: 24, borderRadius: 2 }}
                    />
                    <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>{d.name}</Typography>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>
                      {fCurrency(d.price)}
                    </Typography>
                  </Stack>
                ))}
            </Grid>
          ))}
        </Grid>
      </Card>
    </Dialog>
  );
}
