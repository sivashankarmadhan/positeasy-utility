import {
  Button,
  Card,
  Checkbox,
  Dialog,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';

import uuid from 'react-uuid';
import { useBoolean } from 'src/hooks/useBoolean';
import Iconify from 'src/components/iconify';
import SettingServices from 'src/services/API/SettingServices';
import { filter, find, get, isEmpty, map, set } from 'lodash';
import { currentStoreId, stores } from 'src/global/recoilState';
import { useRecoilState, useRecoilValue } from 'recoil';

const WebHooksComponent = ({
  isOpen,
  onClose,
  getStoreDetails,
  integrateData,
  indexValue,
  webHooksList,
  setWebHooksList,
  finalWebHooksList,
  setFinalWebHooksList,
  hooksName,
  configuration,
  getIntegration,
}) => {
  const currentStore = useRecoilValue(currentStoreId);
  const [webHooks, setWebHooks] = useState('');
  const [webHooks1, setWebHooks1] = useState('');
  const [webHooks2, setWebHooks2] = useState('');
  const [isIntegration, setIsIntegration] = useState(false);
  const [webHooksSection, setWebHooksSection] = useState('');
  const [webHooksSection1, setWebHooksSection1] = useState('');
  const [webHooksSection2, setWebHooksSection2] = useState('');
  const [selectedStore, setSelectedStore] = useRecoilState(currentStoreId);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isShortKeyCopy, setIsShortKeyCopy] = useState(false);
  console.log('integrateData', integrateData, indexValue);
  const password = useBoolean();
  const apiKey = useBoolean();
  const theme = useTheme();
  const sectionOrderOption = ['CREATE', 'UPDATE', 'DELETE'];

  //   const [webHooksList, setWebHooksList] = useState([]);

  //   const [finalWebHooksList, setFinalWebHooksList] = useState([]);

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const addWebhooksProductIntegration = async (index) => {
    try {
      const webHooksArrayForCurrent = finalWebHooksList?.filter(
        (item) => item.header === hooksName
      );

      const webHooksArrayForOthers = finalWebHooksList?.filter((item) => item.header !== hooksName);

      webHooksArrayForCurrent[index] = webHooksList[index];

      console.log(
        'webHooksArrayForOthers',
        webHooksArrayForOthers,
        webHooksArrayForCurrent,
        finalWebHooksList
      );

      //   const filteredwebHooksArrayForCurrent = webHooksArrayForCurrent.map((item) => (item === null ? {} : item));

      const resultWebHooks = [...webHooksArrayForCurrent, ...webHooksArrayForOthers];

      //   console.log('webHooksArray', webHooksArray, finalWebHooksList);

      setFinalWebHooksList(JSON.parse(JSON.stringify(resultWebHooks)));
      const options = {
        storeId: configuration?.storeId,
        name: integrateData?.name,
        webhooksUrl: webHooksArrayForCurrent[index].URL,
      };
      const resp = await SettingServices.addWebhooksProductIntegration(options);
      const configOptions = {
        storeId: configuration?.storeId,
        name: integrateData?.name,
        webhooksConf: JSON.parse(JSON.stringify(resultWebHooks)),
      };

      const dataResp = await SettingServices.addWebhooksProductConfigIntegration(configOptions);

      getIntegration();
      toast.success('Webhooks Added successfully');
      // onClose();
    } catch (err) {
      console.log('errerr', err);

      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  const replaceWebhooksIntegration = async (finalWebHooksList) => {
    try {
      const configOptions = {
        storeId: configuration?.storeId,
        name: integrateData?.name,
        webhooksConf: JSON.parse(JSON.stringify(finalWebHooksList)),
      };
      console.log('configOptions', configOptions);
      const dataResp = await SettingServices.addWebhooksProductConfigIntegration(configOptions);

      getIntegration();
      // onClose();
    } catch (err) {
      // console.log('');
      console.log('errerr', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  console.log('hooksName', hooksName, webHooksList);

  const handleWebhooks = (e, index) => {
    // setWebHooks(e.target.value);

    const formatData = map(webHooksList, (_item, _index) => {
      if (index === _index) {
        set(_item, 'URL', e.target.value);
      }
      return _item;
    });

    setWebHooksList(formatData);
  };

  const handleSection1Change = (event, index) => {
    const formatData = map(webHooksList, (_item, _index) => {
      if (index === _index) {
        set(_item, 'event', event.target.value);
      }
      return _item;
    });

    setWebHooksList(formatData);
    // setWebHooksSection(event.target.value);
  };
  const handleSection2Change = (event) => {
    setWebHooksSection1(event.target.value);
  };
  const handleWebhooks1 = (e) => {
    setWebHooks1(e.target.value);
  };
  const handleWebhooks2 = (e) => {
    setWebHooks2(e.target.value);
  };
const itemsLength = hooksName === "products" ? 3 : 1
  console.log('webHooksList', webHooksList);
  return (
    <Stack>
      <Stack>
        <Stack flexDirection={'row'} alignItems={'center'} p={2} justifyContent={'space-between'}>
          <Typography fontWeight={700} variant="subtitle1">
            {hooksName === "products" ? "Products" : "Online payment"}
          </Typography>{' '}
          <Stack flexDirection={'row'} gap={2}>
            {webHooksList === null ||
              (webHooksList?.length < itemsLength && (
                <Iconify
                  width={30}
                  height={30}
                  color={theme.palette.primary.main}
                  icon={'ph:plus-fill'}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setWebHooksList((prev) => {
                      return [
                        ...prev,
                        { event: '', URL: '', webhookId: uuid(), header: hooksName },
                      ];
                    });
                  }}
                />
              ))}
            {!isEmpty(webHooksList) && (
              <Iconify
                width={30}
                height={30}
                color={theme.palette.primary.main}
                icon={'ph:minus-fill'}
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  const webHooksArrayForCurrent = finalWebHooksList?.filter(
                    (item) => item.header === hooksName
                  );

                  const webHooksArrayForOthers = finalWebHooksList?.filter(
                    (item) => item.header !== hooksName
                  );

                  webHooksArrayForCurrent.pop();
                  const array = [...webHooksArrayForCurrent, ...webHooksArrayForOthers];
                  if (webHooksList.length === finalWebHooksList.length) {
                    webHooksList.pop();
                    console.log('arrayarary');

                    console.log('webHooksList', webHooksList, finalWebHooksList);
                    setWebHooksList(JSON.parse(JSON.stringify(webHooksList)));
                    setFinalWebHooksList(JSON.parse(JSON.stringify(array)));
                    replaceWebhooksIntegration(JSON.parse(JSON.stringify(array)));
                  } else {
                    webHooksList.pop();
                    console.log('arrayarary');

                    setWebHooksList(JSON.parse(JSON.stringify(webHooksList)));
                    replaceWebhooksIntegration(JSON.parse(JSON.stringify(array)));
                  }
                }}
              />
            )}
          </Stack>
        </Stack>
        {map(
          filter(webHooksList, (_item) => get(_item, 'header') === hooksName),
          (_item, index) => {
            const sectionOption = ['CREATE', 'UPDATE', 'DELETE'];
            const filterData = filter(sectionOption, (item) => {
              const findData = find(webHooksList, (webHook, _index) => {
                if (index === _index) return false;
                return webHook.event === item;
              });
              return !findData;
            });
            const sectionIntentOption = ['INTENT'];
            const filterIntentData = filter(sectionIntentOption, (item) => {
              const findData = find(webHooksList, (webHook, _index) => {
                if (index === _index) return false;
                return webHook.event === item;
              });
              return !findData;
            });
            console.log('item', _item);
            return (
              <Stack>
                <Stack
                  p={2}
                  flexDirection={'row'}
                  justifyContent={'space-between'}
                  gap={2}
                  alignItems={'center'}
                >
                  <FormControl sx={{ width: '60%' }}>
                    <InputLabel id="demo-simple-select-label">
                      {/* {hooksName === 'products' ? 'Product' : 'Online Payment'} */}
                      Event type
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      // defaultValue={get(selectedUnit, 'productId')}
                      label="Units"
                      value={get(_item, 'event')}
                      onChange={(e) => handleSection1Change(e, index)}
                      // inputProps={{ style: { height: 10 } }}
                    >
                      {hooksName === 'products'
                        ? map(filterData, (e) => (
                            <MenuItem sx={{ fontSize: 'small' }} value={e}>
                              {e}
                            </MenuItem>
                          ))
                        : map(filterIntentData, (e) => (
                            <MenuItem sx={{ fontSize: 'small' }} value={e}>
                              {e}
                            </MenuItem>
                          ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    variant="filled"
                    value={get(_item, 'URL')}
                    onChange={(e) => handleWebhooks(e, index)}
                    label={'Enter URl'}
                  />
                  <Button
                    size="large"
                    type="button"
                    variant="contained"
                    onClick={() => addWebhooksProductIntegration(index)}
                  >
                    Set
                  </Button>
                </Stack>
              </Stack>
            );
          }
        )}
      </Stack>
    </Stack>
  );
};

export default WebHooksComponent;
