// @mui
import {
  Fab,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Popover,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  TextField,
  Autocomplete,
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
// component
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { get, isEmpty, map, noop, some } from 'lodash';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { StatusArrayConstants, StatusConstants, hideScrollbar } from 'src/constants/AppConstants';
import Iconify from 'src/components/iconify';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import RAW_PRODUCTS_API from 'src/services/rawproducts';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import { useSetRecoilState } from 'recoil';
import { alertDialogInformationState } from 'src/global/recoilState';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
// ----------------------------------------------------------------------

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: { xs: 125, sm: 96 },
  display: 'flex',
  justifyContent: 'space-between',
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

// ----------------------------------------------------------------------

export default function RawMaterialListToolbar({
  numSelected,
  selected,
  onFilterName,
  handleOpenNewProduct,
  totalRawProducts,
  onFilterStatus,
  setFilterStatus,
  filterStatus,
  intialFetch,
  setSelected,
  setFilterSearchStatus,
  handleOpenStock,
  category,
  handleChangeCategory,
  categoriesList,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const defaultValue = { open: false, event: {}, data: {} };
  const [openBulkAction, setOpenBulkAction] = useState(defaultValue);
  const [open, setOpen] = useState(defaultValue);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [selectAllStatus, setSelectAllStatus] = useState(false);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const handleChangeProductStatus = async (status, onClose) => {
    try {
      const options = {
        productId: selected,
        status: status,
      };
      const response = await RAW_PRODUCTS_API.updateProductStatus(options);
      if (response) toast.success(SuccessConstants.STATUS_CHANGED);
      intialFetch();
      setSelected([]);
      onClose();
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_CHANGE_STATUS);
    }
  };

  const deleteAllProduct = async (onClose) => {
    try {
      const options = {
        productId: selected,
      };
      const response = await RAW_PRODUCTS_API.deleteSelectedProduct(options);
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        intialFetch();
        setSelected([]);
        onClose();
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || 'Unable to Delete Product, Try Again');
    }
  };
  const handleAlertDialog = ({ title, status }) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to ${title}`,
      actions: {
        primary: {
          text: title,
          onClick: (onClose) => {
            handleChangeProductStatus(status, onClose);
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
  const handleDeleteAllProduct = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to delete products ?`,
      actions: {
        primary: {
          text: 'Delete',
          onClick: (onClose) => {
            deleteAllProduct(onClose);
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
  const handleOpenBulkMenu = (event, product) => {
    setOpenBulkAction({ open: true, eventData: event.currentTarget });
  };
  const handleCloseBulkMenu = () => {
    setOpenBulkAction(defaultValue);
  };
  const handleSelectAllStatus = () => {
    if (!selectAllStatus) setFilterStatus([...StatusArrayConstants]);
    if (selectAllStatus) setFilterStatus([]);
    setSelectAllStatus(!selectAllStatus);
  };
  const handleOpenMenu = (event, product) => {
    setOpen({ open: true, eventData: event.currentTarget });
  };

  const handleCloseMenu = () => {
    setOpen(defaultValue);
  };
  const checkIsStatusAll = (status) => {
    const check = some(
      totalRawProducts,
      (e) => selected.includes(e.productId) && e.status === status
    );
    if (!check) return true;
    return false;
  };
  const checkCurrentCategory = (name) => {
    const data = some(category, (e) => e.id === name);
    return data;
  };
  const isInactiveAll = checkIsStatusAll(StatusConstants.INACTIVE);
  const isActiveAll = checkIsStatusAll(StatusConstants.ACTIVE);
  const isSoldOutAll = checkIsStatusAll(StatusConstants.SOLDOUT);
  return (
    <>
      <Tooltip title="Add new material">
        <Fab
          onClick={handleOpenNewProduct}
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 12, right: 16 }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      {(!isEmpty(totalRawProducts) || setFilterSearchStatus) && (
        <StyledRoot
          sx={{
            ...(numSelected > 0 && {
              color: 'common.white',
              bgcolor: 'primary.main',
              mt: 2,
            }),
            '&.MuiToolbar-root': {
              px: 0,
            },
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
            {numSelected > 0 ? (
              <Typography
                component="div"
                variant="subtitle1"
                marginLeft={1}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {numSelected} selected
              </Typography>
            ) : (
              <StyledSearch
                sx={{ width: { xs: '100% !important', sm: '50% !important' }, paddingLeft: '7px' }}
                className="inventoryStep3"
                size="small"
                onChange={onFilterName}
                placeholder="Search products..."
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

            <Stack sx={{ width: '100%' }}>
              {numSelected > 0 ? (
                <Stack flexDirection={'row'} sx={{ alignItems: 'center', gap: 2 }}>
                  <Stack
                    sx={{
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 1,
                      width: '100%',
                    }}
                  >
                    <Popover
                      open={Boolean(get(openBulkAction, 'open'))}
                      anchorEl={get(openBulkAction, 'eventData')}
                      onClose={handleCloseBulkMenu}
                      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      PaperProps={{
                        sx: {
                          p: 1,
                          width: 170,
                          '& .MuiMenuItem-root': {
                            px: 1,
                            typography: 'body2',
                            borderRadius: 0.75,
                          },
                        },
                      }}
                    >
                      {' '}
                      {isInactiveAll && (
                        <MenuItem
                          onClick={() => {
                            handleAlertDialog({
                              title: 'mark as inactive',
                              status: StatusConstants.INACTIVE,
                            });
                          }}
                        >
                          <GpsNotFixedIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />{' '}
                          Mark as inactive
                        </MenuItem>
                      )}
                      {isActiveAll && (
                        <MenuItem
                          onClick={() => {
                            handleAlertDialog({
                              title: 'mark as active',
                              status: StatusConstants.ACTIVE,
                            });
                          }}
                        >
                          <GpsFixedIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />
                          Mark as active
                        </MenuItem>
                      )}
                      {isSoldOutAll && (
                        <MenuItem
                          onClick={() => {
                            handleAlertDialog({
                              title: 'mark as soldout',
                              status: StatusConstants.SOLDOUT,
                            });
                          }}
                        >
                          <GpsOffIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />
                          Mark as soldout
                        </MenuItem>
                      )}
                      <MenuItem onClick={handleDeleteAllProduct}>
                        <DeleteIcon sx={{ color: theme.palette.common.primary, mr: 1 }} />
                        Delete All
                      </MenuItem>
                    </Popover>
                  </Stack>

                  <Tooltip title="Bulk action">
                    <IconButton className="inventoryStep2" onClick={handleOpenBulkMenu}>
                      <Iconify
                        icon="mi:options-horizontal"
                        color="#FFFFFF"
                        width="60"
                        height="60"
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ) : (
                <Stack
                  sx={{
                    alignItems: 'center',
                    gap: 1,
                    flexDirection: { xs: 'column', sm: 'row', lg: 'row' },
                    width: '100%',
                  }}
                >
                  <Autocomplete
                    multiple
                    size="small"
                    filterSelectedOptions
                    options={map(categoriesList, (_item) => ({
                      label: _item,
                      id: _item,
                    }))}
                    filterOptions={(options, { inputValue }) => {
                      const searchTerm = inputValue.toLowerCase();
                      return options.filter((option) =>
                        option.label.toLowerCase().startsWith(searchTerm)
                      );
                    }}
                    value={category}
                    getOptionDisabled={(option) => checkCurrentCategory(option.id)}
                    onChange={(event, newValue) => handleChangeCategory(newValue)}
                    sx={{ minWidth: 200, width: '100%', flexWrap: 'nowrap' }}
                    renderInput={(params) => (
                      <TextField variant="filled" {...params} label={'Category'} />
                    )}
                  />
                  <Stack
                    sx={{
                      alignItems: 'center',
                      gap: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      width: '100%',
                    }}
                  >
                    <Tooltip title="Inventory stock">
                      <IconButton className="inventoryStep2" onClick={handleOpenStock}>
                        <Iconify icon={'fluent-mdl2:quantity'} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Filter list">
                      <IconButton className="inventoryStep2" onClick={handleOpenMenu}>
                        <Iconify icon="ic:round-filter-list" color="#5a0b45" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
        </StyledRoot>
      )}

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
        </Typography>{' '}
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
                defaultChecked={true}
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
                defaultChecked={true}
                checked={filterStatus.includes(StatusConstants.SOLDOUT) || selectAllStatus}
                onChange={onFilterStatus}
                name={StatusConstants.SOLDOUT}
              />
            }
            label="Soldout"
          />
        </FormGroup>
      </Popover>
    </>
  );
}
