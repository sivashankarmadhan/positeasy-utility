import React, { useState } from 'react';

import KebabMenu from 'src/components/KebabMenu';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Divider, MenuItem, Stack, Typography } from '@mui/material';

export default function ExpenseReportKebab(props) {
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
            sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
            onClick={() => {
              handleCloseMenu();
              handleEdit(params.row.id);
            }}
          >
            <EditIcon sx={{ fontSize: { xs: '18px', sm: '22px' } }} />
            Edit
          </Stack>

          <Divider sx={{ borderStyle: 'dashed', my: { xs: 0.5, sm: 1 } }} />

          <Stack
            onClick={() => {
              handleCloseMenu();
              handleOpenDeleteDrawer(params.row.id);
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
