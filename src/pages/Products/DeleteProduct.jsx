import { Button, Dialog, Paper, Typography } from '@mui/material';
import { get } from 'lodash';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import PRODUCTS_API from 'src/services/products';
import RAW_PRODUCTS_API from 'src/services/rawproducts';

export default function DeleteProduct(props) {
  const { open, product, handleClose, syncUpProducts, isRawMaterial = false } = props;

  const handleDeleteProduct = async () => {
    try {
      const options = {
        productId: get(product, 'productId'),
      };

      const response = await (isRawMaterial
        ? RAW_PRODUCTS_API.deleteProduct(options)
        : PRODUCTS_API.deleteProduct(options));
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        handleClose();
        syncUpProducts();
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || 'Unable to Delete Product, Try Again');
    }
  };
  return (
    <Dialog open={open}>
      <Paper
        sx={{
          p: 2,
        }}
      >
        <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
          Are you sure you want to delete {get(product, 'name')?.toUpperCase()}
          {get(product, 'unitsEnabled') ? `${get(product, 'unit')}${get(product, 'unitName')}` : ''}
          ? This action cannot be undone.
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} sx={{ mr: 2 }} variant="text">
            Cancel
          </Button>
          <Button onClick={handleDeleteProduct} variant="contained">
            Ok
          </Button>
        </div>
      </Paper>
    </Dialog>
  );
}
