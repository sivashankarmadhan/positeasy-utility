import { Divider, IconButton, Stack, TextField, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KebabMenu from 'src/components/KebabMenu';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import get from 'lodash/get';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  alertDialogInformationState,
  currentStoreId,
  currentTerminalId,
} from 'src/global/recoilState';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import INTENT_API from 'src/services/IntentService';
import EditViewProducts from './EditViewProducts';
import PreviewIcon from '@mui/icons-material/Preview';
import ViewLogsDialog from './ViewLogsDialog';
import { STORE_PURCHASE_CONSTANTS } from 'src/constants/AppConstants';

const PurchaseStoreViewKebabMenu = ({ data, storePurchase, getAllPurchaseOrders }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [viewPreviewDialog, setViewPreviewDialog] = useState(false);

  const [reason, setReason] = useState('');
  const [editOnDialog, setEditOnDialog] = useState(false);
  const [openMenu, setOpenMenuActions] = useState(null);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const handleDeleteOrder = async (referenceId) => {
    try {
      await PurchaseOrderServices.deletePurchase({
        referenceId,
      });
      toast.success(SuccessConstants.PURCHASE_ORDER_DELETED_SUCCESSFULLY);
      getAllPurchaseOrders();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

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
          text: 'yes',
          onClick: (onClose) => {
            handleApproveReject(referenceId, status);
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
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        referenceId: referenceId,
        requestStatus: status,
        ...(status === 'REJECTED' ? { reason: reason } : {}),
      };
      await INTENT_API.addPurchaseStatus(options);
      getAllPurchaseOrders();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleDeleteOrderWithAlert = (referenceId) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to clear ?`,
      actions: {
        primary: {
          text: 'Clear',
          onClick: async (onClose) => {
            handleDeleteOrder(referenceId);
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
    <Stack flexDirection="row" alignItems="center">
      <PreviewIcon
        color="primary"
        onClick={() => setViewPreviewDialog(true)}
        sx={{ cursor: 'pointer' }}
      />
      {( data?.status !== STORE_PURCHASE_CONSTANTS.ON_EDIT) && (
        <IconButton
          onClick={() => {
            navigate(
              `${PATH_DASHBOARD.purchases.viewStorePurchaseOrdersDetails}/${get(
                data,
                'referenceId'
              )}`,
              {
                state: { storePurchase: storePurchase },
              }
            );
          }}
        >
          <KeyboardDoubleArrowRightIcon
            sx={{
              color: theme.palette.primary.main,
            }}
          />
        </IconButton>
      )}

      {data?.status === 'ON_EDIT' && (
        <IconButton
          onClick={() => {
            setEditOnDialog(true);
          }}
        >
          <VisibilityIcon
            sx={{
              color: theme.palette.primary.main,
            }}
          />
        </IconButton>
      )}

      {data?.status === STORE_PURCHASE_CONSTANTS.OPEN && data?.requestStatus === STORE_PURCHASE_CONSTANTS.PENDING && (
        <KebabMenu
          key={get(data, 'purchaseId')}
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          btnMarginTop={0}
          actions={
            <>
              <Stack
                onClick={() => {
                  handleCloseMenu();
                  handleApproveRejectRequest(get(data, 'referenceId'), STORE_PURCHASE_CONSTANTS.APPROVED);
                }}
                sx={{
                  color: 'green',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                }}
              >
                Approve
              </Stack>
              <Divider sx={{ borderStyle: 'dashed', my: { xs: 0.5, sm: 1 } }} />
              <Stack
                onClick={() => {
                  handleCloseMenu();
                  handleApproveRejectRequest(get(data, 'referenceId'), STORE_PURCHASE_CONSTANTS.REJECTED);
                }}
                sx={{
                  color: 'error.main',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                }}
              >
                Reject
              </Stack>
            </>
          }
        />
      )}

      {editOnDialog && (
        <EditViewProducts
          isViewOnly={true}
          isOpen={editOnDialog}
          getAllPurchaseOrders={getAllPurchaseOrders}
          onClose={() => setEditOnDialog(false)}
          data={data}
        />
      )}
      {viewPreviewDialog && (
        <ViewLogsDialog
          // isViewOnly ={true}
          isOpen={viewPreviewDialog}
          // getAllPurchaseOrders={getAllPurchaseOrders}
          onClose={() => setViewPreviewDialog(false)}
          data={data}
        />
      )}
    </Stack>
  );
};

export default PurchaseStoreViewKebabMenu;
