import CloudSyncIcon from '@mui/icons-material/CloudSync';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import {
  Autocomplete,
  Box,
  IconButton,
  ListItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { filter, find, get, isEmpty, map, some } from 'lodash';
import uuid from 'react-uuid';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';

export default function BillingSearch(props) {
  const {
    setaddOrder,
    isAddonMandatory,
    totalProducts,
    addOrder,
    syncUpProducts,
    lastSyncTime,
    syncState,
    setView,
    view,
    billing = false,
  } = props;
  const theme = useTheme();

  const handleViewChange = (e, nextView) => {
    setView(nextView);
  };

  const handleAddOrder = (e) => {
    const currentTimestamp = new Date().getTime();
    const cartId = `${uuid()}:${currentTimestamp}`;
    const check = find(addOrder, (d) => e.productId === d.productId);
    if (isEmpty(check)) {
      setaddOrder((prevState) => {
        return [
          ...prevState,
          {
            ...e,
            cartId: cartId,
            quantity: 1,
            addOn: e.addOn && isAddonMandatory ? e.addOn : [],
            productAddons: get(e, 'productAddons', []),
          },
        ];
      });
    } else if (!isEmpty(check)) {
      const otherOrders = filter(addOrder, (d) => e.productId !== d.productId);
      setaddOrder((prevState) => {
        return [
          ...otherOrders,
          {
            ...check,
            quantity: Number(get(check, 'quantity')) + 1,
          },
        ];
      });
    }
  };

  console.log(addOrder);
  const handleSearch = (e) => {
    if (e) {
      handleAddOrder({ ...get(e, 'product'), productAddons: get(e, 'product.addon', []) });
    }
  };
  const handleFilterOptions = (options, state) => {
    const inputValue = get(state, 'inputValue').toLowerCase();
    const filtered = filter(
      options,
      (option) =>
        get(option, 'label').toLowerCase().includes(inputValue) ||
        get(option, 'id').toLowerCase().includes(inputValue)
    );
    return filtered;
  };
  const isOrdered = (curr) => {
    if (!curr) return false;
    const check = some(addOrder, (e) => e.productId === curr);
    return check;
  };
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        width: {
          xs: '97%',
          md: '65%',
          lg: '65%',
          sm: '97%',
        },
        zIndex: 100,
        alignContent: 'flex-end',
        alignSelf: 'flex-end',

        pt: '10px',
        pb: '5px',
        left: '10px',
        pl: 1,
        pr: 1,
        backgroundColor: '#F8F8F8 !important',
        '& .MuiList-root': {
          backgroundColor: '#F8F8F8 !important',
          py: '10px',
        },
      }}
    >
      <Stack flexDirection={'row'} sx={{ gap: 1 }}>
        <Autocomplete
          fullWidth
          label="Search Products"
          size="small"
          clearOnEscape
          disablePortal
          options={map(totalProducts, (_item) => ({
            label: get(_item, 'name'),
            id: get(_item, 'productId'),
            product: _item,
          }))}
          value={''}
          filterOptions={handleFilterOptions}
          onChange={(event, newValue) => handleSearch(newValue)}
          sx={{ minWidth: 160 }}
          renderInput={(params) => (
            <TextField fullWidth variant="filled" {...params} label={'Search'} />
          )}
          getOptionDisabled={(option, value) =>
            get(option, 'product.stockMonitor', false) &&
            get(option, 'product.stockQuantity', 0) < 1
          }
          renderOption={(props, option, { selected }) => (
            <ListItem
              {...props}
              sx={{
                width: '100%',
                backgroundColor: isOrdered(get(option, 'product.productId'))
                  ? theme.palette.grey[200]
                  : 'transparent',
                px: 2,
                py: 1,
                borderRadius: 1,
              }}
            >
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: isOrdered(get(option, 'product.productId')) ? 'bold' : '' }}
                >
                  {option.label} {get(option, 'product.unit', '')}
                  {get(option, 'product.unitName', '')}
                </Typography>
                {get(option, 'product.stockMonitor', false) && (
                  <Typography variant="caption">
                    Available : {get(option, 'product.stockQuantity', 0)}
                  </Typography>
                )}
                <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {get(option, 'product.offerPrice') > 0 &&
                    typeof get(option, 'product.offerPrice') !== 'object' &&
                    get(option, 'product.offerPrice') !== get(option, 'product.price') && (
                      <Typography
                        variant="caption"
                        sx={{
                          textDecorationLine: 'line-through',
                          fontWeight: 'bold',
                          color: 'text.secondary',
                        }}
                      >
                        {fCurrency(toFixedIfNecessary(get(option, 'product.price'), 2))}
                      </Typography>
                    )}
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {fCurrency(
                      get(option, 'product.offerPrice')
                        ? get(option, 'product.offerPrice')
                        : get(option, 'product.price')
                    )}
                  </Typography>
                </Stack>
              </Stack>
            </ListItem>
          )}
        />
        <Tooltip title={`last sync time ${lastSyncTime}`}>
          <IconButton
            sx={{ color: 'primary.main' }}
            disabled={!isEmpty(addOrder) || !syncState}
            onClick={syncUpProducts}
          >
            <CloudSyncIcon fontSize="large" />
          </IconButton>
        </Tooltip>

        <Stack flexDirection={'row'}>
          <Box>
            <ToggleButtonGroup
              orientation="Horizontal"
              value={view}
              exclusive
              onChange={handleViewChange}
              size="small"
              sx={{ marginLeft: 1 }}
            >
              <ToggleButton value="GRID" aria-label="module">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="LIST" aria-label="list">
                <ViewListIcon sx={{ marginTop: '5px' }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
