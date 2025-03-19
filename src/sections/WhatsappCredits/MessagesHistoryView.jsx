import {
  Divider,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { get } from 'lodash';
import React, { useState } from 'react';
import Label from 'src/components/label';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import { fDatesWithTimeStampWithDayjs } from 'src/utils/formatTime';
import DescriptionIcon from '@mui/icons-material/Description';
import OrderDetailsDialog from './OrderDetailsDialog';
// import KebabMenu from 'src/components/KebabMenu';
// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
// import EditIcon from '@mui/icons-material/Edit';
// import SettingServices from 'src/services/API/SettingServices';
// import { SuccessConstants } from 'src/constants/SuccessConstants';
// import toast from 'react-hot-toast';
// import ViewMoreDrawer from 'src/sections/Customer/ViewMoreDrawer';
// import WysiwygIcon from '@mui/icons-material/Wysiwyg';
// import PRODUCTS_API from 'src/services/products';
// import Label from '../components/label';
// import { formatAmountToIndianCurrency } from '../utils/formatNumber';
// import { convertToRupee } from '../helper/ConvertPrice';

export default function MessagesHistoryView({ _item }) {
  const theme = useTheme();

  const [isOpenOrderDetailsDialog, setIsOpenOrderDetailsDialog] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell align="left">#{get(_item, 'orderId')}</TableCell>
        <TableCell align="left">{fDatesWithTimeStampWithDayjs(get(_item, 'date'))}</TableCell>
        <TableCell align="left">
          <IconButton onClick={() => setIsOpenOrderDetailsDialog(true)}>
            <DescriptionIcon sx={{ color: theme.palette.primary.main, width: 25, height: 25 }} />
          </IconButton>
          {get(_item, 'orderDetails')}
        </TableCell>
        <TableCell align="left">
          {fDatesWithTimeStampWithDayjs(get(_item, 'deliveryDate'))}
        </TableCell>
        <TableCell align="left">
          ₹ {toFixedIfNecessary(get(_item, 'orderedAmount') / 100, 2) || '--'}
        </TableCell>
        <TableCell align="left">
          {
            <Label
              color={get(_item, 'messageStatus') === 'COMPLETED' ? 'success' : 'error'}
              sx={{ fontSize: '10px', fontWeight: 'bold' }}
            >
              {get(_item, 'messageStatus') === 'COMPLETED' ? 'Message Sent' : 'Message Failed'}
            </Label>
          }
        </TableCell>
      </TableRow>
      {isOpenOrderDetailsDialog && (
        <OrderDetailsDialog
          open={isOpenOrderDetailsDialog}
          onClose={() => {
            setIsOpenOrderDetailsDialog(false);
          }}
        />
      )}
    </>
  );
}
