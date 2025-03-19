import {
  Card,
  Dialog,
  Stack,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Checkbox,
  TextField,
  useTheme,
} from '@mui/material';
import { get, isEmpty, map, isEqual, isNull } from 'lodash';
import React, { useEffect, useState } from 'react';
import { STORE_ORDERS_STATUS_CONSTANTS, STORE_PURCHASE_CONSTANTS, hideScrollbar } from 'src/constants/AppConstants';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  alertDialogInformationState,
  currentStoreId,
  currentTerminalId,
} from 'src/global/recoilState';
import INTENT_API from 'src/services/IntentService';
import { SuccessConstants } from 'src/constants/SuccessConstants';

const EditViewProducts = ({ isOpen, onClose, isViewOnly, data, getAllPurchaseOrders }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [defaultSelectedItems, setDefaultSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState('');
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const theme = useTheme();
  useEffect(() => {
    if (data?.orders && data.orders.length > 0) {
      console.log('skskdkdkkdkdkd', isNull(data?.orders[0].editOfPurchase));
      const defaults = data.orders.map((order) => ({
        productId: get(order, 'productId'),
        editOfPurchase: isNull(get(order, 'editOfPurchase')) ? true : get(order, 'editOfPurchase') ,
        price: get(order, 'price')/100,
        quantity: get(order, 'quantity'),
      }));
      setDefaultSelectedItems(defaults);
      setSelectedItems(defaults);
    }
  }, [data?.orders]);
  // const handleCheckboxChange = (_item, event) => {
  //   const productId = get(_item, 'productId');
  //   setSelectedItems((prevItems) => {
  //     const index = prevItems.findIndex((item) => item.productId === productId);
  //     if (index === -1) {
  //       return [
  //         ...prevItems,
  //         {
  //           productId,
  //           editOfPurchase: event.target.checked,
  //           price: get(_item, 'price'),
  //           quantity: get(_item, 'quantity'),
  //         },
  //       ];
  //     } else {
  //       const updatedItems = [...prevItems];
  //       updatedItems[index] = { ...updatedItems[index], editOfPurchase: event.target.checked };
  //       return updatedItems;
  //     }
  //   });
  // };

  const handleCheckboxChange = (_item) => {
    const productId = get(_item, 'productId');
  
    setSelectedItems((prevItems) => {
      return prevItems.map((item) =>
        item.productId === productId
          ? { ...item, editOfPurchase: !(item.editOfPurchase ?? true) }
          : item
      );
    });
  };
  
  
  

  const handlePriceChange = (_item, newPrice) => {
    const productId = get(_item, 'productId');
    setSelectedItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.productId === productId);
      if (index !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[index] = {
          ...updatedItems[index],
          price: parseFloat(newPrice),
        };
        return updatedItems;
      }
      return prevItems;
    });
  };

  const handleQuantityChange = (_item, newQuantity) => {
    const productId = get(_item, 'productId');
    setSelectedItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.productId === productId);
      if (index !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[index] = {
          ...updatedItems[index],
          quantity: parseInt(newQuantity, 10),
        };
        return updatedItems;
      }
      return prevItems;
    });
  };

  const resetItem = (_item) => {
    const productId = get(_item, 'productId');
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? {
              productId,
              editOfPurchase: true,
              price: get(_item, 'price'),
              quantity: get(_item, 'quantity'),
            }
          : item
      )
    );
  };
console.log('defaultSelectedItems', defaultSelectedItems, selectedItems);
  const anyPriceEmpty = selectedItems.some((item) => !item.price);
  const hasChanges = !isEqual(selectedItems, defaultSelectedItems);
console.log('selectedItems', selectedItems);
  const handleupdate = async () => {
    if (anyPriceEmpty) {
      toast.error("Price cannot be empty for any product");
      return;
    }
    setIsLoading(true);
    const payload = {
      referenceId: data?.referenceId,
      products: selectedItems,
    };
    try {
      await PurchaseOrderServices.editProductStock(payload);
      toast.success(`Updated successfully`);
      onClose();
      getAllPurchaseOrders();
      setIsLoading(false);
    } catch (e) {
      console.log('Update error', e);
      setIsLoading(false);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  
  const handleReceiveApproveReject = async (referenceId, status) => {
    setIsLoading(true);

    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        referenceId: referenceId,
        status: status,
        ...(status === 'REJECTED' ? { reason: reason } : {}),
      };
      await INTENT_API.updateReceivePurchaseStatus(options);
      onClose();
      getAllPurchaseOrders();
      setIsLoading(false);
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      setIsLoading(false);

      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
// console.log('dhdhhdh',  selectedItems.find(item => item.productId === get(_item, 'productId'))
// ?.editOfPurchase);
  const handleApproveRejectRequest = (referenceId, status) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: (
        <Stack flexDirection="column" gap={1.5}>
          <Typography>{`Are you sure you want to ${
            status === 'REJECTED' ? 'Reject' : 'Approve'
          }?`}</Typography>
          {status === 'REJECTED' && (
            <TextField
              autoFocus
              fullWidth
              size="medium"
              variant="outlined"
              placeholder="Enter Reason"
              onChange={(e) => setReason(e.target.value)}
              InputProps={{
                style: { color: '#000000' },
              }}
            />
          )}
        </Stack>
      ),
      actions: {
        primary: {
          text: 'Yes',
          onClick: (onClose) => {
            if(!isViewOnly) {
              handleReceiveApproveReject(data?.referenceId, status)
            } else {
              handleApproveReject(data?.referenceId, status);

            }
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

  const handleApproveReject = async (referenceId, status) => {
    try {
      setIsLoading(true);
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        referenceId: referenceId,
        requestStatus: status,
        ...(status === 'REJECTED' ? { reason: reason } : {}),
      };
      await INTENT_API.addPurchaseStatus(options);
      onClose();
      getAllPurchaseOrders();
      setIsLoading(false);
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log('Error', err);
      setIsLoading(false);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const getLogRequest = async () => {
    try {
      const res = await PurchaseOrderServices.getLogRequestData({
        referenceId: get(data, 'referenceId'),
      });
      if(!isEmpty(res?.data)) {
        setSelectedItems(res?.data);
        setDefaultSelectedItems(res?.data)
      }
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    // if (isViewOnly) {
      getLogRequest();
    // }
  }, [isViewOnly]);
console.log('sksksksks', data?.orders);
  return (
    <Dialog open={isOpen}>
      <Card
        sx={{
          p: 2,
          width: { xs: '100%', sm: 250, md: 300, lg: 400 },
          maxWidth: '100%',
        }}
      >
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', mb: 1 }}
        >
          <Typography variant="h6" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            Product list
          </Typography>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Typography fontSize={'10px'} pb={2}>
          If you unselect a product from the product list, it will become unavailable in the store
          purchase order list.
        </Typography>
        <TableContainer style={{ maxHeight: 400, ...hideScrollbar }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="left"
                  sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                >
                  Product Name
                </TableCell>
                <TableCell
                  align="left"
                  sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                >
                  Price
                </TableCell>
                <TableCell
                  align="left"
                  sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                >
                  Quantity
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                >
                  Selection
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {map(data?.orders, (_item) => {
                console.log('shhfhfhfh',  selectedItems.find(item => item.productId === get(_item, 'productId'))
                ?.editOfPurchase);
                return(
                <TableRow key={_item.id} sx={{ borderBottom: '1px solid #ced4da' }}>
                  <TableCell align="left">{get(_item, 'name')}</TableCell>
                  <TableCell align="left">
                    <TextField
                      type="number"
                      variant="outlined"
                      disabled={isViewOnly}
                      size="small"
                      value={
                        selectedItems.find(item => item.productId === get(_item, 'productId'))
                          ?.price ?? (get(_item, 'price')/100)
                      }
                      onChange={(e) => handlePriceChange(_item, e.target.value)}
                      inputProps={{ style: { fontSize: '12px', padding: '4px' } }}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <TextField
                      type="number"
                      variant="outlined"
                      disabled={isViewOnly}
                      size="small"
                      value={
                        selectedItems.find(item => item.productId === get(_item, 'productId'))
                          ?.quantity ?? get(_item, 'quantity')
                      }
                      onChange={(e) => handleQuantityChange(_item, e.target.value)}
                      inputProps={{ style: { fontSize: '12px', padding: '4px' } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Checkbox
                      disabled={isViewOnly}
                      checked={
                        selectedItems.find(item => item.productId === get(_item, 'productId'))?.editOfPurchase ?? true
                      }
                      onChange={(event) => handleCheckboxChange(_item, event)}
                    />
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </TableContainer>
        {isEmpty(data?.orders) && (
          <Typography sx={{ fontWeight: 700, textAlign: 'center', padding: 2 }}>
            No Product list Found
          </Typography>
        )}
        <Stack width={'100%'}>
          {!isViewOnly && (
            <>
              {anyPriceEmpty ? (
                <LoadingButton
                  size="large"
                  variant="contained"
                  loading={isLoading}
                  onClick={() => {
                    toast.error("Price cannot be empty for any product");
                  }}
                >
                  Update product list
                </LoadingButton>
              ) : hasChanges ? (
                <LoadingButton
                  size="large"
                  variant="contained"
                  loading={isLoading}
                  onClick={() => handleupdate()}
                >
                  Update product list
                </LoadingButton>
              ) : (
                <Stack flexDirection={'row'} gap width={'100%'}>
                  <LoadingButton
                    size="large"
                    fullWidth
                    variant="outlined"
                    loading={isLoading}
                    onClick={() => {
                      handleApproveRejectRequest(
                        get(data, 'referenceId'),
                        STORE_PURCHASE_CONSTANTS.REJECTED
                      );
                    }}
                  >
                    Reject
                  </LoadingButton>
                  <LoadingButton
                    size="large"
                    fullWidth
                    variant="contained"
                    loading={isLoading}
                    onClick={() => {
                      handleApproveRejectRequest(
                        get(data, 'referenceId'),
                        STORE_ORDERS_STATUS_CONSTANTS.ACKNOWLEDGE
                      );
                    }}
                  >
                    ACKNOWELEDGE
                  </LoadingButton>
                </Stack>
              )}
            </>
          )}
          {isViewOnly && (
            <Stack flexDirection={'row'} gap width={'100%'}>
              <LoadingButton
                size="large"
                fullWidth
                variant="outlined"
                loading={isLoading}
                onClick={() => {
                  handleApproveRejectRequest(
                    get(data, 'referenceId'),
                    STORE_PURCHASE_CONSTANTS.REJECTED
                  );
                }}
              >
                Reject
              </LoadingButton>
              <LoadingButton
                size="large"
                fullWidth
                variant="contained"
                loading={isLoading}
                onClick={() => {
                  handleApproveRejectRequest(
                    get(data, 'referenceId'),
                    STORE_PURCHASE_CONSTANTS.APPROVED
                  );
                }}
              >
                Approve
              </LoadingButton>
            </Stack>
          )}
        </Stack>
      </Card>
    </Dialog>
  );
};

export default EditViewProducts;

