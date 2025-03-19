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
  useMediaQuery,
} from '@mui/material';

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

AddonListHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  rowCount: PropTypes.number,
  headLabel: PropTypes.array,
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func,
  onSelectAllClick: PropTypes.func,
};

export default function AddonListHead({
  order,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onRequestSort,
  onSelectAllClick,
}) {
  const theme = useTheme();
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  const isMobile = useMediaQuery('(max-width:600px');

  return (
    <TableHead>
      <TableRow
        sx={{
          '& .MuiTableCell-head': {
            background: theme.palette.primary.lighter,
            color: theme.palette.primary.main,
          },
        }}
      >
        <TableCell
          padding="checkbox"
          sx={{ position: isMobile ? 'static' : 'sticky', left: 0, zIndex: 99 }}
        >
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={numSelected > 0}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ ...headCell.style }}
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
