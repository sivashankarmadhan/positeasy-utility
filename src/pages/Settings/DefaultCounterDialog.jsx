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

export default function DefaultCounterDialog(props) {
  const { open, handleClose, initialFetch, previous } = props;
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const ALL = 'all';
  const [countersList, setCountersList] = useState([]);
  const [selectedList, setSelectedList] = useState(previous);
  const [terminalConfiguration, setTerminalConfiguration] = useRecoilState(
    terminalConfigurationState
  );
  const getCountersList = async () => {
    try {
      const response = await COUNTERS_API.getAllCounters();
      setCountersList(get(response, 'data'));
    } catch (e) {
      setCountersList([]);
      console.log(e);
    }
  };
  useEffect(() => {
    if (currentStore && currentTerminal) getCountersList();
  }, [currentStore, currentTerminal]);

  const handleChange = (event, value) => {
    const { name, checked } = event.target;

    if (value === ALL) {
      if (checked) {
        setSelectedList(countersList);
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
          const filterOthers = filter(prev, (e) => e.counterId !== value.counterId);
          return filterOthers;
        });
      }
    }
  };
  const isSelected = (data) => some(selectedList, (e) => e.counterId === data.counterId);
  const handleSubmit = async (notDisable = true) => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        terminalSettings: {
          ...terminalConfiguration,
          defaultCounterConfig: {
            isActive: !isEmpty(selectedList) ? true : false,
            selectedCounters: selectedList,
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
          Default Counter
        </Typography>
        <FormGroup>
          <FormControlLabel
            value={ALL}
            control={
              <Checkbox
                checked={countersList.length === selectedList.length}
                onChange={(event) => handleChange(event, ALL)}
              />
            }
            label={'All'}
          />
          {map(countersList, (e) => (
            <FormControlLabel
              value={e}
              control={
                <Checkbox checked={isSelected(e)} onChange={(event) => handleChange(event, e)} />
              }
              label={capitalCase(get(e, 'name', '') || '')}
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
