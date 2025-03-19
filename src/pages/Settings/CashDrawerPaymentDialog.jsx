import { Button, Card, Dialog, Stack, Typography } from '@mui/material';
import { filter, get, isEmpty, map, some } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentStoreId,
  currentTerminalId,
  terminalConfigurationState,
} from 'src/global/recoilState';
import COUNTERS_API from 'src/services/counters';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { capitalCase } from 'change-case';
import SettingServices from 'src/services/API/SettingServices';
import { PaymentModeTypes } from 'src/constants/AppConstants';

export default function CashDrawerPaymentDialog(props) {
  const { open, handleClose, initialFetch, previous } = props;
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const ALL = 'all';
  const PaymentTypeConstants = ['CARD', 'CASH', 'UPI', 'SWIGGY', 'ZOMATO'];
  const [selectedList, setSelectedList] = useState(previous);
  const [terminalConfiguration, setTerminalConfiguration] = useRecoilState(
    terminalConfigurationState
  );

  const handleChange = (event, value) => {
    const { checked } = event.target;

    if (value === ALL) {
      if (checked) {
        setSelectedList(PaymentTypeConstants);
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
          const filterOthers = filter(prev, (e) => e !== value);
          return filterOthers;
        });
      }
    }
  };
  const isSelected = (data) => selectedList.includes(data);
  const handleSubmit = async (notDisable = true) => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        terminalSettings: {
          ...terminalConfiguration,
          cashDrawerSettings: {
            isActive: !isEmpty(selectedList) ? true : false,
            drawerOpenPaymentModes: selectedList,
          },
        },
      };
      await SettingServices.postTerminalConfiguration(options);
      initialFetch();
      handleClose();
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Dialog open={open}>
      <Card
        sx={{
          p: 2,
          width: { xs: 360, md: 400 },
          minHeight: 300,
          maxHeight: 500,
          overflowY: 'scroll',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Cash Drawer
        </Typography>
        <FormGroup>
          <FormControlLabel
            value={ALL}
            control={
              <Checkbox
                checked={PaymentModeTypes.length === selectedList.length}
                onChange={(event) => handleChange(event, ALL)}
              />
            }
            label={'All'}
          />
          {map(PaymentModeTypes, (e) => (
            <FormControlLabel
              value={e}
              control={
                <Checkbox
                  checked={isSelected(get(e, 'value'))}
                  onChange={(event) => handleChange(event, get(e, 'value'))}
                />
              }
              label={get(e, 'label')}
            />
          ))}
        </FormGroup>
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
          <Button onClick={handleSubmit} variant="contained">
            Submit
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
