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
} from '@mui/material';
import Box from '@mui/material/Box';
import { get, isEmpty, map, remove } from 'lodash';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import CustomerView from 'src/components/CustomerView';
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
} from 'src/global/recoilState';
import AddCustomer from 'src/sections/Customer/AddCustomer';
import SettingServices from 'src/services/API/SettingServices';
import { SettingsSections } from 'src/constants/AppConstants';
import Label from 'src/components/label';
import { PATH_DASHBOARD } from 'src/routes/paths';
import VendorServices from 'src/services/API/VendorServices';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import VendorView from 'src/sections/Vendors/VendorView';

const ViewVendors = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  const [isLoading, setIsLoading] = useState(false);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const [allVendorsList, setAllVendorsList] = useState([]);
  const [totalVendors, setTotalVendors] = useState('');
  const [paginationData, setPaginationData] = useState({
    size: 10,
    page: 1,
  });

  console.log('allVendorsList', allVendorsList);

  function handlePageChange(event, newPage) {
    setPaginationData((prev) => ({ ...prev, page: newPage + 1 }));
  }

  function handleOnRowsPerPageChange(event, data) {
    setPaginationData({ page: 1, size: data.props.value });
  }

  const renderHeading = (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="h6">Vendors</Typography>
      <Label variant="soft" color="success">
        {totalVendors}
      </Label>
    </Stack>
  );

  const getAllVendors = async (newPaginationData) => {
    setIsLoading(true);
    try {
      const response = await VendorServices.allVendors({
        size: get(newPaginationData || paginationData, 'size'),
        page: get(newPaginationData || paginationData, 'page'),
      });
      setAllVendorsList(get(response, 'data.vendorData', []));
      setTotalVendors(get(response, 'data.totalItems'));
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal) {
      getAllVendors();
    }
  }, [currentStore, currentTerminal, paginationData]);

  const refetchData = () => {
    getAllVendors({ page: 10, size: 1 });
    setPaginationData({ size: 10, page: 1 });
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <Card sx={{ m: 2 }}>
      <CardHeader
        title={renderHeading}
        sx={{ mb: 3, px: !isMobile ? 2 : null, pl: isMobile ? 2 : null }}
        action={
          isMobile ? (
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 35,
                  height: 35,
                  borderRadius: '50%',
                  backgroundColor: 'lightgray',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onClick={() => {
                  navigate(PATH_DASHBOARD.purchases.createVendor);
                }}
              >
                <AddIcon color="primary" />
              </Box>
            </Stack>
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
              <Button
                size="large"
                startIcon={<AddIcon />}
                onClick={() => {
                  navigate(PATH_DASHBOARD.purchases.createVendor);
                }}
              >
                Create Vendor
              </Button>
            </Stack>
          )
        }
      />
      <TableContainer sx={{ height: isMobile ? 630 : 550 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="left">Vendor Name</TableCell>
              <TableCell align="left">Company Name</TableCell>
              <TableCell align="left">Contact Number</TableCell>
              <TableCell align="left">Email</TableCell>
              {/* <TableCell align="left">FSSAI Lic No</TableCell>
              <TableCell align="left">GST No</TableCell> */}
              <TableCell align="left">Total Orders</TableCell>
              <TableCell align="left">Total Amount(₹)</TableCell>
              <TableCell align="left" sx={{ position: 'sticky', right: 0 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {map(allVendorsList, (_vendor) => (
              <VendorView _item={_vendor} refetchData={refetchData} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        labelRowsPerPage=""
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalVendors}
        rowsPerPage={get(paginationData, 'size')}
        page={get(paginationData, 'page') - 1}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleOnRowsPerPageChange}
      />
    </Card>
  );
};

export default ViewVendors;
