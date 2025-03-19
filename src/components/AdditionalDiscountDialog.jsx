import React, { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import { filter, map, isEmpty, get } from 'lodash';
import DeleteIcon from '@mui/icons-material/Delete';
import { StorageConstants } from 'src/constants/StorageConstants';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  amountCommentsState,
  currentStoreId,
  currentTerminalId,
  percentageCommentsState,
} from 'src/global/recoilState';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import SettingServices from 'src/services/API/SettingServices';
import DiscountIcon from '@mui/icons-material/Discount';
import { numberChecking } from 'src/utils/numberChecking';

export default function AdditionalDiscountDialog({
  open,
  handleClose,
  initialFetch,
  terminalConfiguration,
}) {
  const [amount, setAmount] = useRecoilState(amountCommentsState);
  const [percentage, setpercentage] = useRecoilState(percentageCommentsState);
  const [amountMessage, setAmountMessage] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [selectedValue, setSelectedValue] = useState('FlatAmount');
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [loading, setLoading] = useState(false);

  const paymentTabs = selectedValue === 'FlatAmount';
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        terminalSettings: {
          ...terminalConfiguration,
          additionalDiscount: {
            isActive: true,
            flatAmount: amount,
            discount: percentage,
            selected: selectedValue,
          },
        },
      };
      await SettingServices.postTerminalConfiguration(options);
      setLoading(false);
      initialFetch();
      handleClose();
    } catch (e) {
      setLoading(false);
      console.log(e);
      toast.error(ErrorConstants.FAILED_TO_FETCH_ADDITIONAL_DISCOUNT);
    }
  };

  useEffect(() => {
    if (terminalConfiguration) {
      setAmount(get(terminalConfiguration, 'additionalDiscount.flatAmount'));
      setpercentage(get(terminalConfiguration, 'additionalDiscount.discount'));
    }
  }, [terminalConfiguration]);

  const saveToLocal = (data) => {
    ObjectStorage.setItem(StorageConstants.AMOUNT_COMMENTS, {
      data: data,
    });
  };

  function handleAddPayment() {
    setAmount((prev) => {
      if (prev) {
        return [...prev, amountMessage];
      } else {
        return [amountMessage];
      }
    });
    setAmountMessage('');
  }

  function handleAddDiscount() {
    setpercentage((prev) => {
      if (prev) {
        return [...prev, discountMessage];
      } else {
        return [discountMessage];
      }
    });
    setDiscountMessage('');
  }

  const handleAdd = () => {
    paymentTabs ? handleAddPayment() : handleAddDiscount();
  };

  const handleDelete = (comment) => {
    if (paymentTabs) {
      setAmount((prevState) => {
        const filtered = filter(prevState, (d) => d !== comment);
        return filtered;
      });
    } else {
      setpercentage((prevState) => {
        const filtered = filter(prevState, (d) => d !== comment);
        return filtered;
      });
    }
  };
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          p: 2,
          textAlign: 'center',
          borderRadius: '4px 4px 0 0',
          boxShadow: 1,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              color: 'primary.contrastText',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Additional Discount Predefined Value
          </Typography>
          <DiscountIcon sx={{ fontSize: 24, color: 'primary.contrastText' }} />
        </Box>
      </DialogTitle>

      <Box sx={{ marginLeft: 4, marginBottom: 3, marginTop: 2 }}>
        <FormControl component="fieldset" sx={{ display: 'flex', flexDirection: 'column' }}>
          <FormLabel component="legend" sx={{ marginBottom: 1 }}>
            Select Predefined Mode
          </FormLabel>

          <RadioGroup
            row
            aria-label="options"
            name="options"
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <FormControlLabel
              value="FlatAmount"
              control={<Radio />}
              label="FlatAmount"
              sx={{ display: 'flex', alignItems: 'center' }}
            />
            <FormControlLabel
              value="Discount"
              control={<Radio />}
              label="Discount"
              sx={{ display: 'flex', alignItems: 'center' }}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {paymentTabs ? (
        <DialogContent dividers>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <TextField
              autoFocus
              fullWidth
              size="medium"
              variant="outlined"
              value={amountMessage}
              onChange={(e) => {
                const value = e.target.value;
                const isNumber = numberChecking(value);
                if (value === '' || isNumber) {
                  setAmountMessage(isNumber);
                }
              }}
              placeholder="Enter Amount (₹)"
              InputProps={{
                style: { color: '#000000' },
              }}
              type="number"
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleAdd}
              disabled={!amountMessage || amount?.length >= 3}
              sx={{
                height: { xs: 'auto', sm: '54px' },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Add
            </Button>
          </Box>
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {!isEmpty(amount) ? (
              map(amount, (e, index) => (
                <Stack
                  sx={{
                    p: 0.5,
                    border: '1px solid #D4D4D4',
                    borderRadius: '5px',
                    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
                    px: 2,
                    mt: 1.5,
                  }}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1" color="textPrimary" sx={{ fontWeight: 'bold' }}>
                      {e}
                    </Typography>
                  </Box>

                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(e)}
                    sx={{
                      color: '#d32f2f',
                      '&:hover': { backgroundColor: '#ffd6d6' },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                No items found
              </Typography>
            )}
          </List>
        </DialogContent>
      ) : (
        <DialogContent dividers>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 1,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <TextField
              autoFocus
              fullWidth
              size="medium"
              variant="outlined"
              value={discountMessage}
              onChange={(e) => {
                const value = e.target.value;
                const isNumber = numberChecking(value);
                if (value === '' || isNumber) {
                  setDiscountMessage(isNumber);
                }
              }}
              placeholder="Enter Discount (%)"
              InputProps={{
                style: { color: '#000000' },
              }}
              type="number"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdd}
              disabled={!discountMessage || percentage?.length >= 3}
              sx={{
                height: { xs: 'auto', sm: '54px' },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Add
            </Button>
          </Box>
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {!isEmpty(percentage) ? (
              map(percentage, (e, index) => (
                <Stack
                  sx={{
                    p: 0.5,
                    border: '1px solid #D4D4D4',
                    borderRadius: '5px',
                    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
                    px: 2,
                    mt: 1.5,
                  }}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1" color="textPrimary" sx={{ fontWeight: 'bold' }}>
                      {e}
                    </Typography>
                  </Box>

                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(e)}
                    sx={{
                      color: '#d32f2f',
                      '&:hover': { backgroundColor: '#ffd6d6' },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                No items found
              </Typography>
            )}
          </List>
        </DialogContent>
      )}

      <DialogActions>
        <Button onClick={handleClose} variant="outlined" size="large" color="error">
          Close
        </Button>
        <Button onClick={handleSubmit} variant="contained" size="large" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
