import { alpha, Grid, IconButton, Stack, Typography, useTheme } from '@mui/material';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useEffect, useState } from 'react';
import S3ImageCaching from './S3ImageCaching';
import { find, get } from 'lodash';
import { fCurrency } from 'src/utils/formatNumber';

export default function GetQuantitySelectedAddon({
  value,
  handleIncrementDecrementAddonQuantity,
  quantityWithAddon,
}) {
  const theme = useTheme();

  const [quantity, setQuantity] = useState(0);

  const selected = find(quantityWithAddon, (_item) => {
    return get(_item, 'addOnId') === get(value, 'addOnId');
  });

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };
  const handleDecrement = () => {
    setQuantity((prev) => prev - 1);
  };
  useEffect(() => {
    handleIncrementDecrementAddonQuantity({ ...value, quantity });
  }, [quantity]);

  return (
    <Grid
      sm={5.5}
      lg={5.5}
      xs={12}
      item
      sx={{
        border: 1,
        borderColor:
          get(selected, 'quantity') > 0
            ? theme.palette.success.dark
            : alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        m: 1,
        padding: 1,
        borderRadius: 1,
      }}
      onClick={() => {
        handleIncrement();
      }}
    >
      <Grid key={value.addOnId} container sx={{ alignItems: 'center' }}>
        <Grid item xs={4} sm={4} lg={4}>
          <S3ImageCaching
            src={get(value, 'addOnImage')}
            alt={get(value, 'name')}
            style={{ borderRadius: 10 }}
          />
        </Grid>
        <Grid item xs={8} sm={8} lg={8}>
          <Stack
            flexDirection={'column'}
            sx={{ display: 'flex', justifyContent: 'space-between', ml: 1.5 }}
          >
            <Typography sx={{ fontSize: '15px' }}>{get(value, 'name')}</Typography>
            <Typography sx={{ fontWeight: 'bold' }}>{fCurrency(get(value, 'price'))}</Typography>
          </Stack>
          <Stack
            direction={'row'}
            sx={{
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: '100%',
              // maxWidth: 100,
              visibility: quantity > 0 ? 'visible' : 'hidden',
            }}
          >
            <IconButton>
              <RemoveCircleIcon
                sx={{
                  color: theme.palette.error.main,
                  fontSize: '18px',

                  '&:hover': { color: theme.palette.common.black },
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDecrement();
                }}
              />
            </IconButton>
            <Typography sx={{ opacity: 0.2 }}>|</Typography>
            <Typography sx={{ mx: 1, fontSize: '18px' }}>{quantity}</Typography>
            <Typography sx={{ opacity: 0.2 }}>|</Typography>
            <IconButton>
              <AddCircleIcon
                sx={{
                  color: theme.palette.success.dark,
                  fontSize: '18px',
                  '&:hover': { color: theme.palette.common.black },
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleIncrement();
                }}
              />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
}
