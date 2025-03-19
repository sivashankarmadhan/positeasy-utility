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
import Checkbox from '@mui/material/Checkbox';
import { isEmpty, map } from 'lodash';

function QRInventoryPreview({ data }) {
  const theme = useTheme();
  const headers = [
    'Name',
    'Category',
    'Description',
    'Price',
    'Counter',
    'Tag',
    'Veg',
    'Image',
    'IsUnitEnabled',
    '-',
  ];

  return (
    <>
      {!isEmpty(data) && (
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
                  {map(headers, (e, index) => (
                    <TableCell sx={{ minWidth: '7rem', color: theme.palette.primary.main }}>
                      {e}
                    </TableCell>
                  ))}
                </>
              </TableRow>
            </TableHead>
            <TableBody>
              {map(data, (d, index) => {
                return (
                  <TableRow>
                    {map(d, (e, key) => (
                      <TableCell>
                        {key !== 'productImage' ? (
                          key === 'unitsEnabled' ? (
                            e ? (
                              'Enabled'
                            ) : (
                              'Disabled'
                            )
                          ) : key === 'isVeg' ? (
                            e ? (
                              'Veg'
                            ) : (
                              'Non-Veg'
                            )
                          ) : (
                            e
                          )
                        ) : (
                          <img
                            style={{ height: 80, width: 140, objectFit: 'cover' }}
                            src={e}
                            alt={e}
                          />
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

export default QRInventoryPreview;
