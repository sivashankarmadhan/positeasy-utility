import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  useTheme,
} from '@mui/material';
import { get, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import { ExcelRenderer } from 'react-excel-renderer';
import ProductLoader from './ProductLoader';

function ExcelPreview({ file, data, setData }) {
  const theme = useTheme();
  const isCsv = get(file, 'type')?.includes('csv');
  const [loading, setLoading] = useState(false);
  const [displayedData, setDisplayedData] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const totalRowCount = isEmpty(data) ? 0 : data?.length;

  const isSinglePage = rowsPerPage >= totalRowCount;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handlePagination = () => {
    if (isEmpty(data)) return [];

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return data?.slice(startIndex, endIndex);
  };
  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };
  const handleRender = async () => {
    try {
      setLoading(true);
      if (file) {
        await ExcelRenderer(file, (err, resp) => {
          if (err) {
            console.log(err);
          } else {
            setData(resp.rows);
          }
        });
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    const paginatedData = handlePagination();
    setDisplayedData(paginatedData);
  }, [data, page, rowsPerPage]);
  useEffect(() => {
    handleRender();
  }, [file]);

  return (
    <>
      {loading && <ProductLoader />}
      {data && !loading && (
        <TableContainer component={Paper} sx={{ height: '90%' }}>
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
                  {map(displayedData[0], (e, index) => (
                    <TableCell sx={{ minWidth: '7rem', color: theme.palette.primary.main }}>
                      {index}
                    </TableCell>
                  ))}
                </>
              </TableRow>
            </TableHead>
            <TableBody>
              {map(displayedData, (d, index) => {
                return (
                  <>
                    {d && (
                      <TableRow>
                        {map(d, (e) => (
                          <TableCell>{e}</TableCell>
                        ))}
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TablePagination
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          '& .MuiTablePagination-actions': {
            display: isSinglePage ? 'none' : 'block',
          },
        }}
        labelRowsPerPage=""
        rowsPerPageOptions={[10, 25, 50, 100, 250, 500]}
        component="div"
        showFirstButton
        showLastButton
        count={totalRowCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      ;
    </>
  );
}

export default ExcelPreview;
