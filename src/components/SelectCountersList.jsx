import { Button, Card, Dialog, Stack, Typography } from '@mui/material';
import { filter, get, isEmpty, map, some } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentStoreId,
  currentTerminalId,
  terminalConfigurationState,
} from '../global/recoilState';
import COUNTERS_API from '../services/counters';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { capitalCase } from 'change-case';
import SettingServices from '../services/API/SettingServices';
import PRODUCTS_API from '../services/products';
import ProductLoader from './ProductLoader';

export default function SelectCountersList(props) {
  const { open, handleClose, initialFetch, scanQrDetails } = props;
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const ALL = 'all';
  const [loading, setLoading] = useState(false);
  const [countersList, setCountersList] = useState([]);
  const [selectedList, setSelectedList] = useState(
    get(scanQrDetails, 'counterSettings.selectedCounters') || []
  );
  const [terminalConfiguration, setTerminalConfiguration] = useRecoilState(
    terminalConfigurationState
  );

  const getProductCounterList = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;

    try {
      setLoading(true);
      const response = await PRODUCTS_API.getProductCounterList(currentStore);
      if (response) setCountersList(response.data);
    } catch (e) {
      console.log(e);
      setCountersList([]);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal) getProductCounterList();
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
        scanQrSettings: {
          ...scanQrDetails,
          counterSettings: {
            isActive: !isEmpty(selectedList) ? true : false,
            selectedCounters: selectedList,
          },
        },
      };
      await SettingServices.postScanQrConfiguration(options);
      initialFetch();
      handleClose();
    } catch (e) {
      console.log(e);
    }
  };
  return loading ? (
    <ProductLoader />
  ) : (
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
                checked={countersList?.length === selectedList?.length}
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
