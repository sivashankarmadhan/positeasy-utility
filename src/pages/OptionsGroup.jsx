import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery,
  Autocomplete,
  TextField,
  Tooltip,
  TableSortLabel,
  MenuItem,
  Popover,
  Fab,
  Checkbox,
} from '@mui/material';
import Box from '@mui/material/Box';
import { filter, find, forEach, get, includes, isEmpty, map, remove, startCase } from 'lodash';
import { useEffect, useState } from 'react';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import CustomerView from 'src/components/CustomerView';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import RouterConstants from 'src/constants/RouterConstants';
import { CustomerInfoTourConfig, CustomerTourConfig } from 'src/constants/TourConstants';
import { SelectedSection } from 'src/global/SettingsState';
import {
  alertDialogInformationState,
  allConfiguration,
  currentStoreId,
  currentTerminalId,
  isPublishFDState,
  isTourOpenState,
  storeNameState,
  storeReferenceState,
  stores,
} from 'src/global/recoilState';
import AddCustomer from 'src/sections/Customer/AddCustomer';
import SettingServices from 'src/services/API/SettingServices';
import {
  onlineCategoryTableColumns,
  optionsGroupTableColumns,
  SettingsSections,
} from '../constants/AppConstants';
import Label from '../components/label';
import { Icon } from '@iconify/react';
import AuthService from 'src/services/authService';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import toast from 'react-hot-toast';
import PRODUCTS_API from 'src/services/products';
import AddOnlineCategory from 'src/sections/OnlineCategory/AddOnlineCategory';
import CategoryTableBody from 'src/sections/OnlineCategory/CategoryTableBody';
import Iconify from 'src/components/iconify';
import ONLINE_STORES from 'src/services/onlineStoresServices';
import OnlineCategoryServices from 'src/services/API/OnlineCategoryServices';
import TimingDialog from 'src/sections/OnlineCategory/TimingDialog';
import { formatTimeWithoutSec } from 'src/utils/formatTime';
import AddOptionGroups from 'src/sections/OptionGroups/AddOptionGroups';
import OptionsGroupServices from 'src/services/API/OptionsGroupServices';
import OptionGroupTableBody from 'src/sections/OptionGroups/OptionGroupTableBody';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import { StyledRoot } from 'src/layouts/login/styles';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import moment from 'moment';
import useFDPublish from 'src/hooks/useFDPublish';
import FolderOffIcon from '@mui/icons-material/FolderOff';

const OptionsGroup = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [isOpenAddOptionGroupModal, setIsOpenAddOptionGroupModal] = useState(false);
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const [onlineCategory, setOnlineCategory] = useState([]);
  let [optionsGroupData, setOptionsGroupData] = useState([]);
  const [isLoading, setIsLoading] = useState(null);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const setSection = useSetRecoilState(SelectedSection);
  const [totalOptionsGroup, setTotalOptionsGroup] = useState('');
  const [editOptionGroup, setEditOptionGroup] = useState({});
  const [paginationData, setPaginationData] = useState({
    size: 10,
    page: 1,
  });
  const [categoryId, setCategoryId] = useState('');
  const { updatePublish } = useFDPublish();
  const storeName = useRecoilValue(storeNameState);
  const storeReference = useRecoilValue(storeReferenceState);

  const isTourOpen = useRecoilValue(isTourOpenState);

  const actualStoresData = useRecoilValue(stores);

  const [isTimingDialogOpen, setIsTimingDialogOpen] = useState(false);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const defaultValue = { open: false, event: {}, data: {} };
  const [open, setOpen] = useState(defaultValue);

  const [selected, setSelected] = useState([]);

  const [openBulkAction, setOpenBulkAction] = useState(defaultValue);

  const rowsPerPage = get(paginationData, 'size');

  const handleOpenBulkMenu = (event, product) => {
    setOpenBulkAction({ open: true, eventData: event.currentTarget });
  };
  const handleCloseBulkMenu = () => {
    setOpenBulkAction(defaultValue);
  };

  const handleCloseMenu = () => {
    setOpen(defaultValue);
  };

  const handleCloseTimingDialog = () => {
    setIsTimingDialogOpen(false);
    handleCloseMenu();
    setCategoryId('');
  };

  const handleOpenStockDialog = async (e) => {
    setOpen(defaultValue);
    setCurrentProductStock(e);
    setStockOpenDialog(true);
  };

  const closeOptionGroupModal = () => {
    setEditOptionGroup(null);
    setIsOpenAddOptionGroupModal(false);
  };

  async function fetchCategoryList() {
    try {
      setIsLoading(true);
      const responseCategoryCodes = await OptionsGroupServices.allOptionsGroup({
        size: rowsPerPage,
        page: get(paginationData, 'page'),
      });
      setOptionsGroupData(get(responseCategoryCodes, 'data.groupData', []));
      setTotalOptionsGroup(get(responseCategoryCodes, 'data.totalItems'));
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const initialFetch = async () => {
    if (currentStore && currentTerminal) {
      try {
        fetchCategoryList();
      } catch (err) {
        console.log(err);
      }
    }
  };

  function handlePageChange(event, newPage) {
    setPaginationData((prev) => ({ ...prev, page: newPage + 1 }));
  }

  function handleOnRowsPerPageChange(event, data) {
    setPaginationData({ page: 1, size: data.props.value });
  }

  const renderHeading = (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="h6">Options Group</Typography>
    </Stack>
  );

  useEffect(() => {
    if (storeReference) {
      setIsLoading(true);
      initialFetch();
    }
  }, [currentStore, currentTerminal]);

  const getActiveStoreName = (storeId) => {
    const store = find(actualStoresData, (e) => e.storeId === storeId);
    if (isEmpty(store)) return '';
    return get(store, 'storeName');
  };

  const handleItem = (data) => {
    setEditOptionGroup(data);
    handleCloseMenu();
    setIsOpenAddOptionGroupModal(true);
  };

  const timingOnSubmit = async (data) => {
    const filterDataTimings = filter(data?.daySlots, (_item) => {
      return !isEmpty(get(_item, 'slots'));
    });

    const formatDataTimings = map(filterDataTimings, (_daySlot) => {
      return {
        ..._daySlot,
        slots: map(get(_daySlot, 'slots'), (_slot) => {
          return {
            start_time: `${formatTimeWithoutSec(get(_slot, 'start_time'))}:00`,
            end_time: `${formatTimeWithoutSec(get(_slot, 'end_time'))}:00`,
          };
        }),
      };
    });

    try {
      await OnlineCategoryServices.categoryTiming({
        storeReference: storeReference,
        categoryId: categoryId,
        daySlots: formatDataTimings,
        title: data?.title,
        actionType: 'CATEGORY_TIMING',
        storeName: storeName,
      });
      await updatePublish();
      initialFetch();
      handleCloseTimingDialog();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = optionsGroupData?.map((n) => n.groupId);
      setSelected(newSelecteds);
      return;
    } else setSelected([]);
  };

  const toggleOnlineOptionsGroup = async ({ status, onClose, event, onLoading } = {}) => {
    try {
      // onLoading?.(true);

      const payload = {
        storeReference: storeReference,
        OGList: selected,
        action: status,
      };

      const response = await OptionsGroupServices.toggleOnlineOptionsGroup(payload);

      if (response?.data?.recResponse?.message && response?.data?.recResponse?.status) {
        toast?.[response?.data?.recResponse?.status]?.(response?.data?.recResponse?.message);
      } else {
        toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
      }
      await updatePublish();
      setSelected([]);
      initialFetch();
      // onLoading?.(false);
      onClose();
    } catch (err) {
      console.log('err', err);
      toast.error(
        err?.response?.message || err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG
      );
      // onLoading?.(false);
    }
  };

  const toggleOnlineOptionsGroupWithAlertDialog = (status) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to ${
        status === 'ACTIVE' ? 'enable' : 'disable'
      } option list ?`,
      actions: {
        primary: {
          text: status === 'ACTIVE' ? 'enable' : 'disable',
          onClick: (onClose, onLoading, event) => {
            toggleOnlineOptionsGroup({ status, onClose, event, onLoading });
          },
          sx: {
            backgroundColor: status === 'ACTIVE' ? 'green' : 'red',
            '&:hover': {
              backgroundColor: status === 'ACTIVE' ? 'green' : 'red',
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

  const FDEnableOptions = [];
  const FDDisableOptions = [];

  forEach(optionsGroupData, (_item) => {
    if (selected.includes(get(_item, 'groupId'))) {
      if (_item?.status === 'ACTIVE') {
        FDEnableOptions.push(_item);
      } else if (_item?.status === 'INACTIVE') {
        FDDisableOptions.push(_item);
      }
    }
  });

  const isCheckAllEnableItems = !isEmpty(FDEnableOptions) && isEmpty(FDDisableOptions);

  const isCheckAllDisableItems = !isEmpty(FDDisableOptions) && isEmpty(FDEnableOptions);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Card sx={{ m: 2 }}>
        <Tooltip title="Add new option group">
          <Fab
            onClick={() => setIsOpenAddOptionGroupModal(true)}
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: 12, right: 16 }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
        <CardHeader
          className="customerStep1"
          title={renderHeading}
          sx={{ mb: 3, px: !isMobile ? 2 : null, pl: isMobile ? 2 : null }}
        />
        {selected?.length > 0 && (
          <StyledRoot
            sx={{
              ...(selected?.length > 0 && {
                color: 'common.white',
                bgcolor: 'primary.main',
                mt: 2,
                py: 1,
              }),
              '&.MuiToolbar-root': {
                px: 0,
              },
              width: '100%',
            }}
          >
            <Stack
              flexDirection={'row'}
              sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%' }}
            >
              <Stack flexDirection="row" alignItems="center" sx={{ width: '100%' }}>
                <Typography
                  component="div"
                  variant="subtitle1"
                  marginLeft={1}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {selected?.length} selected
                </Typography>

                <Tooltip title="Bulk action" sx={{ ml: 'auto' }}>
                  <IconButton className="inventoryStep2" onClick={handleOpenBulkMenu}>
                    <Iconify icon="mi:options-horizontal" color="#FFFFFF" width="60" height="60" />
                  </IconButton>
                </Tooltip>
              </Stack>

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
                <MenuItem
                  disabled={!isCheckAllDisableItems}
                  onClick={() => {
                    toggleOnlineOptionsGroupWithAlertDialog('ACTIVE');
                  }}
                >
                  <img
                    src={
                      !isCheckAllDisableItems
                        ? '/assets/swiggy-zomato-logo-disabled.svg'
                        : '/assets/swiggy-zomato-logo.svg'
                    }
                    style={{ width: 23, height: 23, marginRight: 10 }}
                  />
                  Enable Options
                </MenuItem>
                <MenuItem
                  disabled={!isCheckAllEnableItems}
                  onClick={() => {
                    toggleOnlineOptionsGroupWithAlertDialog('INACTIVE');
                  }}
                >
                  <img
                    src={
                      !isCheckAllEnableItems
                        ? '/assets/swiggy-zomato-logo-disabled.svg'
                        : '/assets/swiggy-zomato-logo.svg'
                    }
                    style={{ width: 23, height: 23, marginRight: 10 }}
                  />
                  Disable Options
                </MenuItem>
              </Popover>
            </Stack>
          </StyledRoot>
        )}
        <TableContainer sx={{ height: isMobile ? 630 : 550 }}>
          <Table stickyHeader>
            <TableHead sx={{ marginLeft: '4px !important' }}>
              <TableRow
                sx={{
                  '& .MuiTableCell-head': {
                    background: theme.palette.primary.lighter,
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {' '}
                <TableCell
                  padding="checkbox"
                  sx={{
                    pr: 3,
                    position: 'sticky',
                    left: 0,
                    zIndex: 95,
                  }}
                >
                  <Stack sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Checkbox
                      indeterminate={
                        selected.length > 0 && selected.length < optionsGroupData?.length
                      }
                      checked={
                        optionsGroupData?.length > 0 && selected.length === optionsGroupData?.length
                      }
                      onChange={handleSelectAllClick}
                    />
                  </Stack>
                </TableCell>
                {map(optionsGroupTableColumns, (headCell) => {
                  return (
                    <TableCell
                      key={headCell.id}
                      align={headCell.alignRight ? 'right' : 'left'}
                      sx={{
                        ...headCell.style,
                        position: isMobile ? 'static' : headCell.style?.position,
                      }}
                    >
                      {headCell.label}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {optionsGroupData?.length > 0 ? (
                map(optionsGroupData, (_item, _index) => (
                  <OptionGroupTableBody
                    data={_item}
                    setOpen={setOpen}
                    selected={selected}
                    setSelected={setSelected}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={optionsGroupTableColumns.length + 1}
                    align="center"
                    sx={{
                      height: '50vh', // Adjust height to center vertically
                      textAlign: 'center',
                    }}
                  >
                    {!isLoading && isLoading !== null && (
                      <Stack flexDirection="column" alignItems="center" justifyContent="center">
                        <FolderOffIcon sx={{ fontSize: '50px' }} />
                        <Typography>No data found</Typography>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
          }}
          labelRowsPerPage=""
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalOptionsGroup}
          rowsPerPage={rowsPerPage}
          page={get(paginationData, 'page') - 1}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleOnRowsPerPageChange}
        />
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
              '& .MuiMenuItem-root': {
                px: 1,
                typography: 'body2',
                borderRadius: 0.75,
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleItem(get(open, 'data'));
            }}
          >
            <Iconify icon={'uil:edit'} sx={{ mr: 1, color: theme.palette.primary.main }} />
            Edit
          </MenuItem>
        </Popover>
      </Card>
      {isOpenAddOptionGroupModal && (
        <AddOptionGroups
          isOpenAddOptionGroupModal={isOpenAddOptionGroupModal}
          closeOptionGroupModal={closeOptionGroupModal}
          editOptionGroup={
            !isEmpty(editOptionGroup)
              ? {
                  items: map(get(editOptionGroup, 'association'), (_item) => ({
                    label: get(_item, 'name'),
                    id: get(_item, 'productId'),
                  })),
                  description: get(editOptionGroup, 'description'),
                  maxSelectable: get(editOptionGroup, 'attributes.max_selectable'),
                  minSelectable: get(editOptionGroup, 'attributes.min_selectable'),
                  sortOrder: String(get(editOptionGroup, 'attributes.sort_order')),
                  title: get(editOptionGroup, 'title'),
                  translations: get(editOptionGroup, 'attributes.translations'),
                }
              : null
          }
          groupId={get(editOptionGroup, 'groupId')}
          initialFetch={initialFetch}
          storeReference={storeReference}
          storeName={storeName}
        />
      )}
      {isTimingDialogOpen && (
        <TimingDialog
          isOpen={isTimingDialogOpen}
          onClose={handleCloseTimingDialog}
          currentCategoryData={find(optionsGroupData, (_item) => get(_item, 'id'))}
          timingOnSubmit={timingOnSubmit}
        />
      )}
      {isTourOpen && (
        <TakeATourWithJoy
          config={isEmpty(optionsGroupData) ? CustomerTourConfig : CustomerInfoTourConfig}
        />
      )}
    </>
  );
};

export default OptionsGroup;
