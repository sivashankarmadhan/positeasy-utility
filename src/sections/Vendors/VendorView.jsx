import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import {
  Divider,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  useTheme
} from '@mui/material';
import { get } from 'lodash';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { useSetRecoilState } from 'recoil';
import KebabMenu from 'src/components/KebabMenu';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { alertDialogInformationState } from 'src/global/recoilState';
import { PATH_DASHBOARD } from 'src/routes/paths';
import VendorServices from 'src/services/API/VendorServices';
import ViewMoreDrawer from './ViewMoreDrawer';

export default function VendorView({ _item, refetchData }) {
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
        <TableCell align="left">{get(_item, 'name')}</TableCell>
        <TableCell align="left">{get(_item, 'companyName')}</TableCell>
        <TableCell align="left">{get(_item, 'contactNumber')}</TableCell>
        <TableCell align="left">{get(_item, 'email')}</TableCell>
        {/* <TableCell align="left">{get(_item, 'vendorInfo.fssaiLicNo') || '-'}</TableCell>
        <TableCell align="left">{get(_item, 'vendorInfo.gstNo') || '-'}</TableCell> */}
        <TableCell align="left">{_item?.total_orders || 0}</TableCell>
        <TableCell align="left">{_item?.order_amount / 100 || 0}</TableCell>
        <TableCell
          align="right"
          sx={{
            position: 'sticky',
            right: 0,
            backgroundColor: 'white',
          }}
        >
          <Stack flexDirection="row" alignItems="center">
            <Stack flexDirection="row" alignItems="center" gap={0.5} mt={0.5}>
              <Tooltip title="View More">
                <IconButton
                  onClick={() => {
                    handleCloseMenu();
                    setOpenViewMoreDrawer(true);
                  }}
                >
                  <WysiwygIcon sx={{ fontSize: { xs: '18px', sm: '22px' } }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Purchase Details">
                <IconButton
                  onClick={() => {
                    handleCloseMenu();
                    navigate(
                      `${PATH_DASHBOARD.purchases.vendorPurchaseOrders}/${get(_item, 'id')}`
                    );
                  }}
                >
                  <ShoppingBasketIcon sx={{ fontSize: { xs: '18px', sm: '22px' } }} />
                </IconButton>
              </Tooltip>
            </Stack>
            <KebabMenu
              className="customerinfoStep2"
              key={get(_item, 'customerId')}
              open={openMenu}
              onOpen={handleOpenMenu}
              onClose={handleCloseMenu}
              customWidth={180}
              actions={
                <>
                  <Stack
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 0.5,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      handleCloseMenu();
                      handleEditVendor(get(_item, 'id'));
                    }}
                  >
                    <EditIcon sx={{ fontSize: { xs: '18px', sm: '22px' } }} />
                    Edit
                  </Stack>

                  <Divider sx={{ borderStyle: 'dashed', my: { xs: 0.5, sm: 1 } }} />
                  <Stack
                    onClick={() => {
                      handleCloseMenu();
                      handleDeleteVendorWithAlert(get(_item, 'id'));
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
        _item={_item}
      />
    </>
  );
}
