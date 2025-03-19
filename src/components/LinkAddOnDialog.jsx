import {
  Button,
  Card,
  Dialog,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { forEach, get, map } from 'lodash';
import React, { useState } from 'react';
import S3ImageCaching from './S3ImageCaching';
import { fCurrency } from 'src/utils/formatNumber';
import AutoCompleteChipWithCheckBox from './AutoCompleteChipWithCheckBox';
import CancelIcon from '@mui/icons-material/Cancel';
import PRODUCTS_API from 'src/services/products';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';

export default function LinkAddOnDialog(props) {
  const {
    addonOpenDialog,
    handleCloseAddOnDialog,
    currentProductAddon,
    selectedValues,
    addonList,
    setSelectedValues,
    currentProductData,
    syncUpProducts,
    isView,
    bulkUpdate,
  } = props;
  const theme = useTheme();
  const [openAddonDelinkConfirmDialog, setOpenAddonDelinkConfirmDialog] = useState(false);

  const handleSubmitDeLinkAddon = async (addOnId) => {
    try {
      const response = await PRODUCTS_API.deLinkAddon(
        addOnId,
        get(currentProductData, 'productId')
      );
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        syncUpProducts();
      }
    } catch (e) {
      console.log(e);
    } finally {
      handleCloseAddOnDialog();
      setOpenAddonDelinkConfirmDialog(false);
    }
  };
  const handleSubmitLinkAddon = async () => {
    try {
      let options = [];
      if (get(bulkUpdate, 'isOpen', false)) {
        map(get(bulkUpdate, 'data', []), (d) => {
          forEach(selectedValues, (e) => {
            options.push({
              productId: d,
              addOnId: e.addOnId,
            });
          });
        });
      } else {
        forEach(selectedValues, (e) => {
          options.push({
            productId: get(currentProductData, 'productId'),
            addOnId: e.addOnId,
          });
        });
      }
      const response = await PRODUCTS_API.linkAddon(options);
      if (response) {
        handleCloseAddOnDialog();
        toast.success(SuccessConstants.ADDON_ADDED);
        syncUpProducts();
      }
    } catch (e) {
      console.log(e);
      handleCloseAddOnDialog();
    }
  };
  return (
    <Dialog
      open={get(bulkUpdate, 'isOpen', false) ? get(bulkUpdate, 'isOpen', false) : addonOpenDialog}
    >
      <Card
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          minWidth: { xs: 320, sm: 450 },
        }}
      >
        {!isView && (
          <Grid container sx={{ alignItems: 'center' }}>
            <Grid item>
              <AutoCompleteChipWithCheckBox
                selectedValues={selectedValues}
                options={addonList}
                setSelectedValues={setSelectedValues}
                currentProductAddon={currentProductAddon}
              />
            </Grid>
            <Grid item>
              <Button
                onClick={() => handleSubmitLinkAddon()}
                size="small"
                variant="contained"
                sx={{ m: 1, display: 'flex' }}
              >
                Add Addons
              </Button>
            </Grid>
          </Grid>
        )}

        <Grid
          container
          sx={{ width: '100%', mb: 1, maxHeight: 'calc(100vh - 10rem)', overflow: 'auto' }}
        >
          {currentProductAddon &&
            map(currentProductAddon, (e) => (
              <Grid
                sm={5.5}
                lg={5.5}
                xs={12}
                item
                sx={{
                  border: 1,
                  borderColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity
                  ),
                  m: 1,
                  padding: 1,
                  borderRadius: 1,
                }}
              >
                <Grid container sx={{ alignItems: 'center' }}>
                  <Grid item xs={4} sm={4} lg={4}>
                    <S3ImageCaching
                      src={get(e, 'addOnImage')}
                      alt={get(e, 'name')}
                      style={{ height: 50, width: 50, borderRadius: 10 }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6} lg={6}>
                    <Stack
                      flexDirection={'column'}
                      sx={{ display: 'flex', justifyContent: 'space-between', ml: 1 }}
                    >
                      <Typography sx={{ fontSize: '15px' }}>{get(e, 'name')}</Typography>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {fCurrency(get(e, 'price'))}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid
                    item
                    xs={2}
                    sm={2}
                    lg={2}
                    sx={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <IconButton>
                      <CancelIcon
                        color="error"
                        onClick={() => setOpenAddonDelinkConfirmDialog(true)}
                      />
                    </IconButton>
                  </Grid>
                </Grid>
                <Dialog open={openAddonDelinkConfirmDialog}>
                  <Paper
                    sx={{
                      p: 2,
                    }}
                  >
                    <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                      Are you sure you want to remove the Addon on this product? This action cannot
                      be undone.
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        onClick={() => setOpenAddonDelinkConfirmDialog(false)}
                        sx={{ mr: 2 }}
                        variant="text"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSubmitDeLinkAddon(get(e, 'addOnId'))}
                        variant="contained"
                      >
                        ok
                      </Button>
                    </div>
                  </Paper>
                </Dialog>
              </Grid>
            ))}
        </Grid>
      </Card>
    </Dialog>
  );
}
