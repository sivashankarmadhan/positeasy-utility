import {
  Divider,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  TextField,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Card,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { SvgIcon } from '@mui/material';

import { get, map } from 'lodash';
import React, { useState } from 'react';
import KebabMenu from 'src/components/KebabMenu';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import SettingServices from 'src/services/API/SettingServices';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import ViewMoreDrawer from 'src/sections/Customer/ViewMoreDrawer';
import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import PRODUCTS_API from 'src/services/products';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import Label from '../components/label';
import { formatAmountToIndianCurrency } from '../utils/formatNumber';
import { convertToRupee } from '../helper/ConvertPrice';
import {
  PaymentModeTypeConstants,
  PaymentModeTypeConstantsCart,
} from '../../src/constants/AppConstants';
import { paymentModeListState } from '../../src/global/recoilState';
import { useRecoilState, useRecoilValue } from 'recoil';
import DropDown from './cart/DropDown';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import RegexValidation from '../../src/constants/RegexValidation';

export default function CustomerView({
  _item,
  setIsOpenAddCustomerModal,
  setEditCustomer,
  initialFetch,
  _index,
  fetchCustomersList,
  setIsCredited,
  isCredited,
}) {
  const [customerOrdersDetails, setCustomerOrdersDetails] = useState([]);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [openMenu, setOpenMenuActions] = useState(null);
  const [currencyDialog, setCurrencyDialog] = useState(false);
  const paymentModeList = useRecoilValue(paymentModeListState)[0];
  const [paymentMode, setPaymentMode] = useState(PaymentModeTypeConstants.CASH);

  const [openViewMoreDrawer, setOpenViewMoreDrawer] = useState(false);
  const handleClickCurrencyOpen = () => {
    setCurrencyDialog(true);
  };

  const handleCurrencyClose = () => {
    setCurrencyDialog(false);
  };

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const handlePaymentMode = (event) => {
    setPaymentMode(get(event, 'label'));
  };

  const handleEditCustomer = (customer) => {
    setEditCustomer(customer);
    setIsOpenAddCustomerModal(true);
  };
  const handleDeleteCustomer = async (customer) => {
    try {
      const response = await SettingServices.removeCustomer(get(customer, 'customerId'));
      if (response) toast.success(SuccessConstants.DELETED_SUCCESSFUL);
      initialFetch();
    } catch (e) {
      toast.error(ErrorConstants.SOMETHING_WRONG);
    }
  };

  const getCustomerOrders = async () => {
    try {
      const response = await PRODUCTS_API.getCustomerOrders({
        customerId: get(_item, 'customerId'),
      });
      setCustomerOrdersDetails(get(response, 'data'));
    } catch (error) {
      toast.error(ErrorConstants.SOMETHING_WRONG);
    }
  };

  const customerCreditBulkClose = async () => {
    const option = {
      customerId: get(_item, 'customerId'),
      mode: paymentMode,
    };

    try {
      const response = await SettingServices.customerCreditBulkClose(option);
      if (response) {
        fetchCustomersList();
        handleCurrencyClose();
        toast.success(get(response, 'data.message'));
      }
    } catch (error) {
      toast.error(ErrorConstants.ERROR_BULK_CLOSE);
    }
  };

  const isPayableDisabled =
    get(_item, 'orderAmount', 0) - get(_item, 'paidAmount', 0) === 0 ||
    get(_item, 'orderAmount', 0) === 0;

  return (
    <>
      <TableRow>
        <TableCell align="left">{get(_item, 'name')}</TableCell>

        <TableCell align="left">{get(_item, 'contactNumber')}</TableCell>
        <TableCell align="left">
          <TextField
            inputProps={{ readOnly: true }}
            focused
            size="small"
            value={get(_item, 'address') || '--'}
            sx={{
              '& input': { p: 1.5 },
              width: isMobile ? 130 : 200,
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 400,
              '& .MuiOutlinedInput-notchedOutline': {
                backgroundColor: get(_item, 'address') ? '#919eab3d' : '',
                borderColor: 'transparent!important',
              },
            }}
          />
        </TableCell>

        <TableCell align="left">{get(_item, 'gstInfo.GSTNumber') || '--'}</TableCell>
        <TableCell align="left">{get(_item, 'totalOrders') || 0}</TableCell>
        <TableCell align="left">
          {(get(_item, 'orderAmount') / 100 || 0)
            .toFixed(2)
            .replace(RegexValidation.ORDER_PAYABLES_VALUE, '')}
        </TableCell>
        <TableCell align="left">
          {((get(_item, 'orderAmount') - get(_item, 'paidAmount')) / 100 || 0)
            .toFixed(2)
            .replace(RegexValidation.ORDER_PAYABLES_VALUE, '')}
        </TableCell>

        <TableCell align="right" sx={{ position: 'sticky', right: 0, backgroundColor: 'white' }}>
          <Stack direction={'row'} alignItems={'center'} spacing={2}>
        
            <Box
              className="relative group flex items-center gap-2 cursor-pointer mb-2"
              sx={{
                pointerEvents: isPayableDisabled ? 'none' : 'auto',
                opacity: isPayableDisabled ? 0.5 : 1,
              }}
              onClick={() => {
                if (isPayableDisabled) return;
                handleClickCurrencyOpen();
              }}
            >
              <SvgIcon
                sx={{
                  cursor: 'pointer',
                  fontSize: 24,
                  color: isPayableDisabled ? 'gray' : 'green',
                }}
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </SvgIcon>
            </Box>

            <Dialog open={currencyDialog} onClose={handleCurrencyClose}>
              <DialogTitle>Close bulk order</DialogTitle>
              <DialogContent>
                <DialogContentText mt={0}>
                  Are you sure, Do you want to close all orders of Customer in bulk?
                  <Stack direction="row" alignItems="center" mt={3} mb={2} spacing={1}>
                    <Stack
                      sx={{
                        backgroundColor: 'white',
                        color: (theme) => theme.palette.primary.light,
                        borderRadius: 1,
                        p: 0,
                        justifyContent: 'left',
                        alignItems: 'left',
                      }}
                    >
                      <Typography>
                        Payables: ₹
                        {((get(_item, 'orderAmount') - get(_item, 'paidAmount')) / 100 || 0)
                          .toFixed(2)
                          .replace(RegexValidation.ORDER_PAYABLES_VALUE, '')}
                      </Typography>
                    </Stack>

                    {!isCredited && (
                      <Autocomplete
                        options={map(PaymentModeTypeConstantsCart, (_item) => _item.name)}
                        getOptionLabel={(option) => option}
                        onChange={(event, value) => handlePaymentMode({ label: value })}
                        sx={{ width: 150, p: 1 }}
                        size="small"
                        renderInput={(params) => (
                          <TextField {...params} label="Payment mode" variant="outlined" />
                        )}
                        value={paymentMode}
                      />
                    )}
                  </Stack>
                </DialogContentText>
              </DialogContent>

              <DialogActions>
                <Button onClick={handleCurrencyClose} className="text-gray-600" variant="outlined">
                  Cancel
                </Button>
                <Button
                  onClick={customerCreditBulkClose}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                  variant="contained"
                >
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>

            <KebabMenu
              className="customerinfoStep2"
              key={get(_item, 'customerId')}
              open={openMenu}
              onOpen={handleOpenMenu}
              onClose={handleCloseMenu}
              actions={
                <>
                  <Stack
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 0.5,
                      cursor: 'pointer',
                      mb: 2,
                    }}
                    onClick={() => {
                      handleCloseMenu();
                      setOpenViewMoreDrawer(true);
                      getCustomerOrders();
                    }}
                  >
                    <WysiwygIcon sx={{ fontSize: { xs: '18px', sm: '22px' } }} />
                    View More
                  </Stack>

                  <Stack
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 0.5,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      handleCloseMenu();
                      handleEditCustomer(_item);
                    }}
                  >
                    <EditIcon sx={{ fontSize: { xs: '18px', sm: '22px' } }} />
                    Edit
                  </Stack>

                  <Divider sx={{ borderStyle: 'dashed', my: { xs: 0.5, sm: 1 } }} />
                  <Stack
                    onClick={() => {
                      handleCloseMenu();
                      handleDeleteCustomer(_item);
                    }}
                    sx={{
                      color: 'error.main',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 0.5,
                      cursor: 'pointer',
                    }}
                  >
                    <DeleteOutlineIcon
                      sx={{
                        fontSize: { xs: '18px', sm: '22px' },
                      }}
                    />
                    Delete
                  </Stack>
                </>
              }
            />
          </Stack>
        </TableCell>
      </TableRow>
      <ViewMoreDrawer
        openViewMoreDrawer={openViewMoreDrawer}
        setOpenViewMoreDrawer={setOpenViewMoreDrawer}
        customerOrdersDetails={customerOrdersDetails}
      />
    </>
  );
}
