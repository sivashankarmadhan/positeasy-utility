import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box, Chip, Divider, MenuItem, Stack, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// routes
// auth

// components
import { get } from 'lodash';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentStoreId, storeLogo } from 'src/global/recoilState';
import UpdatePassword from 'src/pages/Auth/UpdatePassword';
import LogoServices from 'src/services/API/UploadLogoServices';
import AuthService from 'src/services/authService';
import { IconButtonAnimate } from '../../../components/animate';
import { CustomAvatar } from '../../../components/custom-avatar';
import MenuPopover from '../../../components/menu-popover';
import Logout from '../../../pages/Auth/Logout';
import { TERMINAL_STATUS } from 'src/constants/AppConstants';
import useExecuteAfterCheck from 'src/hooks/useExecuteAfterCheck';

// ----------------------------------------------------------------------

const OPTIONS = [
  {
    label: 'Home',
    linkTo: '/',
  },
  {
    label: 'Profile',
    linkTo: '/',
  },
  {
    label: 'Settings',
    linkTo: '/',
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover({ role }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentStore = useRecoilValue(currentStoreId);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const [open, setOpen] = useState(false);
  const [logo, setLogo] = useRecoilState(storeLogo);
  const [openLogout, setOpenLogout] = useState(false);
  const user = AuthService._getMerchantDetails();
  const [openPopover, setOpenPopover] = useState(null);

  const executeAfterCheck = useExecuteAfterCheck();

  const handleOpenLogout = () => {
    setOpenLogout(true);
    handleClosePopover();
  };
  const handleCloseLogout = () => {
    setOpenLogout(false);
    handleClosePopover();
  };
  const getLogo = async () => {
    try {
      const response = await LogoServices.getLogoImage();
      if (get(response, 'data.logoImage')) setLogo(get(response, 'data.logoImage'));
    } catch (e) {
      console.log(e);
    }
  };

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleUpdatePassword = () => {
    handleClosePopover();
    setOpen(true);
  };

  useEffect(() => {
    if (currentStore) getLogo();
  }, [currentStore]);

  return (
    <>
      <Box
        onClick={handleOpenPopover}
        sx={{
          p: 0,
          ml: 0.7,
          ...(openPopover && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              // bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <CustomAvatar
          sx={{
            backgroundColor: 'white',
            color: theme.palette.primary.main,
            border: 2,
            borderColor: theme.palette.primary.light,
            cursor: 'pointer',
          }}
          src={logo}
          alt={
            get(user, 'email')?.slice(0, 1) ||
            get(user, 'terminalNumber')?.slice(0, 1) ||
            get(user, 'role')?.slice(0, 1)
          }
          name={get(user, 'email') || get(user, 'terminalNumber') || get(user, 'role')}
        />
      </Box>
      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 200, p: 0 }}>
        <Stack sx={{ p: 1 }}>
          <Typography
            size="small"
            variant="subtitle2"
            sx={{
              color: 'primary.main',
              ml: 1,
              display: 'flex',
              justifyContent: 'flex-start',
              fontWeight: 'bold',
            }}
          >
            {get(user, 'role', '')?.toUpperCase()}
          </Typography>
          {/* {OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {option.label}
            </MenuItem>
          ))} */}

          <MenuItem
            onClick={() => {
              executeAfterCheck(() => {
                handleUpdatePassword();
              });
            }}
          >
            Update Password
          </MenuItem>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            executeAfterCheck(() => {
              handleOpenLogout();
            });
          }}
          sx={{ m: 1 }}
        >
          Logout
        </MenuItem>
      </MenuPopover>
      <UpdatePassword open={open} handleClose={handleClose} />
      <Logout open={openLogout} handleClose={handleCloseLogout} />
    </>
  );
}
