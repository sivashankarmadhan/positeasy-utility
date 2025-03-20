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
import PRODUCTS_API from 'src/services/products';

const ToggleItem = ({ receivedLog }) => {
  console.log('receivedLogaaa', receivedLog);

  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const storeReference = useRecoilValue(storeReferenceState);

  const [onlineItemsList, setOnlineItemsList] = useState([]);

  const getAllOnlineItemsList = async () => {
    try {
      const resp = await PRODUCTS_API.getItemsProductList();
      setOnlineItemsList(get(resp, 'data'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (currentTerminal && currentStore && storeReference) {
      getAllOnlineItemsList();
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
                  Item
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
              {map(get(receivedLog, 'status.0.items'), (_log) => {
                const formatOnlineCategoryList = find(onlineItemsList, (_item) => {
                  return get(_item, 'productId') === get(_log, 'ref_id');
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
                      {get(_log, 'status') === 'success' ? (
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

export default ToggleItem;
