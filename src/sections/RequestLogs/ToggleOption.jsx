import React, { useEffect, useState } from 'react';
import {
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useRecoilValue } from 'recoil';
import { currentStoreId, currentTerminalId, storeReferenceState } from 'src/global/recoilState';
import OptionsGroupServices from 'src/services/API/OptionsGroupServices';
import { find, get, map } from 'lodash';

const ToggleOption = ({ receivedLog }) => {
  console.log('receivedLogaaa', receivedLog);

  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const storeReference = useRecoilValue(storeReferenceState);

  const [onlineOptionsList, setOnlineOptionsList] = useState([]);

  const getAllOnlineOptionsList = async () => {
    try {
      const resp = await OptionsGroupServices.allOptions({ page: 1, size: 50 });
      setOnlineOptionsList(get(resp, 'data.optionData'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (currentTerminal && currentStore && storeReference) {
      getAllOnlineOptionsList();
    }
  }, [currentTerminal, currentStore, storeReference]);

  return (
    <Stack>
      <Stack>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="left"
                  sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                >
                  Option
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
              {map(get(receivedLog, 'options'), (_item) => {
                const formatOnlineCategoryList = find(onlineOptionsList, (_option) => {
                  return get(_option, 'optionId') === get(_item, 'ref_id');
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
                      {get(formatOnlineCategoryList, 'title')}
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
    </Stack>
  );
};

export default ToggleOption;
