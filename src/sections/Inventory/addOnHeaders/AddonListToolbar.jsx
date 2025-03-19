import PropTypes from 'prop-types';
// @mui
import {
  Button,
  Divider,
  Fab,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Popover,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
// component
import AddIcon from '@mui/icons-material/Add';
import ExtensionIcon from '@mui/icons-material/Extension';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { get, isEmpty, map, some } from 'lodash';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { useRecoilValue } from 'recoil';
import {
  StatusArrayConstants,
  StatusConstants,
  StockMonitorArrayConstants,
  StockMonitorConstants,
  hideScrollbar,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { allProducts } from 'src/global/recoilState';
import { PATH_DASHBOARD } from 'src/routes/paths';
import PRODUCTS_API from 'src/services/products';
import Iconify from '../../../components/iconify';
// ----------------------------------------------------------------------

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: { xs: 320, sm: 240 },
  transition: theme.transitions.create(['box-shadow'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

// ----------------------------------------------------------------------

AddonListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  filterCategory: PropTypes.string,
  onFilterName: PropTypes.func,
  filterStatus: PropTypes.string,
  onFilterStatus: PropTypes.func,
  onFilterCategory: PropTypes.func,
  handleOpenNewProduct: PropTypes.func,
  initialFetch: PropTypes.func,
  addOnList: PropTypes.array,
  selected: PropTypes.array,
  setFilterSearchStatus: PropTypes.bool,
  setFilterStatus: PropTypes.func,
  setFilterStockMonitor: PropTypes.func,
  filterStockMonitor: PropTypes.array,
  onFilterStockMonitor: PropTypes.func,
  categoriesList: PropTypes.array,
  setFilterCategory: PropTypes.func,
};

export default function AddonListToolbar({
  numSelected,
  onFilterName,
  filterCategory,
  onFilterCategory,
  handleOpenNewProduct,
  addOnList,
  initialFetch,
  selected,
  setSelected,
  filterStatus,
  onFilterStatus,
  setFilterSearchStatus,
  setFilterStatus,
  setFilterStockMonitor,
  filterStockMonitor,
  onFilterStockMonitor,
  categoriesList,
  setFilterCategory,
  handleAddItems,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const totalProducts = useRecoilValue(allProducts);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [openImport, setOpenImport] = useState(false);
  const [openPartnerImport, setOpenPartnerImport] = useState(false);
  const [openQRImport, setOpenQRImport] = useState(false);
  const [openStockExport, setOpenStockExport] = useState(false);
  const defaultValue = { open: false, event: {}, data: {} };
  const [open, setOpen] = useState(defaultValue);
  const [selectAllStatus, setSelectAllStatus] = useState(false);
  const [selectAllStockMonitor, setSelectAllStockMonitor] = useState(true);
  const [selectAllCategory, setSelectAllCategory] = useState(true);

  const checkfilter = (status) => some(addOnList, (e) => e.status === status);
  const handleOpenStockExport = () => {
    setOpenStockExport(true);
  };
  const handleCloseStockExport = () => {
    setOpenStockExport(false);
  };
  const handleOpenMenu = (event, product) => {
    setOpen({ open: true, eventData: event.currentTarget });
  };

  const handleCloseMenu = () => {
    setOpen(defaultValue);
  };
  const handleOpenImport = () => {
    setOpenImport(true);
  };
  const handleSelectImportOptions = (e) => {
    handleCloseImport();
    if (e === 'partner') {
      handleOpenPartnerImport();
    }
    if (e === 'qr') {
      handleOpenQRImport();
    }
    if (e === 'stock') {
      handleOpenStockExport();
    }
  };
  const handleCloseImport = () => {
    setOpenImport(false);
  };
  const handleOpenPartnerImport = () => {
    setOpenPartnerImport(true);
  };
  const handleClosePartnerImport = () => {
    setOpenPartnerImport(false);
  };
  const handleOpenQRImport = () => {
    setOpenQRImport(true);
  };
  const handleCloseQRImport = (e) => {
    setOpenQRImport(false);
  };

  const handleDeleteAllProduct = async () => {
    try {
      const options = {
        productId: selected,
      };
      const response = await PRODUCTS_API.deleteProduct(options);
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        initialFetch();
        setSelected([]);
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || 'Unable to Delete Product, Try Again');
    }
  };

  const handleChangeProductStatus = async (status) => {
    try {
      const options = {
        addOnId: selected,
        status: status,
      };
      const response = await PRODUCTS_API.updateAddonStatus(options);
      if (response) toast.success(SuccessConstants.STATUS_CHANGED);
      initialFetch();
    } catch (e) {
      console.log(e);
    }
  };

  const checkIsStatusAll = (status) => {
    const check = some(totalProducts, (e) => selected.includes(e.productId) && e.status === status);
    if (!check) return true;
    return false;
  };
  const handleSelectAllStatus = () => {
    if (!selectAllStatus) setFilterStatus([...StatusArrayConstants]);
    if (selectAllStatus) setFilterStatus([]);
    setSelectAllStatus(!selectAllStatus);
  };

  const isInactiveAll = checkIsStatusAll(StatusConstants.INACTIVE);
  const isActiveAll = checkIsStatusAll(StatusConstants.ACTIVE);
  const isSoldOutAll = checkIsStatusAll(StatusConstants.SOLDOUT);
  return (
    <StyledRoot
      sx={{
        ...(numSelected > 0 && {
          color: 'common.white',
          bgcolor: 'primary.main',
        }),
        mb: { xs: 4, sm: 0 },
        mt: { xs: 4, sm: 0 },
      }}
    >
      <Stack
        sx={{
          gap: 1,
          flexDirection: { xs: 'column', sm: 'row' },
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginLeft: '-3px',
        }}
      >
        <Stack
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            position: 'relative',
            right: '20px',
          }}
        >
          {numSelected > 0 ? (
            <Typography component="div" variant="subtitle1">
              {numSelected} selected
            </Typography>
          ) : (
            <StyledSearch
              sx={{ width: '99%' }}
              size="small"
              onChange={onFilterName}
              placeholder="Search Addons..."
              startAdornment={
                <InputAdornment position="start">
                  <Iconify
                    icon="eva:search-fill"
                    sx={{ color: 'text.disabled', width: 20, height: 20 }}
                  />
                </InputAdornment>
              }
            />
          )}
        </Stack>
        <Stack>
          {numSelected > 0 ? (
            <Stack flexDirection={'row'} sx={{ alignItems: 'center', gap: 2 }}>
              <Stack
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 1,
                }}
              >
                {isInactiveAll && (
                  <Button
                    onClick={() => handleChangeProductStatus(StatusConstants.INACTIVE)}
                    sx={{
                      color: theme.palette.common.white,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': { border: '1px solid #FFFFFF' },
                    }}
                    variant="text"
                    startIcon={<GpsNotFixedIcon sx={{ color: theme.palette.common.white }} />}
                  >
                    Mark as inactive
                  </Button>
                )}
                {isActiveAll && (
                  <Button
                    onClick={() => handleChangeProductStatus(StatusConstants.ACTIVE)}
                    sx={{
                      color: theme.palette.common.white,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': { border: '1px solid #FFFFFF' },
                    }}
                    variant="text"
                    startIcon={<GpsFixedIcon sx={{ color: theme.palette.common.white }} />}
                  >
                    Mark as active
                  </Button>
                )}
                {isSoldOutAll && (
                  <Button
                    onClick={() => handleChangeProductStatus(StatusConstants.SOLDOUT)}
                    sx={{
                      color: theme.palette.common.white,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': { border: '1px solid #FFFFFF' },
                    }}
                    variant="text"
                    startIcon={<GpsOffIcon sx={{ color: theme.palette.common.white }} />}
                  >
                    Mark as soldout
                  </Button>
                )}
              </Stack>
              <Tooltip title="Delete the selected products">
                <IconButton onClick={handleDeleteAllProduct}>
                  <Iconify color="common.white" icon="eva:trash-2-fill" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <Stack
              flexDirection={'row'}
              sx={{ alignItems: 'center', justifyContent: 'space-around' }}
            >
              <Tooltip title="Filter list">
                <IconButton onClick={handleOpenMenu}>
                  <Iconify icon="ic:round-filter-list" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add new product">
                <Fab
                  onClick={handleOpenNewProduct}
                  color="primary"
                  aria-label="add"
                  sx={{ position: 'fixed', bottom: 12, right: 16 }}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      </Stack>
      <Popover
        open={Boolean(get(open, 'open'))}
        anchorEl={get(open, 'eventData')}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 160,
            maxHeight: 400,
            ...hideScrollbar,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          Status
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={false}
                checked={selectAllStatus}
                onChange={handleSelectAllStatus}
                name={'All'}
              />
            }
            label={'Select All'}
          />
          <FormControlLabel
            control={
              <Checkbox
                disabled={selectAllStatus}
                defaultChecked={false}
                checked={filterStatus.includes(StatusConstants.ACTIVE) || selectAllStatus}
                onChange={onFilterStatus}
                name={StatusConstants.ACTIVE}
              />
            }
            label="Active"
          />
          <FormControlLabel
            control={
              <Checkbox
                disabled={selectAllStatus}
                defaultChecked={false}
                checked={filterStatus.includes(StatusConstants.INACTIVE) || selectAllStatus}
                onChange={onFilterStatus}
                name={StatusConstants.INACTIVE}
              />
            }
            label="Inactive"
          />
          <FormControlLabel
            control={
              <Checkbox
                disabled={selectAllStatus}
                defaultChecked={false}
                checked={filterStatus.includes(StatusConstants.SOLDOUT) || selectAllStatus}
                onChange={onFilterStatus}
                name={StatusConstants.SOLDOUT}
              />
            }
            label="Soldout"
          />
        </FormGroup>
      </Popover>
    </StyledRoot>
  );
}
