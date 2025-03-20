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
  Tooltip,
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
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import CreateCalalogue from './CreateCalalogue';
import CategoryTiming from './CategoryTiming';
import ToggleItem from './ToggleItem';
import ToggleOption from './ToggleOption';
import CreateOrUpdateStore from './CreateOrUpdateStore';
import ToggleStore from './ToggleStore';

const RequestLogResponseDialog = ({ isOpen, onClose, data }) => {
  console.log('receivedLog', data?.receivedLog);

  const isError = get(data, `receivedLog.stats.error`);

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
            <Typography variant="h4" sx={{ marginRight: '12px' }}>
              Response
            </Typography>
          </Typography>

          <Stack flexDirection="row" alignItems="center" gap={1}>
            {data?.action === 'CREATE_CATALOGUE' && (
              <Chip
                color={isError ? 'error' : 'success'}
                variant="outlined"
                sx={{
                  fontSize: '11px',
                  fontWeight: 600,
                  '&.MuiChip-root': { borderRadius: '4px' },
                }}
                label={isError ? 'Error' : 'Success'}
              />
            )}

            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>

        {data?.action === 'CREATE_CATALOGUE' && (
          <CreateCalalogue receivedLog={data?.receivedLog?.[0]} />
        )}
        {data?.action === 'CATEGORY_TIMING' && (
          <CategoryTiming receivedLog={data?.receivedLog?.[0]} />
        )}
        {data?.action === 'TOGGLE_OPTION' && <ToggleOption receivedLog={data?.receivedLog?.[0]} />}
        {data?.action === 'TOGGLE_ITEM' && <ToggleItem receivedLog={data?.receivedLog?.[0]} />}
        {data?.action === 'CREATE/UPDATE_STORE' && (
          <CreateOrUpdateStore receivedLog={data?.receivedLog?.[0]} />
        )}
        {data?.action === 'TOGGLE_STORE' && <ToggleStore receivedLog={data?.receivedLog?.[0]} />}
        {![
          'CREATE_CATALOGUE',
          'CATEGORY_TIMING',
          'TOGGLE_OPTION',
          'TOGGLE_ITEM',
          'CREATE/UPDATE_STORE',
          'TOGGLE_STORE',
        ].includes(data?.action) && (
          <Stack sx={{ overflow: 'auto', maxHeight: 500 }}>
            <pre>{JSON.stringify(data?.receivedLog, null, 2)}</pre>
          </Stack>
        )}
      </Card>
    </Dialog>
  );
};

export default RequestLogResponseDialog;
