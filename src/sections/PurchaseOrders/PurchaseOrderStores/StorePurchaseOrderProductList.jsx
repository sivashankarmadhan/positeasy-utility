import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Box,
  Stack,
  Typography,
  Checkbox,
  Card,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ControlPointSharpIcon from '@mui/icons-material/ControlPoint';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { filter, get, isBoolean, isEmpty, map, reduce } from 'lodash';
import { useSetRecoilState } from 'recoil';
import { alertDialogInformationState } from 'src/global/recoilState';
import Items from 'src/pages/Products/Items';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import EditIcon from '@mui/icons-material/Edit';
import EnterValueDialog from 'src/components/cart/EnterValueDialog';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import { PURCHASE_ORDER_PAYMENT_TYPE } from 'src/constants/AppConstants';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import AddAndEditProduct from '../AddAndEditProduct';
import StoreAddAndEditProduct from './StoreAddAndEditProduct';

const StorePurchaseOrderProductList = ({
  productList,
  setProductList,
  isOpenModal,
  receiverStoreId,
  setIsOpenModal,
  finalDeliveryCharges,
  setFinalDeliveryCharges,
  finalDiscount,
  setFinalDiscount,
  watchPaymentType,
  watchAdvance,

}) => {
  const theme = useTheme();
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [editProductDetails, setEditProductDetails] = useState({});
  const [isOpenDeliveryCharges, setIsOpenDeliveryCharges] = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [isOpenDiscount, setIsOpenDiscount] = useState(false);
  const [discount, setDiscount] = useState(0);

  const handleDeleteProduct = (_index) => {
    const filterProducts = filter(productList, (_product, _index) => {
      return _index !== _index;
    });
    setProductList(filterProducts);
  };

  const handleDeleteWithAlert = (_index) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to clear ?`,
      actions: {
        primary: {
          text: 'Clear',
          onClick: (onClose) => {
            handleDeleteProduct(_index);
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

  const subTotal = reduce(
    productList,
    (_acc, curr) => {
      return (
        getTotalPriceAndGst({
          price: get(curr, 'price'),
          GSTPercent: get(curr, 'GSTPercent'),
          GSTInc: get(curr, 'GSTInc'),
          fullData: curr,
        })?.withoutGstAmount + _acc
      );
    },
    0
  );

  const totalGst = reduce(
    productList,
    (_acc, curr) => {
      return (
        getTotalPriceAndGst({
          price: get(curr, 'price'),
          GSTPercent: get(curr, 'GSTPercent'),
          GSTInc: get(curr, 'GSTInc'),
          fullData: curr,
        })?.gstPercentageValue + _acc
      );
    },
    0
  );

  const totalAmount =
    (subTotal || 0) +
    (totalGst || 0) +
    Number(finalDeliveryCharges || 0) -
    Number(finalDiscount || 0);

  const isPartial = get(watchPaymentType, 'id') === PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL;
  const isCredit = get(watchPaymentType, 'id') === PURCHASE_ORDER_PAYMENT_TYPE.CREDIT;

  return (
    <Card
      sx={{
        p: 2,
        m: 0.2,
        mt: 4,
        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
      }}
    >
      <TableContainer component={Paper} sx={{ height: '80%', mt: 4 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                '& .MuiTableCell-head': {
                  background: theme.palette.primary.lighter,
                },
              }}
            >
              <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                Name
              </TableCell>
              <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                Quantity
              </TableCell>
              {/* <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                Unit price (₹)
              </TableCell>
              <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                GSTPercent
              </TableCell>
              <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                GSTInc
              </TableCell>
              <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                Amount (₹)
              </TableCell> */}
              <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                Auto add to stocks
              </TableCell>
              <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {map(productList, (_item, _index) => {
              return (
                <TableRow>
                  <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                    {get(_item, 'name')}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                    {get(_item, 'quantity')}
                  </TableCell>

                  <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                    {isBoolean(get(_item, 'autoAdd')) ? (
                      <Checkbox checked={get(_item, 'autoAdd')} disabled />
                    ) : (
                      '-'
                    )}
                  </TableCell>

                  <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                    <Stack flexDirection="row" gap={1.5} justifyContent="center">
                      <EditNoteIcon
                        size={35}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => {
                          setIsOpenModal(true);
                          setEditProductDetails({ data: _item, index: _index });
                        }}
                      />
                      <DeleteIcon
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleDeleteWithAlert(_index)}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        sx={{
          background: '#F4F5F7',
          p: 1.5,
          width: '10rem',
          borderRadius: '7px',
          cursor: 'pointer',
        }}
        flexDirection="row"
        gap={1.5}
        mt={1.5}
        onClick={() => {
          setIsOpenModal(true);
        }}
      >
        <ControlPointSharpIcon />
        <Typography sx={{ fontSize: '15px' }}>Add New Row</Typography>
      </Stack>

      <Stack flexDirection="row" justifyContent="flex-end" mt={2}>
        <Stack
          sx={{ background: '#F4F5F7', borderRadius: '5px' }}
          p={2}
          width={isMobile ? '80%' : '50%'}
          spacing={1.5}
        >
          <Stack flexDirection="row" justifyContent="space-between">
            <Typography sx={{ fontSize: '15px' }}>Total No of Items</Typography>
            <Typography sx={{ fontSize: '15px' }}>{productList.length}</Typography>
          </Stack>
        </Stack>
      </Stack>

      {isOpenModal && (
        <StoreAddAndEditProduct
          isOpenModal={isOpenModal}
          receiverStoreId={receiverStoreId}
          closeModal={() => {
            setIsOpenModal(false);
            setEditProductDetails({});
          }}
          editProductDetails={editProductDetails}
          // onSubmit={(data, productsFlow) => {
          //   if (!isEmpty(editProductDetails)) {
          //     const formatProducts = map(productList, (_item, _index) => {
          //       if (get(editProductDetails, 'index') === _index) {
          //         return data;
          //       }
          //       return _item;
          //     });
          //     console.log('data', formatProducts);

          //     setProductList(formatProducts);
          //     setEditProductDetails({});
          //   } else {
          //     console.log('data', [...(productList || []), data]);

          //     setProductList([...(productList || []), data]);
          //   }




          //   setIsOpenModal(false);
          //   if (productsFlow) {
          //     ObjectStorage.setItem(StorageConstants.AUTO_ADD_TO_STOCKS, {
          //       data: get(data, 'autoAdd'),
          //     });
          //   }
          // }}
          onSubmit={(data, productsFlow) => {
    let updatedProductList;

    if (!isEmpty(editProductDetails)) {
        updatedProductList = map(productList, (_item, _index) => {
            if (get(editProductDetails, 'index') === _index) {
                return data;
            }
            return _item;
        });
        setEditProductDetails({});
    } else {
        updatedProductList = [...(productList || []), data];
    }

    const mergedProducts = updatedProductList.reduce((acc, item) => {
        const existing = acc.find(p => p.productId === item.productId);

        if (existing) {
            existing.quantity += item.quantity;
        } else {
            acc.push({ ...item });
        }

        return acc;
    }, []);

    console.log('Merged Products:', mergedProducts);
    setProductList(mergedProducts);
    setEditProductDetails({});
    setIsOpenModal(false);

    if (productsFlow) {
        ObjectStorage.setItem(StorageConstants.AUTO_ADD_TO_STOCKS, {
            data: get(data, 'autoAdd'),
        });
    }
}}

        />
      )}

      <EnterValueDialog
        open={isOpenDeliveryCharges}
        onClose={() => {
          setIsOpenDeliveryCharges(false);
          setDeliveryCharges(finalDeliveryCharges || 0);
        }}
        name="Delivery Charges"
        value={deliveryCharges}
        setValue={(value) => {
          setDeliveryCharges(value);
        }}
        onCancel={() => {
          setIsOpenDeliveryCharges(false);
          setDeliveryCharges(finalDeliveryCharges || 0);
        }}
        onSubmit={() => {
          setIsOpenDeliveryCharges(false);
          setFinalDeliveryCharges(deliveryCharges || 0);
        }}
      />
      <EnterValueDialog
        open={isOpenDiscount}
        onClose={() => {
          setIsOpenDiscount(false);
          setDiscount(finalDiscount || 0);
        }}
        name="Delivery Charges"
        value={discount}
        setValue={(value) => {
          setDiscount(value);
        }}
        onCancel={() => {
          setIsOpenDiscount(false);
          setDiscount(finalDiscount || 0);
        }}
        onSubmit={() => {
          setIsOpenDiscount(false);
          setFinalDiscount(discount || 0);
        }}
      />
    </Card>
  );
};

export default StorePurchaseOrderProductList;
