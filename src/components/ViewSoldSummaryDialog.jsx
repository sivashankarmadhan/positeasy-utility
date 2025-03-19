import {
  Card,
  Dialog,
  Stack,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material';
import { get, map } from 'lodash';
import React from 'react';
import { hideScrollbar } from 'src/constants/AppConstants';
import CloseIcon from '@mui/icons-material/Close';

const ViewSoldSummaryDialog = ({ isOpen, onClose, data }) => {
  return (
    <Dialog open={isOpen}>
      <Card
        sx={{
          p: 2,
          width: { xs: '100%', sm: 450, md: 600, lg: 800 },
          maxWidth: '100%',
        }}
      >
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            Sold summary list
          </Typography>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Stack>

        <TableContainer style={{ maxHeight: 400, ...hideScrollbar }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ced4da',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ced4da',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Category
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ced4da',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sold Quantity
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ced4da',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Unit Price (₹)
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ced4da',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Total Price (₹)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {map(data?.soldSummary, (_item) => {
                return (
                  <TableRow sx={{ borderBottom: '1px solid #ced4da' }}>
                    <TableCell align="left">{get(_item, 'Name')}</TableCell>
                    <TableCell align="left">
                      <Chip
                        size="small"
                        color={'success'}
                        sx={{
                          fontSize: '11px',
                          fontWeight: 600,
                          '&.MuiChip-root': { borderRadius: '4px' },
                        }}
                        label={get(_item, 'Category')}
                      />
                    </TableCell>
                    <TableCell align="left">{get(_item, 'TotalQuantity')}</TableCell>
                    <TableCell align="left">{get(_item, 'UnitPrice')}</TableCell>
                    <TableCell align="left">{get(_item, 'TotalPrice')}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Dialog>
  );
};

export default ViewSoldSummaryDialog;
