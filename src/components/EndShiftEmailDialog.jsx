import {
  Button,
  Card,
  Dialog,
  Stack,
  TextField,
  Typography,
  IconButton,
  Divider,
  InputAdornment,
  Box,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { filter, find, get, isEqual, map } from 'lodash';
import CloseIcon from '@mui/icons-material/Close';
import { alertDialogInformationState } from '../global/recoilState';
import { useSetRecoilState } from 'recoil';
import { LoadingButton } from '@mui/lab';
import { validateEmail } from 'src/utils/validation';
import WebAssetOffIcon from '@mui/icons-material/WebAssetOff';

export default function EndShiftEmailDialog(props) {
  const { open, handleClose, handlePostConfiguration, endShiftConfig, isLoading, handleSubmit } =
    props;

  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [editedIndex, setEditedIndex] = useState(null);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const isEditFlow = editedIndex !== null;

  const editContactNumber = find(emailList, (__contact, _index) => {
    return _index === editedIndex;
  });

  // if (validateEmail(e.target.value)) {
  //   setEmail(e.target.value);
  // }

  const handleAddContact = () => {
    if (isEditFlow) {
      const formatData = map(emailList, (contactData, index) => {
        if (index === editedIndex) {
          return email;
        }
        return contactData;
      });
      setEmailList(formatData || []);
      setEmail('');
      setEditedIndex(null);
    } else {
      setEmailList((prev) => [...prev, email]);
      setEmail('');
    }
  };

  const handleDelete = (_index) => {
    const filterData = filter(emailList, (contact, index) => {
      return index !== _index;
    });
    setEmailList(filterData || []);
    setEditedIndex(null);
    setEmail('');
  };

  const handleEdit = (_contact, _index) => {
    setEditedIndex(_index);
    setEmail(_contact);
  };

  useEffect(() => {
    if (open) {
      setEmail('');
      setEmailList(get(endShiftConfig, 'emailList') || []);
    }
  }, [open]);

  const handleWarningWithAlert = (_index) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure you want to delete contact`,
      actions: {
        primary: {
          text: 'yes',
          onClick: (onClose) => {
            handleDelete(_index);
            onClose();
          },
          sx: {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
            },
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

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 360, sm: 500 }, overflowY: 'auto' }}>
        <Stack sx={{ width: '100%', mb: 3 }}>
          <Stack
            sx={{ width: '100%' }}
            flexDirection="row"
            alignItems="flex-end"
            justifyContent="space-between"
            pb={0.5}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              End shift
            </Typography>
          </Stack>

          <Divider sx={{ border: '0.9px dashed #A6A6A6' }} />
        </Stack>

        <Stack flexDirection={'row'} gap={1} marginBottom={1}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder={'Email address'}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            disabled={emailList?.length === 1 && !isEditFlow}
          />
          <Stack flexDirection="row" gap={1}>
            {isEditFlow && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditedIndex(null);
                  setEmail('');
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleAddContact}
              disabled={!validateEmail(email) || (isEditFlow && editContactNumber === email)}
            >
              {isEditFlow ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Stack>

        <Stack mt={2}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Email list
          </Typography>

          <Stack
            flexDirection="column"
            gap={1.5}
            sx={{ maxHeight: '35vh', height: '35vh', overflow: 'auto' }}
          >
            {map(emailList, (_contact, _index) => {
              return (
                <Stack
                  sx={{
                    p: 1.5,
                    border: _index === editedIndex ? '1px solid green' : '1px solid #D4D4D4',
                    borderRadius: '5px',
                    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
                  }}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography>{_contact}</Typography>

                  <Stack flexDirection="row" gap={1} alignItems="center">
                    <EditNoteIcon
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        handleEdit(_contact, _index);
                      }}
                    />
                    <DeleteOutlineIcon
                      color="error"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        handleWarningWithAlert(_index);
                      }}
                    />
                  </Stack>
                </Stack>
              );
            })}
            {!emailList?.length && (
              <Stack
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={1.5}
                sx={{ maxHeight: '35vh', height: '35vh', overflow: 'auto' }}
              >
                <WebAssetOffIcon sx={{ fontSize: '30px' }} />
                <Box sx={{ fontSize: '14px', textAlign: 'center', color: 'gray' }}>Not found</Box>
              </Stack>
            )}
          </Stack>
        </Stack>

        <Stack
          flexDirection={'row'}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 4,
            gap: 1,
          }}
        >
          <Button size="large" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton
            size="large"
            variant="contained"
            disabled={
              !emailList?.length ||
              (isEqual(get(endShiftConfig, 'emailList') || [], emailList) &&
                get(endShiftConfig, 'isActive'))
            }
            onClick={() => handleSubmit(emailList)}
            loading={isLoading}
          >
            Submit
          </LoadingButton>
        </Stack>
      </Card>
    </Dialog>
  );
}
