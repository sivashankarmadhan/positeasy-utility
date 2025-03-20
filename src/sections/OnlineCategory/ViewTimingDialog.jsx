import {
  Card,
  Dialog,
  IconButton,
  Stack,
  Typography,
  useTheme,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { get, map } from 'lodash';
import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AuthService from 'src/services/authService';
import { ALL_CONSTANT, USER_AGENTS } from 'src/constants/AppConstants';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { generateFilename } from 'src/helper/generateFilename';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import PRODUCTS_API from 'src/services/products';
import convertTo12Hour from 'src/utils/convertTo12Hour';

const ViewTimingDialog = ({ isOpen, onClose, timing }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Card
        sx={{
          p: 2,
          width: { xs: '70vh', md: '60vh', lg: '80vh' },
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
            <span style={{ marginRight: '12px' }}>Timing List</span>
            <Chip
              size="small"
              color={'success'}
              sx={{
                fontSize: '11px',
                fontWeight: 600,
                '&.MuiChip-root': { borderRadius: '4px' },
              }}
              label={get(timing, 'title')}
            />
          </Typography>

          <Stack flexDirection="row" alignItems="center" gap={1}>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Stack sx={{ overflow: 'auto', maxHeight: 500 }}>
          {map(get(timing, 'daySlots'), (_day_slot) => {
            return (
              <Stack>
                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', mb: 2 }}>
                  {get(_day_slot, 'day')}
                </Typography>
                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          align="left"
                          sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                        >
                          Start date
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                        >
                          End date
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {map(get(_day_slot, 'slots'), (_item) => (
                        <TableRow key={get(_item, 'id')} sx={{ borderBottom: '1px solid #ced4da' }}>
                          <TableCell align="left">
                            {convertTo12Hour(get(_item, 'start_time'))}
                          </TableCell>
                          <TableCell align="left">
                            {convertTo12Hour(get(_item, 'end_time'))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            );
          })}
        </Stack>
      </Card>
    </Dialog>
  );
};

export default ViewTimingDialog;
