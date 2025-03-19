import * as React from 'react';
import { useEffect } from 'react';
import { Card, MenuItem, Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Stack } from '@mui/material';
import { Dialog } from '@mui/material';
import { useState } from 'react';
import {
  compact,
  every,
  get,
  map,
  some,
  uniqBy,
  upperCase,
  forEach,
  isEmpty,
  find,
  groupBy,
  reduce,
} from 'lodash';
import toast from 'react-hot-toast';
import CloseIcon from '@mui/icons-material/Close';
import { ErrorConstants } from '../constants/ErrorConstants';
import TABLESERVICES_API from 'src/services/API/TableServices';
import { IconButton } from '@mui/material';
import { useTheme } from '@mui/material';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { TableCard } from 'src/sections/TableList/TableCard';
import { allConfiguration, currentStoreId, currentTerminalId } from 'src/global/recoilState';
import { useRecoilValue } from 'recoil';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { orderBy } from 'lodash';
import { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'src/components/FormProvider';
import {
  defaultOrderTypes,
  OrderTypeConstants,
  REQUIRED_CONSTANTS,
} from 'src/constants/AppConstants';
import { formatOrderTypeDataStrucutre } from 'src/utils/formatOrderTypeDataStrucutre';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import RefreshIcon from '@mui/icons-material/Refresh';

const bull = (
  <Box component="span" sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.6)' }}>
    •
  </Box>
);

export default function BasicCard() {
  const [age, setAge] = React.useState('');
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const theme = useTheme();
  const [isAscending, setIsAscending] = useState(true);
  const handleChange = (event) => {
    setAge(event.target.value);
  };
  const [filteredData, setFilteredData] = useState([]);
  const [open, Setopen] = useState(false);
  const defaultValue = { open: false, event: {}, data: {} };
  const [opens, setOpens] = useState(defaultValue);
  const [tableList, setTableList] = useState([]);
  const [editTableData, setEditTableData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const configuration = useRecoilValue(allConfiguration);
  const isOrderTypeEnable = get(configuration, 'isOrderType.isActive', false);
  const previouseOrderTypeList = get(configuration, 'isOrderType.orderTypes', defaultOrderTypes);
  const priceTypeList = formatOrderTypeDataStrucutre(previouseOrderTypeList);
  const getTableList = async () => {
    try {
      const res = await TABLESERVICES_API.getTableList();
      if (res) {
        setTableList(get(res, 'data') || []);
      }
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    getTableList();
  }, [currentStore, currentTerminal]);

  useEffect(() => {
    setSelectedCategory('ALL');
    setFilteredData(tableList);
  }, [tableList]);

  const postCreateTable = async (details) => {
    try {
      const res = await TABLESERVICES_API.postCreateTable(details);
      if (res) {
        toast.success(SuccessConstants.CREATED_SUCCESSFUL);
        Setopen(false);
        getTableList();
        reset(defaultValues);
      }
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleCloseMenu = () => {
    setOpens(defaultValue);
  };
  const RegisterSchema = Yup.object().shape({
    tableName: Yup.string()
      .required(ErrorConstants.TABLE_NAME_IS_REQUIRED)
      .transform((value) => value?.toUpperCase()),
    tableCapacity: Yup.string().required(ErrorConstants.TABLE_CAPACITY_IS_REQUIRED),
    tableCategory: Yup.string()
      .required(REQUIRED_CONSTANTS.CATEGORY)
      .transform((value) => value?.toUpperCase()),
    tableInfo: Yup.object().shape({
      priceVariant: Yup.string(),
    }),
  });

  const defaultValues = {
    tableName: '',
    tableCapacity: '',
    tableCategory: OrderTypeConstants.DineIn,
    tableInfo: {},
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    let options = {
      tableName: data.tableName,
      tableCapacity: data.tableCapacity,
      tableCategory: data.tableCategory,
      tableInfo: get(data, 'tableInfo'),
    };
    if (editTableData) {
      const id = editTableData.tableId;
      updateTableId(options, id);
    } else {
      postCreateTable(options);
    }
  };

  const updateTableId = async (TableBody, id) => {
    try {
      const res = await TABLESERVICES_API.updateTableId(TableBody, id);
      toast.success(SuccessConstants.EDIT_SUCCESSFUL);

      setEditTableData(null);
      await getTableList();
      reset(defaultValues);
      Setopen(false);
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const sortData = (tableList) => {
    if (isAscending) {
      return tableList?.sort?.((a, b) => {
        return a?.tableName?.localeCompare?.(b?.tableName, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      });
    } else {
      return tableList?.sort?.((a, b) => {
        return b?.tableName?.localeCompare?.(a?.tableName, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      });
    }
  };

  const groupByCategory = (list) => {
    const result = [{ key: 'ALL', label: 'ALL' }];

    const isNotNullCategoryData = every(list, (_item) => {
      return get(_item, 'tableCategory');
    });

    if (!isNotNullCategoryData) {
      result.push({ key: OrderTypeConstants.DineIn, label: OrderTypeConstants.DineIn });
    }

    const formatData = compact(
      map(list, (_item) =>
        get(_item, 'tableCategory') ? get(_item, 'tableCategory')?.toUpperCase?.() : null
      )
    );

    const removeDublicateData = uniqBy(formatData, function (e) {
      return e;
    });

    const finalFormatData = map(removeDublicateData, (_item) => {
      return { key: _item, label: _item };
    });

    const orderData = orderBy(finalFormatData, ['key'], ['asc']);

    const categoryList = [...result, ...orderData];

    return categoryList;
  };

  const groupedCategories = groupByCategory(tableList);
  const uniqueCategories = Array.from(new Set(tableList.map((item) => item.tableCategory)));
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    filterData(category);
  };

  const filterData = (category) => {
    if (category.toUpperCase() === 'ALL') {
      setFilteredData(tableList);
      return;
    }

    const normalizedCategory = category.replace(/\s+/g, ' ').toUpperCase();
    const filteredResults = tableList.filter((item) => {
      const itemCategory = get(item, 'tableCategory') || OrderTypeConstants.DineIn;
      return (
        itemCategory.trim() &&
        itemCategory.replace(/\s+/g, ' ').toUpperCase() === normalizedCategory
      );
    });
    setFilteredData(filteredResults);
  };
  const getTotalAmount = (_table) => {
    let totalAmount = 0;

    forEach(get(_table, 'additionalInfo.tableOrders'), (_TableOrder) => {
      forEach(get(_TableOrder, 'order'), (_Product) => {
        totalAmount +=
          getTotalPriceAndGst({
            price: (_Product?.offerPrice || _Product?.price) / 100,
            GSTPercent: _Product.GSTPercent,
            GSTInc: _Product?.GSTInc,
            fullData: _Product,
          })?.withGstAmount * _Product?.quantity;
      });
    });

    return toFixedIfNecessary(totalAmount, 2);
  };

  const handleParcelCharges = (item) => {
    let totalParcelCharges = 0;
    forEach(get(item, 'additionalInfo.tableOrders', []), (order) => {
      if (Array.isArray(get(order, 'order', []))) {
        forEach(get(order, 'order', []), (parcel) => {
          if (!get(parcel, 'isParcelCharges', false)) return;
          let parcelCharge = 0;
          parcelCharge =
            (Number(get(parcel, 'parcelCharges') || 0) / 100) * get(parcel, 'quantity');
          if (!get(parcel, 'GSTInc') && get(parcel, 'GSTPercent') > 0) {
            parcelCharge += (parcelCharge * get(parcel, 'GSTPercent', 0)) / 100;
          }
          totalParcelCharges += parcelCharge;
        });
      }
    });
    return totalParcelCharges || 0;
  };

  const handleRefesh = () => {
    getTableList();
  };
  useEffect(() => {
    if (!isEmpty(editTableData)) {
      console.log('editTableData', editTableData);
      reset(editTableData);
    } else {
      reset(defaultValues);
    }
  }, [editTableData]);
  return (
    <div>
      <Box xs display="flex" justifyContent="end" alignItems="center" gap={2} pr={3} mb={1}>
        <Button
          variant="outlined"
          onClick={() => {
            setIsAscending((prev) => !prev);
          }}
        >
          {' '}
          {isAscending ? (
            <ArrowUpwardIcon size={22} className="mt-1" />
          ) : (
            <ArrowDownwardIcon size={22} className="mt-1" />
          )}
        </Button>

        <Button
          variant="outlined"
          onClick={() => {
            Setopen(true);
            reset(defaultValues);
          }}
        >
          CreateTable
        </Button>
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          paddingY: 1,
          ml: 1.5,
          '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
        }}
      >
        {groupedCategories.map(({ key, label }) => {
          return (
            <>
              <Stack
                key={key}
                onClick={() => handleCategoryClick(key)}
                sx={{
                  whiteSpace: 'nowrap',

                  paddingX: 2,
                  paddingY: 1,

                  cursor: 'pointer',
                  borderRadius: 2,
                  backgroundColor:
                    selectedCategory === key ? theme.palette.primary.main : '#F6F7F8',
                  color: selectedCategory === key ? 'white' : 'black',
                  border: `1px solid ${
                    selectedCategory === key ? theme.palette.primary.main : 'transparent'
                  }`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor:
                      selectedCategory === key
                        ? theme.palette.primary.dark
                        : theme.palette.grey[300],
                  },
                }}
              >
                <Typography variant="body2" noWrap>
                  {label}
                </Typography>
              </Stack>
            </>
          );
        })}
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefesh}>
            <RefreshIcon color="primary" />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3} p={1}>
        {sortData(filteredData).length ? (
          map(sortData(filteredData), (item) => (
            <TableCard
              key={item.tableId}
              item={item}
              getTableList={getTableList}
              setEditTableData={setEditTableData}
              totalAmount={getTotalAmount(item)}
              Setopen={Setopen}
              reset={reset}
              isChargesAmount={Number(get(item, 'additionalInfo.additionalCharges', 0))}
              isDiscountAmount={get(item, 'additionalInfo.additionalDiscount', 0)}
              totalParcelCharges={handleParcelCharges(item)}
            />
          ))
        ) : (
          <Grid
            item
            xs={12}
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginTop={10}
          >
            <img src="/assets/images/table/OBJECTS.png" alt="No tables available" />
          </Grid>
        )}
      </Grid>
      <Stack sx={{ bgcolor: '#F6F7F8' }}>
        <Dialog open={open}>
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mx: 4, mt: 3, mr: 3, mb: 2 }}
          >
            <Typography variant="h5">
              {' '}
              {editTableData ? 'Edit Table' : 'Create New Table'}{' '}
            </Typography>
            <IconButton
              // sx={{ width: 50 }}
              onClick={() => {
                Setopen(false);
                setEditTableData(null);
                reset(defaultValues);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Card sx={{ p: 1, width: { xs: 300, sm: 550 } }}>
              <Stack gap={3} mb={2} sx={{ width: '100%', alignItems: 'center' }}>
                <RHFTextField
                  sx={{ bgcolor: '#F6F7F8', width: '95%' }}
                  label="Name"
                  id="Enter Table Name"
                  name="tableName"
                />
                <RHFTextField
                  type="number"
                  sx={{ bgcolor: '#F6F7F8', width: '95%' }}
                  label="Capacity"
                  id="Enter Table Capacity"
                  name="tableCapacity"
                />
                <RHFAutocomplete
                  label="Category"
                  options={uniqueCategories.filter((category) => category !== null)}
                  name="tableCategory"
                  variant="outlined"
                  sx={{ bgcolor: '#F6F7F8', width: '95%' }}
                  filterOptions={(options, state) => {
                    return options.filter((option) =>
                      option.toLowerCase().startsWith(state.inputValue.toLowerCase())
                    );
                  }}
                />
                <Stack
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    width: '95%',
                  }}
                >
                  <Typography variant="subtitle2">Table price (optional):</Typography>
                </Stack>
                {priceTypeList?.length > 2 && (
                  <RHFSelect
                    name={`tableInfo.priceVariant`}
                    label="Choose price variant"
                    sx={{ bgcolor: '#F6F7F8', width: '95%' }}
                  >
                    {map(priceTypeList, (e) => {
                      if (e !== OrderTypeConstants.Parcel)
                        return (
                          <MenuItem key={e} value={e}>
                            {e}
                          </MenuItem>
                        );
                    })}
                  </RHFSelect>
                )}
              </Stack>

              <Stack flexDirection="row" alignItems="center" justifyContent="flex-end">
                <Button
                  type="button"
                  onClick={() => {
                    Setopen(false);
                    // setTableName('')
                    // setTableCapacity('')
                    reset(defaultValues);
                    setEditTableData(null);
                  }}
                  variant="outlined"
                  size="large"
                  sx={{ mr: 1, backgroundColor: '#FFD9D9', color: '#212B36', mb: 2, mt: 1 }}
                >
                  Clear
                </Button>

                <Button size="large" type="submit" variant="contained" sx={{ mb: 2, mr: 2, mt: 1 }}>
                  {editTableData ? 'Update' : 'Submit'}
                </Button>
              </Stack>
            </Card>
          </FormProvider>
        </Dialog>
      </Stack>

      {/* <ReviewTable reserved={reserved} setReserved={setReserved} /> */}

      {/* <AddExpense /> */}
    </div>
  );
}
