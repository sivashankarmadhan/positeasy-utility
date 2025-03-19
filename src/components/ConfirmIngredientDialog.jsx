import {
  Box,
  Button,
  Card,
  Dialog,
  Grid,
  IconButton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { clone, find, findIndex, forEach, get, isEmpty, map } from 'lodash';
import { useRecoilValue } from 'recoil';
import { currentStoreId } from 'src/global/recoilState';
import RAW_PRODUCTS_API from 'src/services/rawproducts';
import toast from 'react-hot-toast';
import Label from './label';
import { Close } from '@mui/icons-material';
export default function ConfirmIngredientDialog(props) {
  const {
    open,
    handleClose,
    productData,
    selectedProducts,
    setSelectedProducts,
    previousIngredients,
    getPreviousIngredients,
    handleReset,
  } = props;
  const theme = useTheme();
  const currentStore = useRecoilValue(currentStoreId);
  const getSelected = (productId) => {
    const isAlready = find(selectedProducts, (e) => get(e, 'productId') === productId);
    return isAlready;
  };

  const handleRemoveSelectedProduct = (e) => {
    setSelectedProducts((prevState) => {
      const index = findIndex(prevState, (d) => get(d, 'productId') === get(e, 'productId'));
      if (index !== -1) {
        const currentState = [...prevState];
        currentState.splice(index, 1);
        return currentState;
      }
      return prevState;
    });
  };

  const handleSubmitLinkIngredient = async () => {
    try {
      if (isEmpty(previousIngredients)) {
        let options = [
          {
            storeId: currentStore,
            productId: get(productData, 'productId'),
            rawIngredients: map(selectedProducts, (e) => {
              return {
                ...e,
                rawProductId: get(e, 'productId'),
                quantity: Number(get(e, 'quantity')),
              };
            }),
          },
        ];
        const response = await RAW_PRODUCTS_API.addIngredients(options);
        if (response) {
          handleReset();
          getPreviousIngredients();
          toast.success(`Ingredients Added Successfully to ${get(productData, 'name')}`);
        }
      } else {
        let options = {
          storeId: currentStore,
          productId: get(productData, 'productId'),
          ingredients: map(selectedProducts, (e) => {
            return {
              ...e,
              rawProductId: get(e, 'productId'),
              quantity: Number(get(e, 'quantity')),
            };
          }),
        };

        const response = await RAW_PRODUCTS_API.updateIngredients(options);
        if (response) {
          handleReset();
          getPreviousIngredients();
          toast.success(`Ingredients Added Successfully to ${get(productData, 'name')}`);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Dialog open={open}>
      <Card
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: 340,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Are you sure the below materials link to {`${get(productData, 'name')}`}?
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Stack>

        <Grid
          direction={'column'}
          container
          sx={{ width: '100%', mt: 1, gap: 1, maxHeight: 500, overflowY: 'scroll' }}
        >
          {map(selectedProducts, (e) => (
            <Grid
              sm={12}
              lg={12}
              xs={12}
              item
              sx={{
                border: 1,
                borderColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity
                ),
                p: 1,

                borderRadius: 1,
              }}
            >
              <Stack
                sx={{
                  flexDirection: 'row',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack
                  sx={{
                    flexDirection: 'row',
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'space-between',
                  }}
                >
                  <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 'bold' }}>
                      {get(e, 'name')}
                    </Typography>
                    {!isEmpty(getSelected(get(e, 'productId'))) && (
                      <Label color="success" sx={{ fontSize: '15px', fontWeight: 'bold' }}>
                        {get(getSelected(get(e, 'productId')), 'quantity')}
                        {get(getSelected(get(e, 'productId')), 'unitName')?.toLowerCase()}
                      </Label>
                    )}
                  </Stack>
                </Stack>

                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  onClick={() => handleRemoveSelectedProduct(e)}
                >
                  Remove
                </Button>
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Button
          disabled={selectedProducts?.length < 1}
          onClick={handleSubmitLinkIngredient}
          variant="contained"
        >
          Confirm
        </Button>
      </Card>
    </Dialog>
  );
}
