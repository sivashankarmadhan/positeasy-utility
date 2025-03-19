import {
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import { useMediaQuery, useResponsive } from '@poriyaalar/custom-hooks';
import { useNavigate } from 'react-router';
import { useResetRecoilState } from 'recoil';
import TripleToggleSwitch from 'src/components/toggle/Triple';
import { SortingConstants, StatusConstants } from 'src/constants/AppConstants';
import { currentAddon, currentProduct } from 'src/global/recoilState';
import FilterPopOver from 'src/layouts/dashboard/header/FilterPopOver';
import { PATH_DASHBOARD } from 'src/routes/paths';

export default function AddonHeader({
  handleOpenDrawer,
  dataStatusState,
  setDataStatusState,
  setNewAddon,
  setEditMode,
  sortingOrder,
  setSortingOrder,
}) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const resetCurrentProduct = useResetRecoilState(currentAddon);
  const theme = useTheme();

  const handleAddItems = () => {
    handleOpenDrawer();
    resetCurrentProduct();
    setNewAddon(true);
    setEditMode(true);
  };

  const toggleLabels = {
    center: {
      title: 'Inactive',
      value: StatusConstants.INACTIVE,
    },

    right: {
      title: 'Soldout',
      value: StatusConstants.SOLDOUT,
    },
    left: {
      title: 'Active',
      value: StatusConstants.ACTIVE,
    },
  };

  const onToggleChange = (value) => {
    setDataStatusState(
      value === 'left'
        ? StatusConstants.ACTIVE
        : value === 'center'
        ? StatusConstants.INACTIVE
        : StatusConstants.SOLDOUT
    );
  };
  return (
    <Stack
      flexDirection={'row'}
      sx={{
        justifyContent: 'space-between',
        px: 1,
        alignItems: isMobile ? 'center' : 'flex-end',
        pb: 1,
        mt: 1,
      }}
    >
      <Stack
        flexDirection={'row'}
        sx={{
          mr: 1,
          alignItems: 'center',
        }}
      >
        <Tooltip title="Go back to inventory">
          <IconButton
            onClick={() => navigate(PATH_DASHBOARD.inventory, { replace: true })}
            size="small"
            sx={{ color: theme.palette.primary.main }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>

        {isMobile ? (
          <div
            style={{
              justifyItems: 'center',
              alignItems: 'center',
              display: 'flex',
              position: 'relative',
            }}
          >
            <FilterPopOver IconChildren={<FilterAltIcon fontSize="medium" />}>
              <FormControl>
                <RadioGroup
                  defaultValue={dataStatusState}
                  onChange={(event) => {
                    setDataStatusState(event.target.value);
                  }}
                  sx={{ px: 2 }}
                >
                  <FormControlLabel
                    value={StatusConstants.ACTIVE}
                    control={<Radio />}
                    label="Active"
                  />
                  <FormControlLabel
                    value={StatusConstants.INACTIVE}
                    control={<Radio />}
                    label="Inactive"
                  />
                  <FormControlLabel
                    value={StatusConstants.SOLDOUT}
                    control={<Radio />}
                    label="Soldout"
                  />
                </RadioGroup>
              </FormControl>
            </FilterPopOver>
          </div>
        ) : (
          <div style={{ marginLeft: 5 }}>
            <TripleToggleSwitch
              dataStatusState={dataStatusState}
              labels={toggleLabels}
              onChange={onToggleChange}
            />
          </div>
        )}
      </Stack>
      <Stack flexDirection={'row'} sx={{ alignItems: 'center' }}>
        {/* <FilterPopOver IconChildren={<SortIcon fontSize="medium" />}>
          <FormControl>
            <RadioGroup
              defaultValue={sortingOrder}
              onChange={(event) => {
                setSortingOrder(event.target.value);
              }}
              sx={{ px: 2 }}
            >
              <FormControlLabel
                value={SortingConstants.NEWEST}
                control={<Radio />}
                label="Newest"
              />
              <FormControlLabel
                value={SortingConstants.OLDEST}
                control={<Radio />}
                label="Oldest"
              />
            </RadioGroup>
          </FormControl>
        </FilterPopOver> */}
        {isMobile ? (
          <div
            onClick={handleAddItems}
            style={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: 20,
              boxShadow: `1px 2px 5px ${theme.palette.primary.light}`,
              marginLeft: 5,
            }}
          >
            <IconButton>
              <AddIcon sx={{ color: theme.palette.common.white }} />
            </IconButton>
          </div>
        ) : (
          <Button
            onClick={handleAddItems}
            sx={{ ml: 1 }}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Addon
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
