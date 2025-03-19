import { Icon } from '@iconify/react';
import {
  Autocomplete,
  Box,
  Divider,
  FormControl,
  IconButton,
  OutlinedInput,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { alpha, styled } from '@mui/material/styles';
import { get, isEmpty, map, some } from 'lodash';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import PdfDownload from 'src/PrintPdf/PdfDownload';
import DatePicker from 'src/components/DatePicker';
import StartAndEndDatePicker from 'src/components/DateRangePickerRsuite';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DropDown from 'src/components/cart/DropDown';
import { hideScrollbar, MembershipStatus, StatusLabel } from 'src/constants/AppConstants';
import {
  allConfiguration,
  customCodeList,
  customerList,
  currentStartDate,
  currentEndDate,
} from 'src/global/recoilState';
import { PaymentModeTypeConstantsCart } from 'src/constants/AppConstants';
import { CSV, EXCEL, USER_AGENTS } from 'src/constants/AppConstants';
import CsvOrExcelOptionsDialog from './CsvOrExcelOptionsDialog';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { FormLabel } from '@mui/material';
import { ListItemText } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import isUnderWeekDates from 'src/utils/isUnderWeekDates';

export default function FilterComponent(props) {
  const [isAscending, setIsAscending] = useState(true);
  const [selectAllStatus, setSelectAllStatus] = useState(false);
  const {
    handleCustomCode,
    handleCustomerId,
    currentCustomCode,
    currentCustomerId,
    isOrderDetails,
    filterTable,
    handleCategorizeCode,
    isOrderSummaryDetails,
    currentCategorizeCode,
    printPdf,
    categoriesList,
    categoryList,
    isDisabledCustomCodeAndCustomer,
    isEnabledCustomCode,
    csvDownload,
    excelDownload,
    isConfigCsvOrExcelColumns,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleChangeCounter,
    handleChangeOrder,
    counter,
    counterList,
    isDesc,
    setIsDesc,
    customer = true,
    multiCounters,
    categorySort,
    setCategorySort,
    vendor,
    handleChangeVendor,
    vendorList,
    onFilterStatus,
    date,
    productWiseSort,
    setProductWiseSort,
    purchaseOrderStatus,
    handleChangeStatus,
    purchaseOrderStatusList,
    productName,
    setProductName,
    status,
    productList,
    isHideCategory,
    isHideCounter,
    paymentMode = [],
    setPaymentMode,
    DayStock,
    isHideProductName,
    isHideFilter,
    orderId,
    setOrderId,
    isOrderId,
    memberStatus,
    setMemberStatus,
    setMemberConatactNo,
    memberConatactNo,
  } = props;

  console.log('productList', productList);
  const defaultValue = { open: false, event: {}, data: {} };
  const [openDialog, setOpenDialog] = useState({ status: false, name: '' });
  const handleCloseMenu = () => {
    setOpen(defaultValue);
  };
  const [open, setOpen] = useState(defaultValue);
  const configuration = useRecoilValue(allConfiguration);
  const isCustomCodeEnabled = get(configuration, 'customCode', false);
  const isCustomerIdEnabled = get(configuration, 'customerManagement', false);
  const customCodes = useRecoilValue(customCodeList);
  const customerCodes = useRecoilValue(customerList);
  const currentLocation = window.location.pathname;
  const topHeader = currentLocation.split('/');
  const topName = topHeader[currentLocation.split('/').length - 1];
  console.log('topName', topName);
  const counterSettings = get(configuration, 'counterSettings', {});
  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false) && !isHideCounter;
  const theme = useTheme();

  const handleOpenMenu = (event, product) => {
    setOpen({ open: true, eventData: event.currentTarget });
  };
  console.log('paymentModejjj', paymentMode);
  const checkCurrentCounterId = (counterId) => {
    const data = some(multiCounters, (e) => e.id === counterId);
    return data;
  };
  const handleChanges = (event) => {
    setProductWiseSort(event.target.value);
    handleCloseMenu();
  };
  const productChanges = (event) => {
    if (topName === 'product') {
      setProductName(event);
      handleCloseMenu();
    }
  };
  const handleChange = () => {
    setIsDesc((prev) => !prev);
  };

  const handlePaymentMode = (event, newValue) => {
    console.log('evevnn', event, get(event, 'label'));
    setPaymentMode(event, newValue);
  };
  const handleMemberStatus = (event, newValue) => {
    setMemberStatus(event, newValue);
  };

  const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
    width: 200,
    transition: theme.transitions.create(['box-shadow', 'width'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shorter,
    }),
    '& fieldset': {
      borderWidth: `1px !important`,
      borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
    },
  }));
  const isMobile = useMediaQuery('(max-width:600px)');

  const filterOptions = createFilterOptions({
    ignoreCase: true,
    matchFrom: 'start',
    limit: 6,
  });

  let isUnderWeekDatesBol = isUnderWeekDates(startDate, endDate);

  if (topName === 'order') {
    isUnderWeekDatesBol = isUnderWeekDates(startDate, endDate, false, true);
  }

  if (topName === 'payment') {
    isUnderWeekDatesBol = isUnderWeekDates(startDate, endDate, true, true);
  }

  return (
    <Stack
      sx={{
        display: 'flex',
        flexFlow: 'row wrap-reverse',
        alignItems: 'center',
      }}
      gap={2}
    >
      {isMobile ? (
        <>
          <>
            {(topName === 'order' || topName === 'payment' || topName === 'expense') &&
              !isOrderDetails &&
              !isEmpty(filterTable) && (
                <Tooltip title={isDesc ? 'Descending' : 'Ascending'}>
                  <IconButton onClick={handleChange}>
                    {isDesc ? (
                      <ArrowUpwardIcon sx={{ color: theme.palette.primary.main }} />
                    ) : (
                      <ArrowDownwardIcon sx={{ color: theme.palette.primary.main }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}

            {topName === 'product' && !isHideFilter && !DayStock && (
              <>
                <IconButton className="inventoryStep2" onClick={handleOpenMenu}>
                  <Icon
                    icon={get(open, 'open') ? 'bi:sort-down-alt' : 'bi:sort-up-alt'}
                    color="#5a0b45"
                    height={25}
                    width={30}
                  />
                </IconButton>

                <Popover
                  open={Boolean(get(open, 'open'))}
                  anchorEl={get(open, 'eventData')}
                  onClose={handleCloseMenu}
                  anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      p: 1,
                      width: 148,
                      maxHeight: 300,
                      ...hideScrollbar,
                    },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#000', fontSize: 16, mb: 1 }}>
                    Sort by
                  </Typography>
                  <FormGroup>
                    <FormControl>
                      <RadioGroup
                        style={{ fontSize: '10px' }}
                        aria-labeled
                        by="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={productWiseSort}
                        onChange={handleChanges}
                      >
                        <FormControlLabel
                          size="small"
                          value="category"
                          control={<Radio />}
                          label="Category"
                        />
                        <Divider />
                        <FormControlLabel
                          value="totalprice"
                          control={<Radio />}
                          label="Total price"
                        />
                        <Divider />
                        <FormControlLabel
                          value="soldquantity"
                          control={<Radio />}
                          label="Sold quantity"
                        />
                      </RadioGroup>
                    </FormControl>
                  </FormGroup>
                </Popover>
              </>
            )}

            {printPdf && !isEmpty(filterTable) && (
              <Tooltip title={'Export PDF'}>
                <Stack ml={1}>
                  <PdfDownload
                    printPdf={printPdf}
                    style={{ opacity: 0.5 }}
                    isUnderWeekDatesBol={isUnderWeekDatesBol}
                  />
                </Stack>
              </Tooltip>
            )}
            {csvDownload && !isEmpty(filterTable) && (
              <Tooltip
                title={
                  isUnderWeekDates(startDate, endDate, topName === 'order', topName === 'order')
                    ? 'Export CSV'
                    : 'COMING SOON'
                }
              >
                <IconButton
                  ml={1}
                  disabled={
                    !isUnderWeekDates(startDate, endDate, topName === 'order', topName === 'order')
                  }
                  onClick={() => {
                    if (isConfigCsvOrExcelColumns) {
                      setOpenDialog({ status: true, name: CSV });
                    } else {
                      csvDownload();
                    }
                  }}
                >
                  <Icon
                    icon="grommet-icons:document-csv"
                    style={
                      isUnderWeekDates(startDate, endDate, topName === 'order', topName === 'order')
                        ? { color: theme.palette.primary.main }
                        : { opacity: 0.5, color: 'gray' }
                    }
                    width="20"
                    height="20"
                  />
                </IconButton>
              </Tooltip>
            )}
            {excelDownload && !isEmpty(filterTable) && (
              <Tooltip title={isUnderWeekDatesBol ? 'Export EXCEL' : 'COMING SOON'}>
                <IconButton
                  ml={1}
                  disabled={!isUnderWeekDatesBol}
                  onClick={() => {
                    if (isConfigCsvOrExcelColumns) {
                      setOpenDialog({ status: true, name: EXCEL });
                    } else {
                      excelDownload();
                    }
                  }}
                >
                  <Icon
                    icon="uiw:file-excel"
                    style={
                      isUnderWeekDatesBol
                        ? { color: theme.palette.primary.main }
                        : { opacity: 0.5, color: 'gray' }
                    }
                    width="20"
                    height="20"
                  />
                </IconButton>
              </Tooltip>
            )}

            {isCustomCodeEnabled &&
              !isEmpty(customCodes) &&
              (!isDisabledCustomCodeAndCustomer || isEnabledCustomCode) && (
                <Autocomplete
                  size="small"
                  label="Custom Name"
                  disablePortal
                  options={map(customCodes, (_item) => ({
                    label: _item.codeName,
                    id: _item.customCode,
                  }))}
                  value={currentCustomCode}
                  onChange={(event, newValue) => {
                    handleCustomCode(newValue);
                  }}
                  sx={{ minWidth: '100%' }}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase();
                    return options.filter((option) =>
                      option.label.toLowerCase().startsWith(searchTerm)
                    );
                  }}
                  renderOption={(props, item) => (
                    <li {...props} key={item.id}>
                      <ListItemText>{item.label}</ListItemText>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label={'Custom Name'} />
                  )}
                />
              )}

            {isCustomerIdEnabled &&
              !isEmpty(customerCodes) &&
              customer &&
              !isDisabledCustomCodeAndCustomer && (
                <Autocomplete
                  label="Customer"
                  size="small"
                  disablePortal
                  options={map(customerCodes, (_item) => ({
                    label: _item.name,
                    id: _item.customerId,
                  }))}
                  value={currentCustomerId}
                  onChange={(event, newValue) => handleCustomerId(newValue)}
                  sx={{ minWidth: '100%' }}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase();
                    return options.filter((option) =>
                      option.label.toLowerCase().startsWith(searchTerm)
                    );
                  }}
                  renderOption={(props, item) => (
                    <li {...props} key={item.id}>
                      <ListItemText>{item.label}</ListItemText>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label={'Customer'} />
                  )}
                />
              )}
            {topName === 'purchaseOrders' && (
              <Autocomplete
                size="small"
                disablePortal
                options={map(vendorList, (_item) => ({
                  label: get(_item, 'name'),
                  id: get(_item, 'id'),
                }))}
                value={get(vendor, 'id')}
                onChange={(event, newValue) => handleChangeVendor(newValue)}
                sx={{ minWidth: 350 }}
                filterOptions={(options, { inputValue }) => {
                  const searchTerm = inputValue.toLowerCase();
                  return options.filter((option) =>
                    option.label.toLowerCase().startsWith(searchTerm)
                  );
                }}
                renderOption={(props, item) => (
                  <li {...props} key={item.id}>
                    <ListItemText>{item.label}</ListItemText>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField variant="filled" {...params} label={'Vendor'} />
                )}
              />
            )}

            {topName === 'purchase orders' && !isDisabledCustomCodeAndCustomer && (
              <Autocomplete
                label="Customer"
                size="small"
                disablePortal
                options={map(customerCodes, (_item) => ({
                  label: _item.name,
                  id: _item.customerId,
                }))}
                value={currentCustomerId}
                onChange={(event, newValue) => handleCustomerId(newValue)}
                sx={{ minWidth: '100%' }}
                filterOptions={(options, { inputValue }) => {
                  const searchTerm = inputValue.toLowerCase();
                  return options.filter((option) =>
                    option.label.toLowerCase().startsWith(searchTerm)
                  );
                }}
                renderInput={(params) => (
                  <TextField variant="filled" {...params} label={'Customer'} />
                )}
                renderOption={(props, item) => (
                  <li {...props} key={item.id}>
                    <ListItemText>{item.label}</ListItemText>
                  </li>
                )}
              />
            )}
          </>

          {isCountersEnabled && topName === 'terminals' && (
            <Autocomplete
              multiple
              size="small"
              filterSelectedOptions
              options={map(counterList, (_item) => ({
                label: get(_item, 'name'),
                id: get(_item, 'counterId'),
              }))}
              value={multiCounters}
              getOptionDisabled={(option) => checkCurrentCounterId(option.id)}
              onChange={(event, newValue) => handleChangeCounter(newValue)}
              sx={{ minWidth: '100%' }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderInput={(params) => <TextField variant="filled" {...params} label={'Counter'} />}
              renderOption={(props, item) => (
                <li {...props} key={item.id}>
                  <ListItemText>{item.label}</ListItemText>
                </li>
              )}
            />
          )}

          {(topName === 'product' || topName === 'category') &&
            isCountersEnabled &&
            !isHideFilter && (
              <Autocomplete
                size="small"
                disablePortal
                options={map(counterList, (_item) => ({
                  label: get(_item, 'name'),
                  id: get(_item, 'counterId'),
                }))}
                value={get(counter, 'label')}
                onChange={(event, newValue) => handleChangeCounter(newValue)}
                sx={{ minWidth: '100%' }}
                filterOptions={(options, { inputValue }) => {
                  const searchTerm = inputValue.toLowerCase();
                  return options.filter((option) =>
                    option.label.toLowerCase().startsWith(searchTerm)
                  );
                }}
                renderOption={(props, item) => (
                  <li {...props} key={item.id}>
                    <ListItemText>{item.label}</ListItemText>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField variant="filled" {...params} label={'Counter'} />
                )}
              />
            )}

          {isOrderId && (
            <TextField
              sx={{
                width: '100%',
                // minWidth: { xs: '40%', sm: 85 },
                // maxWidth: 100,

                '& .MuiInputBase-input': {
                  height: 17,
                },
                '& .css-qa422o-MuiFormLabel-root-MuiInputLabel-root': {
                  top: -1.5,
                },
              }}
              variant="outlined"
              size="medium"
              label="Order ID"
              value={orderId}
              // inputProps={{ style: { padding: '8px', paddingBottom: '20px' } }}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setOrderId('');
                } else if (Number(value)) {
                  setOrderId(Number(value));
                }
              }}
            />
          )}
           <Stack width={'100%'} gap={2}><Stack flexDirection={'row'} width={'100%'} gap={1} justifyContent={'space-between'}>{topName === 'membership' && (
            <Autocomplete
              multiple
              
              options={MembershipStatus.map((_item) => _item.name)}
              getOptionLabel={(option) => option}
              value={memberStatus || []}
              onChange={(event, newValue) => handleMemberStatus(newValue)}
              size="small"
              sx={{ minWidth: '50%' }}
              renderInput={(params) => <TextField {...params} label="Status" variant="filled" />}
            />
          )}
          {topName === 'membership' && (
            <Autocomplete
            label="Customer"
            size="small"
            disablePortal
            options={map(customerCodes, (_item) => ({
              label: _item.name,
              id: _item.customerId,
            }))}
            value={currentCustomerId}
            onChange={(event, newValue) => handleCustomerId(newValue)}
            sx={{ minWidth: '50%' }}
            filterOptions={(options, { inputValue }) => {
              const searchTerm = inputValue.toLowerCase();
              return options.filter((option) =>
                option.label.toLowerCase().startsWith(searchTerm)
              );
            }}
            renderOption={(props, item) => (
              <li {...props} key={item.id}>
                <ListItemText>{item.label}</ListItemText>
              </li>
            )}
            renderInput={(params) => (
              <TextField variant="filled" {...params} label={'Customer'} />
            )}
          />
          )}</Stack>
          {topName === 'membership' && (
            <TextField
            sx={{
              minWidth: { xs: '100%', sm: 85 },
              maxWidth: '100%',

              '& .MuiInputBase-input': {
                height: 17,
              },
              '& .css-qa422o-MuiFormLabel-root-MuiInputLabel-root': {
                top: -1.5,
              },
            }}
            variant="outlined"
            size="medium"
            label="Mobile Number"
            value={memberConatactNo}
            type='text'
            inputProps={{
              maxLength: 10,
              pattern: "[0-9]*",
            }}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                setMemberConatactNo('');
              } else if (/^\d*$/.test(value)) {
                setMemberConatactNo(value);
              }
            }}
          />
          )}</Stack>

          {topName === 'product' && !isHideProductName && (
            // <StyledSearch
            //   sx={{ minWidth: 310 }}
            //   // sx={{ width: { xs: '50% !important', sm: '25% !important' }, paddingLeft: '7px' }}
            //   className="inventoryStep3"
            //   size="small"
            //   value={productName}
            //   autoFocus={productName !== null}
            //   onChange={productChanges}
            //   placeholder="Search products..."
            //   startAdornment={
            //     <InputAdornment position="start">
            //       <Iconify
            //         icon="eva:search-fill"
            //         sx={{ color: 'text.disabled', width: 20, height: 20 }}
            //       />
            //     </InputAdornment>
            //   }
            // />

            <Autocomplete
              size="small"
              label="Product Name"
              disablePortal
              options={productList}
              value={productName}
              onChange={(event, newValue) => {
                productChanges(newValue);
              }}
              sx={{ minWidth: '100%' }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderOption={(props, item, index) => (
                <li {...props} key={index.index}>
                  <ListItemText>{item.label}</ListItemText>
                </li>
              )}
              renderInput={(params) => (
                <TextField variant="filled" {...params} label={'Product Name'} />
              )}
            />
          )}

          {topName === 'expense' && !isHideCategory && (
            <Autocomplete
              size="small"
              disablePortal
              options={categoriesList
                .filter((item) => !!item)
                .map((item, index) => ({
                  label: item ? item?.categoryName : `Unknown-${index}`,
                  id: item ? item?.categoryName : `unknown-${index}`,
                }))}
              value={currentCategorizeCode}
              onChange={(event, newValue) => handleCategorizeCode(newValue)}
              sx={{ minWidth: 160 }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue ? inputValue.toLowerCase() : '';
                return options.filter(
                  (option) => option.label && option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <ListItemText>{option.label}</ListItemText>
                </li>
              )}
              renderInput={(params) => <TextField variant="filled" {...params} label="Category" />}
            />
          )}
          {topName === 'product' && !isHideCategory && (
            <Autocomplete
              size="small"
              disablePortal
              options={map(categoriesList, (_item) => ({
                label: _item,
                id: _item,
              }))}
              value={currentCategorizeCode}
              onChange={(event, newValue) => handleCategorizeCode(newValue)}
              sx={{ minWidth: '100%' }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderOption={(props, item) => (
                <li {...props} key={item.id}>
                  <ListItemText>{item.label}</ListItemText>
                </li>
              )}
              renderInput={(params) => (
                <TextField variant="filled" {...params} label={'Category'} />
              )}
            />
          )}

          {topName === 'order' && !isOrderDetails && (
            <Autocomplete
              size="small"
              disablePortal
              options={StatusLabel}
              value={get(status, 'label')}
              onChange={(event, newValue) => handleChangeOrder(newValue)}
              sx={{ minWidth: '100%' }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderOption={(props, item) => (
                <li {...props} key={item.id}>
                  <ListItemText>{item.label}</ListItemText>
                </li>
              )}
              renderInput={(params) => <TextField variant="filled" {...params} label={'Status'} />}
            />
          )}
          {topName === 'category' && !isHideCategory && (
            <Autocomplete
              size="small"
              disablePortal
              options={map(categoriesList, (_item) => ({
                label: _item,
                id: _item,
              }))}
              value={currentCategorizeCode}
              onChange={(event, newValue) => handleCategorizeCode(newValue)}
              sx={{ minWidth: '100%' }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderOption={(props, item) => (
                <li {...props} key={item.id}>
                  <ListItemText>{item.label}</ListItemText>
                </li>
              )}
              renderInput={(params) => (
                <TextField variant="filled" {...params} label={'Category'} />
              )}
            />
          )}
          {topName === 'payment' && (
            <Autocomplete
              multiple
              options={PaymentModeTypeConstantsCart.map((_item) => _item.name)}
              getOptionLabel={(option) => option}
              value={paymentMode || []}
              onChange={(event, newValue) => handlePaymentMode(newValue)}
              size="small"
              sx={{ minWidth: '100%' }}
              renderInput={(params) => <TextField {...params} label="Mode" variant="filled" />}
            />
          )}
          {DayStock ? (
            <Box
              sx={{
                width: '100%',
                '& .rs-picker': {
                  width: '100% !important',
                },
              }}
            >
              <DatePicker />
            </Box>
          ) : (
            <Box
              sx={{
                width: '100%',
                '& .rs-picker': {
                  width: '100% !important',
                },
              }}
            >
              <Stack>{!isOrderSummaryDetails && <StartAndEndDatePicker />}</Stack>
            </Box>
          )}

          {openDialog?.status && (
            <CsvOrExcelOptionsDialog
              open={openDialog?.status}
              handleClose={() => {
                setOpenDialog({ status: false, name: '' });
              }}
              onSubmit={(data, reset) => {
                if (openDialog?.name === CSV) {
                  csvDownload(data, () => {
                    reset();
                    setOpenDialog({ status: false, name: '' });
                  });
                } else if (openDialog?.name === EXCEL) {
                  excelDownload(data, () => {
                    reset();
                    setOpenDialog({ status: false, name: '' });
                  });
                }
              }}
              name={openDialog?.name}
            />
          )}
        </>
      ) : (
        <>
          {DayStock ? (
            <DatePicker />
          ) : (
            <Stack>{!isOrderSummaryDetails && <StartAndEndDatePicker />}</Stack>
          )}

          {(!isDisabledCustomCodeAndCustomer || isEnabledCustomCode) && (
            <>
              {isCustomCodeEnabled && !isEmpty(customCodes) && (
                <Autocomplete
                  size="small"
                  label="Custom Name"
                  disablePortal
                  options={map(customCodes, (_item) => ({
                    label: _item.codeName,
                    id: _item.customCode,
                  }))}
                  value={currentCustomCode}
                  onChange={(event, newValue) => {
                    handleCustomCode(newValue);
                  }}
                  sx={{ minWidth: 160 }}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase();
                    return options.filter((option) =>
                      option.label.toLowerCase().startsWith(searchTerm)
                    );
                  }}
                  renderOption={(props, item) => (
                    <li {...props} key={item.id}>
                      <ListItemText>{item.label}</ListItemText>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label={'Custom Name'} />
                  )}
                />
              )}
            </>
          )}

          {!isDisabledCustomCodeAndCustomer && (
            <>
              {isCustomerIdEnabled && !isEmpty(customerCodes) && customer && (
                //    <Autocomplete
                //    label="Customer"
                //    size="small"
                //    disablePortal
                //    options={map(customerCodes, (_item) => ({
                //      label: _item.name,
                //      id: _item.customerId,
                //    }))}
                //    value={currentCustomerId}
                //    onChange={(event, newValue) => {
                //      console.log('Selected customer:', newValue); // Debugging: check selected value
                //      handleCustomerId(newValue);
                //    }}
                //    sx={{ minWidth: 160 }}
                //    filterOptions={(options, { inputValue }) => {
                //      const searchTerm = inputValue.toLowerCase().trim();
                //      console.log('Search term:', searchTerm); // Debugging: log the search term
                //      console.log('Available options:', options); // Debugging: check options being passed

                //      // Ensure filtering only for options whose label starts with the search term
                //      return options.filter(option =>
                //        option.label.toLowerCase().startsWith(searchTerm)
                //      );
                //    }}
                //    renderInput={(params) => (
                //      <TextField variant="filled" {...params} label="Customer" />
                //    )}
                //  />
                <Autocomplete
                  size="small"
                  disablePortal
                  options={map(customerCodes, (_item) => ({
                    label: _item.name,
                    id: _item.customerId,
                  }))}
                  value={currentCustomerId}
                  onChange={(event, newValue) => {
                    console.log('Selected customer:', newValue);
                    handleCustomerId(newValue);
                  }}
                  sx={{ minWidth: 160 }}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase();
                    return options.filter((option) =>
                      option.label.toLowerCase().startsWith(searchTerm)
                    );
                  }}
                  renderOption={(props, item) => (
                    <li {...props} key={item.id}>
                      <ListItemText>{item.label}</ListItemText>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label="Customer" />
                  )}
                />
              )}

              {topName === 'purchase orders' && (
                <Autocomplete
                  label="Customer"
                  size="small"
                  disablePortal
                  options={map(customerCodes, (_item) => ({
                    label: _item.name,
                    id: _item.customerId,
                  }))}
                  value={currentCustomerId}
                  onChange={(event, newValue) => handleCustomerId(newValue)}
                  sx={{ minWidth: 160 }}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase();
                    return options.filter((option) =>
                      option.label.toLowerCase().startsWith(searchTerm)
                    );
                  }}
                  renderOption={(props, item) => (
                    <li {...props} key={item.id}>
                      <ListItemText>{item.label}</ListItemText>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label={'Customer'} />
                  )}
                />
              )}
            </>
          )}

          {isCountersEnabled && topName === 'terminals' && (
            <Autocomplete
              multiple
              size="small"
              filterSelectedOptions
              options={map(counterList, (_item) => ({
                label: get(_item, 'name'),
                id: get(_item, 'counterId'),
              }))}
              value={multiCounters}
              getOptionDisabled={(option) => checkCurrentCounterId(option.id)}
              onChange={(event, newValue) => handleChangeCounter(newValue)}
              sx={{ minWidth: 200 }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderOption={(props, item) => (
                <li {...props} key={item.id}>
                  <ListItemText>{item.label}</ListItemText>
                </li>
              )}
              renderInput={(params) => <TextField variant="filled" {...params} label={'Counter'} />}
            />
          )}
          {topName === 'membership' && (
            <Autocomplete
              multiple
              options={MembershipStatus.map((_item) => _item.name)}
              getOptionLabel={(option) => option}
              value={memberStatus || []}
              onChange={(event, newValue) => handleMemberStatus(newValue)}
              size="small"
              sx={{ minWidth: '15%' }}
              renderInput={(params) => <TextField {...params} label="Status" variant="filled" />}
            />
          )}
          {topName === 'membership' && (
            <Autocomplete
            label="Customer"
            size="small"
            disablePortal
            options={map(customerCodes, (_item) => ({
              label: _item.name,
              id: _item.customerId,
            }))}
            value={currentCustomerId}
            onChange={(event, newValue) => handleCustomerId(newValue)}
            sx={{ minWidth: '15%' }}
            filterOptions={(options, { inputValue }) => {
              const searchTerm = inputValue.toLowerCase();
              return options.filter((option) =>
                option.label.toLowerCase().startsWith(searchTerm)
              );
            }}
            renderOption={(props, item) => (
              <li {...props} key={item.id}>
                <ListItemText>{item.label}</ListItemText>
              </li>
            )}
            renderInput={(params) => (
              <TextField variant="filled" {...params} label={'Customer'} />
            )}
          />
          )}
          {topName === 'membership' && (
            <TextField
            sx={{
              minWidth: { xs: '40%', sm: 85 },
              maxWidth: 180,

              '& .MuiInputBase-input': {
                height: 17,
              },
              '& .css-qa422o-MuiFormLabel-root-MuiInputLabel-root': {
                top: -1.5,
              },
            }}
            variant="outlined"
            size="medium"
            label="Contact Number"
            value={memberConatactNo}
            type='text'
            inputProps={{
              maxLength: 10,
              pattern: "[0-9]*",
            }}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                setMemberConatactNo('');
              } else if (/^\d*$/.test(value)) {
                setMemberConatactNo(value);
              }
            }}
          />
          )}

          {(topName === 'product' || topName === 'category') && !isHideCategory && (
            <Autocomplete
              size="small"
              disablePortal
              options={map(categoriesList, (_item) => ({
                label: _item,
                id: _item,
              }))}
              value={currentCategorizeCode}
              onChange={(event, newValue) => handleCategorizeCode(newValue)}
              sx={{ minWidth: 160 }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderOption={(props, item) => (
                <li {...props} key={item.id}>
                  <ListItemText>{item.label}</ListItemText>
                </li>
              )}
              renderInput={(params) => (
                <TextField variant="filled" {...params} label={'Category'} />
              )}
            />
          )}
          {topName === 'payment' && (
            <Autocomplete
              multiple
              options={PaymentModeTypeConstantsCart.map((_item) => _item.name)}
              getOptionLabel={(option) => option}
              value={paymentMode || []}
              onChange={(event, newValue) => handlePaymentMode(newValue)}
              size="small"
              sx={{ minWidth: 140 }}
              renderInput={(params) => <TextField {...params} label="Mode" variant="filled" />}
            />
          )}

          {topName === 'expense' && !isHideCategory && (
            <Autocomplete
              size="small"
              disablePortal
              options={categoriesList
                .filter((item) => !!item)
                .map((item, index) => ({
                  label: item ? item?.categoryName : `Unknown-${index}`,
                  id: item ? item?.categoryName : `unknown-${index}`,
                }))}
              value={currentCategorizeCode}
              onChange={(event, newValue) => handleCategorizeCode(newValue)}
              sx={{ minWidth: 160 }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue ? inputValue.toLowerCase() : '';
                return options.filter(
                  (option) => option.label && option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <ListItemText>{option.label}</ListItemText>
                </li>
              )}
              renderInput={(params) => <TextField variant="filled" {...params} label="Category" />}
            />
          )}

          {topName === 'order' && !isOrderDetails && (
            <Autocomplete
              size="small"
              disablePortal
              options={StatusLabel}
              value={get(status, 'id')}
              onChange={(event, newValue) => handleChangeOrder(newValue)}
              sx={{ minWidth: 220 }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderOption={(props, item) => (
                <li {...props} key={item.id}>
                  <ListItemText>{item.label}</ListItemText>
                </li>
              )}
              renderInput={(params) => <TextField variant="filled" {...params} label={'Status'} />}
            />
          )}

          {(topName === 'product' || topName === 'category') &&
            isCountersEnabled &&
            !isHideFilter && (
              <Autocomplete
                size="small"
                disablePortal
                options={map(counterList, (_item) => ({
                  label: get(_item, 'name'),
                  id: get(_item, 'counterId'),
                }))}
                value={get(counter, 'label')}
                onChange={(event, newValue) => handleChangeCounter(newValue)}
                sx={{ minWidth: 160 }}
                filterOptions={(options, { inputValue }) => {
                  const searchTerm = inputValue.toLowerCase();
                  return options.filter((option) =>
                    option.label.toLowerCase().startsWith(searchTerm)
                  );
                }}
                renderOption={(props, item) => (
                  <li {...props} key={item.id}>
                    <ListItemText>{item.label}</ListItemText>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField variant="filled" {...params} label={'Counter'} />
                )}
              />
            )}

          {topName === 'product' && !isHideProductName && (
            // <StyledSearch
            //   sx={{ minWidth: 160 }}
            //   // sx={{ width: { xs: '50% !important', sm: '25% !important' }, paddingLeft: '7px' }}
            //   className="inventoryStep3"
            //   size="small"
            //   value={productName}
            //   autoFocus={productName !== null}
            //   onChange={productChanges}
            //   placeholder="Search products..."
            //   startAdornment={
            //     <InputAdornment position="start">
            //       <Iconify
            //         icon="eva:search-fill"
            //         sx={{ color: 'text.disabled', width: 20, height: 20 }}
            //       />
            //     </InputAdornment>
            //   }
            // />
            <Autocomplete
              size="small"
              label="Product Name"
              disablePortal
              options={productList}
              value={productName}
              onChange={(event, newValue) => {
                productChanges(newValue);
              }}
              sx={{ minWidth: 160 }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderOption={(props, item, index) => {
                return (
                  <li {...props} key={index.index}>
                    <ListItemText>{item.label}</ListItemText>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField variant="filled" {...params} label={'Product Name'} />
              )}
            />
          )}

          {isOrderId && (
            <TextField
              sx={{
                minWidth: { xs: '40%', sm: 85 },
                maxWidth: 100,

                '& .MuiInputBase-input': {
                  height: 17,
                },
                '& .css-qa422o-MuiFormLabel-root-MuiInputLabel-root': {
                  top: -1.5,
                },
              }}
              variant="outlined"
              size="medium"
              label="Order ID"
              value={orderId}
              // inputProps={{ style: { padding: '8px', paddingBottom: '20px' } }}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setOrderId('');
                } else if (Number(value)) {
                  setOrderId(Number(value));
                }
              }}
            />
          )}

          {topName === 'purchaseOrders' && (
            <Autocomplete
              size="small"
              disablePortal
              options={map(vendorList, (_item) => ({
                label: get(_item, 'name'),
                id: get(_item, 'id'),
              }))}
              value={get(vendor, 'id')}
              onChange={(event, newValue) => handleChangeVendor(newValue)}
              sx={{ minWidth: 160 }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.label.toLowerCase().startsWith(searchTerm)
                );
              }}
              renderOption={(props, item) => (
                <li {...props} key={item.id}>
                  <ListItemText>{item.label}</ListItemText>
                </li>
              )}
              renderInput={(params) => <TextField variant="filled" {...params} label={'Vendor'} />}
            />
          )}

          {printPdf && !isEmpty(filterTable) && (
            <Tooltip title={isUnderWeekDatesBol ? 'Export PDF' : 'COMING SOON'}>
              <Stack ml={1}>
                <PdfDownload printPdf={printPdf} isUnderWeekDatesBol={isUnderWeekDatesBol} />
              </Stack>
            </Tooltip>
          )}
          {csvDownload && !isEmpty(filterTable) && (
            <Tooltip
              title={
                isUnderWeekDates(startDate, endDate, topName === 'order', topName === 'order')
                  ? 'Export CSV'
                  : 'COMING SOON'
              }
            >
              <Stack>
                <IconButton
                  disabled={
                    !isUnderWeekDates(startDate, endDate, topName === 'order', topName === 'order')
                  }
                  ml={1}
                  onClick={() => {
                    if (isConfigCsvOrExcelColumns) {
                      setOpenDialog({ status: true, name: CSV });
                    } else {
                      csvDownload();
                    }
                  }}
                >
                  <Icon
                    icon="grommet-icons:document-csv"
                    style={
                      isUnderWeekDates(startDate, endDate, topName === 'order', topName === 'order')
                        ? { color: theme.palette.primary.main }
                        : { opacity: 0.5, color: 'gray' }
                    }
                    width="20"
                    height="20"
                  />
                </IconButton>
              </Stack>
            </Tooltip>
          )}
          {excelDownload && !isEmpty(filterTable) && (
            <Tooltip title={isUnderWeekDatesBol ? 'Export EXCEL' : 'COMING SOON'}>
              <Stack>
                <IconButton
                  ml={1}
                  disabled={!isUnderWeekDatesBol}
                  onClick={() => {
                    if (isConfigCsvOrExcelColumns) {
                      setOpenDialog({ status: true, name: EXCEL });
                    } else {
                      excelDownload();
                    }
                  }}
                >
                  <Icon
                    icon="uiw:file-excel"
                    style={
                      isUnderWeekDatesBol
                        ? { color: theme.palette.primary.main }
                        : { opacity: 0.5, color: 'gray' }
                    }
                    width="20"
                    height="20"
                  />
                </IconButton>
              </Stack>
            </Tooltip>
          )}

          {topName === 'product' && !isEmpty(filterTable) && !DayStock && !isHideFilter && (
            <>
              <IconButton className="inventoryStep2" onClick={handleOpenMenu}>
                <Icon
                  icon={get(open, 'open') ? 'bi:sort-down-alt' : 'bi:sort-up-alt'}
                  color="#5a0b45"
                  height={25}
                  width={30}
                />
              </IconButton>

              <Popover
                open={Boolean(get(open, 'open'))}
                anchorEl={get(open, 'eventData')}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    p: 1,
                    width: 148,
                    maxHeight: 300,
                    ...hideScrollbar,
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#000', fontSize: 16, mb: 1 }}>
                  Sort by
                </Typography>
                <FormGroup>
                  <FormControl>
                    <RadioGroup
                      style={{ fontSize: '10px' }}
                      aria-labeled
                      by="demo-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      value={productWiseSort}
                      onChange={handleChanges}
                    >
                      <FormControlLabel
                        size="small"
                        value="category"
                        control={<Radio />}
                        label="Category"
                      />
                      <Divider />
                      <FormControlLabel
                        value="totalprice"
                        control={<Radio />}
                        label="Total price"
                      />
                      <Divider />
                      <FormControlLabel
                        value="soldquantity"
                        control={<Radio />}
                        label="Sold quantity"
                      />
                    </RadioGroup>
                  </FormControl>
                </FormGroup>
              </Popover>
            </>
          )}

          {(topName === 'order' || topName === 'payment' || topName === 'expense') &&
            !isOrderDetails &&
            !isEmpty(filterTable) && (
              <Tooltip title={isDesc ? 'Descending' : 'Ascending'}>
                <IconButton onClick={handleChange}>
                  {isDesc ? (
                    <ArrowUpwardIcon sx={{ color: theme.palette.primary.main }} />
                  ) : (
                    <ArrowDownwardIcon sx={{ color: theme.palette.primary.main }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          {openDialog?.status && (
            <CsvOrExcelOptionsDialog
              open={openDialog?.status}
              handleClose={() => {
                setOpenDialog({ status: false, name: '' });
              }}
              onSubmit={(data, reset) => {
                if (openDialog?.name === CSV) {
                  csvDownload(data, () => {
                    reset();
                    setOpenDialog({ status: false, name: '' });
                  });
                } else if (openDialog?.name === EXCEL) {
                  excelDownload(data, () => {
                    reset();
                    setOpenDialog({ status: false, name: '' });
                  });
                }
              }}
              name={openDialog?.name}
            />
          )}
        </>
      )}
    </Stack>
  );
}
