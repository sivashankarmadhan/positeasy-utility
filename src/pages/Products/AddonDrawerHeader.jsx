import { IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import CreateIcon from '@mui/icons-material/Create';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { isEmpty } from 'lodash';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { currentAddon } from 'src/global/recoilState';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const AddonDrawerHeader = ({
  reset,
  handleCloseDrawer,
  editMode,
  setEditMode,
  newAddon,
  defaultValues,
  setOpenDeleteAddOn,
}) => {
  const theme = useTheme();
  const resetCurrentAddon = useResetRecoilState(currentAddon);
  const currentAddonData = useRecoilValue(currentAddon);
  const { isMobile } = useResponsive();
  const handleCancel = () => {
    handleCloseDrawer();
    setEditMode(false);
    resetCurrentAddon();
    reset();
  };
  const handleClear = () => {
    if (newAddon) {
      reset({ ...defaultValues });
    } else {
      reset({ ...currentAddonData });
    }
  };
  const addonName = isEmpty(currentAddonData) ? 'ADD ADDON' : currentAddonData?.name?.toUpperCase();
  return (
    <Stack
      flexDirection={'row'}
      sx={{
        justifyContent: 'space-between',
        m: 1,
        alignItems: 'center',
        pb: 1,

        borderBottom: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        mx: 3,
      }}
    >
      <Typography variant="h6">{addonName}</Typography>
      <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
        {!newAddon && !editMode && (
          <Tooltip title="Delete">
            <IconButton
              sx={{ color: theme.palette.primary.main }}
              onClick={() => setOpenDeleteAddOn(true)}
            >
              <DeleteForeverIcon />
            </IconButton>
          </Tooltip>
        )}
        {!newAddon && !editMode && (
          <IconButton sx={{ color: theme.palette.primary.main }} onClick={() => setEditMode(true)}>
            <CreateIcon />
          </IconButton>
        )}

        {editMode && (
          <Typography
            onClick={() => handleClear()}
            sx={{
              '&:hover': {
                textDecoration: 'underline',
                color: theme.palette.primary.light,
              },
              fontSize: '14px',
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              mr: 1,
              cursor: 'pointer',
            }}
          >
            Reset
          </Typography>
        )}

        <IconButton sx={{ color: theme.palette.primary.main }} onClick={() => handleCancel()}>
          <CloseIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};
export default AddonDrawerHeader;
