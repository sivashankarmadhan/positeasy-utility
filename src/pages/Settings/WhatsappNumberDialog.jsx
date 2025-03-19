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
import { filter, find, get, isEqual, map, includes } from 'lodash';
import CloseIcon from '@mui/icons-material/Close';
import { alertDialogInformationState } from 'src/global/recoilState';
import { useSetRecoilState } from 'recoil';
import { LoadingButton } from '@mui/lab';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import toast from 'react-hot-toast';

export default function WhatsappNumberDialog(props) {
  const { open, handleClose, handlePostConfiguration, endShiftConfig, isLoading, handleSubmit,dailySummary } =
    props;

  const theme = useTheme();

  const [contact, setContact] = useState('');
  const [contactList, setContactList] = useState([]);
  const [editedIndex, setEditedIndex] = useState(null);
  
console.log('contact',contact);
console.log('v',contactList);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const isEditFlow = editedIndex !== null;

  const editContactNumber = find(contactList, (__contact, _index) => {
    return _index === editedIndex;
  });


  const remove91InContacts = (contacts) => {
    return map(contacts, (_contact) => {
      return _contact?.substring?.(2);
    });
  };

  const handleAddContact = () => {
    if (isEditFlow) {
      const formatData = map(contactList, (contactData, index) => {
        if (index === editedIndex) {
          return contact;
        }
        return contactData;
      });
      setContactList(formatData || []);
      setContact('');
      setEditedIndex(null);
    } else {
      if (includes(contactList, contact)) {
        toast.error("Number already exists")
      } else {
        setContactList([...contactList,contact])
        setContact('');
      }
    }
  };

  const handleDelete = (_index) => {
    const filterData = filter(contactList, (contact, index) => {
      return index !== _index;
    });
    setContactList(filterData || []);
    setEditedIndex(null);
    setContact('');
  };

  const handleEdit = (_contact, _index) => {
    setEditedIndex(_index);
    setContact(_contact);
  };

  console.log("endShiftConfig", endShiftConfig);

  useEffect(() => {
    if (open) {
      setContact('');
      setContactList(remove91InContacts(get(endShiftConfig, 'contactList') || []));
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

  console.log("contactList", contactList);

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
            Sale summary
            </Typography>
          </Stack>

          <Divider sx={{ border: '0.9px dashed #A6A6A6' }} />
        </Stack>

        <Stack flexDirection={'row'} gap={1} marginBottom={1}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            type="number"
            placeholder={'Contact number'}
            value={contact}
            onChange={(e) => {
              if (String(e.target.value).length <= 10) {
                setContact(e.target.value);
              }
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start">+91</InputAdornment>,
            }}
            disabled={  contactList?.length == 5 && !isEditFlow}
          />
          <Stack flexDirection="row" gap={1}>
            {isEditFlow && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditedIndex(null);
                  setContact('');
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleAddContact}
              disabled={contact?.length !== 10 || (isEditFlow && editContactNumber === contact)}
            >
              {isEditFlow ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Stack>

        <Stack mt={2}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Contact list
          </Typography>

          <Stack
            flexDirection="column"
            gap={1.5}
            sx={{ maxHeight: '35vh', height: '35vh', overflow: 'auto' }}
          >
            {map(contactList, (_contact, _index) => {
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
                  <Typography>+91{_contact}</Typography>

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
            {!contactList?.length && (
              <Stack
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={1.5}
                sx={{ maxHeight: '35vh', height: '35vh', overflow: 'auto' }}
              >
                <PhoneDisabledIcon sx={{ fontSize: '30px' }} />
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
              !contactList?.length ||
              (isEqual(remove91InContacts(get(endShiftConfig, 'contactList') || []), contactList) &&
                get(endShiftConfig, 'isActive'))
            }
            onClick={() => handleSubmit(contactList)}
            loading={isLoading}
          >
            Submit
          </LoadingButton>
        </Stack>
      </Card>
    </Dialog>
  );
}
