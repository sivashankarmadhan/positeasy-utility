import { Divider, IconButton, Stack, TextField, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
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
import PreviewIcon from '@mui/icons-material/Preview';

import { ErrorConstants } from 'src/constants/ErrorConstants';
import INTENT_API from 'src/services/IntentService';
import EditViewProducts from './EditViewProducts';
import ViewLogsDialog from './ViewLogsDialog';
import { STORE_PURCHASE_CONSTANTS } from 'src/constants/AppConstants';

const ReceiveViewKebabMenu = ({ data, storePurchase, getAllPurchaseOrders }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [reason, setReason] = useState('');
  const [editOnDialog, setEditOnDialog] = useState(false);
  const [viewPreviewDialog, setViewPreviewDialog] = useState(false);

  const [openMenu, setOpenMenuActions] = useState(null);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };


  return (
    <Stack flexDirection="row" alignItems="center">
      <>
      <PreviewIcon
          color="primary"
          onClick={() => setViewPreviewDialog(true)}
          sx={{ cursor: 'pointer' }}
        />
        {data?.status !== STORE_PURCHASE_CONSTANTS.OPEN && data?.status !== STORE_PURCHASE_CONSTANTS.ON_EDIT && (
          <IconButton
            onClick={() => {
              navigate(
                `${PATH_DASHBOARD.purchases.viewStorePurchaseOrdersDetails}/${get(
                  data,
                  'referenceId'
                )}`,
                {
                  state: { storePurchase: storePurchase, storeId: data?.storeId },
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
      
        {data?.status === 'OPEN' && (
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
                    setEditOnDialog(true);
                  }}
                  sx={{
                    color: 'info',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                  }}
                >
                  Status update
                </Stack>

              
              </>
            }
          />
        )}
      </>

      {editOnDialog && (
        <EditViewProducts
          isOpen={editOnDialog}
          onClose={() => setEditOnDialog(false)}
          data={data}
          getAllPurchaseOrders={getAllPurchaseOrders}
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

export default ReceiveViewKebabMenu;
