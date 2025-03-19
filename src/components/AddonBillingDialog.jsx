import { Button, Card, Dialog, Grid, Stack } from '@mui/material';
import { filter, get, isEmpty, map } from 'lodash';
import { useState } from 'react';
import GetQuantitySelectedAddon from './GetQuantitySelectedAddon';

export default function AddonBillingDialog({ data, open, handleClose }) {
  const [quantityWithAddon, setQuantityWithAddon] = useState([]);

  const onClose = () => {
    handleClose({ selectedAddOn: [], productData: data.productData });
  };

  const filterAddQuantityData = filter(quantityWithAddon, (_item) => {
    return get(_item, 'quantity') > 0;
  });

  const onSubmit = () => {
    handleClose({ selectedAddOn: filterAddQuantityData, productData: data.productData });
    setQuantityWithAddon([]);
  };
  const handleAddonQuantity = (e) => {
    setQuantityWithAddon((prevState) => {
      const newData = filter(prevState, (d) => d.addOnId !== e.addOnId);
      return [...newData, e];
    });
  };

  return (
    <Dialog open={open}>
      <Card
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          minWidth: { xs: 320, sm: 450 },
        }}
      >
        <Grid
          container
          sx={{ width: '100%', mb: 1, maxHeight: 'calc(100vh - 10rem)', overflow: 'auto' }}
        >
          {data.addOnData &&
            map(data.addOnData, (e) => {
              return (
                <GetQuantitySelectedAddon
                  handleIncrementDecrementAddonQuantity={handleAddonQuantity}
                  value={e}
                  quantityWithAddon={quantityWithAddon}
                />
              );
            })}
        </Grid>

        <Stack
          flexDirection={'row'}
          sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 1, gap: 2 }}
        >
          <Button onClick={onClose} sx={{ color: '#000' }} size="small" variant="text">
            Cancel
          </Button>
          <Button
            disabled={isEmpty(filterAddQuantityData)}
            onClick={onSubmit}
            size="small"
            color="primary"
            variant="contained"
          >
            Submit
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
