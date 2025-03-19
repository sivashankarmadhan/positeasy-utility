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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import uuid from 'react-uuid';
import StoreServices from 'src/services/API/StoreServices';
import { useBoolean } from 'src/hooks/useBoolean';
import Iconify from 'src/components/iconify';
import SettingServices from 'src/services/API/SettingServices';
import { filter, find, get, isEmpty, map, set } from 'lodash';
import { currentStoreId, stores } from 'src/global/recoilState';
import { useRecoilState, useRecoilValue } from 'recoil';
import WebHooksComponent from 'src/components/WebHooksComponent';

const ViewWejhaDialog = ({
  isOpen,
  onClose,
  getStoreDetails,
  integrateData,
  indexValue,
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
  console.log('integrateData', integrateData);
  const password = useBoolean();
  const apiKey = useBoolean();
  const theme = useTheme();
  const sectionOrderOption = ['CREATE', 'UPDATE', 'DELETE'];

  const [webHooksList, setWebHooksList] = useState([]);
  const [isWebhooksEnabled, setIsWebhooksEnabled] = useState(false);
  const [webHooksList2, setWebHooksList2] = useState([]);

  const [finalWebHooksList, setFinalWebHooksList] = useState([]);

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);



  const regenrateApiKey = async (e) => {
    try {
      const options = {
        storeId: configuration?.storeId,
        name: integrateData?.name,
        storeName: storeName,
      };
      const resp = await SettingServices.regenrateApiKey(options);
      getIntegration();
      // onClose();
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const getIntegrationData = async () => {
    try {
      // const resp = await SettingServices.getIntegration(configuration?.storeId);
      console.log('resmmp', integrateData?.webhooksConf, indexValue);
      const onlinePaymentArray = integrateData?.webhooksConf?.filter(
        (item) => item.header === 'onlinePayment'
      );
      const productsArray = integrateData?.webhooksConf?.filter(
        (item) => item.header === 'products'
      );
      if(!isEmpty(integrateData?.webhooksConf)) {
        setIsWebhooksEnabled(true)
      }
      console.log('filteredArray', onlinePaymentArray,productsArray );
      setWebHooksList(integrateData?.webhooksConf ? productsArray : []);
      setWebHooksList2(integrateData?.webhooksConf ? onlinePaymentArray : []);
      setFinalWebHooksList(
        integrateData?.webhooksConf ? integrateData?.webhooksConf : []
      );
      // const response = await SettingServices.getStoreInventory();
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  console.log('indexValue', webHooksList);

  useEffect(() => {
    isOpen && getIntegrationData();
  }, [selectedStore, isOpen]);
  const addWebhooksProductIntegration = async (index) => {
    try {
      finalWebHooksList[index] = webHooksList[index];

      const filteredArray = finalWebHooksList.map((item) => (item === null ? {} : item));

      const webConfig = JSON.parse(JSON.stringify(filteredArray));
      setFinalWebHooksList(JSON.parse(JSON.stringify(filteredArray)));
      const options = {
        storeId: configuration?.storeId,
        name: integrateData?.name,
        webhooksUrl: filteredArray[index].URL,
      };
      const resp = await SettingServices.addWebhooksProductIntegration(options);
      const configOptions = {
        storeId: configuration?.storeId,
        name: integrateData?.name,
        webhooksConf: JSON.parse(JSON.stringify(filteredArray)),
      };

      const dataResp = await SettingServices.addWebhooksProductConfigIntegration(configOptions);

      getIntegration();
      toast.success('Webhooks Added successfully');
      // onClose();
    } catch (err) {
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

      const dataResp = await SettingServices.addWebhooksProductConfigIntegration(configOptions);

      getIntegration();
      // onClose();
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const deleteIntegration = async () => {
    try {
      const options = {
        storeId: integrateData?.storeId,
        id: integrateData?.id,
      };
      const resp = await SettingServices.deleteIntegration(options);
      await getIntegration();
      onClose();
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  console.log('finalWebHooksList', finalWebHooksList);

  const copyToClipboardWejha = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
    } catch (err) {
      setCopySuccess(false);
    }
  };
  const copyToClipboardShort = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsShortKeyCopy(true);
    } catch (err) {
      setCopySuccess(false);
    }
  };

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

  console.log('webHooksList', webHooksList);
  return (
    <Dialog sx={{ width: '100%' }} open={isOpen}>
      <Stack gap={2} sx={{ p: 2, width: { xs: 300, sm: 600 } }}>
        <Stack
          flexDirection={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
          sx={{ cursor: 'pointer' }}
        >
          <Typography variant="h6">Integration</Typography>
          <CloseIcon onClick={onClose} />
        </Stack>

        <Stack gap={3}>
          {' '}
          <Stack
            sx={{
              // backgroundColor: '#F0EFEF',
              border: '1px solid #F0EFEF',
              justifyContent: 'center',
              p: 2,
              borderRadius: '10px',

              gap: 2,
            }}
          >
            <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant="h6"> Configuration</Typography>
              {/* <DeleteIcon sx={{ color: 'red' }} onClick={deleteIntegration} /> */}
            </Stack>

            <Stack gap={2}>
              <TextField
                fullWidth
                disabled
                value={integrateData?.apiKeys}
                label="API Key's"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack flexDirection={'row'} alignItems={'center'} gap={2}>
                        <IconButton onClick={apiKey.onToggle} edge="end">
                          <Iconify
                            icon={apiKey.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          />
                        </IconButton>
                        <IconButton
                          onClick={() => copyToClipboardWejha(integrateData?.apiKeys)}
                          edge="end"
                        >
                          {/* {copySuccess ? <ContentCopyIcon sx={{ cursor: 'pointer' }} /> : <ContentCopyIcon sx={{ cursor: 'pointer' }} />  } */}
                          <Iconify
                            size={25}
                            icon={!copySuccess ? 'fluent:copy-24-regular' : 'fluent:copy-32-filled'}
                          />
                        </IconButton>
                      </Stack>
                    </InputAdornment>
                  ),
                }}
                name="apiKey"
                type={apiKey.value ? 'text' : 'password'}
              />
              <Button size="large" type="button" variant="contained" onClick={regenrateApiKey}>
                Regenerate
              </Button>
              {/* <ContentCopyIcon sx={{ cursor: 'pointer' }} /> */}
              {/* <Button size="small" type="button" variant="contained">
            Regenerate
          </Button> */}
            </Stack>
          </Stack>
             <Card>
          <Stack flexDirection={'row'} alignItems={'center'} p={2} justifyContent={'space-between'}>
            <Typography variant="h6">Webhooks</Typography>{' '}
            {!isWebhooksEnabled && <Iconify
                    width={30}
                    height={30}
                    color={theme.palette.primary.main}
                    icon={'mingcute:down-fill'}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setIsWebhooksEnabled(true)
                      // setWebHooksList((prev) => {
                      //   return [
                      //     ...prev,
                      //     { event: '', URL: '', webhookId: uuid(), header: 'product' },
                      //     { event: '', URL: '', webhookId: uuid(), header: 'onlinePayment' },
                      //   ];
                      // });
                    }}
                  />}
             {isWebhooksEnabled && <Iconify
                    width={30}
                    height={30}
                    color={theme.palette.primary.main}
                    icon={'mingcute:up-fill'}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setIsWebhooksEnabled(false)
                      // setWebHooksList((prev) => {
                      //   return [
                      //     ...prev,
                      //     { event: '', URL: '', webhookId: uuid(), header: 'product' },
                      //     { event: '', URL: '', webhookId: uuid(), header: 'onlinePayment' },
                      //   ];
                      // });
                    }}
                  />}
            {/* <Stack flexDirection={'row'} gap={2}>
              {webHooksList === null ||
                (webHooksList?.length < 3 && (
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
                          { event: '', URL: '', webhookId: uuid(), header: 'product' },
                          { event: '', URL: '', webhookId: uuid(), header: 'onlinePayment' },
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
                    if (webHooksList.length === finalWebHooksList.length) {
                      webHooksList.pop();
                      finalWebHooksList.pop();
                      console.log('webHooksList', webHooksList, finalWebHooksList);
                      setWebHooksList(JSON.parse(JSON.stringify(webHooksList)));
                      setFinalWebHooksList(JSON.parse(JSON.stringify(finalWebHooksList)));
                      replaceWebhooksIntegration(JSON.parse(JSON.stringify(finalWebHooksList)));
                    } else {
                      webHooksList.pop();
                      setWebHooksList(JSON.parse(JSON.stringify(webHooksList)));
                      replaceWebhooksIntegration(JSON.parse(JSON.stringify(finalWebHooksList)));
                    }
                  }}
                />
              )}
            </Stack> */}
          </Stack>
       
            {isWebhooksEnabled  && <Stack>
              <WebHooksComponent
              hooksName={'products'}
              getIntegration={getIntegration}
              integrateData={integrateData}
              configuration={configuration}
              webHooksList={webHooksList}
              indexValue={indexValue}
              setWebHooksList={setWebHooksList}
              finalWebHooksList={finalWebHooksList}
              setFinalWebHooksList={setFinalWebHooksList}
            />
            <WebHooksComponent
              hooksName={'onlinePayment'}
              getIntegration={getIntegration}
              integrateData={integrateData}
              configuration={configuration}
              indexValue={indexValue}
              webHooksList={webHooksList2}
              setWebHooksList={setWebHooksList2}
              finalWebHooksList={finalWebHooksList}
              setFinalWebHooksList={setFinalWebHooksList}
            /></Stack>}
          </Card>
          {/* <Card>
          <Stack
            p={2}
            flexDirection={'row'}
            justifyContent={'space-between'}
            gap={2}
            alignItems={'center'}
          >
            <FormControl sx={{ width: '60%' }}>
              <InputLabel id="demo-simple-select-label">Section</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                // defaultValue={get(selectedUnit, 'productId')}
                label="Units"
                value={webHooksSection1}

                onChange={handleSection2Change}
                // inputProps={{ style: { height: 10 } }}
              >
                {map(sectionOrderOption, (e) => (
                        <MenuItem value={e}>
                          {e}
                        </MenuItem>
                      ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              variant="filled"
              value={webHooks1}
              onChange={handleWebhooks1}
              label={'Enter URl'}
            />
            <Button
              size="large"
              type="button"
              variant="contained"
              //  onClick={onSubmit}
            >
              Set
            </Button>
          </Stack>
        </Card> */}
        </Stack>

        {/* <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
          <Button size="large" variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="large"
            type="button"
            variant="contained"
            //  onClick={onSubmit}
          >
            Submit
          </Button>
        </Stack> */}
      </Stack>
    </Dialog>
  );
};

export default ViewWejhaDialog;
