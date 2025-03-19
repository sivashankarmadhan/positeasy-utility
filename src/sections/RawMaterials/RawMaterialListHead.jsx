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
import { map } from 'lodash';

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

RawMaterialListHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  rowCount: PropTypes.number,
  headLabel: PropTypes.array,
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func,
  onSelectAllClick: PropTypes.func,
};

export default function RawMaterialListHead({
  order,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onRequestSort,
  onSelectAllClick,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px');

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

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
        <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, zIndex: 99 }}>
          <Checkbox
            className="inventoryStep7"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {map(headLabel, (headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ ...headCell.style, position: isMobile ? 'static' : headCell.style?.position }}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
