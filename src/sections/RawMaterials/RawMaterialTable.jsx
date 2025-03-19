import { sentenceCase } from 'change-case';
import { get, isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
// @mui
import {
  Box,
  Checkbox,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Typography,
  Tooltip,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
// sections
// mock
import { useRecoilState, useRecoilValue } from 'recoil';
import { StatusConstants } from 'src/constants/AppConstants';
import { base64_images } from 'src/constants/ImageConstants';
import { allAddons, allConfiguration, allProducts, currentProduct } from 'src/global/recoilState';
// @mui
import { useTheme } from '@mui/material';
// components
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import DatasetLinkedIcon from '@mui/icons-material/DatasetLinked';
import DatasetIcon from '@mui/icons-material/Dataset';
import { find } from 'lodash';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import AuthService from '../../services/authService';
import { formatDate } from 'src/utils/formatTime';
import { toFixedIfNecessary } from 'src/utils/formatNumber';

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

export default function RawMaterialTable({
  row,
  selected,
  setOpen,
  setSelected,
  order,
  orderBy,
  setOpenProductsDialog,
}) {
  const isMobile = useMediaQuery('(max-width:600px');

  const {
    productId,

    name,
    productImage,
    category,
    stockQuantity,
    unitName,
    status,
    batchId,
    rawValue,
    productInfo,
    StockAlert,
    rawIng,
  } = row;

  const { mfgDate, expDate } = get(productInfo, 'batchInfo', {}) || {};
  const [isHover, setIsHover] = useState(false);
  const theme = useTheme();
  const [currentProductData, setCurrentProduct] = useRecoilState(currentProduct);

  const selectedUser = selected.indexOf(productId) !== -1;

  const mouseEnterFunction = () => {
    setIsHover(true);
  };

  const mouseLeaveFunction = () => {
    setIsHover(false);
  };

  const handleOpenProductsDialog = async (e) => {
    setCurrentProduct(e);
    setOpenProductsDialog(true);
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
          pr: 3,
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
        <Typography variant="subtitle2" noWrap>
          {name}
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
        </Typography>
      </TableCell>
      <TableCell align={'right'}>
        {stockQuantity ? toFixedIfNecessary(stockQuantity, 2) : '-'}
      </TableCell>
      <TableCell align="left">{sentenceCase(category ? category : '')}</TableCell>
      <TableCell align="left">
        <Typography sx={{ fontSize: '14px', display: 'flex', flexDirection: 'row' }}>
          {unitName || '-'}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Tooltip title={`Click to view linked product`}>
          <IconButton
            sx={{ mr: 1, color: theme.palette.primary.main, width: 35, height: 35 }}
            onClick={() => handleOpenProductsDialog(row)}
          >
            {rawIng?.[0]?.rawIngredients?.length ? (
              <div style={{ position: 'relative' }}>
                <DatasetLinkedIcon />
                <div
                  style={{
                    position: 'absolute',
                    top: -3,
                    left: 19,
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
                <DatasetIcon sx={{ color: '#0a0808' }} />
              </Stack>
            )}
          </IconButton>
        </Tooltip>
      </TableCell>
      <TableCell align="left">{productId}</TableCell>
      <TableCell align="left">{batchId || '-'}</TableCell>

      <TableCell align={StockAlert ? 'right' : 'left'}>
        {StockAlert ? StockAlert.count : '⚠️Low stock not enabled'}
      </TableCell>
      <TableCell align="left">
        {toFixedIfNecessary(get(row, 'unitAverageValue', 0) * get(row, 'stockQuantity', 0), 2)}
      </TableCell>
      <TableCell align="left">
        {toFixedIfNecessary(get(row, 'unitAverageValue', 0) || 0, 4)}
      </TableCell>
      <TableCell align="left">{mfgDate ? formatDate(mfgDate) : '-'}</TableCell>
      <TableCell align="left">{expDate ? formatDate(expDate) : '-'}</TableCell>
      <TableCell component="th" scope="row" padding="none" sx={{ pr: 2 }}>
        <TableCell align="left"></TableCell>
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
        </Box>
      </TableCell>
    </TableRow>
  );
}
