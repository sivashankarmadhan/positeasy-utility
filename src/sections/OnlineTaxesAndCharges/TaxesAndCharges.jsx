import AddIcon from '@mui/icons-material/Add';

import {
  Card,
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
} from '@mui/material';
import { find, forEach, get, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  alertDialogInformationState,
  currentStoreId,
  currentTerminalId,
  storeReferenceState,
  stores,
} from 'src/global/recoilState';
import { onlineTaxTableColumns } from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import toast from 'react-hot-toast';
import Iconify from 'src/components/iconify';
import ONLINE_STORES from 'src/services/onlineStoresServices';
import useFDPublish from 'src/hooks/useFDPublish';
import OnlineTaxesAndChargesServices from 'src/services/API/OnlineTaxesAndChargesServices';
import AddOnlineTaxesAndCharges from './AddOnlineTaxesAndCharges';
import TaxesAndChargesTableBody from './TaxesAndChargesTableBody';
import PRODUCTS_API from 'src/services/products';
import FolderOffIcon from '@mui/icons-material/FolderOff';

const Taxes = ({ type }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [isOpenAddTaxModal, setIsOpenAddTaxModal] = useState(false);
  let [taxesAndChargesData, setTaxesAndChargesData] = useState([]);
  const [isLoading, setIsLoading] = useState(null);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [totalTax, setTotalTax] = useState('');
  const [editTax, setEditTax] = useState({});
  const [paginationData, setPaginationData] = useState({
    size: 10,
    page: 1,
  });

  const [productList, setProductList] = useState([]);

  const storeReference = useRecoilValue(storeReferenceState);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const [selected, setSelected] = useState([]);

  const { updatePublish } = useFDPublish();

  const defaultValue = { open: false, event: {}, data: {} };
  const [open, setOpen] = useState(defaultValue);

  const rowsPerPage = get(paginationData, 'size');

  const handleCloseMenu = () => {
    setOpen(defaultValue);
  };

  const closeTaxModal = () => {
    setEditTax(null);
    setIsOpenAddTaxModal(false);
  };

  async function fetchTaxList() {
    if (!storeReference) return;
    try {
      const responseTaxCodes = await OnlineTaxesAndChargesServices.getTaxesAndChargesList({
        size: rowsPerPage,
        page: get(paginationData, 'page'),
        storeReference: storeReference,
        type: type,
      });
      setTaxesAndChargesData(get(responseTaxCodes, 'data.groupData', []));
      setTotalTax(get(responseTaxCodes, 'data.totalItems'));
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  }

  const initialFetch = async () => {
    if (currentStore && currentTerminal) {
      try {
        setIsLoading(true);
        await fetchTaxList();
      } catch (err) {
        toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      } finally {
        setIsLoading(false);
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
      <Typography variant="h6">Tax</Typography>
    </Stack>
  );

  useEffect(() => {
    if (storeReference) {
      initialFetch();
    }
  }, [currentStore, currentTerminal]);

  const handleItem = (data) => {
    setEditTax(data);
    handleCloseMenu();
    setIsOpenAddTaxModal(true);
  };

  const handleToggleStatus = async (data, onClose, onLoading) => {
    const isActive = data?.isActive === 'true' || data?.isActive === true;

    try {
      onLoading(true);
      await OnlineTaxesAndChargesServices.toggleTax({
        action: !isActive,
        codeReference: data?.codeReference,
        storeReference: storeReference,
        type: type,
      });
      await updatePublish();
      initialFetch();
      handleCloseMenu();
      onLoading(false);
      onClose();
      toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
      onLoading(false);
      onClose();
    }
  };

  const handleToggleStatusWithAlert = (data) => {
    const isActive = data?.isActive === 'true' || data?.isActive === true;
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

  useEffect(() => {
    if (get(location, 'state.isOpenAddTaxDialog')) {
      setIsOpenAddTaxModal(true);
    }
  }, []);

  const selectedNameList = [];

  forEach(taxesAndChargesData, (_item) => {
    if (selected.includes(get(_item, 'id')) && get(_item, 'attributes.sessionInfo.title')) {
      selectedNameList.push(get(_item, 'attributes.sessionInfo.title'));
    }
  });

  const getProductList = async () => {
    try {
      const response = await PRODUCTS_API.getItemsProductList();
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
    if (currentStore && currentTerminal) {
      getProductList();
    }
  }, [currentStore, currentTerminal]);

  const isTax = type === 'TAX';

  let additionalColumns = [];

  if (!isTax) {
    additionalColumns = [
      {
        label: 'Fulfillment modes',
        id: 'fulfillment_modes',
        alignRight: false,
        style: { minWidth: 120 },
      },
      {
        label: 'Included platforms',
        id: 'included_platforms',
        alignRight: false,
        style: { minWidth: 120 },
      },
    ];
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Card sx={{ m: 2 }}>
        <Tooltip title="Add new online category">
          <Fab
            onClick={() => setIsOpenAddTaxModal(true)}
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: 12, right: 16 }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>

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
                {map([...onlineTaxTableColumns, ...additionalColumns], (headCell) => {
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
              {taxesAndChargesData?.length > 0 ? (
                map(taxesAndChargesData, (_item, _index) => (
                  <TaxesAndChargesTableBody
                    data={_item}
                    setOpen={setOpen}
                    selected={selected}
                    setSelected={setSelected}
                    productList={productList}
                    type={type}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={[...onlineTaxTableColumns, ...additionalColumns].length + 1}
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
          count={totalTax}
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
            {open?.data?.isActive === 'true' || open?.data?.isActive === true ? (
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

            {open?.data?.isActive === 'true' || open?.data?.isActive === true
              ? 'Disable'
              : 'Active'}
          </MenuItem>
        </Popover>
      </Card>
      {isOpenAddTaxModal && (
        <AddOnlineTaxesAndCharges
          isOpenAddTaxModal={isOpenAddTaxModal}
          closeTaxModal={closeTaxModal}
          editTax={
            !isEmpty(editTax)
              ? {
                  code: get(editTax, 'code'),
                  description: get(editTax, 'description'),
                  structure: {
                    ...get(editTax, 'structure'),
                    ...(type === 'TAX'
                      ? {}
                      : { applicable_on: get(editTax, 'structure.applicable_on') }),
                  },
                  ...(type === 'TAX' ? {} : { attributes: get(editTax, 'attributes') }),
                  associatedItems: map(get(editTax, 'associatedItems'), (_item) => {
                    const findData = find(productList, (_product) => {
                      return get(_product, 'productId') === _item;
                    });
                    return {
                      label: get(findData, 'name') || 'All',
                      id: get(findData, 'productId') || 'all',
                    };
                  }),
                }
              : null
          }
          codeReference={get(editTax, 'codeReference')}
          initialFetch={initialFetch}
          storeReference={storeReference}
          type={type}
          productList={productList}
        />
      )}
    </>
  );
};

export default Taxes;
