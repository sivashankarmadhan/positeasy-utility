import {
  Button,
  Checkbox,
  Dialog,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { find, get, isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { REQUIRED_CONSTANTS, ROLES_DATA, VALIDATE_CONSTANTS } from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import RegexValidation from 'src/constants/RegexValidation';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { alertDialogInformationState, allConfiguration, allProducts } from 'src/global/recoilState';
import AuthService from 'src/services/authService';
import PRODUCTS_API from 'src/services/products';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';

export default function ManageRawMaterialStock({
  open,
  handleClose,
  currentProductStock,
  setCurrentProductStock,
  syncUpProducts,
}) {
  const theme = useTheme();

  const configuration = useRecoilValue(allConfiguration);
  const isStockResetMode = get(configuration, 'staffPermissions.isAllowStockReset', false);
  const isAllowStockReduce = get(configuration, 'staffPermissions.isAllowStockReduce', false);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const listOfProducts = useRecoilValue(allProducts);
  const [addStock, setAddStock] = useState(null);
  const [reduceStock, setReduceStock] = useState(null);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [lowStockNotification, setLowStockNotification] = useState(false);
  const [lowStockValue, setLowStockValue] = useState('');
  const [isAllowStaffRed, setIsAllowStaffRed] = useState(false);
  const [stock, setStock] = useState(
    toFixedIfNecessary(get(currentProductStock, 'stockQuantity'), 2)
  );
  const [reduceStockReason, setReduceStockReason] = useState('wastage');
  const [assignTo, setAssignTo] = useState('');
  const [isRawValue, serIsRawValue] = useState();
  const [value, setValue] = useState('');
  const [valueError, setValueError] = useState(false);
  const [helperText, setHelperText] = useState('');
  const checkRawValueExist = async () => {
    let options = {
      productId: get(currentProductStock, 'productId'),

      storeId: get(currentProductStock, 'storeId'),
      merchantId: get(currentProductStock, 'merchantId'),
    };
    try {
      const response = await PRODUCTS_API.rawValue(options);

      if (response?.data?.unitAverageValue) {
        setHelperText('');
        serIsRawValue(false);
      } else {
        serIsRawValue(true);
        setHelperText(<span style={{ color: '#3674B5', fontSize: '9px' }}>{response?.data}</span>);
      }
    } catch (error) {
      toast.error('Raw value does not exist.');
      serIsRawValue(true);
    }
  };
  const getCurrentTimestamp = () => new Date().toISOString();
  const handleChangeValue = (event) => {
    const inputValue = event.target.value;
    const floatValue = inputValue.split?.('.')?.[1];

    if (
      RegexValidation.POSITIVE_NUMBER_WITH_EMPTY.test(inputValue) &&
      (!floatValue || floatValue.length <= 2)
    ) {
      setValue(inputValue);
      setValueError(false);
      checkRawValueExist(inputValue);
    } else {
      setValueError(true);
    }
  };
  const handleKeyDownValue = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleComplete();
    }
  };

  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole;
  const isAllowStaffResetStock = isStockResetMode || isAuthorizedRoles;

  const isAllowStaffReduceStock = isAllowStockReduce || isAuthorizedRoles;

  const handleChangeAddStock = (event) => {
    const floatValue = event.target.value?.split?.('.')?.[1];
    if (
      RegexValidation.POSITIVE_NUMBER_WITH_EMPTY.test(event.target.value) &&
      (!floatValue || floatValue?.length <= 2)
    ) {
      setAddStock(event.target.value);
      setReduceStock(null);
    }
  };

  useEffect(() => {
    setLowStockNotification(get(currentProductStock, 'StockAlert.StockAlert', false));
    setLowStockValue(get(currentProductStock, 'StockAlert.count', ''));
    //setValue(get(currentProductStock, 'rawValue', ''));
  }, [currentProductStock]);

  const handleLowStockToggle = () => {
    setLowStockNotification(!lowStockNotification);
  };

  const handleChangeLowStock = (event) => {
    const inputValue = event.target.value;
    if (RegexValidation.POSITIVE_NUMBER_WITH_EMPTY.test(inputValue) && Number(inputValue) > 0) {
      setLowStockValue(inputValue);
    } else if (inputValue === '') {
      setLowStockValue('');
    }
  };

  const handleChangeReduceStock = (event) => {
    const floatValue = event.target.value?.split?.('.')?.[1];
    if (
      RegexValidation.POSITIVE_NUMBER_WITH_EMPTY.test(event.target.value) &&
      (!floatValue || floatValue?.length <= 2)
    ) {
      setReduceStock(event.target.value);
      setAddStock(null);
    }
  };

  const handleResetStock = async () => {
    try {
      let options = {
        productId: get(currentProductStock, 'productId'),
        quantity: get(currentProductStock, 'stockQuantity'),
        name: get(currentProductStock, 'name'),
      };
      const response = await PRODUCTS_API.resetRawMaterialStock(options);
      if (response) toast.success(SuccessConstants.STOCK_UPDATED);
      syncUpProducts();
      handleClose();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
    }
  };

  const handleOpenAlertForResetStock = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure! You want to reset the ${toFixedIfNecessary(
        get(currentProductStock, 'stockQuantity'),
        2
      )} stock, this action cannot be reversed?`,
      actions: {
        primary: {
          text: 'Reset',
          onClick: (onClose) => {
            handleResetStock();
            onClose();
          },
          sx: {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
            },
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          sx: {
            color: '#000',
          },
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };

  const handleComplete = () => {
    if (addStock && addStock > 0) {
      if (currentProductStock.stock < 0) {
        return toast.error(REQUIRED_CONSTANTS.STOCK_QUANTITY_IS_NOT_AVAILABLE);
      }
      const options = {
        monitor: true,
        productId: currentProductStock?.productId,
        quantity: Number(addStock),
        rawValue: Number(value),

        name: get(currentProductStock, 'name'),
      };
      console.log('Updating product stock with options:', options);
      handleUpdateProduct(options);
    }

    if (reduceStock && reduceStock > 0) {
      if (currentProductStock.stock < 0) {
        return toast.error(REQUIRED_CONSTANTS.STOCK_QUANTITY_IS_NOT_AVAILABLE);
      }
      const options = {
        monitor: true,
        productId: currentProductStock?.productId,
        quantity: -Number(reduceStock),
        rawValue: Number(value),

        name: get(currentProductStock, 'name'),

        ...(reduceStockReason === 'assignTo' && {
          assignTo: assignTo,
          wastageType: 'identifiers',
        }),
      };
      console.log('Reducing product stock with options:', options);
      handleUpdateProduct(options);
    }

    if (lowStockNotification && lowStockValue && lowStockValue > 0) {
      const alertOptions = {
        StockAlert: lowStockNotification,
        productId: currentProductStock?.productId,
        count: lowStockNotification && lowStockValue ? Number(lowStockValue) : 0,
      };
      console.log('Updating low stock alert with options:', alertOptions);
      handleUpdateLowStock(alertOptions);
      handleClose();
    }
    if (!lowStockNotification) {
      if (!lowStockValue || lowStockValue <= 0) {
        return;
      }
      const alertOptions = {
        StockAlert: lowStockNotification,
        productId: currentProductStock?.productId,
      };
      console.log('Updating low stock alert with options:', alertOptions);
      handleUpdateLowStock(alertOptions);
      handleClose();
    }
  };
  const isMobile = useMediaQuery('(max-width:600px)');
  const handleUpdateProduct = async (options) => {
    try {
      const response = await PRODUCTS_API.updateRawMaterialStock(options);
      if (response) toast.success(SuccessConstants.STOCK_UPDATED);
      syncUpProducts();
      handleClose();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
    }
  };

  const handleAssignToChange = (e) => {
    setAssignTo(e.target.value);
  };

  const handleUpdateLowStock = async (options) => {
    try {
      console.log('Options:', options);
      const response = await PRODUCTS_API.updateRawProductAlert(options);
      if (response) {
        console.log('API succeeded:', response);
        // toast.success(SuccessConstants.STOCK_UPDATED);
      }
      syncUpProducts();
      handleClose();
    } catch (e) {
      console.error('API error:', e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
    }
  };

  useEffect(() => {
    if (!isEmpty(listOfProducts)) {
      const findedProduct = find(
        listOfProducts,
        (e) => get(e, 'productId') === get(currentProductStock, 'productId')
      );
      if (!isEmpty(findedProduct)) setCurrentProductStock(findedProduct);
    }
  }, [listOfProducts]);

  useEffect(() => {
    if (addStock && addStock > 0) {
      setStock(Number(get(currentProductStock, 'stockQuantity')) + Number(addStock));
    } else if (reduceStock && reduceStock > 0) {
      setStock(Number(get(currentProductStock, 'stockQuantity')) - Number(reduceStock));
    } else {
      setStock(Number(get(currentProductStock, 'stockQuantity')));
    }
  }, [addStock, reduceStock, currentProductStock]);
  useEffect(() => {
    if (!value) {
      setIsAllowStaffRed(false);
    }
    if (!addStock && !reduceStock) {
      setValue('');
    }
  }, [value, addStock, reduceStock]);
  return (
    <Dialog open={open}>
      <Paper
        sx={{
          p: 2,
        }}
      >
        <Typography sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
          {`Manage Stock Details of ${get(currentProductStock, 'name')?.toUpperCase()}`}
          {get(currentProductStock, 'unit')
            ? ` (${get(currentProductStock, 'unit')}${get(currentProductStock, 'unitName')})`
            : ''}
        </Typography>
        <Grid container sx={{ alignItems: 'center', mb: 3 }}>
          <Grid xs={4} item sx={{ my: 1 }}>
            Stock quantity
          </Grid>
          <Grid xs={8} item sx={{ display: 'flex', flexDirection: 'row', gap: 2, my: 1 }}>
            <TextField
              type="text"
              disabled
              onWheel={(e) => e.target.blur()}
              defaultValue={stock}
              value={toFixedIfNecessary(stock, 2)}
            />

            {!addStock &&
              !reduceStock &&
              !!get(currentProductStock, 'stockQuantity') &&
              isAllowStaffResetStock && (
                <Button
                  sx={{ width: '7rem' }}
                  variant="contained"
                  size="medium"
                  onClick={handleOpenAlertForResetStock}
                >
                  Reset
                </Button>
              )}
          </Grid>

          <Grid xs={4} item sx={{ mb: 1 }}>
            New stock
          </Grid>

          <Grid xs={8} item sx={{ mb: 1 }}>
            <TextField
              sx={{ mt: 1 }}
              onChange={handleChangeAddStock}
              label="Enter new stock"
              onWheel={(e) => e.target.blur()}
              helperText={`Unit Average Value: ${fCurrency(
                toFixedIfNecessary(get(currentProductStock, 'unitAverageValue', 0), 2) || 0
              )}`}
              value={addStock || ''}
            />
          </Grid>
          <Grid xs={4} item sx={{ mb: 1 }}>
            Total Value
          </Grid>

          <Grid
            item
            xs={8}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}
          >
            <TextField
              onChange={handleChangeValue}
              onKeyDown={handleKeyDownValue}
              label="Enter value"
              sx={{ mt: 1 }}
              disabled={!addStock && !reduceStock}
              onWheel={(e) => e.target.blur()}
              value={value}
              error={valueError}
              helperText={
                helperText
                  ? helperText
                  : !addStock && !reduceStock && 'Please Enter New Stock or Reduce Stock'
              }
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
            {!isMobile && isRawValue && (
              <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 3 }}>
                <Checkbox
                  checked={isAllowStaffRed}
                  disabled={!value}
                  onChange={(e) => setIsAllowStaffRed(e.target.checked)}
                  color="primary"
                />
                <Typography fontSize={'10px'}>Allow input value</Typography>
              </Stack>
            )}
          </Grid>
          {isMobile && isRawValue && (
            <Grid xs={12} item sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAllowStaffRed}
                    disabled={!value}
                    onChange={(e) => setIsAllowStaffRed(e.target.checked)}
                    color="primary"
                  />
                }
                label="Allow input value"
              />
            </Grid>
          )}
          {isAllowStaffReduceStock && (
            <>
              <Grid xs={4} item>
                Reduce stock
              </Grid>

              <Grid xs={8} item>
                <TextField
                  sx={{ mt: 1 }}
                  onChange={handleChangeReduceStock}
                  label="Enter reduce stock"
                  onWheel={(e) => e.target.blur()}
                  value={reduceStock || ''}
                />
              </Grid>

              {isAllowStaffReduceStock && reduceStock && (
                <>
                  <Grid xs={4} item>
                    <Typography sx={{ mt: 1 }}>Reason</Typography>
                  </Grid>
                  <Grid xs={8} item>
                    <RadioGroup
                      row
                      value={reduceStockReason}
                      onChange={(e) => setReduceStockReason(e.target.value)}
                    >
                      <FormControlLabel value="wastage" control={<Radio />} label="Wastage" />
                      <FormControlLabel value="assignTo" control={<Radio />} label="Assigned To" />
                    </RadioGroup>
                  </Grid>

                  {reduceStockReason === 'assignTo' && (
                    <>
                      <Grid xs={4} item>
                        <Typography sx={{ mt: 1 }}>Assign To</Typography>
                      </Grid>
                      <Grid xs={8} item>
                        <TextField
                          sx={{ mt: 1 }}
                          onChange={handleAssignToChange}
                          label="Enter assignee"
                          value={assignTo || ''}
                        />
                      </Grid>
                    </>
                  )}
                </>
              )}
            </>
          )}

          <Grid xs={lowStockNotification ? 4 : 6} item sx={{ mb: 2, mt: 2, textWrap: 'nowrap' }}>
            Add Low Stock
          </Grid>
          <Grid xs={lowStockNotification ? 8 : 6} item sx={{ mb: 2, mt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography> Off</Typography>
              <Switch checked={lowStockNotification} onChange={handleLowStockToggle} />
              <Typography>On</Typography>
            </Stack>
          </Grid>
          {lowStockNotification && (
            <>
              <Grid xs={4} item>
                Low stock
              </Grid>

              <Grid xs={8} item>
                <TextField
                  sx={{ mt: 1 }}
                  label="Enter low stock"
                  onChange={handleChangeLowStock}
                  value={lowStockValue}
                  defaultValue={lowStockValue}
                />
              </Grid>
            </>
          )}
        </Grid>
        <Stack sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row' }}>
          <Button onClick={() => handleClose()} sx={{ mr: 2 }} variant="text">
            Cancel
          </Button>
          <Button
            disabled={
              (!isAllowStaffRed && isRawValue) ||
              (lowStockNotification && (!lowStockValue || Number(lowStockValue) <= 0))
            }
            onClick={() => {
              if (reduceStockReason === 'assignTo' && !assignTo) {
                return toast.error('Please enter a valid assignee');
              }
              if (lowStockNotification) {
                if (!lowStockValue || Number(lowStockValue) <= 0) {
                  return toast.error('Please enter a valid low stock value');
                }

                handleUpdateLowStock({
                  StockAlert: lowStockNotification,
                  productId: currentProductStock?.productId,
                  count: Number(lowStockValue),
                });
              }
              handleComplete();
            }}
            variant="contained"
          >
            Ok
          </Button>
        </Stack>
      </Paper>
    </Dialog>
  );
}
