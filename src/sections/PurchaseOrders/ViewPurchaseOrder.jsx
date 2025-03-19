import { Chip, Divider, Stack, TableCell, TableRow, useTheme } from '@mui/material';
import { get, map } from 'lodash';
import React, { useState } from 'react';
import KebabMenu from 'src/components/KebabMenu';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import SettingServices from 'src/services/API/SettingServices';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import VendorServices from 'src/services/API/VendorServices';
import { alertDialogInformationState } from 'src/global/recoilState';
import { useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import { fDatesWithTimeStamp } from 'src/utils/formatTime';
import { ESTIMATE_STATUS, ORDER_STATUS } from 'src/constants/AppConstants';
import statusColor from 'src/utils/statusColor';

// const handlePaymentTypeColor = (status) => {
//   if (status === ORDER_STATUS.FULL_PAYMENT) {
//     return 'success';
//   } else if (status === ORDER_STATUS.PARTIAL) {
//     return 'info';
//   } else return 'warning';
// };

export default function ViewPurchaseOrder({ _item, refetchData, tableData }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [openMenu, setOpenMenuActions] = useState(null);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const [openViewMoreDrawer, setOpenViewMoreDrawer] = useState(false);

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const handleEditVendor = (vendorId) => {
    navigate(`${PATH_DASHBOARD.purchases.editVendor}/${vendorId}`);
  };

  const handleDeleteVendor = async (vendorId) => {
    try {
      await VendorServices.removeVendor({ vendorId });
      toast.success(SuccessConstants.DELETED_SUCCESSFUL);
      refetchData();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleDeleteVendorWithAlert = (vendorId) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to clear vendor?`,
      actions: {
        primary: {
          text: 'Clear',
          onClick: (onClose) => {
            handleDeleteVendor(vendorId);
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
    <>
      <TableRow>
        {map(tableData, (_list) => {
          return (
            <TableCell
              align={get(_list, 'align')}
              sx={{
                minWidth: get(_list, 'minWidth'),
                position: get(_list, 'sticky') ? 'sticky' : 'static',
                backgroundColor: 'white',
                right: 0,
                zIndex: 99,
              }}
            >
              {get(_list, 'renderData')
                ? get(_list, 'renderData')(_item)
                : get(_item, get(_list, 'field'))}
            </TableCell>
          );
        })}
      </TableRow>
    </>
  );
}
