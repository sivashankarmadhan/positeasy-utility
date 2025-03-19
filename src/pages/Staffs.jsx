import AddIcon from '@mui/icons-material/Add';
import AddLinkIcon from '@mui/icons-material/AddLink';
import AdjustIcon from '@mui/icons-material/Adjust';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import find from 'lodash/find';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecoilValue } from 'recoil';
import {
  BookingIllustration,
  ComingSoonIllustration,
  MotivationIllustration,
  SeoIllustration,
} from 'src/assets/illustrations';
import BackgroundIllustration from 'src/assets/illustrations/BackgroundIllustration';
import CreateStaffAccessDialog from 'src/components/CreateStaffAccessDialog';
import CreateStoreAccessDialog from 'src/components/CreateStoreAccessDialog';
import RemoveAccessStaff from 'src/components/RemoveAccessStaff';
import RemoveStaff from 'src/components/RemoveStaff';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { useSettingsContext } from 'src/components/settings';
import { ROLES_DATA, ROLES_DATA_ID, hideScrollbar } from 'src/constants/AppConstants';
import { StaffTourConfig } from 'src/constants/TourConstants';
import { currentStoreId } from 'src/global/recoilState';
import FilterPopOver from 'src/layouts/dashboard/header/FilterPopOver';
import STORES_API from 'src/services/stores';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarIcon from 'src/components/CalendarIcon';
import MasterAttendance from './MasterAttendance/MasterAttendance';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DateTimeDialog from 'src/components/MarkOverTimeHoursDialog';
import Avatar from '@mui/material/Avatar';
import AddEditStaffDialog from 'src/components/AddEditStaffDialog';


export default function Staffs() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const currentStore = useRecoilValue(currentStoreId);
  const [storesData, setStoresData] = useState();
  const groupedStoresData = groupBy(storesData, 'storeId');
  const storeLabelList = map(groupedStoresData, (terminal, store) => store);
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState({});
  const [openNewStaffDialog, setOpenNewStaffDialog] = useState(false);
  const [openLinkTerminalDialog, setOpenLinkTerminalDialog] = useState(false);
  const [openLinkStoreDialog, setOpenLinkStoreDialog] = useState(false);
  const [openRemoveStaffAccessDialog, setOpenRemoveStaffAccessDialog] = useState(false);
  const [openRemoveStaffDialog, setOpenRemoveStaffDialog] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [paidStores, setPaidStores] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceMasterView, setAttendanceMasterView] = useState(false);
  const [accessId, setAccessId] = useState('');
  const [otHoursView, setOtHoursView] = useState(false);
  const [otUpdate, setOtUpdate] = useState(false);
  const [datesArray, setDatesArray] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [presentDays, setPresentDays] = useState('');
  const [absentDays, setAbsentDays] = useState('');

  const isMobile = useMediaQuery('(max-width:800px)');

  const handleOpenAddNewStaff = () => {
    setOpenNewStaffDialog(true);
  };
  const handleCloseAddNewStaff = () => {
    setOpenNewStaffDialog(false);
  };
  const handleOpenRemoveStaff = () => {
    setOpenRemoveStaffDialog(true);
  };
  const handleCloseRemoveStaff = () => {
    setOpenRemoveStaffDialog(false);
    setSelectedStaff({});
  };
  const handleCloseOtDialog = () => {
    setOtHoursView(false);
  };
  const handleOpenRemoveStaffAccess = () => {
    setOpenRemoveStaffAccessDialog(true);
  };
  const handleCloseRemoveStaffAccess = () => {
    setOpenRemoveStaffAccessDialog(false);
    setSelectedTerminal({});
  };
  const handleOpenLinkStore = () => {
    setOpenLinkStoreDialog(true);
  };
  const handleCloseLinkStore = () => {
    setOpenLinkStoreDialog(false);
  };
  const handleOpenLinkTerminal = () => {
    setOpenLinkTerminalDialog(true);
  };
  const handleCloseLinkTerminals = () => {
    setOpenLinkTerminalDialog(false);
  };

  const handleEditClick = (staff) => {
    setSelectedStaff(staff);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedStaff(null);
  };

  const getStaffByStaffId = (staffId) => {
    const staff = find(staffData, (e) => e?.staffId === staffId);
    return staff;
  };
  const getStaffs = async () => {
    try {
      setIsLoading(true);
      const response = await STORES_API.getStaffs();
      if (response) {
        setStaffData(get(response, 'data'));
        setSelectedStaff(get(response, 'data[0]'));
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  const getPaidTerminals = async () => {
    try {
      const response = await STORES_API.getPaidTerminals();
      if (response) setPaidStores(get(response, 'data'));
    } catch (error) {
      console.log(error);
    }
  };
  const getTerminalsByStaffId = async () => {
    try {
      const response = await STORES_API.getTerminalsByStaffId(selectedStaff.staffId);
      if (response) setStoresData(get(response, 'data'));
    } catch (error) {
      console.log(error);
    }
  };
  const getStoreName = (storeId) => {
    const terminals = find(storesData, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  useEffect(() => {
    if (!isEmpty(selectedStaff)) {
      {
        getTerminalsByStaffId();
        getPaidTerminals();
        setSelectedStore('');
        setAttendanceMasterView(false);
      }
    }
  }, [selectedStaff]);

  useEffect(() => {}, [storeLabelList]);

  useEffect(() => {
    if (currentStore) {
      getStaffs();
    }
  }, [currentStore]);

  useEffect(() => {
    if (!isEmpty(selectedStaff)) {
      if (isMobile) {
        setSelectedStaff(null);
      }
    }
  }, [staffData, isMobile]);
  if (isLoading) return <LoadingScreen />;

  const addAndSearchStaffContent = () => {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          my: 1,
        }}
      >
        <Autocomplete
          className="staffStep2"
          fullWidth
          size="small"
          disableClearable
          options={map(staffData, (e) => e)}
          onChange={(e, val) => setSelectedStaff(val)}
          getOptionLabel={(option) => get(option, 'name')?.toUpperCase()}
          renderOption={(props, option, { selected }) => (
            <li {...props}>{get(option, 'name')?.toUpperCase()}</li>
          )}
          renderInput={(params) => (
            <TextField
              fullWidth
              {...params}
              label="Search Staffs"
              InputProps={{
                ...params.InputProps,
                type: 'search',
              }}
            />
          )}
        />
        <Tooltip title={'Click to add new staff'}>
          <IconButton
            className="staffStep1"
            sx={{
              color: theme.palette.primary.main,
              '&:disabled': { color: theme.palette.grey[400], pointerEvents: 'auto' },
            }}
            onClick={() => handleOpenAddNewStaff()}
          >
            <AddIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  const staffDetails = () => {
    return (
      <Stack
        gap={2}
        p={2}
        pt={4}
        borderRadius={'20px'}
        sx={{
          border: 0.2,
          borderColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
          width: { xs: '100%', sm: '100%', md: '32%', lg: '32%' },
          height: 'calc(100vh - 8rem)',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <Grid container sx={{ pt: 1, gap: 1, overflow: 'auto', ...hideScrollbar, width: '100%' }}>
          <Grid item md={12} xs={12} sm={12} lg={12} xl={12}>
            {addAndSearchStaffContent()}
          </Grid>
          {map(staffData, (e) => (
            <Grid
              md={12}
              xs={12}
              sm={12}
              lg={12}
              xl={12}
              item
              onClick={() => {
                setSelectedStaff(e);
                console.log(selectedStaff, 'staff');
                console.log(e, 'eee');
                // if (e !== selectedStaff) {
                //   setSelectedStaff(e);
                //   setAccessId(get(e, 'accessId'));
                if (attendanceMasterView) {
                  setDatesArray([]);
                  setAttendanceMasterView(false);
                  // }
                }
              }}
              key={e}
              sx={{ p: 0.2 }}
            >
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '2',
                  p: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover':
                    selectedStaff?.staffId === e?.staffId
                      ? {}
                      : {
                          backgroundColor: '#E9E9EB',
                          color: '#000',
                        },
                  ...(selectedStaff?.staffId === e?.staffId
                    ? {
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.common.white,
                      }
                    : {}),
                }}
              >
                <Stack
                  flexDirection={'column'}
                  spacing={0.5}
                  sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    sx={{ width: '100%', position: 'relative', mt: 0 }}
                  >
                    {get(e, 'staffImage') ? (
                      <img
                        src={get(e, 'staffImage')}
                        alt={`${get(e, 'name', 'Staff')}'s image`}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: '30px',
                          height: '30px',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: '#f0f0f0',
                          color: '#9e9e9e',
                          fontSize: '12px',
                        }}
                      ></Avatar>
                    )}
                    <Stack
                      direction="column"
                      spacing={0.5}
                      sx={{ flex: 1, padding: '8px 0', justifyContent: 'flex-start' }}
                    >
                      <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {get(e, 'name')?.toUpperCase()}
                      </Typography>

                      <Typography sx={{ fontSize: '12px' }}>
                        {get(e, 'contactNumber', 'N/A')}
                      </Typography>
                    </Stack>

                    <Stack sx={{ position: 'absolute', bottom: -5, right: -5 }}>
                      <FilterPopOver
                        IconChildren={
                          <MoreVertIcon
                            sx={{
                              color: selectedStaff?.staffId === e?.staffId ? 'white' : '',
                              borderRadius: '50%',
                            }}
                          />
                        }
                      >
                        <MenuItem onClick={() => handleOpenLinkStore()}>
                          <Stack
                            direction={'row'}
                            sx={{ display: 'flex', alignItems: 'center', pt: 1 }}
                          >
                            <AddLinkIcon fontSize="small" />
                            <Typography variant="caption" sx={{ ml: -1.5 }}>
                              Link new store
                            </Typography>
                          </Stack>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => handleEditClick(staffData[0])}>
                          {' '}
                          <Stack
                            direction="row"
                            sx={{ display: 'flex', alignItems: 'center', pt: 1 }}
                          >
                            <EditIcon fontSize="small" sx={{ color: '#5A045b' }} />
                            <Typography variant="caption" sx={{ ml: -1.5 }}>
                              Edit staff
                            </Typography>
                          </Stack>
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          onClick={(e) => {
                            handleOpenRemoveStaff();
                          }}
                        >
                          <Stack
                            direction={'row'}
                            sx={{ display: 'flex', alignItems: 'center', pb: 1 }}
                          >
                            <DeleteForeverIcon fontSize="small" color="error" />
                            <Typography variant="caption" sx={{ ml: -1.5 }}>
                              Remove staff
                            </Typography>
                          </Stack>
                        </MenuItem>
                      </FilterPopOver>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  };

  const attendanceAndStoreList = () => {
    return (
      <Stack flexDirection={'column'} gap={2} sx={{ width: '100%' }}>
        {attendanceMasterView && (
          <MasterAttendance
            accessId={accessId}
            otUpdate={otUpdate}
            setOtUpdate={setOtUpdate}
            datesArray={datesArray}
            setDatesArray={setDatesArray}
            setPresentDays={setPresentDays}
            presentDays={presentDays}
            absentDays={absentDays}
            setAbsentDays={setAbsentDays}
            setAttendanceMasterView={setAttendanceMasterView}
          />
        )}
        {!attendanceMasterView && (
          <>
            <Stack
              gap={2}
              p={2}
              borderRadius={'20px'}
              sx={{
                border: 0.1,
                borderColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity
                ),
                width: '100%',
                // height: { xs: '20%', md: '20%', sm: '22%', lg: '25%' },
                position: 'relative',
              }}
            >
              {isMobile && (
                <Stack onClick={() => setSelectedStaff(null)} flexDirection={'row'} sx={{ mb: 1 }}>
                  <ArrowBackIcon fontSize="small" />
                  Back
                </Stack>
              )}
              {isEmpty(staffData) && (
                <Typography
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontWeight: 'bold',
                    color: alpha(theme.palette.primary.main, 0.5),
                  }}
                >
                  Stores Not found
                </Typography>
              )}
              <Grid
                container
                spacing={2}
                sx={{
                  overflowX: 'auto',
                  ...hideScrollbar,
                }}
              >
                {isMobile && (
                  <Card
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      p: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      marginLeft: 2,
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.common.white,
                    }}
                  >
                    <Stack
                      flexDirection={'column'}
                      spacing={0.5}
                      sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                        sx={{ width: '100%', position: 'relative', mt: 0 }}
                      >
                        {get(selectedStaff, 'staffImage') ? (
                          <img
                            src={get(selectedStaff, 'staffImage')}
                            alt={`${get(selectedStaff, 'name', 'Staff')}'s image`}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              position: 'absolute',
                              top: 0,
                              right: 0,
                            }}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              width: '30px',
                              height: '30px',
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              bgcolor: '#f0f0f0',
                              color: '#9e9e9e',
                              fontSize: '12px',
                            }}
                          />
                        )}

                        <Stack
                          direction="column"
                          spacing={0.5}
                          sx={{ flex: 1, padding: '8px 0', justifyContent: 'flex-start' }}
                        >
                          <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                            {get(selectedStaff, 'name')?.toUpperCase()}
                          </Typography>
                          <Typography sx={{ fontSize: '12px' }}>
                            {get(selectedStaff, 'contactNumber', 'N/A')}
                          </Typography>
                          {/* <Typography sx={{ fontSize: '12px' }}>
                            {get(selectedStaff, 'email')}
                          </Typography> */}
                        </Stack>

                        <FilterPopOver
                          IconChildren={
                            <MoreVertIcon
                              sx={{
                                position: 'absolute',
                                bottom: -64,
                                right: -5,
                                color: selectedStaff?.staffId ? 'white' : '',
                                borderRadius: '50%',
                              }}
                            />
                          }
                        >
                          <MenuItem onClick={() => handleOpenLinkStore()}>
                            <Stack
                              direction={'row'}
                              sx={{ display: 'flex', alignItems: 'center', pt: 1 }}
                            >
                              <AddLinkIcon fontSize="small" />
                              <Typography variant="caption" sx={{ ml: -1.5 }}>
                                Link new store
                              </Typography>
                            </Stack>
                          </MenuItem>
                          <Divider />
                          <MenuItem onClick={() => handleEditClick(staffData[0])}>
                            {' '}
                            <Stack
                              direction="row"
                              sx={{ display: 'flex', alignItems: 'center', pt: 1 }}
                            >
                              <EditIcon fontSize="small" sx={{ color: '#5A045b' }} />
                              <Typography variant="caption" sx={{ ml: -1.5 }}>
                                Edit staff
                              </Typography>
                            </Stack>
                          </MenuItem>
                          <Divider />
                          <MenuItem
                            onClick={(e) => {
                              handleOpenRemoveStaff();
                            }}
                          >
                            <Stack
                              direction={'row'}
                              sx={{ display: 'flex', alignItems: 'center', pb: 1 }}
                            >
                              <DeleteForeverIcon fontSize="small" color="error" />
                              <Typography variant="caption" sx={{ ml: -1.5 }}>
                                Remove staff
                              </Typography>
                            </Stack>
                          </MenuItem>
                        </FilterPopOver>
                      </Stack>
                    </Stack>
                  </Card>
                )}
                {!isEmpty(staffData) && (
                  <Grid item xs={12} md={4} lg={4}>
                    <Box
                      sx={{
                        border: `1px dashed ${theme.palette.primary.main}`,
                        borderRadius: 2,
                        display: isEmpty(staffData) ? 'none' : 'flex',
                        p: 3.4,
                        cursor: 'pointer',
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.common.white, 0.4),
                        },
                      }}
                      onClick={() => {
                        setAccessId(get(selectedStaff, 'accessId'));
                        setDatesArray([]);
                        setAttendanceMasterView(true);
                      }}
                    >
                      <Stack
                        flexDirection={'column'}
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <CalendarIcon sx={{ marginLeft: '10px' }} fontSize="large" />
                        <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>
                          Attendance
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                )}

                {map(storeLabelList, (e) => (
                  <Grid item xs={12} md={4} lg={4}>
                    <Card
                      onClick={() => setSelectedStore(e)}
                      sx={{
                        p: 3,
                        my: 0.2,
                        // minWidth: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        height: '95%',
                        cursor: 'pointer',
                        ...(selectedStore === e
                          ? {
                              backgroundColor: theme.palette.primary.light,
                              color: theme.palette.common.white,
                            }
                          : {}),
                      }}
                    >
                      <Stack
                        flexDirection={'column'}
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <Typography variant="subtitle1">{getStoreName(e) || '-'}</Typography>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
                <Grid item xs={12} md={4} lg={4}>
                  <Box
                    sx={{
                      border: `1px dashed ${theme.palette.primary.main}`,
                      borderRadius: 2,
                      display: isEmpty(staffData) ? 'none' : 'flex',
                      p: 3.4,
                      cursor: 'pointer',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.common.white, 0.4),
                      },
                    }}
                    onClick={() => handleOpenLinkStore()}
                  >
                    <Stack
                      className="staffStep4"
                      flexDirection={'column'}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <AddLinkIcon fontSize="large" />
                      <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>
                        Link New Store Access
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Stack>
            <Stack
              gap={2}
              p={2}
              pt={4}
              borderRadius={'20px'}
              sx={{
                border: 0.1,
                borderColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity
                ),
                width: '100%',
                minHeight: '28rem',
                height: '80%',
                overflowY: 'auto',
                position: 'relative',
                ...hideScrollbar,
              }}
            >
              {!selectedStore && (
                <Typography
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontWeight: 'bold',
                    color: alpha(theme.palette.primary.main, 0.5),
                    textAlign: 'center',
                  }}
                >
                  {isEmpty(storeLabelList) ? 'Add Stores to View Terminals' : 'Store Not Selected'}
                </Typography>
              )}

              <Grid container direction={'row'} sx={{ gap: 1 }}>
                {map(selectedStore ? groupedStoresData[selectedStore] : [], (e) => (
                  <Grid item xs={12} sm={12} md={5.9} lg={5.9} xl={3.9}>
                    <Card sx={{ p: 2, minWidth: 120, minHeight: 120 }}>
                      <Stack flexDirection={'column'} gap={1}>
                        <Stack
                          flexDirection={'row'}
                          sx={{ display: 'flex', justifyContent: 'space-between' }}
                        >
                          <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>
                            {get(e, 'terminalName') ? get(e, 'terminalName') : get(e, 'terminalId')}
                          </Typography>
                          <Stack
                            flexDirection={'row'}
                            sx={{ gap: 1, display: 'flex', alignItems: 'center' }}
                          >
                            <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>
                              {ROLES_DATA_ID[e.roleId].label}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Stack
                          flexDirection={'row'}
                          sx={{ display: 'flex', justifyContent: 'space-between' }}
                        >
                          <Typography variant="caption">Terminal Number</Typography>

                          <Typography variant="caption">{get(e, 'terminalNumber')}</Typography>
                        </Stack>
                        <Stack
                          flexDirection={'row'}
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 3,
                            alignItems: 'center',
                          }}
                        >
                          {/* <Tooltip title="Click to Upgrade the Role to Manager">
                            <Typography
                              sx={{
                                display:
                                  Number(get(e, 'roleId')) === ROLES_DATA.store_staff.id
                                    ? ''
                                    : 'none',
                                fontWeight: 'bold',
                                fontSize: '12px',
                                color: theme.palette.info.main,
                                cursor: 'pointer',
                                '&:hover': { textDecorationLine: 'underline' },
                              }}
                              onClick={() => {
                                setSelectedTerminal(e);
                                handleOpenConfirmUpgrade();
                              }}
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                // sx={{ border: 1, borderColor: theme.palette.primary.main }}
                                startIcon={<UpgradeIcon fontSize="small" color="success" />}
                              >
                                {' '}
                                Upgrade
                              </Button>
                            </Typography>
                          </Tooltip> */}
                          <Tooltip title="Click to remove the Access">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedTerminal(e);
                                handleOpenRemoveStaffAccess();
                              }}
                              // sx={{ border: 1, borderColor: theme.palette.primary.main }}
                              startIcon={<CancelPresentationIcon color="error" fontSize="small" />}
                            >
                              Remove {!isMobile ? 'Access' : ''}
                            </Button>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
                <Grid
                  onClick={() => handleOpenLinkTerminal()}
                  xs={12}
                  sm={12}
                  md={5.9}
                  lg={5.9}
                  xl={3.9}
                  sx={{
                    border: `1px dashed ${theme.palette.primary.main}`,
                    borderRadius: 2,
                    display: selectedStore ? 'flex' : 'none',
                    alignItems: 'center',
                    cursor: 'pointer',
                    minHeight: 120,
                    '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.4) },
                  }}
                >
                  <Stack
                    flexDirection={'column'}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      color: theme.palette.primary.main,
                    }}
                  >
                    <AddLinkIcon fontSize="large" />
                    <Typography sx={{ fontWeight: 'bold' }}>Link New Terminal Access </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </>
        )}
      </Stack>
    );
  };

  return (
    <>
      <Helmet>
        <title> Staffs | POSITEASY</title>
      </Helmet>
      <Container
        maxWidth={themeStretch ? false : 'xxl'}
        sx={{
          mt: 2,
          '&.MuiContainer-root': {
            p: 1.5,
          },
        }}
      >
        {isEmpty(staffData) && (
          <Tooltip title="Click to add new staff">
            <Stack
              className="staffStep1"
              onClick={() => handleOpenAddNewStaff()}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                cursor: 'pointer',
                alignItems: 'center',
                border: `1.5px dotted ${theme.palette.primary.main}`,
                padding: 2,
                borderRadius: 2,
                '&:hover': { backgroundColor: alpha(theme.palette.primary.lighter, 0.4) },
              }}
            >
              <PersonAddAlt1Icon fontSize="large" />
              <Typography noWrap>Create new staff</Typography>
            </Stack>
          </Tooltip>
        )}
        {!isEmpty(staffData) && (
          <Stack flexDirection={'row'} gap={2}>
            {!isMobile && staffDetails()}
            {isMobile && isEmpty(selectedStaff) && staffDetails()}
            {selectedStaff && attendanceAndStoreList()}
          </Stack>
        )}
        <CreateStaffAccessDialog
          paidStores={paidStores}
          selectedStore={selectedStore}
          open={openLinkTerminalDialog}
          handleClose={handleCloseLinkTerminals}
          staffId={get(selectedStaff, 'staffId')}
          getTerminalsByStaffId={getTerminalsByStaffId}
          staffData={staffData}
        />
        <CreateStoreAccessDialog
          paidStores={paidStores}
          open={openLinkStoreDialog}
          handleClose={handleCloseLinkStore}
          staffId={get(selectedStaff, 'staffId')}
          getTerminalsByStaffId={getTerminalsByStaffId}
          staffData={staffData}
          getStoreName={getStoreName}
        />
        <RemoveAccessStaff
          open={openRemoveStaffAccessDialog}
          handleClose={handleCloseRemoveStaffAccess}
          storeId={selectedStore}
          terminalName={get(selectedTerminal, 'terminalName')}
          terminalNumber={get(selectedTerminal, 'terminalNumber')}
          staffName={get(selectedStaff, 'name')}
          getStaffs={getStaffs}
        />
        <RemoveStaff
          open={openRemoveStaffDialog}
          handleClose={handleCloseRemoveStaff}
          staff={selectedStaff}
          getStaffs={getStaffs}
        />
        <AddEditStaffDialog
          open={openNewStaffDialog}
          handleClose={handleCloseAddNewStaff}
          getStaffs={getStaffs}
        />
        <AddEditStaffDialog
          open={openEditDialog}
          handleClose={handleCloseEditDialog}
          getStaffs={getStaffs}
          staffData={selectedStaff}
        />
        {/* <DateTimeDialog
          open={otHoursView}
          handleClose={handleCloseOtDialog}
          accessId={get(selectedStaff, 'accessId')}
          setOtUpdate={setOtUpdate}
          otUpdate={otUpdate}
          datesArray={datesArray}
        /> */}
      </Container>
      <TakeATourWithJoy config={StaffTourConfig} />
    </>
  );
}
