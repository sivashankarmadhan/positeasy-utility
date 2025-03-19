import { Button, Card, Checkbox, Dialog, Stack, TextField, Typography } from '@mui/material';
import { filter, get, isArray, isEmpty, isObject, map, some } from 'lodash';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from 'recoil';
import { defaultOrderTypes, OrderTypeConstants } from 'src/constants/AppConstants';
import {
  alertDialogInformationState,
  allConfiguration,
  currentStoreId,
} from 'src/global/recoilState';
import SettingServices from 'src/services/API/SettingServices';
import { formatOrderTypeDataStrucutre } from 'src/utils/formatOrderTypeDataStrucutre';

export default function OrderTypeDialog(props) {
  const { open, handleClose, viewMode, handleCloseView, initialFetch } = props;
  const currentStore = useRecoilValue(currentStoreId);

  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const [alertDialogInformation, setAlertDialogInformation] = useRecoilState(
    alertDialogInformationState
  );
  const previousOrderTypeList = get(configuration, 'isOrderType.orderTypes', defaultOrderTypes);
  const isPreviousSaveOrderType = get(configuration, `isOrderType.isSaveOrderType`, false);
  const [isSaveOrderType, setIsSaveOrderType] = useState(isPreviousSaveOrderType);
  const formattedOrderList = formatOrderTypeDataStrucutre(previousOrderTypeList);
  const [orderTypes, setOrderTypes] = useState(formattedOrderList);
  const [_orderType, _setOrderType] = useState('');
  const handleChange = (e) => {
    const { name, value } = e.target;
    _setOrderType(value?.toUpperCase());
  };
  const handleAddNew = (e) => {
    setOrderTypes((prev) => {
      const isPrevious = some(prev, (e) => e?.toUpperCase() === _orderType?.toUpperCase());
      if (!isPrevious) {
        return [...prev, _orderType];
      } else {
        toast.error('Duplicate values not allowed');
        return prev;
      }
    });
    _setOrderType('');
  };
  const handleSubmit = async () => {
    try {
      const options = {
        isOrderType: {
          isActive: true,
          orderTypes: orderTypes,
          isSaveOrderType,
        },
      };
      const response = await SettingServices.postConfiguration(options);
      if (response) toast.success('Saved successfully');
      handleClose();
    } catch (e) {
      console.log(e);
    }
  };
  const handleAlertDialog = (title) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure you want to remove the ${title} type`,
      actions: {
        primary: {
          text: title,
          onClick: (onClose) => {
            handleRemoveOrderType(title);
            onClose();
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          sx: {
            color: '#000',
          },
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };
  const handleRemoveOrderType = (value) => {
    setOrderTypes((prev) => {
      const filtered = filter(prev, (e) => e !== value);
      return filtered;
    });
    _setOrderType('');
  };
  return (
    <Dialog open={open || viewMode}>
      <Card sx={{ p: 2, width: { xs: 320, sm: 500 }, overflowY: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Order Types
        </Typography>

        <Stack
          flexDirection={'row'}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 2,
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            value={_orderType}
            placeholder={'Enter new order type'}
            sx={{ mb: 3 }}
            type="text"
            size="small"
            onChange={handleChange}
          />
          <Button
            disabled={!_orderType}
            size="small"
            sx={{ height: 40 }}
            onClick={handleAddNew}
            variant="contained"
          >
            Add
          </Button>
        </Stack>
        {!isEmpty(orderTypes) ? (
          <>
            {map(orderTypes, (value, index) => (
              <Stack
                key={index}
                flexDirection={'row'}
                justifyContent={'space-between'}
                marginBottom={1}
                sx={{
                  display: 'flex',
                  justifyItems: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography defaultValue={value} name={value} sx={{ fontSize: '14px' }}>
                  {value}
                </Typography>
                <Button
                  disabled={defaultOrderTypes.includes(value)}
                  size="small"
                  onClick={() => handleAlertDialog(value)}
                  variant="contained"
                  sx={{ fontSize: '11px' }}
                >
                  Remove
                </Button>
              </Stack>
            ))}
          </>
        ) : (
          <></>
        )}

        <Stack
          flexDirection={'row'}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2,
            gap: 1,
          }}
        >
          <Stack
            gap={1}
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              mt: '8px',
            }}
          >
            <Checkbox
              size="small"
              checked={isSaveOrderType}
              onChange={(event) => {
                setIsSaveOrderType(event.target.checked);
              }}
            />
            <Typography variant="caption" sx={{ whiteSpace: 'nowrap', ml: -1 }}>
              Save order type
            </Typography>
          </Stack>
          <Stack
            flexDirection={'row'}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 2,
              gap: 1,
            }}
          >
            <Button sx={{ height: 40 }} onClick={handleClose} variant="contained">
              Close
            </Button>
            <Button sx={{ height: 40 }} onClick={handleSubmit} variant="contained">
              Submit
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Dialog>
  );
}
