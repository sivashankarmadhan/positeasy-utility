import { Chip, TableCell, TableRow, Typography, useTheme, Stack } from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { isEmpty, map } from 'lodash';
import { useState, useEffect } from 'react';
import DrawerTransaction from './DrawerTransactionOrder';
import { PaymentStatusConstants } from 'src/constants/AppConstants';
import ExtensionIcon from '@mui/icons-material/Extension';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { fCurrency } from 'src/utils/formatNumber';
import { convertToRupee } from 'src/helper/ConvertPrice';
import HtmlTooltip from './HtmlTooltip';
import statusColor from 'src/utils/statusColor';

export default function OrderTableRow({ row, allData }) {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {!isEmpty(row) && (
        <>
          <TableRow key={row.orderId}>
            <TableCell align="center"> {row.orderId} </TableCell>
            <TableCell align="center">
              <Stack spacing={1} direction="row" justifyContent={'center'}>
                <Typography>
                  {row.name}
                  {row.unit && (
                    <Typography sx={{ display: 'inline' }} variant="caption">
                      {` (${row.unit}${row.unitName})`}
                    </Typography>
                  )}
                </Typography>
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <Typography color="inherit" fontWeight={'bold'}>
                        Add-ons
                      </Typography>
                      {!isEmpty(row.addOns) &&
                        map(row.addOns, (e) => {
                          return (
                            <Typography sx={{ fontSize: '10px' }}>
                              x{e.quantity} {e.name}{' '}
                              {fCurrency(convertToRupee(e.price) * e.quantity)}
                            </Typography>
                          );
                        })}
                    </React.Fragment>
                  }
                >
                  <ExtensionIcon
                    sx={{
                      color: !isEmpty(row.addOns)
                        ? theme.palette.success.dark
                        : theme.palette.grey[500],
                      fontSize: '20px',
                      visibility: !isEmpty(row.addOns) ? 'visible' : 'hidden',
                    }}
                  />
                </HtmlTooltip>
              </Stack>
            </TableCell>
            <TableCell align="center"> {row.category} </TableCell>
            <TableCell align="center">{row.quantity}</TableCell>
            <TableCell align="center">{row.price / 100}</TableCell>
            <TableCell align="center">{(row.price / 100) * row.quantity}</TableCell>
            <TableCell align="center">
              <Chip
                size="small"
                color={statusColor(row.orderStatus)}
                sx={{
                  fontSize: '11px',
                  fontWeight: 600,
                  '&.MuiChip-root': { borderRadius: '4px' },
                }}
                label={`${row.orderStatus}`}
              />
            </TableCell>
            <TableCell align="center">
              <Chip
                size="small"
                onClick={handleOpen}
                variant="outlined"
                color="info"
                label="View Details"
                sx={{ cursor: 'pointer' }}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <DrawerTransaction
              handleOpen={handleOpen}
              open={open}
              handleClose={handleClose}
              row={row}
            />
          </TableRow>
        </>
      )}
    </>
  );
}