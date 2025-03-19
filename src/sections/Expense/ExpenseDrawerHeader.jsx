import { Button, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import CreateIcon from '@mui/icons-material/Create';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { isEmpty } from 'lodash';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { currentProduct } from 'src/global/recoilState';

const ExpenseDrawerHeader = ({
  reset,
  handleClose,
  handleCloseDrawer,
  editMode,
  setEditMode,
  newProduct,
  newExpense,
}) => {
  const theme = useTheme();
  const resetCurrentProduct = useResetRecoilState(currentProduct);
  const currentProductData = useRecoilValue(currentProduct);
  const { isMobile } = useResponsive();
  const handleCancel = () => {
    handleCloseDrawer();
  };
  const productName = isEmpty(currentProductData)
    ? newExpense
      ? ''?.toUpperCase()
      : 'Edit Expense'?.toUpperCase()
    : currentProductData?.name?.toUpperCase();
  return (
    <Stack
      flexDirection={'row'}
      sx={{
        justifyContent: 'space-between',
        m: 1,
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        mx: 3,
        mt: 3,
        my: 2,
      }}
    >
      <Typography variant="h6">{productName}</Typography>
      <Stack flexDirection="row" gap={2} alignItems="center">
        <Stack flexDirection={'row'}>
          <Tooltip title="Close">
            <IconButton
              sx={{ color: theme.palette.primary.main, height: 40 }}
              onClick={() => handleCancel()}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  );
};
export default ExpenseDrawerHeader;
