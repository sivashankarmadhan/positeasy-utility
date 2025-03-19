import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import { get } from 'lodash';
import { Button, MenuItem, Stack, Typography, Tooltip } from '@mui/material';
import Iconify from 'src/components/iconify';
import { Popover } from '@mui/material';
import { useState } from 'react';
import { useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { reduce } from 'lodash';
import { unionBy } from 'lodash';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import TABLESERVICES_API from 'src/services/API/TableServices';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import { alertDialogInformationState, currentStoreId } from 'src/global/recoilState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AuthService from 'src/services/authService';
import { QR_LINK } from 'src/constants/AppConstants';
import GenerateQRCode from 'src/components/GenerateQrCode';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import SlotTimer from 'src/components/SlotTimer';

export const TableCard = ({
  item,
  getTableList,
  setEditTableData,
  Setopen,
  reset,
  totalAmount,
  isChargesAmount,
  isDiscountAmount,
  totalParcelCharges,
}) => {
  const theme = useTheme();
  const defaultValue = { open: false, event: {}, data: {} };
  const [opens, setOpens] = useState(defaultValue);
  const [openQrCode, setOpenQrCode] = useState(false);
  const handleOpenQrCode = () => {
    setOpenQrCode(true);
  };
  const handleCloseQrCode = () => {
    setOpenQrCode(false);
  };
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const currentStore = useRecoilValue(currentStoreId);
  const tableId = item.tableId;
  const tableCapacity = get(item, 'tableCapacity');

  const handleCloseMenu = () => {
    setOpens(defaultValue);
  };

  const handleOpenMenu = (event, product) => {
    setOpens({ open: true, eventData: event.currentTarget, data: product });
  };
  const API = import.meta.env.VITE_REMOTE_URL;
  const { merchantId } =
    JSON.parse(window.atob(AuthService._getAccessToken()?.split?.('.')?.[1])) || '';
  let QRString =
    API === QR_LINK.STAGE_POSITEASY
      ? `${QR_LINK.POSITEASY_PUBLIC_WEB}/?merchantId=${merchantId}&storeId=${currentStore}`
      : `${QR_LINK.PUBLIC_POSITEASY}/?merchantId=${merchantId}&storeId=${currentStore}`;
  if (tableId) {
    QRString += `&tableId=${tableId}`;
  }
  const totalOccupied = reduce(
    unionBy(get(item, 'additionalInfo.tableOrders', []), 'subTableId'),
    (acc, val) => acc + Number(get(val, 'subTableCount') || 0),
    0
  );

  const deleteTableImage = async () => {
    try {
      const res = await TABLESERVICES_API.deleteTableImage(tableId);
      toast.success(SuccessConstants.DELETED_SUCCESSFUL);
      getTableList();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleDelete = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to delete ?`,
      actions: {
        primary: {
          text: 'Delete',
          onClick: (onClose) => {
            deleteTableImage();
            handleCloseMenu();

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

  return (
    <Grid item xs={12} sm={6} md={3} minlg={3} xl={2.4}>
      <Card
        sx={{
          px: 1,
          borderColor: '#fcf2ca',
          py: 1,
          bgcolor: get(item, 'additionalInfo.isEstimate')
            ? '#fcf6de'
            : item?.tableStatus === 'OCCUPIED'
            ? '#FFE3E3'
            : item?.tableStatus === 'AVAILABLE'
            ? '#F6F7F8'
            : item?.tableStatus === 'PARTIAL'
            ? '#EBF9FC'
            : '#FFF2D6',
          width: '100%',
        }}
      >
        <Box
          xs
          display="flex"
          justifyContent=" space-between"
          alignItems="center"
          sx={{ height: 35 }}
        >
          {get(item, 'additionalInfo.isEstimate') ? (
            <Stack
              direction={'row'}
              alignItems={'center'}
              justifyContent={'space-between'}
              width={'100%'}
            >
              <Card
                sx={{
                  backgroundColor: '#FFFF',
                  color: '#B71F18',
                  mt: 2,
                  borderRadius: 1,
                  width: '100px',
                }}
              >
                <Stack justifyContent={'center'} alignItems={'center'} p={0.5}>
                  <Typography variant="caption" fontWeight={'bold'} fontSize={10}>
                    FROZEN
                  </Typography>
                  {get(item, 'additionalInfo.estimateTime') && (
                    <Stack direction={'row'} spacing={0.5} alignItems={'center'}>
                      <AccessAlarmIcon sx={{ fontSize: 'small' }} />
                      <Typography variant="caption" fontSize={10} fontWeight={'bold'}>
                        <SlotTimer
                          startTime={new Date(get(item, 'additionalInfo.estimateTime'))}
                          showZeroTime
                        />
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Card>
              <Stack direction={'row'} spacing={1} alignItems={'center'} mt={2}>
                <Typography variant="body2">Orders :</Typography>
                <Typography variant="h6">
                  {get(item, 'additionalInfo.tableOrders')?.length}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <>
              <Chip
                size="small"
                label={item?.tableStatus}
                sx={{
                  fontWeight: 'bold',
                  backgroundColor:
                    item?.tableStatus === 'OCCUPIED'
                      ? '#FFD2D2'
                      : item?.tableStatus === 'AVAILABLE'
                      ? '#CFEAE1'
                      : item?.tableStatus === 'RESERVED'
                      ? '#FEE6B3'
                      : item?.tableStatus === 'PARTIAL'
                      ? '#C5EFF6'
                      : '',
                  color:
                    item?.tableStatus === 'OCCUPIED'
                      ? '#B71F18'
                      : item?.tableStatus === 'AVAILABLE'
                      ? '#00A76F'
                      : item?.tableStatus === 'Reserved'
                      ? '#FFAB00'
                      : item?.tableStatus === 'PARTIAL'
                      ? '#00B8D9'
                      : '',
                }}
              />
              {item?.tableStatus === 'OCCUPIED' && (
                <Stack direction={'row'} spacing={1} alignItems={'center'}>
                  <Typography variant="body2">Orders :</Typography>
                  <Typography variant="h6">
                    {get(item, 'additionalInfo.tableOrders', [])?.length}
                  </Typography>
                </Stack>
              )}
            </>
          )}

          {item?.tableStatus === 'AVAILABLE' && (
            <IconButton variant="contained" onClick={handleOpenMenu}>
              <MoreVertIcon />
            </IconButton>
          )}

          <Popover
            open={Boolean(get(opens, 'open'))}
            anchorEl={get(opens, 'eventData')}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                p: 1,
                width: 160,
                '& .MuiMenuItem-root': {
                  px: 1,
                  typography: 'body2',
                  borderRadius: 0.75,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setEditTableData(item);
                Setopen(true);
                setOpens(false);
                reset({
                  tableName: item.tableName,
                  tableCapacity: item.tableCapacity,
                  tableCategory: item.tableCategory,
                });
              }}
            >
              <Iconify icon={'eva:edit-fill'} sx={{ mr: 1, color: theme.palette.primary.main }} />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDelete();
              }}
            >
              <Iconify
                icon={'eva:trash-2-outline'}
                sx={{ mr: 1, color: theme.palette.primary.main }}
              />
              Delete
            </MenuItem>
          </Popover>
        </Box>

        <Box xs display="flex" justifyContent="center" p={1}>
          <Box
            xs
            display="flex"
            justifyContent="center"
            flexDirection="column"
            gap={1}
            alignItems="center"
            bgcolor={
              get(item, 'additionalInfo.isEstimate')
                ? '#fff4c7'
                : item?.tableStatus === 'OCCUPIED'
                ? '#FFD2D2'
                : item?.tableStatus === 'AVAILABLE'
                ? '#EFF0F2'
                : item?.tableStatus === 'RESERVED'
                ? '#FFE7B4'
                : item?.tableStatus === 'PARTIAL'
                ? '#C5EFF6'
                : ''
            }
            borderRadius="50%"
            sx={{
              height: 150,
              width: 150,
            }}
          >
            {get(item, 'additionalInfo.isEstimate') ? (
              <img src="/assets/images/table/Layer_3.png" style={{ width: '4.5rem' }} />
            ) : item?.tableStatus === 'OCCUPIED' ? (
              <img src="/assets/images/table/Layer_1.png" style={{ width: '4.5rem' }} alt="" />
            ) : item?.tableStatus === 'AVAILABLE' ? (
              <img src="/assets/images/table/Layer_2.png" style={{ width: '4.5rem' }} />
            ) : item?.tableStatus === 'RESERVED' ? (
              <img src="/assets/images/table/Layer_3.png" style={{ width: '4.5rem' }} />
            ) : item?.tableStatus === 'PARTIAL' ? (
              <img src="/assets/images/table/Layer_4.png" style={{ width: '4.5rem' }} />
            ) : (
              ''
            )}
            <Box xs fontSize="small" color="#6C6C6C">
              {/* Capacity : {totalOccupied || 0} / {tableCapacity || 0} */}
              Capacity: {tableCapacity || 0}
            </Box>
          </Box>
        </Box>
        <Grid xs display="flex" justifyContent="center" alignItems="center">
          <Stack spacing={1} alignItems={'center'}>
            <Box xs fontSize="small" color="#6C6C6C">
              Amount:
              {totalAmount
                ? `₹ ${(
                    totalAmount +
                    (isChargesAmount - isDiscountAmount) +
                    totalParcelCharges
                  ).toFixed(2)}`
                : '--'}
            </Box>
            <Box>{item.tableName ? item.tableName : '-'} </Box>
          </Stack>
        </Grid>
        <Grid xs display="flex" justifyContent="end" alignItems="end" gap={1}>
          <QrCodeScannerIcon
            size="20"
            style={{ size: '5', fontSize: '24px', cursor: 'pointer', marginLeft: '10px' }}
            onClick={handleOpenQrCode}
          />
          <Tooltip title="Copy">
            <CopyAllIcon
              sx={{ fontSize: '20px', cursor: 'pointer' }}
              onClick={() => {
                navigator.clipboard.writeText(QRString);
                toast.success(SuccessConstants.COPY_CLIPBOARD);
              }}
            />
          </Tooltip>
        </Grid>
      </Card>
      {openQrCode && (
        <GenerateQRCode tableId={item.tableId} open={openQrCode} handleClose={handleCloseQrCode} />
      )}
    </Grid>
  );
};
