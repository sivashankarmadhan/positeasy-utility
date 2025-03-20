import AddIcon from '@mui/icons-material/Add';
import {
  Card,
  CardHeader,
  IconButton,
  Stack,
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
  Tooltip,
  MenuItem,
  Popover,
  Fab,
  Checkbox,
} from '@mui/material';
import Box from '@mui/material/Box';
import { every, filter, find, forEach, get, includes, isEmpty, map, some } from 'lodash';
import { useEffect, useState } from 'react';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { CustomerInfoTourConfig, CustomerTourConfig } from 'src/constants/TourConstants';
import { SelectedSection } from 'src/global/SettingsState';
import {
  alertDialogInformationState,
  allConfiguration,
  currentStoreId,
  currentTerminalId,
  isTourOpenState,
  storeNameState,
  storeReferenceState,
} from 'src/global/recoilState';
import { ONLINE, onlineCategoryTableColumns, SettingsSections } from '../constants/AppConstants';
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
import { StyledRoot } from 'src/layouts/login/styles';
import ONLINE_ITEMS from 'src/services/onlineItemsServices';
import useFDPublish from 'src/hooks/useFDPublish';
import FolderOffIcon from '@mui/icons-material/FolderOff';

const OnlineCategory = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [isOpenAddCategoryModal, setIsOpenAddCategoryModal] = useState(false);
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  let [CategoryData, setCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(null);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const setSection = useSetRecoilState(SelectedSection);
  const [totalCategory, setTotalCategory] = useState('');
  const [editCategory, setEditCategory] = useState({});
  const [paginationData, setPaginationData] = useState({
    size: 10,
    page: 1,
  });

  const isTourOpen = useRecoilValue(isTourOpenState);

  const [isTimingDialogOpen, setIsTimingDialogOpen] = useState(false);
  const [productList, setProductList] = useState([]);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [selected, setSelected] = useState([]);

  const { updatePublish } = useFDPublish();
  const storeReference = useRecoilValue(storeReferenceState);

  const defaultValue = { open: false, event: {}, data: {} };
  const [open, setOpen] = useState(defaultValue);

  const [openBulkAction, setOpenBulkAction] = useState(defaultValue);

  const [onlineParentCategoryList, setParentOnlineCategoryList] = useState([]);
  const [onlineCategoryList, setOnlineCategoryList] = useState([]);

  const rowsPerPage = get(paginationData, 'size');
  const storeName = useRecoilValue(storeNameState);

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
  };

  const closeCategoryModal = () => {
    setEditCategory(null);
    setIsOpenAddCategoryModal(false);
  };

  async function fetchCategoryList() {
    if (!storeReference) return;
    try {
      setIsLoading(true);
      const responseCategoryCodes = await OnlineCategoryServices.allCategories({
        size: rowsPerPage,
        page: get(paginationData, 'page'),
        storeReference: storeReference,
      });
      setCategoryData(get(responseCategoryCodes, 'data.categoryData', []));
      setTotalCategory(get(responseCategoryCodes, 'data.totalItems'));
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  }

  const initialFetch = async () => {
    if (currentStore && currentTerminal) {
      try {
        fetchCategoryList();
      } catch (err) {
        toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
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
      <Typography variant="h6">Category</Typography>
    </Stack>
  );

  useEffect(() => {
    if (storeReference) {
      setIsLoading(true);
      initialFetch();
    }
  }, [currentStore, currentTerminal]);

  const handleItem = (data) => {
    setEditCategory(data);
    handleCloseMenu();
    setIsOpenAddCategoryModal(true);
  };

  const handleToggleStatus = async (data, onClose, onLoading) => {
    const isActive = includes(data?.status?.activeIn, ONLINE);
    try {
      onLoading(true);
      await OnlineCategoryServices.toggleCategory({
        status: !isActive,
        categoryId: data?.id,
        storeReference: storeReference,
      });
      await updatePublish();
      initialFetch();
      handleCloseMenu();
      onLoading(false);
      onClose();
      toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
    } catch (e) {
      console.log('eeeee', e);
      toast.error(error?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
      onLoading(false);
    }
  };

  const handleToggleStatusWithAlert = (data) => {
    const isActive = includes(data?.status?.activeIn, ONLINE);
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure you want to change status to ${isActive ? 'disable' : 'active'}`,
      actions: {
        primary: {
          text: 'yes',
          onClick: (onClose, onLoading) => {
            handleToggleStatus(data, onClose, onLoading);
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

  const timingOnSubmit = async (data) => {
    const isAvailableTimingsData = some(data?.daySlots, (_item) => {
      return !isEmpty(get(_item, 'slots'));
    });

    if (!isAvailableTimingsData) {
      return toast.error(ErrorConstants.PLEASE_FILL_ATLEAST_ONE_DAY_SLOT);
    }

    const filterDataTimings = filter(data?.daySlots, (_item) => {
      return !isEmpty(get(_item, 'slots'));
    });

    const formatDataTimings = map(filterDataTimings, (_daySlot) => {
      return {
        ..._daySlot,
        slots: map(get(_daySlot, 'slots'), (_slot) => {
          return {
            start_time: `${formatTimeWithoutSec(get(_slot, 'start_time'))}`,
            end_time: `${formatTimeWithoutSec(get(_slot, 'end_time'))}`,
          };
        }),
      };
    });

    try {
      const response = await OnlineCategoryServices.categoryTiming({
        storeReference: storeReference,
        categoryId: selected,
        daySlots: formatDataTimings,
        title: data?.title,
        actionType: 'CATEGORY_TIMING',
        storeName,
      });
      await updatePublish();
      initialFetch();
      handleCloseTimingDialog();
      setSelected([]);
      if (response?.data?.recResponse?.message && response?.data?.recResponse?.status) {
        toast?.[response?.data?.recResponse?.status]?.(response?.data?.recResponse?.message);
      } else {
        toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      }
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
    }
  };

  useEffect(() => {
    if (get(location, 'state.isOpenAddCategoryDialog')) {
      setIsOpenAddCategoryModal(true);
    }
  }, []);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = CategoryData?.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    } else setSelected([]);
  };

  const selectedNameList = [];

  forEach(CategoryData, (_category) => {
    if (selected.includes(get(_category, 'id')) && get(_category, 'attributes.sessionInfo.title')) {
      selectedNameList.push(get(_category, 'attributes.sessionInfo.title'));
    }
  });

  const getAllParentOnlineCategoryList = async () => {
    try {
      const resp = await ONLINE_ITEMS.getAllParentOnlineCategoryList(storeReference);
      setParentOnlineCategoryList(get(resp, 'data'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const getAllOnlineCategoryList = async () => {
    try {
      const resp = await ONLINE_ITEMS.getAllOnlineCategoryList(storeReference);
      setOnlineCategoryList(get(resp, 'data'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (currentTerminal && currentStore && storeReference) {
      getAllParentOnlineCategoryList();
      getAllOnlineCategoryList();
    }
  }, [currentTerminal, currentStore, storeReference]);

  const getProductList = async () => {
    try {
      const response = await PRODUCTS_API.getItemsProductList(currentStore);
      if (response) {
        setProductList(response.data);
      } else {
        setProductList([]);
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      setProductList([]);
    }
  };

  useEffect(() => {
    if (currentTerminal && currentStore) {
      getProductList();
    }
  }, [currentTerminal, currentStore]);

  const selectedParentRef = find(onlineParentCategoryList, (_category) => {
    return get(editCategory, 'parent_ref_id') === get(_category, 'id');
  });

  console.log('asasa', get(editCategory, 'parent_ref_id'));

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Card sx={{ m: 2 }}>
        <Tooltip title="Add new online category">
          <Fab
            onClick={() => setIsOpenAddCategoryModal(true)}
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
                  onClick={() => {
                    setIsTimingDialogOpen(true);
                  }}
                  disabled={!every(selectedNameList, (str) => str === selectedNameList[0])}
                >
                  <Iconify
                    icon={'mingcute:time-line'}
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  Timing
                </MenuItem>
              </Popover>
            </Stack>
          </StyledRoot>
        )}

        <TableContainer sx={{ height: 'calc(100vh - 250px)' }}>
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
                      indeterminate={selected.length > 0 && selected.length < CategoryData?.length}
                      checked={CategoryData?.length > 0 && selected.length === CategoryData?.length}
                      onChange={handleSelectAllClick}
                    />
                  </Stack>
                </TableCell>

                {map(onlineCategoryTableColumns, (headCell) => {
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
              {CategoryData?.length > 0 ? (
                map(CategoryData, (_category, _index) => (
                  <CategoryTableBody
                    key={_index}
                    data={_category}
                    setOpen={setOpen}
                    selected={selected}
                    setSelected={setSelected}
                    productList={productList}
                    onlineCategoryList={onlineCategoryList}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={onlineCategoryTableColumns.length + 1}
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
          count={totalCategory}
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
          <MenuItem
            onClick={() => {
              handleToggleStatusWithAlert(get(open, 'data'));
            }}
          >
            {includes(open?.data?.status?.activeIn, ONLINE) ? (
              <Iconify
                icon={'lsicon:disable-outline'}
                sx={{ mr: 1, color: theme.palette.primary.main }}
              />
            ) : (
              <Iconify
                icon={'fontisto:radio-btn-active'}
                sx={{ mr: 1, color: theme.palette.primary.main }}
              />
            )}

            {includes(open?.data?.status?.activeIn, ONLINE) ? 'Disable' : 'Active'}
          </MenuItem>
        </Popover>
      </Card>
      {isOpenAddCategoryModal && (
        <AddOnlineCategory
          isOpenAddCategoryModal={isOpenAddCategoryModal}
          closeCategoryModal={closeCategoryModal}
          editCategory={
            !isEmpty(editCategory)
              ? {
                  name: get(editCategory, 'name'),
                  description: get(editCategory, 'description'),
                  attributes: {
                    sortOrder: get(editCategory, 'attributes.sortOrder'),
                    translations: get(editCategory, 'attributes.translations'),
                  },
                  image: get(editCategory, 'image'),
                  parent_ref_id: {
                    label: get(selectedParentRef, 'name') || '',
                    id: get(selectedParentRef, 'id') || '',
                  },
                }
              : null
          }
          categoryId={get(editCategory, 'id')}
          initialFetch={initialFetch}
          storeReference={storeReference}
          storeName={storeName}
          onlineParentCategoryList={onlineParentCategoryList}
          onlineCategoryList={onlineCategoryList}
        />
      )}
      {isTimingDialogOpen && (
        <TimingDialog
          isOpen={isTimingDialogOpen}
          onClose={handleCloseTimingDialog}
          currentCategoryData={find(CategoryData, (_item) => get(_item, 'id'))}
          timingOnSubmit={timingOnSubmit}
        />
      )}
      {isTourOpen && (
        <TakeATourWithJoy
          config={isEmpty(CategoryData) ? CustomerTourConfig : CustomerInfoTourConfig}
        />
      )}
    </>
  );
};

export default OnlineCategory;
