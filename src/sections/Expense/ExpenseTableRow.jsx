import { Box, Divider, Stack, TableCell, TableRow, TextField, useMediaQuery } from '@mui/material';
import { get } from 'lodash';
import React, { useState } from 'react';
import { fDatesWithTimeStamp } from 'src/utils/formatTime';
import KebabMenu from 'src/components/KebabMenu';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs';

export default function ExpenseTableRow(props) {
  const { row, handleOpenDeleteDrawer, handleEdit } = props;


  const isMobile = useMediaQuery('(max-width:600px)');

  const [openMenu, setOpenMenuActions] = useState(null);
  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };
  return (
    <TableRow>
      <TableCell align="left">
        {fDatesWithTimeStamp(
          `${get(row, 'dateTz')?.split?.('T')?.[0]} ${
            get(row, 'dateTz')?.split?.('T')[1]?.split?.('.')?.[0]
          }`
        )}
      </TableCell>
      <TableCell align="left"> {get(row, 'name')} </TableCell>
      <TableCell align="left">{get(row, 'category')|| '-'}</TableCell>
      <TableCell align="left">{get(row, 'paymentType')|| '-'}</TableCell>
      <TableCell align="left">{get(row, 'counterName') || '-'}</TableCell>

      <TableCell align="left">{get(row, 'amountSpent') / 100 || 0}</TableCell>
      <TableCell align="left">
        {fDatesWithTimeStamp(
          `${get(row, 'createdAt')?.split?.('T')?.[0]} ${
            get(row, 'createdAt')?.split?.('T')[1]?.split?.('.')?.[0]
          }`
        )}
      </TableCell>
      <TableCell align="left" sx={{ maxWidth: 200, textAlign: 'justify' }}>
        <TextField
          inputProps={{ readOnly: true }}
          focused
          size="small"
          value={get(row, 'additionalInfo') || '-'}
          sx={{
            '& input': { p: 1.5 },
            width: 200,
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: 400,
            '& .MuiOutlinedInput-notchedOutline': {
              backgroundColor: get(row, 'additionalInfo') ? '#919eab3d' : '',
              borderColor: 'transparent!important',
            },
          }}
        />
      </TableCell>
      <TableCell>
        <Box className="expenseStep4" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <KebabMenu
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
                    handleEdit(get(row, 'expenseId'));
                  }}
                >
                  <EditIcon sx={{ fontSize: { xs: '18px', sm: '22px' } }} />
                  Edit
                </Stack>

                <Divider sx={{ borderStyle: 'dashed', my: { xs: 0.5, sm: 1 } }} />

                <Stack
                  onClick={() => {
                    handleCloseMenu();
                    handleOpenDeleteDrawer(get(row, 'expenseId'));
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
        </Box>
      </TableCell>
    </TableRow>
  );
}
