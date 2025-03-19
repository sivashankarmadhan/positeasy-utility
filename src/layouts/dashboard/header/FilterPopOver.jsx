import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
// routes
// auth
// components
import { IconButtonAnimate } from '../../../components/animate';
import MenuPopover from '../../../components/menu-popover';
import { useSnackbar } from '../../../components/snackbar';
import { Tooltip } from '@mui/material';

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

export default function FilterPopOver({
  IconChildren,
  children,
  sx = {},
  IconStyle = {},
  customWidth,
}) {
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = (event) => {
    event.stopPropagation();
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = (e) => {
    setOpenPopover(null);
    e.stopPropagation();
  };

  //   const handleClickItem = (path) => {
  //     handleClosePopover();
  //     navigate(path);
  //   };

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpenPopover}
        sx={{
          p: 0,
          ...(openPopover && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              pointer: 'cursor',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
          ...IconStyle,
        }}
      >
        {IconChildren}
      </IconButtonAnimate>
      <MenuPopover
        arrow="top-left"
        open={openPopover}
        onClose={handleClosePopover}
        sx={{ width: customWidth || 150, p: 0, ...sx }}
      >
        {children}
      </MenuPopover>
    </>
  );
}
