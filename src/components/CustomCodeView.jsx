import { Divider, Stack, Typography, useTheme } from '@mui/material';
import { get } from 'lodash';
import React, { useState } from 'react';
import KebabMenu from 'src/components/KebabMenu';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import SettingServices from 'src/services/API/SettingServices';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import { useSetRecoilState } from 'recoil';
import { alertDialogInformationState } from 'src/global/recoilState';

export default function CustomCodeView({
  _item,
  setIsOpenAddCustomCodeModal,
  setEditCustomCode,
  initialFetch,
}) {
  const theme = useTheme();

  const [openMenu, setOpenMenuActions] = useState(null);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };
  const handleEditCustomCode = (customCode) => {
    setEditCustomCode(customCode);
    setIsOpenAddCustomCodeModal(true);
  };
  const handleDeleteCustomCode = async (data, onClose) => {
    try {
      const response = await SettingServices.removeCustomCode(get(data, 'customCode'));
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        handleCloseMenu();
        onClose();
      }
      initialFetch();
    } catch (e) {
      console.log(e);
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
            handleDeleteCustomCode(_item, onClose);
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
    <Stack
      sx={{
        width: '100%',
        border: '1px solid #DEDEDE',
        borderRadius: '12px',
        p: 2,
      }}
      flexDirection="row"
      alignItems="center"
    >
      <Stack spacing={0.5} flexGrow={1}>
        <Typography sx={{ fontWeight: 500 }} variant="subtitle1">
          {_item?.codeName}
        </Typography>
      </Stack>
      <KebabMenu
        key={get(_item, 'id')}
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
              }}
              onClick={() => {
                handleCloseMenu();
                handleEditCustomCode(_item);
              }}
            >
              <EditIcon sx={{ fontSize: { xs: '18px', sm: '22px' } }} />
              Edit
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', my: { xs: 0.5, sm: 1 } }} />
            <Stack
              onClick={handleDelete}
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
      />{' '}
    </Stack>
  );
}
