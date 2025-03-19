import { Button, Card, Dialog, Stack, Typography } from '@mui/material';
import { filter, get, isEmpty, map, some } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentStoreId,
  currentTerminalId,
  terminalConfigurationState,
} from '../../global/recoilState';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { capitalCase } from 'change-case';
import ProductLoader from 'src/components/ProductLoader';
import INTENT_API from 'src/services/IntentService';

export default function SelectStoreDialog(props) {
  const { open, handleClose, initialFetch, intentSettings } = props;
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const ALL = 'all';
  const [loading, setLoading] = useState(false);
  const [storeList, setStoreList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);

  const getStoreNames = async () => {
    try {
      setLoading(true);
      const response = await INTENT_API.getStoreAllList();
      setLoading(false);
      setStoreList(get(response, 'data'));
      const result = get(response, 'data').filter((item) =>
        get(intentSettings, 'selectesStores').includes(item.storeId)
      );
      setSelectedList(result);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal) getStoreNames();
  }, []);

  const handleChange = (event, value) => {
    const { name, checked } = event.target;

    if (value === ALL) {
      if (checked) {
        setSelectedList(storeList);
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
          const filterOthers = filter(prev, (e) => e.storeId !== value.storeId);
          return filterOthers;
        });
      }
    }
  };
  const isSelected = (data) => some(selectedList, (e) => e.storeId === data.storeId);
  const handleSubmit = async () => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        intentSetting: {
          ...intentSettings,
          selectesStores: selectedList.map((item) => item.storeId).sort(),
        },
      };
      await INTENT_API.addPurchaseSettings(options);
      initialFetch();
      handleClose();
    } catch (e) {}
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
          Store List
        </Typography>
        <FormGroup>
          {!loading && (
            <FormControlLabel
              value={ALL}
              control={
                <Checkbox
                  checked={storeList?.length === selectedList?.length}
                  onChange={(event) => handleChange(event, ALL)}
                />
              }
              label={'All'}
            />
          )}
          {map(storeList, (e) => (
            <>
              {!loading && (
                <FormControlLabel
                  value={e}
                  control={
                    <Checkbox
                      checked={isSelected(e)}
                      onChange={(event) => handleChange(event, e)}
                    />
                  }
                  label={capitalCase(get(e, 'storeName', '') || '')}
                />
              )}
            </>
          ))}
          {loading && <ProductLoader />}
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
