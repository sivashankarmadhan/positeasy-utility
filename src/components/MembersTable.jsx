import { Table, TableBody, TableCell, TableHead, TableRow, styled, useTheme } from '@mui/material';
import { map } from 'lodash';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& .MuiTableCell-head': {
    color: theme.palette.common.white,
    lineHeight: '8px',
    background: theme.palette.primary.main,
  },
}));
export default function MembersTable(props) {
  const { memberData } = props;
  const theme = useTheme();

  const headers = ['S.no', 'Name', 'Email', 'Contact No.', 'Status'];
  return (
    <Table stickyHeader sx={{ borderColor: theme.palette.primary.main }}>
      <TableHead>
        <StyledTableRow>
          {map(headers, (e) => (
            <TableCell align="center">{e}</TableCell>
          ))}
        </StyledTableRow>
      </TableHead>
      <TableBody>
        {map(memberData, (e, index) => (
          <TableRow>
            <TableCell align="center"> {index + 1} </TableCell>
            <TableCell align="center">{e.name}</TableCell>
            <TableCell align="center">{e.email}</TableCell>
            <TableCell align="center">{e.contactNumber}</TableCell>
            <TableCell align="center">{e.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
