import {
  Button,
  Card,
  Checkbox,
  Dialog,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from '@mui/material';
import { capitalCase } from 'change-case';
import { filter, get, isEmpty, map, some } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { allConfiguration, currentStoreId, currentTerminalId } from 'src/global/recoilState';
import SettingServices from 'src/services/API/SettingServices';
import STORES_API from 'src/services/stores';
import EditIcon from '@mui/icons-material/Edit';
import UpdateBillingStaffPIN from '../Auth/UpdateBillingStaffPIN';
import { BILLING_STAFF_DEFAULT_PIN } from 'src/constants/AppConstants';

export default function BillingStaffDialog({ open, handleClose, initialFetch }) {
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const staffSettings = get(configuration, 'staffSettings', {});
  const previousList = get(staffSettings, 'staffs', []);
  const [staffList, setStaffList] = useState([]);
  const [selectedList, setSelectedList] = useState(previousList);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [openPIN, setOpenPIN] = useState({ isOpen: false, previous: {} });
  const ALL = 'all';
  const handleOpenPIN = (e) => {
    setOpenPIN({ isOpen: true, previous: e });
  };
  const handleClosePIN = () => {
    setOpenPIN({ isOpen: false, previous: {} });
  };
  const handleSetStaffPIN = (data) => {
    const filtered = filter(selectedList, (e) => e.employeeID !== data.employeeID);
    setSelectedList([...filtered, data]);
  };
  const getStaffList = async () => {
    try {
      const response = await STORES_API.getStaffs();
      if (response) {
        const format = map(get(response, 'data', []), (e) => {
          return {
            ...e,
            employeeID: get(e, 'staffId'),
            secretPin: BILLING_STAFF_DEFAULT_PIN,
          };
        });
        setStaffList(format);
      }
    } catch (error) {}
  };

  const isSelected = (data) => some(selectedList, (e) => e.employeeID === data.employeeID) || false;
  const handleChange = (event, value) => {
    const { name, checked } = event.target;

    if (value === ALL) {
      if (checked) {
        setSelectedList(staffList);
      } else {
        setSelectedList([]);
      }
    } else {
      if (checked) {
        setSelectedList((prev) => {
          return [...prev, value];
        });
      } else {
        setSelectedList((prev) => {
          const filterOthers = filter(prev, (e) => e.employeeID !== value.employeeID);
          return filterOthers;
        });
      }
    }
  };
  const handleSubmit = async () => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        staffSettings: {
          isEnabledShiftLogin: !isEmpty(selectedList) ? true : false,
          staffs: selectedList,
        },
      };
      await SettingServices.postConfiguration(options);
      initialFetch(true);
      handleClose();
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    if (!open) return;
    getStaffList();
  }, []);
  return (
    <Dialog open={open}>
      {get(openPIN, 'isOpen', false) ? (
        <Card sx={{ width: { xs: 340, sm: 400 }, p: 3 }}>
          <UpdateBillingStaffPIN
            handleSetStaffPIN={handleSetStaffPIN}
            handleClose={handleClosePIN}
            previous={get(openPIN, 'previous', {})}
          />
        </Card>
      ) : (
        <Card sx={{ width: { xs: 340, sm: 400 }, p: 3, overflowY: 'auto' }}>
          <Typography variant="h6">Billing Staff </Typography>
          {!isEmpty(staffList) && (
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Checkbox
                  checked={staffList?.length === selectedList?.length}
                  onChange={(event) => handleChange(event, ALL)}
                />
                <Typography>All</Typography>
              </Stack>
            </Stack>
          )}
          {map(staffList, (e) => (
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Checkbox checked={isSelected(e)} onChange={(event) => handleChange(event, e)} />
                <Typography>{get(e, 'name')}</Typography>
              </Stack>
              {isSelected(e) && (
                <Button
                  onClick={() => handleOpenPIN(e)}
                  size="small"
                  startIcon={<EditIcon />}
                  variant="outlined"
                >
                  Change PIN
                </Button>
              )}
            </Stack>
          ))}
          {isEmpty(staffList) && (
            <Typography variant="caption" sx={{ ml: 2, fontWeight: 'bold' }}>
              No staffs found
            </Typography>
          )}
          {!isEmpty(staffList) && (
            <Typography variant="caption" sx={{ ml: 2, fontWeight: 'bold' }}>
              Default PIN : {BILLING_STAFF_DEFAULT_PIN}
            </Typography>
          )}
          <Stack
            flexDirection={'row'}
            gap={2}
            sx={{
              justifyContent: 'flex-end',
              mt: 2,
            }}
          >
            <Button onClick={() => handleClose()} variant="outlined">
              Close
            </Button>
            <Button disabled={isEmpty(staffList)} onClick={handleSubmit} variant="contained">
              Submit
            </Button>
          </Stack>
        </Card>
      )}
    </Dialog>
  );
}
