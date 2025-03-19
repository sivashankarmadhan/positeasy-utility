import CloudSyncIcon from '@mui/icons-material/CloudSync';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Box, IconButton, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import ListSubheader from '@mui/material/ListSubheader';
import Popper from '@mui/material/Popper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { filter, find, get, isEmpty, map } from 'lodash';
import PropTypes from 'prop-types';
import * as React from 'react';
import uuid from 'react-uuid';
import { VariableSizeList } from 'react-window';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';

const LISTBOX_PADDING = 8; // px

function renderRow(props) {
  const { data, index, style } = props;
  const option = data[index];
  const inlineStyle = {
    ...style,
    top: style.top,
  };
  if (option.hasOwnProperty('group')) {
    return (
      <ListSubheader key={get(option, 'key')} component="div" style={inlineStyle}>
        {get(option, 'group')}
      </ListSubheader>
    );
  }

  return (
    <Typography component="li" {...option[0]} noWrap style={inlineStyle}>
      <Stack
        flexDirection={'row'}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Typography variant="body2">
          {get(option, '1.label')} {get(option, '1.product.unit', '')}
          {get(option, '1.product.unitName', '')}
        </Typography>
        {get(option, '1.product.stockMonitor', false) && (
          <Typography variant="caption">
            Available : {get(option, '1.product.stockQuantity', 0)}
          </Typography>
        )}
        <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
          {get(option, '1.product.offerPrice') > 0 &&
            typeof get(option, '1.product.offerPrice') !== 'object' &&
            get(option, '1.product.offerPrice') !== get(option, '1.product.price') && (
              <Typography
                variant="caption"
                sx={{
                  textDecorationLine: 'line-through',
                  fontWeight: 'bold',
                  color: 'text.secondary',
                }}
              >
                {fCurrency(toFixedIfNecessary(get(option, '1.product.price'), 2))}
              </Typography>
            )}
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {fCurrency(
              get(option, '1.product.offerPrice')
                ? get(option, '1.product.offerPrice')
                : get(option, '1.product.price')
            )}
          </Typography>
        </Stack>
      </Stack>
    </Typography>
  );
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = [];
  children.forEach((item) => {
    itemData.push(item);
    itemData.push(...(item.children || []));
  });

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
    noSsr: true,
  });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child) => {
    if (child.hasOwnProperty('group')) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

ListboxComponent.propTypes = {
  children: PropTypes.node,
};

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: 'border-box',
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
});

export default function VirtualizeSearchBox(props) {
  const theme = useTheme();
  const {
    setaddOrder,
    isAddonMandatory,
    totalProducts,
    addOrder,
    syncUpProducts,
    lastSyncTime,
    syncState,
    billing = false,
    setView,
    view,
  } = props;

  const handleViewChange = (e, nextView) => {
    console.log('nextView', nextView);
    console.log('chec', e);
    if (nextView !== view && nextView !== null && view !== null) {
      setView(nextView);
    }
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
      const otherOrders = filter(addOrder, (d) => get(e, 'productId') !== get(d, 'productId'));
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

  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        width: {
          xs: '95%',
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
        px: 0,
        backgroundColor: '#F8F8F8 !important',
        '& .MuiList-root': {
          backgroundColor: '#F8F8F8 !important',
          py: '10px',
        },
      }}
    >
      <Stack
        flexDirection={isMobile ? 'row' : 'row'}
        sx={{ gap: 1, display: 'flex', marginRight: '2px' }}
      >
        <Autocomplete
          fullWidth
          label="Search Products"
          size="small"
          clearOnEscape
          disablePortal
          id="virtualize-demo"
          disableListWrap
          PopperComponent={StyledPopper}
          filterOptions={handleFilterOptions}
          ListboxComponent={ListboxComponent}
          options={map(totalProducts, (_item) => ({
            label: get(_item, 'name'),
            id: get(_item, 'productId'),
            product: _item,
          }))}
          onChange={(event, newValue) => handleSearch(newValue)}
          getOptionDisabled={(option, value) =>
            get(option, 'product.stockMonitor', false) &&
            get(option, 'product.stockQuantity', 0) < 1
          }
          groupBy={(option) => option[0]?.category?.toUpperCase()}
          renderInput={(params) => <TextField {...params} label="Search" />}
          renderOption={(props, option, state) => [props, option, state.index]}
          // TODO: Post React 18 update - validate this conversion, look like a hidden bug
          renderGroup={(params) => params}
          enderTags={() => null}
        />
        <Stack flexDirection="row" justifyContent={isMobile ? 'flex-end' : 'flex-start'}>
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
                sx={{
                  '& .MuiButtonBase-root': {
                    marginTop: '4px !important',
                  },
                }}
              >
                {!isMobile && (
                  <ToggleButton value="GRID" aria-label="module">
                    <GridViewIcon fontSize="small" sx={{ marginTop: '1px' }} />
                  </ToggleButton>
                )}
                <ToggleButton value="SMALLGRIDIMAGE" aria-label="smallModule">
                  <ViewModuleIcon fontSize="small" sx={{ marginTop: '1px' }} />
                </ToggleButton>
                <ToggleButton value="SMALLGRID" aria-label="smallModule">
                  <ViewCompactIcon fontSize="small" sx={{ marginTop: '1px' }} />
                </ToggleButton>
                <ToggleButton value="LIST" aria-label="list">
                  <ViewListIcon fontSize="small" sx={{ marginTop: '1px' }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
