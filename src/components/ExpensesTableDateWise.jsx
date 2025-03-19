import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { get } from 'lodash';
import map from 'lodash/map';

export default function ExpensesTableDateWise({ expenseDatewise, date }) {
  const theme = useTheme();
  return (
    <TableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableRow
            sx={{
              '& .MuiTableCell-head': {
                background: theme.palette.primary.main,
                color: theme.palette.common.white,
              },
            }}
          >
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">Date</TableCell>
            <TableCell align="center">Amount</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {map(get(expenseDatewise, 'groupData'), (row, index) => (
            <TableRow key={index}>
              <TableCell> {row.name?.toUpperCase()} </TableCell>
              <TableCell align="center">{date}</TableCell>
              <TableCell align="center">{row.amountSpent}</TableCell>
              <TableCell align="center">
                <Button size="small" variant="outlined">
                  view
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
