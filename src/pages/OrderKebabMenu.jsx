import React, { useState } from 'react';

import KebabMenu from 'src/components/KebabMenu';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Divider, MenuItem, Stack, Typography } from '@mui/material';

export default function OrderKebabMenu(props) {
  const { params, handleEdit, handleOpenDeleteDrawer } = props;
  const [openMenu, setOpenMenuActions] = useState(null);
  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };
  return (
    <KebabMenu
      open={openMenu}
      onOpen={handleOpenMenu}
      onClose={handleCloseMenu}
      actions={
        <>
          <Stack
            onClick={() => {
              handleCloseMenu();
              handleOpenDeleteDrawer();
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
  );
}
