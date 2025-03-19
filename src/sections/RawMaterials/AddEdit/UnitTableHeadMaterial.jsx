import PropTypes from 'prop-types';
// @mui
import {
  Box,
  Checkbox,
  TableRow,
  TableCell,
  TableHead,
  TableSortLabel,
  useTheme,
} from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';

// ----------------------------------------------------------------------

export default function UnitTableHeadMaterial({ headLabel }) {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px');

  return (
    <TableHead sx={{ marginLeft: '4px !important' }}>
      <TableRow
        sx={{
          '& .MuiTableCell-head': {
            background: theme.palette.primary.lighter,
            color: theme.palette.primary.main,
          },
        }}
      >
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            sx={{ ...headCell.style, position: isMobile ? 'static' : headCell.style?.position }}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
