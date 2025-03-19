import {
  Button,
  Dialog,
  Grid,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { find, get, isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { REQUIRED_CONSTANTS, ROLES_DATA, VALIDATE_CONSTANTS } from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import RegexValidation from 'src/constants/RegexValidation';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { alertDialogInformationState, allConfiguration, allProducts } from 'src/global/recoilState';
import SettingServices from 'src/services/API/SettingServices';
import AuthService from 'src/services/authService';
import PRODUCTS_API from 'src/services/products';

export default function ManageProductStock({
  open,
  handleClose,
  currentProductStock,
  setCurrentProductStock,
  syncUpProducts,
}) {
  const theme = useTheme();
  const [isEnable, setIsEnable] = useState(get(currentProductStock, 'stockMonitor'));
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const isStockResetMode = get(configuration, 'staffPermissions.isAllowStockReset', false);
  const isAllowStockReduce = get(configuration, 'staffPermissions.isAllowStockReduce', false);
  const isReverseStock = get(configuration, 'isReverseStock', false);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const listOfProducts = useRecoilValue(allProducts);
  const [stock, setStock] = useState(get(currentProductStock, 'stockQuantity'));
  const [isEnableAddStock, setIsEnableAddStock] = useState(
    get(currentProductStock, 'StockAlert.StockAlert')
  );
  const [lowQuantity, setlowQuantity] = useState('');
  const [lowQuantityInput, setLowQuantityInput] = useState(
    get(currentProductStock, 'StockAlert.count', '')
  );
  // const [stockValue, setStockValue] = useState(''); // Default value

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [info, setInfo] = useState('');
  const [isValidInput, setIsValidInput] = useState(true);
  const isShownCumulative = get(currentProductStock, 'stockMonitor') && isEnable;
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole;
  const isAllowStaffResetStock = isStockResetMode || isAuthorizedRoles;

  const isAllowStaffReduceStock = isAllowStockReduce || isAuthorizedRoles;

  const [addStock, setAddStock] = useState(null);
  const [reduceStock, setReduceStock] = useState(null);

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

  const currentStock = stock ? stock : 0;
  const isAllow =
    (get(currentProductStock, 'stockMonitor', false) &&
      currentStock >= get(currentProductStock, 'stockQuantity', 0)) ||
    isAllowStaffResetStock ||
    !get(currentProductStock, 'stockMonitor', false);
  const isAllowSwitch = !get(currentProductStock, 'stockMonitor', false) || isAuthorizedRoles;
  const isAllowOk = !get(currentProductStock, 'stockMonitor', false) && isEnable && stock > 0;

  const handleChange = () => {
    setIsEnable(!isEnable);
  };
  const handleChangeStock = (e) => {
    const inputValue = e.target.value;
    if (/^[0-9]*$/.test(inputValue)) {
      setStock(inputValue);
      setIsValidInput(true);
    } else {
      setIsValidInput(false);
    }
  };
  const handleChangeInfo = (e) => {
    setInfo(e.target.value);
  };
  const handleToggleAddStock = () => {
    setIsEnableAddStock(!isEnableAddStock);
  };

  const handleChangeLowStock = (event) => {
    const inputValue = event.target.value;
    if (RegexValidation.POSITIVE_NUMBER_WITH_EMPTY.test(inputValue) && Number(inputValue) > 0) {
      setLowQuantityInput(inputValue);
    } else if (inputValue === '') {
      setLowQuantityInput('');
    }
  };

  const handlelowQuantity = async () => {
    if (lowQuantityInput === '') {
      toast.error('Please enter a valid low stock value');
      return;
    }
    try {
      let options = {
        StockAlert: isEnableAddStock,
        productId: get(currentProductStock, 'productId'),
        ...(isEnableAddStock && { count: Number(lowQuantityInput) }),
      };

      const response = await PRODUCTS_API.updateStockAlert(options);

      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success('Stock alert updated successfully');
      }

      setCurrentProductStock((prev) => ({
        ...prev,
        lowStockQuantity: Number(lowQuantityInput),
      }));

      syncUpProducts();
      // handleClose();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
    }
  };
  const fetchConfiguration = async () => {
    try {
      const resp = await SettingServices.getConfiguration();
      if (resp) {
        setConfiguration({
          ...(configuration || {}),
          ...(get(resp, 'data.0') || {}),
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleResetStock = async () => {
    try {
      let options = {
        productId: get(currentProductStock, 'productId'),
        quantity: get(currentProductStock, 'stockQuantity'),
        name: get(currentProductStock, 'name'),
      };
      const response = await PRODUCTS_API.resetStock(options);
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
      subtitle: `Are you sure! You want to reset the ${get(
        currentProductStock,
        'stockQuantity'
      )} stock, this action cannot be reversed ? ( Product will be mark as soldout )`,
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

  const handleOpenAlertForEnableReverseStock = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure! You want to enable reverse stock ?`,
      actions: {
        primary: {
          text: 'Ok',
          onClick: (onClose) => {
            handleReverseStockOn();
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

  const handleComplete = (_isReverseStock) => {
    if (isEnable) {
      const isReverseStockData = isReverseStock || _isReverseStock;

      if (
        (!addStock || addStock <= 0) &&
        (!reduceStock || reduceStock <= 0) &&
        (((!stock || stock <= 0) && !isReverseStockData) ||
          get(currentProductStock, 'stockQuantity'))
      ) {
      }

      if (reduceStock && reduceStock > 0) {
        if (stock < 0) {
          return toast.error(REQUIRED_CONSTANTS.STOCK_QUANTITY_IS_NOT_AVAILABLE);
        }
      }

      const options = {
        productId: currentProductStock.productId,
        monitor: isEnable,
        quantity: Number(stock) || 0,
        newQuantity: Number(addStock) || Number('-' + reduceStock) || Number(stock) || 0,
        info: info,
        name: get(currentProductStock, 'unitsEnabled')
          ? `${get(currentProductStock, 'name')}-${get(currentProductStock, 'unit')}${get(
              currentProductStock,
              'unitName'
            )}`
          : get(currentProductStock, 'name'),
        status: 'ACTIVE',
      };
      handleUpdateProduct(options);
    }
    if (!isEnable) {
      const options = {
        productId: currentProductStock.productId,
      };
      handleMonitorOff(options);
      handleClose();
    }
  };

  const handleReverseStockOn = async () => {
    try {
      await SettingServices.turnOnReverseStock();
      await fetchConfiguration();
      handleComplete(true);
    } catch (err) {
      console.log(err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleUpdateProduct = async (options) => {
    try {
      const response = await PRODUCTS_API.updateStock(options);
      if (response) toast.success(SuccessConstants.STOCK_UPDATED);
      syncUpProducts();
      handleClose();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
    }
  };

  const handleMonitorOff = async (options) => {
    try {
      const response = await PRODUCTS_API.monitorOff(options);
      if (response) toast.success(SuccessConstants.STOCK_MONITOR_IS_TURNED_OFF);
      syncUpProducts();
      handleClose();
    } catch (e) {
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
      setInfo(null);
    }
  }, [addStock, reduceStock, currentProductStock]);
  console.log('isEnable', isEnable, isEnableAddStock);
  console.log(
    'isEnablecurrentProductStock',
    currentProductStock,
    currentProductStock?.StockAlert?.StockAlert
  );

  return (
    <Dialog open={open}>
      <Paper
        sx={{
          p: 2,
        }}
      >
        <Typography sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
          {`   Manage Stock Details of ${get(currentProductStock, 'name')?.toUpperCase()}`}
          {get(currentProductStock, 'unit')
            ? ` (${get(currentProductStock, 'unit')}${get(currentProductStock, 'unitName')})`
            : ''}
        </Typography>
        <Grid container sx={{ alignItems: 'center', mb: 3 }}>
          <Grid xs={isEnable ? 4 : 6} item sx={{ mb: 2, textWrap: 'nowrap' }}>
            Stock monitor
          </Grid>
          <Grid xs={isEnable ? 8 : 6} item sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography> Off</Typography>
              <Switch
                disabled={!isAllowSwitch}
                value={isEnable}
                checked={isEnable}
                onChange={handleChange}
              />
              <Typography>On</Typography>
            </Stack>
          </Grid>
          <Grid xs={4} item>
            {isEnable && 'Stock quantity'}
            {isEnable && (
              <Typography
                sx={{
                  fontSize: '8px',
                  color: isReverseStock ? 'green' : 'red',
                  fontWeight: 'bold',
                  ml: 0.2,
                }}
              >
                Reverse stock is {isReverseStock ? 'ON' : 'OFF'}
              </Typography>
            )}
          </Grid>
          <Grid xs={8} item sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            {isEnable && (
              <TextField
                onChange={handleChangeStock}
                type="text"
                label="Enter stock"
                disabled={get(currentProductStock, 'stockQuantity')}
                onWheel={(e) => e.target.blur()}
                defaultValue={stock}
                value={stock}
                helperText={isValidInput ? '' : 'Please enter a valid number'}
                error={!isValidInput}
              />
            )}
            {isEnable &&
              !addStock &&
              !reduceStock &&
              !!get(currentProductStock, 'stockQuantity') &&
              isAllowStaffResetStock && (
                <Button variant="contained" size="medium" onClick={handleOpenAlertForResetStock}>
                  Reset
                </Button>
              )}
          </Grid>

          {!!isEnable && !!get(currentProductStock, 'stockQuantity') && (
            <>
              <Grid xs={4} item sx={{ mb: 1 }}>
                New stock
              </Grid>

              <Grid xs={8} item sx={{ mb: 1 }}>
                <TextField
                  sx={{ mt: 1 }}
                  onChange={handleChangeAddStock}
                  label="Enter new stock"
                  onWheel={(e) => e.target.blur()}
                  value={addStock || ''}
                />
              </Grid>

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
                </>
              )}

              <Grid xs={4} item>
                Reason
              </Grid>

              <Grid xs={8} item>
                <TextField
                  sx={{ mt: 2 }}
                  onChange={handleChangeInfo}
                  label="Enter additional info"
                  onWheel={(e) => e.target.blur()}
                  defaultValue={info}
                />
              </Grid>
            </>
          )}
          {!!isEnable && (
            <>
              <Grid xs={isEnable ? 4 : 6} item sx={{ mb: 2, mt: 2, textWrap: 'nowrap' }}>
                Add Low Stock
              </Grid>
              <Grid xs={isEnable ? 8 : 6} item sx={{ mb: 2, mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography> Off</Typography>
                  <Switch
                    checked={isEnableAddStock}
                    onChange={handleToggleAddStock}
                    defaultValue={isEnableAddStock}
                  />
                  <Typography>On</Typography>
                </Stack>
              </Grid>
              {isEnableAddStock && (
                <>
                  <Grid xs={4} item>
                    Low stock
                  </Grid>

                  <Grid xs={8} item>
                    <TextField
                      sx={{ mt: 1 }}
                      label="Enter low stock"
                      value={lowQuantityInput}
                      defaultValue={lowQuantityInput}
                      onChange={handleChangeLowStock}
                    />
                  </Grid>
                </>
              )}
            </>
          )}
        </Grid>
        <Stack sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row' }}>
          <Button onClick={() => handleClose()} sx={{ mr: 2 }} variant="text">
            Cancel
          </Button>
          <Button
            disabled={isEnableAddStock && (!lowQuantityInput || !isAllow)}
            onClick={() => {
              if (!isReverseStock && isEnable && Number(stock) === 0) {
                handleOpenAlertForEnableReverseStock();
              } else {
                handlelowQuantity();
                handleComplete();
              }
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
