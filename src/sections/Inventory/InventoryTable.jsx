import { sentenceCase } from 'change-case';
import { get, isBoolean, isEmpty, map, truncate } from 'lodash';
import { useEffect, useState } from 'react';
// @mui
import {
  Box,
  Checkbox,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  MenuItem,
  Divider,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
// sections
// mock
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  defaultOrderTypes,
  ROLES_WITHOUT_STORE_STAFF,
  StatusConstants,
} from 'src/constants/AppConstants';
import { base64_images } from 'src/constants/ImageConstants';
import { allAddons, allConfiguration, allProducts, currentProduct } from 'src/global/recoilState';
// @mui
import { useTheme } from '@mui/material';
// components
import ExtensionIcon from '@mui/icons-material/Extension';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { find } from 'lodash';
import { useNavigate } from 'react-router';
import VegNonIcon from 'src/components/VegNonIcon';
import { PATH_DASHBOARD } from 'src/routes/paths';
import AuthService from '../../services/authService';
import { formatAmountToIndianCurrency } from '../../utils/formatNumber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import FilterPopOver from 'src/layouts/dashboard/header/FilterPopOver';
import DatasetLinkedIcon from '@mui/icons-material/DatasetLinked';
import DatasetIcon from '@mui/icons-material/Dataset';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatOrderTypeDataStrucutre } from 'src/utils/formatOrderTypeDataStrucutre';
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function sortArray(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function InventoryTable({
  row,
  setIsView,
  setCurrentProductAddon,
  setAddonOpenDialog,
  selected,
  setOpen,
  setSelected,
  order,
  orderBy,
  setOpenGenerateQR,
  countersList,
  setOpenIngredientsDialog,
}) {
  const isMobile = useMediaQuery('(max-width:600px');
  const theme = useTheme();
  const navigate = useNavigate();
  const [currentProductData, setCurrentProduct] = useRecoilState(currentProduct);
  const [allProductsWithUnits, setAllProductsWithUnits] = useRecoilState(allProducts);
  const [addonList, setAddonList] = useRecoilState(allAddons);
  const sorted = sortArray(allProductsWithUnits, getComparator(order, orderBy));

  const configuration = useRecoilValue(allConfiguration);
  const counterSettings = get(configuration, 'counterSettings', {});
  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false);
  const isShowMRP = get(configuration, 'featureSettings.isMRP', false);
  const isOrderTypeEnable = get(configuration, 'isOrderType.isActive', false);
  const previouseOrderTypeList = get(configuration, 'isOrderType.orderTypes', defaultOrderTypes);
  const orderTypesList = formatOrderTypeDataStrucutre(previouseOrderTypeList);
  const {
    merchantId,
    storeId,
    productId,
    shortCode,
    name,
    description,
    basePrice,
    price,
    productImage,
    category,
    tag,
    attributes,
    discount,
    offerPrice,
    parcelCharges,
    stockMonitor,
    stockQuantity,
    unitsEnabled,
    unit,
    unitName,
    counter,
    GSTPercent,
    GSTInc,
    status,
    counterId,
    createdAt,
    updatedAt,
    addOn,
    sessionInfo,
    rawIng,
    StockAlert,
  } = row;

  const currentRole = AuthService.getCurrentRoleInLocal();

  const [isHover, setIsHover] = useState(false);
  const selectedUser =  !isEmpty(selected) ? selected.indexOf(productId) !== -1 : false ;
  
  const mouseEnterFunction = () => {
    setIsHover(true);
  };

  const mouseLeaveFunction = () => {
    setIsHover(false);
  };
  const handleOpenIngredientsDialog = async (e) => {
    setCurrentProduct(e);
    setOpenIngredientsDialog(true);
  };
  const handleOpenAddonDialog = (e) => {
    if (isEmpty(addonList)) {
      navigate(PATH_DASHBOARD.inventory.addon, { replace: true });
    } else if (!isEmpty(addonList)) {
      const addOnData = find(allProductsWithUnits, (d) => d.productId === e.productId);
      setAddonOpenDialog(true);
      setCurrentProductAddon(get(addOnData, 'addOn', []));
      setCurrentProduct(e);
    }
  };

  const handleOpenMenu = (event, product) => {
    setOpen({ open: true, eventData: event.currentTarget, data: product });
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };
  const getCounterLabel = (counterId) => {
    const counter = find(countersList, (e) => get(e, 'counterId') === counterId);
    return get(counter, 'name', '-');
  };
  useEffect(() => {}, [selectedUser]);
  return (
    <TableRow
      onMouseEnter={mouseEnterFunction}
      onMouseLeave={mouseLeaveFunction}
      hover
      key={productId}
      tabIndex={-1}
      role="checkbox"
      selected={selectedUser}
    >
      <TableCell
        padding="checkbox"
        sx={{
          position: 'sticky',
          left: 0,
          backgroundColor: isHover ? '#F4F6F8' : 'white',
          zIndex: 95,
        }}
      >
        <Stack sx={{ display: 'flex', flexDirection: 'row' }}>
          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, productId)} />
          <IconButton size="large" color="inherit" onClick={(event) => handleOpenMenu(event, row)}>
            <Iconify icon={'eva:more-vertical-fill'} />
          </IconButton>
        </Stack>
      </TableCell>
      <TableCell
        align="left"
        sx={{
          position: isMobile ? 'static' : 'sticky',
          left: 80,
          backgroundColor: isHover ? '#F6F7F8' : 'white',
          zIndex: 95,
        }}
      >
        {tag && (
          <Label
            sx={{
              mb: 0.5,
              height: 15,
              fontSize: '8px',
              backgroundColor: tag ? '#FF563029' : isHover ? '#F6F7F8' : 'white',
              color: tag ? '#B71D18' : '#fff',
            }}
          >
            {tag}
          </Label>
        )}
        <Typography variant="subtitle2" noWrap>
          {truncate(name)}
          <Label
            sx={{ ml: 2 }}
            color={
              (status === StatusConstants.INACTIVE && 'error') ||
              (status === StatusConstants.ACTIVE && 'success') ||
              'warning'
            }
          >
            {status && sentenceCase(status)}
          </Label>
          {!isEmpty(attributes) && (
            <FilterPopOver
              IconStyle={{
                width: 25,
                height: 25,
                '& .css-1rhksjl-MuiSvgIcon-root': {
                  fontSize: '20px',
                },
              }}
              IconChildren={
                <InfoOutlinedIcon
                  sx={{
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                />
              }
              sx={{ overflow: 'hidden' }}
            >
              <Typography sx={{ fontWeight: 'bold', pt: 1, pl: 1 }}>Info</Typography>
              {get(attributes, 'HSNorSACCode') && (
                <MenuItem>
                  <Stack
                    flexDirection={'column'}
                    sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
                  >
                    <Typography variant="caption" flexWrap={true}>
                      HSN or SAC Code
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                      {get(attributes, 'HSNorSACCode') || '-'}
                    </Typography>
                  </Stack>
                </MenuItem>
              )}

              <Divider />

              {get(attributes, 'mrp') && (
                <MenuItem>
                  <Stack
                    flexDirection={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
                  >
                    <Typography variant="caption">MRP :</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                      {get(attributes, 'mrp') || '-'}
                    </Typography>
                  </Stack>
                </MenuItem>
              )}
              <Divider />

              {typeof get(attributes, 'isVeg') === 'boolean' && (
                <MenuItem>
                  <Stack
                    flexDirection={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
                  >
                    <Typography variant="caption">Vegetarian :</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                      {get(attributes, 'isVeg') ? 'Yes' : 'No' || '-'}
                    </Typography>
                  </Stack>
                </MenuItem>
              )}
            </FilterPopOver>
          )}
        </Typography>{' '}
      </TableCell>
      <TableCell align={stockMonitor ? 'right' : 'left'}>
        {stockMonitor ? stockQuantity : '⚠️Monitoring not enabled'}
      </TableCell>
      <TableCell align="left">{formatAmountToIndianCurrency(price)}</TableCell>
      {ROLES_WITHOUT_STORE_STAFF.includes(currentRole) && (
        <TableCell align="left">{formatAmountToIndianCurrency(basePrice) || 0}</TableCell>
      )}
      <TableCell align="left">
        {GSTPercent || 0}
        {!!isBoolean(GSTInc) ? (!!GSTInc ? '(inclusive)' : '(exclusive)') : ''}
      </TableCell>{' '}
      {isShowMRP && <TableCell align="left">{get(attributes, 'mrp', '-')}</TableCell>}
      <TableCell align="left">{discount || 0}</TableCell>
      <TableCell align="left">{formatAmountToIndianCurrency(offerPrice)}</TableCell>
      <TableCell align="left">
        {parcelCharges ? formatAmountToIndianCurrency(parcelCharges) : 0}
      </TableCell>{' '}
      <TableCell align="left">{sentenceCase(category ? category : '')}</TableCell>
      <TableCell align="left">{row?.priceVariants?.memberPrice || '-'}</TableCell>
      {isOrderTypeEnable &&
        map(orderTypesList, (e) => {
          if (!defaultOrderTypes.includes(e))
            return <TableCell align="left">{get(row, `priceVariants.${e}`) || '-'}</TableCell>;
        })}
      {isCountersEnabled && <TableCell align="left">{getCounterLabel(counterId) || '-'}</TableCell>}
      <TableCell align={StockAlert ? 'right' : 'left'}>
        {StockAlert ? StockAlert.count : '⚠️Low stock not enabled'}
      </TableCell>
      <TableCell align="left">
        {description ? (
          <FilterPopOver
            IconStyle={{
              mt: 0.5,
              pb: 0.1,
              width: 25,
              height: 25,
              '& .css-1rhksjl-MuiSvgIcon-root': {
                pb: 0.4,
                fontSize: '20px',
              },
            }}
            IconChildren={
              <DescriptionIcon
                sx={{
                  color: theme.palette.primary.main,
                  cursor: 'pointer',
                  fontSize: '18px',
                  mt: 0.5,
                }}
              />
            }
            sx={{ overflow: 'hidden' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'start', p: 2 }}>{description}</Box>
          </FilterPopOver>
        ) : (
          ''
        )}
      </TableCell>
      <TableCell align="left">
        {get(sessionInfo, 'isSessionEnabled') ? <AccessTimeIcon /> : `-`}
      </TableCell>
      <TableCell align="left">
        <Tooltip
          title={`Click to ${rawIng?.[0]?.rawIngredients?.length ? 'view' : 'add'} ingredients`}
        >
          <IconButton
            sx={{ mr: 1, color: theme.palette.primary.main, width: 35, height: 35 }}
            onClick={() => handleOpenIngredientsDialog(row)}
          >
            {rawIng?.[0]?.rawIngredients?.length ? (
              <div style={{ position: 'relative' }}>
                <DatasetLinkedIcon />
                <div
                  style={{
                    position: 'absolute',
                    top: -3,
                    left: 15,
                    backgroundColor: theme.palette.success.main,
                    borderRadius: 20,
                    height: 15,
                    width: 15,
                    color: theme.palette.common.white,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 'bolder' }}>
                    {rawIng?.[0]?.rawIngredients?.length}
                  </Typography>
                </div>
              </div>
            ) : (
              <Stack sx={{ position: 'relative' }}>
                <DatasetIcon sx={{ color: '#C4CDD5' }} />
                <AddIcon
                  strokeWidth={2}
                  sx={{ position: 'absolute', bottom: -5, left: 9, fontSize: 20 }}
                />
              </Stack>
            )}
          </IconButton>
        </Tooltip>
      </TableCell>
      <TableCell align="left">{productId}</TableCell>
      <TableCell component="th" scope="row" padding="none" sx={{ pr: 2 }}>
        <Box
          sx={{
            position: 'relative',
          }}
        >
          <Box
            component="img"
            alt={name}
            src={productImage ? productImage : base64_images.Custom_No_Image}
            sx={{
              minWidth: 60,
              width: 54,
              height: 59,
              borderRadius: 1,
              flexShrink: 0,
            }}
          />
          <Box style={{ position: 'absolute', top: 34, left: 45 }}>
            {!isEmpty(attributes) && (
              <VegNonIcon
                text={get(attributes, 'isVeg')}
                firstIconStyle={{ fontSize: '13px' }}
                circleIconStyle={{ fontSize: '5px', left: 4, top: 4 }}
              />
            )}
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
}
