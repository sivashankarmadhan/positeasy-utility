import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { find, get, map } from 'lodash';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilValue } from 'recoil';
import { hideScrollbar } from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { currentStoreId, currentTerminalId, storeReferenceState } from 'src/global/recoilState';
import FilterPopOver from 'src/layouts/dashboard/header/FilterPopOver';
import OptionsGroupServices from 'src/services/API/OptionsGroupServices';
import ONLINE_ITEMS from 'src/services/onlineItemsServices';
import PRODUCTS_API from 'src/services/products';
import CalalogueCard from './CalalogueCard';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const tabsOptions = [
  {
    label: 'Items',
    id: 'items',
  },
  {
    label: 'Categories',
    id: 'categories',
  },
  {
    label: 'Options',
    id: 'options',
  },
  {
    label: 'Option groups',
    id: 'option_groups',
  },
  {
    label: 'Taxes',
    id: 'taxes',
  },
  {
    label: 'Charges',
    id: 'charges',
  },
];

const CreateCalalogue = ({ receivedLog }) => {
  const [selectedTab, setSelectedTab] = useState(get(tabsOptions, '0'));

  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const storeReference = useRecoilValue(storeReferenceState);

  const [onlineCategoryList, setOnlineCategoryList] = useState([]);
  const [onlineOptionsGrpList, setOnlineOptionsGrpList] = useState([]);
  const [onlineItemsList, setOnlineItemsList] = useState([]);

  const errorCount = get(receivedLog, `stats.${selectedTab?.id}.errors`) || 0;
  const createdCount = get(receivedLog, `stats.${selectedTab?.id}.created`) || 0;
  const deletedCount = get(receivedLog, `stats.${selectedTab?.id}.deleted`) || 0;
  const updatedCount = get(receivedLog, `stats.${selectedTab?.id}.updated`) || 0;

  const detailsData = get(receivedLog, `${selectedTab?.id}`) || [];

  console.log('detailsData', receivedLog);

  const getAllOnlineCategoryList = async () => {
    try {
      const resp = await ONLINE_ITEMS.getAllOnlineCategoryList(storeReference);
      setOnlineCategoryList(get(resp, 'data'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const getAllOptionsGroupList = async () => {
    try {
      const resp = await OptionsGroupServices.getOptionsGroupList(storeReference);
      setOnlineOptionsGrpList(get(resp, 'data'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const getAllItemsList = async () => {
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
      getAllOnlineCategoryList();
      getAllOptionsGroupList();
      getAllItemsList();
    }
  }, [currentTerminal, currentStore, storeReference]);

  return (
    <>
      <Autocomplete
        size="small"
        options={tabsOptions}
        filterOptions={(options, { inputValue }) => {
          const searchTerm = inputValue.toLowerCase();
          return options.filter((option) => option.label.toLowerCase().startsWith(searchTerm));
        }}
        value={selectedTab}
        onChange={(event, newValue) => setSelectedTab(newValue)}
        sx={{ minWidth: 200, width: '100%', flexWrap: 'nowrap' }}
        renderInput={(params) => <TextField variant="filled" {...params} label={'Feature'} />}
      />

      {selectedTab?.id && (
        <Stack flexDirection="row" gap={1} mt={2} justifyContent="center">
          <Chip
            color={'error'}
            variant="outlined"
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '15px' },
            }}
            label={`${errorCount} Errors`}
          />
          <Chip
            color={'success'}
            variant="outlined"
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '15px' },
            }}
            label={`${createdCount} Created`}
          />

          <Chip
            color={'error'}
            variant="outlined"
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '15px' },
            }}
            label={`${deletedCount} Deleted`}
          />
          <Chip
            color={'success'}
            variant="outlined"
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '15px' },
            }}
            label={`${updatedCount} Updated`}
          />

          <Stack sx={{ position: 'relative', top: 3 }}>
            <FilterPopOver
              customWidth={160}
              IconStyle={{
                width: 25,
                height: 25,
                '& .css-1rhksjl-MuiSvgIcon-root': {
                  fontSize: '20px',
                },
              }}
              IconChildren={
                <InfoOutlinedIcon
                  sx={{
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                />
              }
              sx={{ overflow: 'hidden' }}
            >
              <Typography sx={{ fontWeight: 'bold', pt: 1, pl: 1, mb: 1 }}>Info</Typography>
              <MenuItem>
                <Stack flexDirection={'row'} alignItems="center" gap={3}>
                  <Typography variant="caption" flexWrap={true}>
                    Flush categories
                  </Typography>

                  <Checkbox
                    sx={{
                      width: '10px',
                      height: '10px',
                      '& .MuiCheckbox-root': {
                        width: '10px',
                        height: '10px',
                      },
                    }}
                    checked={!!get(receivedLog, 'flush_categories')}
                    disabled
                  />
                </Stack>
              </MenuItem>

              <Divider />
              <MenuItem>
                <Stack flexDirection={'row'} alignItems="center" gap={3}>
                  <Typography variant="caption" flexWrap={true}>
                    Flush charges
                  </Typography>

                  <Checkbox
                    sx={{
                      width: '10px',
                      height: '10px',
                      '& .MuiCheckbox-root': {
                        width: '10px',
                        height: '10px',
                      },
                    }}
                    checked={!!get(receivedLog, 'flush_charges')}
                    disabled
                  />
                </Stack>
              </MenuItem>
              <Divider />
              <MenuItem>
                <Stack flexDirection={'row'} alignItems="center" gap={3}>
                  <Typography variant="caption" flexWrap={true}>
                    Flush items
                  </Typography>

                  <Checkbox
                    sx={{
                      width: '10px',
                      height: '10px',
                      '& .MuiCheckbox-root': {
                        width: '10px',
                        height: '10px',
                      },
                    }}
                    checked={!!get(receivedLog, 'flush_items')}
                    disabled
                  />
                </Stack>
              </MenuItem>
              <Divider />
              <MenuItem>
                <Stack flexDirection={'row'} alignItems="center" gap={3}>
                  <Typography variant="caption" flexWrap={true}>
                    Flush option groups
                  </Typography>

                  <Checkbox
                    sx={{
                      width: '10px',
                      height: '10px',
                      '& .MuiCheckbox-root': {
                        width: '10px',
                        height: '10px',
                      },
                    }}
                    checked={!!get(receivedLog, 'flush_option_groups')}
                    disabled
                  />
                </Stack>
              </MenuItem>
              <Divider />
              <MenuItem>
                <Stack flexDirection={'row'} alignItems="center" gap={3}>
                  <Typography variant="caption" flexWrap={true}>
                    Flush options
                  </Typography>

                  <Checkbox
                    sx={{
                      width: '10px',
                      height: '10px',
                      '& .MuiCheckbox-root': {
                        width: '10px',
                        height: '10px',
                      },
                    }}
                    checked={!!get(receivedLog, 'flush_options')}
                    disabled
                  />
                </Stack>
              </MenuItem>
              <Divider />
              <MenuItem>
                <Stack flexDirection={'row'} alignItems="center" gap={3}>
                  <Typography variant="caption" flexWrap={true}>
                    Flush taxes
                  </Typography>

                  <Checkbox
                    sx={{
                      width: '10px',
                      height: '10px',
                      '& .MuiCheckbox-root': {
                        width: '10px',
                        height: '10px',
                      },
                    }}
                    checked={!!get(receivedLog, 'flush_taxes')}
                    disabled
                  />
                </Stack>
              </MenuItem>
              <Divider />
            </FilterPopOver>
          </Stack>
        </Stack>
      )}

      <Box
        sx={{
          height: 'calc(100vh - 18.2rem)',
          overflowY: 'auto',
          ...hideScrollbar,
          overflowX: 'clip',
        }}
      >
        {!selectedTab?.id && (
          <Stack
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            sx={{ height: '95%' }}
          >
            <Typography sx={{ opacity: 0.5, fontWeight: 'bold' }}>Select feature</Typography>
          </Stack>
        )}
        <Stack gap={2} mt={2}>
          {map(detailsData, (_item) => {
            return (
              <CalalogueCard
                selectedTab={selectedTab}
                _item={_item}
                onlineCategoryList={onlineCategoryList}
                onlineOptionsGrpList={onlineOptionsGrpList}
                onlineItemsList={onlineItemsList}
              />
            );
          })}
        </Stack>
      </Box>
    </>
  );
};

export default CreateCalalogue;
