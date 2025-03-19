import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { map } from 'lodash';
import React from 'react';
import GstTableRow from './GstTableRow';

const TableGst = ({ headers, data }) => {
  const theme = useTheme();

  return (
    <TableContainer className="step5" component={Paper} sx={{ height: '80%' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow
            sx={{
              '& .MuiTableCell-head': {
                background: theme.palette.primary.lighter,
              },
            }}
          >
            <>
              {map(headers, (e, index) => (
                <TableCell
                  sx={{ minWidth: '7rem', color: theme.palette.primary.main }}
                  align={index === 0 ? 'left' : 'center'}
                >
                  {e}
                </TableCell>
              ))}
              <TableCell sx={{ minWidth: '7rem' }} align="center"></TableCell>
            </>
          </TableRow>
        </TableHead>
        <TableBody>
          {map(data, (row) => (
            <GstTableRow row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableGst;
