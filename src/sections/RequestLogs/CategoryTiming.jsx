import {
  Checkbox,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { find, get, map } from 'lodash';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilValue } from 'recoil';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { currentStoreId, currentTerminalId, storeReferenceState } from 'src/global/recoilState';
import ONLINE_ITEMS from 'src/services/onlineItemsServices';
import convertTo12Hour from 'src/utils/convertTo12Hour';

const CategoryTiming = ({ receivedLog }) => {
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const storeReference = useRecoilValue(storeReferenceState);

  const [onlineCategoryList, setOnlineCategoryList] = useState([]);

  const getAllOnlineCategoryList = async () => {
    try {
      const resp = await ONLINE_ITEMS.getAllOnlineCategoryList(storeReference);
      setOnlineCategoryList(get(resp, 'data'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (currentTerminal && currentStore && storeReference) {
      getAllOnlineCategoryList();
    }
  }, [currentTerminal, currentStore, storeReference]);

  return (
    <Stack sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 10rem)' }}>
      <Stack>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="left"
                  sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                >
                  Category
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {map(get(receivedLog, 'stats.0.stats'), (_item) => {
                const formatOnlineCategoryList = find(onlineCategoryList, (_category) => {
                  return get(_category, 'id') === get(_item, 'category');
                });

                return (
                  <TableRow sx={{ borderBottom: '1px solid #ced4da' }}>
                    <TableCell
                      sx={{
                        '&.MuiTableCell-root': {
                          padding: '12px',
                        },
                      }}
                      align="left"
                    >
                      {get(formatOnlineCategoryList, 'name')}
                    </TableCell>
                    <TableCell
                      sx={{
                        '&.MuiTableCell-root': {
                          padding: '12px',
                        },
                      }}
                      align="center"
                    >
                      {get(_item, 'success') ? (
                        <Chip
                          color={'success'}
                          variant="outlined"
                          sx={{
                            fontSize: '10px',
                            fontWeight: 600,
                            '&.MuiChip-root': { borderRadius: '15px' },
                            height: '25px',
                          }}
                          label="Success"
                        />
                      ) : (
                        <Chip
                          color={'error'}
                          variant="outlined"
                          sx={{
                            fontSize: '10px',
                            fontWeight: 600,
                            '&.MuiChip-root': { borderRadius: '15px' },
                            height: '25px',
                          }}
                          label="Error"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: '100%', mb: 2 }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
          <span style={{ marginRight: '12px' }}>Timing List</span>
          <Chip
            size="small"
            color={'success'}
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '4px' },
            }}
            label={get(receivedLog, 'timing_groups.0.title')}
          />
        </Typography>
      </Stack>

      <Stack>
        {map(get(receivedLog, 'timing_groups.0.day_slots'), (_day_slot) => {
          return (
            <Stack>
              <Typography sx={{ fontSize: '17px', fontWeight: 'bold', mb: 2 }}>
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
                      <TableRow sx={{ borderBottom: '1px solid #ced4da' }}>
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
    </Stack>
  );
};

export default CategoryTiming;
