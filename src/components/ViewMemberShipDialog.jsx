import {
  Button,
  Card,
  Dialog,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { filter, get, isEmpty, map, some } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentStoreId,
  currentTerminalId,
  terminalConfigurationState,
} from '../global/recoilState';
import CloseIcon from '@mui/icons-material/Close';
import { MembershipTableColumns } from 'src/constants/AppConstants';
import STORES_API from 'src/services/stores';

export default function ViewMemberShipDialog(props) {
  const { open, handleClose, initialFetch, scanQrDetails } = props;
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const ALL = 'all';
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px');

  const [memberList, setMemberList] = useState([]);
  const [totalRowCount, setTotalRowCount] = useState([]);


  const getProductCounterList = async () => {

    try {
      setLoading(true);
      const response = await STORES_API.getMembershipCustomer({
        storeId: currentStore,
        page: page +1,
        size: rowsPerPage,
        contactNumber: ''
      });
      if (response) {
         setMemberList(response.data);
         setTotalRowCount(get(response, 'data.totalItems', 0));

      }
    } catch (e) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };


  useEffect(() => {
    if (currentStore && currentTerminal) getProductCounterList();
  }, [currentStore, currentTerminal, page, rowsPerPage, totalRowCount]);

  return (
    <Dialog open={open}>
      <Card
        sx={{
          p: 2,
          width: '100%',
          minHeight: 300,
          maxHeight: '100%',
          overflowY: 'scroll',
        }}
      >
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ pb: 2 }}>
            All Membership Customers
          </Typography>

          <CloseIcon onClick={handleClose} sx={{ cursor: 'pointer' }} />
        </Stack>
        <Stack>
          <TableContainer
            sx={{
              width: '100%',
              maxHeight: isMobile ? 640 : 640,
              minHeight: isMobile ? 640 : 640,
            }}
          >
            <Table stickyHeader>
              <TableHead sx={{ marginLeft: '4px !important' }}>
                <TableRow
                  sx={{
                    '& .MuiTableCell-head': {
                      background: theme.palette.primary.lighter,
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {MembershipTableColumns.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.alignRight ? 'right' : 'left'}
                      sx={{
                        ...headCell.style,
                        position: isMobile ? 'static' : headCell.style?.position,
                        fontSize: '14px',
                      }}
                    >
                      {headCell.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {map(memberList?.data, (row) => {
                  const formattedDateOfSubscription = new Date(row?.dateOfSubscription).toISOString().split("T")[0];
                  const formattedDateOfNextRenewal = new Date(row?.nextRenewal).toISOString().split("T")[0];

                  return (
                    <TableRow
                    >
                      <TableCell align="left">{row?.name ? row?.name : '-'}</TableCell>
                      <TableCell align="left">{row?.contactNumber ? row?.contactNumber : '-'}</TableCell>
                      <TableCell align="left">{row?.dateOfSubscription ? formattedDateOfSubscription : '-'}</TableCell>
                      <TableCell align="left">{row?.nextRenewal ? formattedDateOfNextRenewal : '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            
                
            </Table>
            <TablePagination
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              '& .MuiTablePagination-actions': {
              },
            }}
            labelRowsPerPage=""
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalRowCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          </TableContainer>
        </Stack>
      </Card>
    </Dialog>
  );
}
