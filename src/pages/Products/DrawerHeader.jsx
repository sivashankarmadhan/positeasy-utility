import { IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import CreateIcon from '@mui/icons-material/Create';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { isEmpty } from 'lodash';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { currentProduct } from 'src/global/recoilState';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const DrawerHeader = ({
  reset,
  handleCloseDrawer,
  editMode,
  setEditMode,
  newProduct,
  defaultValues,
  setAddMoreUnits,
  setOpenDeleteProduct,
}) => {
  const theme = useTheme();
  const resetCurrentProduct = useResetRecoilState(currentProduct);
  const currentProductData = useRecoilValue(currentProduct);
  const { isMobile } = useResponsive();
  const handleCancel = () => {
    handleCloseDrawer();
    setEditMode(false);
    resetCurrentProduct();
    reset();
  };
  const handleClear = () => {
    if (newProduct) {
      reset({ ...defaultValues });
      setAddMoreUnits(false);
    } else {
      reset({ ...currentProductData, isGST: currentProductData.GSTPercent > 0 ? true : false });
      setAddMoreUnits(false);
    }
  };
  const productName = isEmpty(currentProductData)
    ? 'Add Product'?.toUpperCase()
    : currentProductData?.name?.toUpperCase();
  return (
    <Stack
      flexDirection={'row'}
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1,
        mb: 3,
        backgroundColor: theme.palette.primary.main,
        p: 1,
        position: 'sticky',
        top: 0,
        zIndex: 999,
        width: '100%',
      }}
    >
      <Typography variant="h6" sx={{ color: '#fff' }}>
        {productName}
      </Typography>
      <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
        {!newProduct && !editMode && (
          <Tooltip title="Delete">
            <IconButton
              sx={{ color: '#fff', '&:hover': { color: theme.palette.error.main } }}
              onClick={() => setOpenDeleteProduct(true)}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        )}

        {!newProduct && !editMode && (
          <Tooltip title={'Edit'}>
            <IconButton onClick={() => setEditMode(true)} sx={{ color: '#fff' }}>
              <CreateIcon />
            </IconButton>
          </Tooltip>
        )}
        {editMode && (
          <Typography
            onClick={() => handleClear()}
            sx={{
              '&:hover': {
                textDecoration: 'underline',
              },
              fontSize: '14px',
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              mr: 1,
              cursor: 'pointer',
              // color: '#fff',
            }}
          >
            Reset
          </Typography>
        )}
        <Tooltip title="Close">
          <IconButton sx={{ color: '#fff' }} onClick={() => handleCancel()}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};
export default DrawerHeader;
