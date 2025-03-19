import { IconButton, Stack, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KebabMenu from 'src/components/KebabMenu';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import get from 'lodash/get';
import { useSetRecoilState } from 'recoil';
import { alertDialogInformationState } from 'src/global/recoilState';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';

const PurchaseViewKebabMenu = ({ data, storePurchase, getAllPurchaseOrders }) => {
  const navigate = useNavigate();
  const theme = useTheme();

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
      <IconButton
        onClick={() => {
          navigate(
            `${PATH_DASHBOARD.purchases.viewPurchaseOrdersDetails}/${get(data, 'referenceId') }`,
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

      <KebabMenu
        key={get(data, 'purchaseId')}
        open={openMenu}
        onOpen={handleOpenMenu}
        onClose={handleCloseMenu}
        btnMarginTop={0}
        actions={
          <>
            {/* TODO: we will enable future */}
            {/* <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
            }}
            onClick={() => {
              handleCloseMenu();
              handleEditPurchaseOrder(get(data, 'referenceId'));
            }}
          >
            <EditIcon sx={{ fontSize: { xs: '18px', sm: '22px' } }} />
            Edit
          </Stack> */}
            {/* <Divider sx={{ borderStyle: 'dashed', my: { xs: 0.5, sm: 1 } }} /> */}
            <Stack
              onClick={() => {
                handleCloseMenu();
                handleDeleteOrderWithAlert(get(data, 'referenceId'));
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
  );
};

export default PurchaseViewKebabMenu;
