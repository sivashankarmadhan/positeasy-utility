// @mui
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Autocomplete,
  Button,
  Card,
  Dialog,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { filter, find, get, groupBy, isEmpty, map, some } from 'lodash';
import Auth_API from 'src/services/auth';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';

// ----------------------------------------------------------------------

export default function ManageStoreEditAccessDialog(props) {
  const theme = useTheme();
  const { open, handleClose, selectedStore, getStores, storeList, editManagerDetails } = props;

  // const storeList = useRecoilValue(stores);
  const [selectedStoreList, setSelectedStoreList] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const groupedStoresData = groupBy(storeList, 'storeId');
  const storeLabelList = map(groupedStoresData, (terminal, store) => {
    return {
      id: store,
      label: get(terminal, '0.storeName'),
    };
  });

  console.log('storeLabelList', storeLabelList);

  const checkCurrentStoreList = (status) => {
    const findData = find(selectedStoreList, (_item) => {
      return get(_item, 'id') === status;
    });
    return status === selectedStore || !!findData;
  };

  const handleChangeStatus = (e) => {
    setSelectedStoreList(e);
  };

  const getStoreName = (storeId) => {
    const terminals = find(storeList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(selectedStore);

  const handleCloseDialog = () => {
    handleClose();
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const checkOptions = {
        storeId: selectedStore,
        terminalNumber: get(editManagerDetails, 'terminalNumber'),
        multiAccessId: map(selectedStoreList, (_item) => get(_item, 'id')),
      };
      await Auth_API.updateManagerAccountAccess(checkOptions);
      toast.success(SuccessConstants.MANAGER_ACCOUNT_ACCESS_IS_CHANGED_SUCCESSFULLY);
      handleCloseDialog();
      getStores();
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isEmpty(storeList) && open) {
      const filterData = filter(storeLabelList, (_item) => {
        const findData = find(get(editManagerDetails, 'multiAccessId'), (_access) => {
          return _access === get(_item, 'id');
        });
        return !!findData;
      });

      const findCurrentStore = find(filterData, (_item) => {
        return get(_item, 'id') === selectedStore;
      });

      const removeCurrentStore = filter(filterData, (_item) => {
        return get(_item, 'id') !== selectedStore;
      });

      setSelectedStoreList([findCurrentStore, ...(removeCurrentStore || [])]);
    }
  }, [storeList, open]);

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 310, md: 360, sm: 400 } }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create or remove manager account access for &nbsp;
            <Typography variant="h6" sx={{ display: 'inline' }} color={theme.palette.primary.main}>
              {storeName}
            </Typography>
          </Typography>
          <Tooltip title="Close">
            <IconButton
              sx={{ color: theme.palette.main, height: 40 }}
              onClick={() =>  handleCloseDialog()}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack spacing={2}>
          <Autocomplete
            multiple
            size="small"
            filterSelectedOptions
            getOptionDisabled={(option) => checkCurrentStoreList(option.id)}
            options={storeLabelList}
            sx={{
              '& .MuiInputBase-root .MuiButtonBase-root:first-child .MuiSvgIcon-root': {
                display: 'none',
              },
            }}
            value={selectedStoreList}
            onChange={(event, newValue) => handleChangeStatus(newValue)}
            renderInput={(params) => <TextField variant="filled" {...params} label={'Stores'} />}
          />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            onClick={onSubmit}
          >
            Access
          </LoadingButton>
        </Stack>
      </Card>
    </Dialog>
  );
}
