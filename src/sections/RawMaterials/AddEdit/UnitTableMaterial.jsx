import { sentenceCase } from 'change-case';
import { filter, get, isBoolean, isEmpty } from 'lodash';
import { useState } from 'react';
// @mui
import { Divider, Stack, TableCell, TableRow, Typography } from '@mui/material';
// components
// sections
// mock
import { useRecoilState, useRecoilValue } from 'recoil';
import { ROLES_WITHOUT_STORE_STAFF } from 'src/constants/AppConstants';
import { allAddons, allConfiguration, allProducts, currentProduct } from 'src/global/recoilState';
// @mui
import { useTheme } from '@mui/material';
// components
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { useNavigate } from 'react-router';
import KebabMenu from 'src/components/KebabMenu';
import VegNonIcon from 'src/components/VegNonIcon';
import AuthService from 'src/services/authService';
import { formatAmountToIndianCurrency } from 'src/utils/formatNumber';
import { formatDate } from 'src/utils/formatTime';

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

export default function UnitTableMaterial({
  row,
  setUnitsList,
  reset,
  setAddAndEditUnitDetails,
  setFilledProductData,
  values,
}) {
  const isMobile = useMediaQuery('(max-width:600px');
  const theme = useTheme();
  const navigate = useNavigate();
  const [currentProductData, setCurrentProduct] = useRecoilState(currentProduct);
  const [allProductsWithUnits, setAllProductsWithUnits] = useRecoilState(allProducts);
  const [addonList, setAddonList] = useRecoilState(allAddons);
  // const sorted = sortArray(allProductsWithUnits, getComparator(order, orderBy));

  const configuration = useRecoilValue(allConfiguration);
  const counterSettings = get(configuration, 'counterSettings', {});
  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false);

  const { productId, name, category, stockQuantity, unitName, batchId, batchInfo, id, variant } =
    row || {};

  const { manufactureDate: mfgDate, expiryDate: expDate } = batchInfo || {};

  const currentRole = AuthService.getCurrentRoleInLocal();

  const [isHover, setIsHover] = useState(false);
  // const selectedUser = selected.indexOf(productId) !== -1;

  const [openMenu, setOpenMenuActions] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const mouseEnterFunction = () => {
    setIsHover(true);
  };

  const mouseLeaveFunction = () => {
    setIsHover(false);
  };

  return (
    <TableRow
      onMouseEnter={mouseEnterFunction}
      onMouseLeave={mouseLeaveFunction}
      hover
      key={productId}
      tabIndex={-1}
      role="checkbox"
      sx={{ backgroundColor: isHover ? '#F4F6F8' : 'white' }}
    >
      <TableCell
        align="left"
        sx={{
          position: isMobile ? 'static' : 'sticky',
          left: 0,
          backgroundColor: isHover ? '#F4F6F8' : 'white',
          zIndex: 95,
        }}
      >
        <Typography variant="subtitle2" noWrap>
          {name}
        </Typography>
      </TableCell>
      <TableCell align="left">{productId}</TableCell>
      <TableCell align="left">{variant}</TableCell>
      <TableCell align="left">{batchId || '-'}</TableCell>
      <TableCell align="left">{sentenceCase(category ? category : '')}</TableCell>

      <TableCell align={'right'}>{stockQuantity}</TableCell>
      <TableCell align="left">{unitName || '-'}</TableCell>
      <TableCell align="left">{formatDate(mfgDate) || '-'}</TableCell>
      <TableCell align="left">{formatDate(expDate) || '-'}</TableCell>
      <TableCell
        align="left"
        sx={{
          position: isMobile ? 'static' : 'sticky',
          right: 0,
          backgroundColor: isHover ? '#F4F6F8' : 'white',
          zIndex: 95,
        }}
      >
        <KebabMenu
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          actions={
            <>
              <Stack
                sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  handleCloseMenu();
                  setFilledProductData(values);
                  setAddAndEditUnitDetails({ status: true, data: row });
                  setTimeout(() => {
                    reset(row);
                  }, 0);
                }}
              >
                <EditIcon sx={{ fontSize: { xs: '18px', sm: '22px' } }} />
                Edit
              </Stack>

              <Divider sx={{ borderStyle: 'dashed', my: { xs: 0.5, sm: 1 } }} />
              <Stack
                onClick={() => {
                  handleCloseMenu();
                  setUnitsList((prev) => {
                    return filter(prev, (_item) => _item?.id !== id);
                  });
                }}
                sx={{
                  color: 'error.main',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                }}
              >
                <DeleteOutlineIcon
                  sx={{
                    fontSize: { xs: '18px', sm: '22px' },
                  }}
                />
                Delete
              </Stack>
            </>
          }
        />
      </TableCell>
    </TableRow>
  );
}
