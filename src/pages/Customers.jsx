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
  ListItemText,
} from '@mui/material';
import Box from '@mui/material/Box';
import { get, isEmpty, map, remove } from 'lodash';
import { useEffect, useState } from 'react';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import CustomerView from 'src/components/CustomerView';
import STORES_API from 'src/services/stores';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import RouterConstants from 'src/constants/RouterConstants';
import { CustomerInfoTourConfig, CustomerTourConfig } from 'src/constants/TourConstants';
import { SelectedSection } from 'src/global/SettingsState';
import {
  allConfiguration,
  currentStoreId,
  currentTerminalId,
  isTourOpenState,
  accountDetailsState,
  customerList,
} from 'src/global/recoilState';
import AddCustomer from 'src/sections/Customer/AddCustomer';
import SettingServices from 'src/services/API/SettingServices';
import { SettingsSections } from '../constants/AppConstants';
import Label from '../components/label';
import { Icon } from '@iconify/react';
import AuthService from 'src/services/authService';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import toast from 'react-hot-toast';
import PRODUCTS_API from 'src/services/products';

const Customers = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const merchantDetails = AuthService._getMerchantDetails();
  const [isOpenAddCustomerModal, setIsOpenAddCustomerModal] = useState(false);
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  let [customerCodes, setCustomerCodes] = useState([]);
  const [currentContactNumber, setCurrentContactNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState({});
  const [customerCodeMode, setCustomerCodeMode] = useState(false);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const setSection = useSetRecoilState(SelectedSection);
  const [totalCustomers, setTotalCustomers] = useState('');
  const [editCustomer, setEditCustomer] = useState({});
  const [paginationData, setPaginationData] = useState({
    size: 10,
    page: 1,
  });
  const [numberChange, setNumberChange] = useState();
  const enabled = 'isEnabled';
  const [currentCustomerIdForContact, setCurrentCustomerIdForContact] = useState('');

  const [customerDetails, setCustomerDetails] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState();
  const [searchCustomer, setSearchCustomer] = useState([]);

  const customerAllList = useRecoilValue(customerList);

  const [currentCustomerId, setCurrentCustomerCode] = useState({ label: '', id: '' });
  const isTourOpen = useRecoilValue(isTourOpenState);
  const handleCustomerCodeMode = (event) => {
    handlePostCustomerCodeMode();
  };
  const handlePostCustomerCodeMode = async () => {
    try {
      const options = {
        customerManagement: !customerCodeMode,
      };
      await SettingServices.postConfiguration(options);
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch {
      toast.error(ErrorConstants.SOMETHING_WRONG);
    }
  };

  const closeCustomerModal = () => {
    setEditCustomer(null);
    setIsOpenAddCustomerModal(false);
    if (!customerCodes.length) {
      setCustomerCodeMode(false);
    }
  };

  const getAccountInfo = async () => {
    try {
      const response = await STORES_API.getAccountInfo({
        storeId: merchantDetails?.storeId,
        terminalId: merchantDetails?.terminalId,
      });
      if (response) {
        setAccountInfo(get(response, 'data'));
      }
    } catch (e) {
      toast.error(ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    getAccountInfo();
  }, []);

  async function fetchCustomersList() {
    const option = {
      size: get(paginationData, 'size'),
      page: get(paginationData, 'page'),
      ...(!isEmpty(numberChange) ? { contactNumber: numberChange } : {}),
    };
    try {
      const responseCustomerCodes = await SettingServices.fetchCustomerList(option);
      setCustomerCodes(get(responseCustomerCodes, 'data.customerData', []));
      setTotalCustomers(get(responseCustomerCodes, 'data.totalItems'));
    } catch (err) {
      toast.error(ErrorConstants.ERROR_CUSTOMER_LIST);
    }
  }

  const initialFetch = async (isEnableSwitchMode) => {
    if (currentStore && currentTerminal) {
      try {
        const resp = await SettingServices.getConfiguration();
        if (resp) {
          if (isEnableSwitchMode) {
            setCustomerCodeMode(true);
          } else {
            setConfiguration({
              ...(configuration || {}),
              ...(get(resp, 'data.0') || {}),
            });
            setCustomerCodeMode(get(resp, 'data.0.customerManagement', false));
          }
        }
        fetchCustomersList();
      } catch (err) {
        toast.error(ErrorConstants.ERROR_CUSTOMER_LIST);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNumberChange = (e, newValue) => {
    const numberFormat = 91 + get(newValue, 'label');
    setNumberChange(numberFormat);
  };

  async function fetchCustomersOrder() {
    try {
      const responseCustomerCodes = await SettingServices.fetchCustomersOrder({
        size: get(paginationData, 'size'),
        page: get(paginationData, 'page'),
      });
      responseCustomerCodes &&
        setCustomerCodes(get(responseCustomerCodes, 'data.customerData', []));
      setTotalCustomers(get(responseCustomerCodes, 'data.totalItems'));
    } catch (err) {
      toast.error(ErrorConstants.SOMETHING_WRONG);
    }
  }
  const handleCustomerId = (e) => {
    setCustomerId(get(e, 'id'));
    setCurrentCustomerCode(e);
  };

  const filterCustomer = customerCodes.filter(function (value) {
    if (isEmpty(customerId)) {
      return value;
    }
    if (value.customerId === customerId) {
      return value.customerId === customerId;
    }
  });

  function handlePageChange(event, newPage) {
    setPaginationData((prev) => ({ ...prev, page: newPage + 1 }));
  }

  function handleOnRowsPerPageChange(event, data) {
    setPaginationData({ page: 1, size: data.props.value });
  }

  const renderHeading = (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="h6">Customers</Typography>
        <Label variant="soft" color="success">
          {totalCustomers}
        </Label>
      </Stack>
      {isMobile && (
        <Autocomplete
          size="small"
          disablePortal
          options={map(customerCodes, (_item) => ({
            label:
              _item.contactNumber?.length > 10
                ? _item.contactNumber.substring(2)
                : _item.contactNumber,
            id: _item.customerId,
          }))}
          onChange={handleNumberChange}
          sx={{ width: 180 }}
          renderInput={(params) => (
            <TextField variant="filled" {...params} label="Contact Number" />
          )}
        />
      )}
    </Stack>
  );

  useEffect(() => {
    setIsLoading(true);
    initialFetch(location?.state?.isEnableSwitchMode);
  }, [currentStore, currentTerminal]);

  useEffect(() => {
    fetchCustomersList();
  }, [get(paginationData, 'size'), get(paginationData, 'page'), numberChange]);

  useEffect(() => {
    if (location?.state?.isEnableSwitchMode) {
      setIsOpenAddCustomerModal(true);
    }
  }, [location]);

  useEffect(() => {
    if (currentCustomerId) {
      setTotalCustomers(filterCustomer.length);
    } else {
      setTotalCustomers(customerCodes.length);
    }
  }, [customerId]);

  useEffect(() => {
    if (currentStore && currentTerminal) {
      setCurrentCustomerCode(null);
      setCustomerId(null);
      fetchCustomersList();
    }
  }, [currentStore, currentTerminal]);

  const csvDownload = async () => {
    try {
      await PRODUCTS_API.exportCustomersAsCsv();
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Card
        sx={{
          mb: 3,
          pl: 3,
          mx: 1,
          my: {
            xs: 2,
            md: 2,
          },
          pt: 1,
          xs: { width: 370 },
        }}
      >
        <Stack
          className="settingConfigStep2"
          mb={2}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h6">Customer</Typography>
            <Typography variant="body2">
              Add your regular customers to generate bill on them
            </Typography>
          </Box>
          <Switch
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: theme.palette.primary.light,
              },
              '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                backgroundColor: theme.palette.primary.light,
              },
              mx: 1.35,
            }}
            checked={customerCodeMode}
            onChange={handleCustomerCodeMode}
          />
        </Stack>
      </Card>
      {customerCodeMode && (
        <>
          <Card sx={{ m: 2 }}>
            <CardHeader
              className="customerStep1"
              title={renderHeading}
              sx={{ mb: 3, px: !isMobile ? 2 : null, pl: isMobile ? 2 : null }}
              action={
                isMobile ? (
                  <>
                    <Stack
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Tooltip title="Export csv">
                        <IconButton
                          onClick={() => {
                            csvDownload();
                          }}
                        >
                          <Icon
                            icon="grommet-icons:document-csv"
                            color={theme.palette.primary.main}
                            width="20"
                            height="20"
                          />
                        </IconButton>
                      </Tooltip>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          backgroundColor: 'lightgray',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onClick={() => setIsOpenAddCustomerModal(true)}
                      >
                        <AddIcon color="primary" />
                      </Box>
                    </Stack>
                  </>
                ) : (
                  <Stack
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Tooltip title="Export csv">
                      <IconButton
                        ml={1}
                        onClick={() => {
                          csvDownload();
                        }}
                      >
                        <Icon
                          icon="grommet-icons:document-csv"
                          color={theme.palette.primary.main}
                          width="20"
                          height="20"
                        />
                      </IconButton>
                    </Tooltip>

                    <Autocomplete
                      size="small"
                      disablePortal
                      options={map(customerAllList, (_item) => ({
                        label:
                          _item.contactNumber?.length > 10
                            ? _item.contactNumber.substring(2)
                            : _item.contactNumber,
                        id: _item.customerId,
                      }))}
                      onChange={handleNumberChange}
                      sx={{ minWidth: 180 }}
                      renderOption={(props, item) => (
                        <li {...props} key={item.id}>
                          <ListItemText>{item.label}</ListItemText>
                        </li>
                      )}
                      filterOptions={(options, { inputValue }) => {
                        const searchTerm = inputValue ? inputValue.toLowerCase() : '';
                        return options.filter(
                          (option) =>
                            option.label && option.label.toLowerCase().startsWith(searchTerm)
                        );
                      }}
                      renderInput={(params) => (
                        <TextField variant="filled" {...params} label="Contact Number" />
                      )}
                    />

                    <Button
                      size="large"
                      startIcon={<AddIcon />}
                      onClick={() => setIsOpenAddCustomerModal(true)}
                    >
                      Add Customer
                    </Button>
                  </Stack>
                )
              }
            />
            <TableContainer sx={{ height: isMobile ? 630 : 550 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="left">Contact Number</TableCell>
                    <TableCell align="left">Address</TableCell>
                    <TableCell align="left">GST No</TableCell>
                    <TableCell align="left">Total Orders</TableCell>
                    <TableCell align="left">Order Amount (₹)</TableCell>
                    <TableCell align="left">Payables (₹)</TableCell>
                    <TableCell align="left" sx={{ position: 'sticky', right: 0 }} />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {map(filterCustomer, (_customer, _index) => (
                    <CustomerView
                      _item={_customer}
                      _index={_index}
                      setIsOpenAddCustomerModal={setIsOpenAddCustomerModal}
                      setEditCustomer={setEditCustomer}
                      initialFetch={initialFetch}
                      fetchCustomersList={fetchCustomersList}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              labelRowsPerPage=""
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={totalCustomers}
              rowsPerPage={get(paginationData, 'size')}
              page={get(paginationData, 'page') - 1}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleOnRowsPerPageChange}
            />
          </Card>
        </>
      )}
      <AddCustomer
        isOpenAddCustomerModal={isOpenAddCustomerModal}
        closeCustomerModal={closeCustomerModal}
        editCustomer={editCustomer}
        customerCodes={customerCodes}
        initialFetch={initialFetch}
      />
      {isTourOpen && (
        <TakeATourWithJoy
          config={isEmpty(customerCodes) ? CustomerTourConfig : CustomerInfoTourConfig}
        />
      )}
    </>
  );
};

export default Customers;
