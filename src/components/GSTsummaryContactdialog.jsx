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
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { filter, find, get, isEqual, map } from 'lodash';
import CloseIcon from '@mui/icons-material/Close';
import { alertDialogInformationState } from '../global/recoilState';
import { useSetRecoilState } from 'recoil';
import { LoadingButton } from '@mui/lab';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export default function GSTsummaryContactdialog(props) {
  const {
    open,
    handleClose,
    handlePostConfiguration,
    endShiftConfig,
    isLoading,
    handleSubmit,
    dailySummary,
  } = props;

  const theme = useTheme();
  const CustomFlagImage = []; 


  const [contact, setContact] = useState('+91');
  const [contactList, setContactList] = useState([]);
  const [editedIndex, setEditedIndex] = useState(null);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const isEditFlow = editedIndex !== null;

  const editContactNumber = find(contactList, (__contact, _index) => {
    return _index === editedIndex;
  });

  const isPhoneValid = (phone) => {
    try {
      const parsedNumber = phoneUtil.parseAndKeepRawInput(phone, phoneUtil.getRegionCodeForNumber(phoneUtil.parse(phone)));
      return phoneUtil.isValidNumber(parsedNumber) && phoneUtil.isPossibleNumber(parsedNumber);
    } catch (error) {
      return false;
    }
  };
  
  const remove91InContacts = (contacts) => {
    return map(contacts, (_contact) => {
      return _contact?.substring?.();
    });
  };
  
  const handleAddContact = () => {
    if (!isPhoneValid(contact)) {
      return;
    }
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
      setContactList((prev) => [...prev, contact]);
      setContact('');
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

  useEffect(() => {
    if (open) {
      setContact('+91');
      setContactList(remove91InContacts(get(endShiftConfig, 'contactList') || []));
    }
  }, [open]);

  useEffect(() => {
    if (!contact.startsWith('+91')) {
      setContact('+91');
    }
  }, []);

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
              GST summary
            </Typography>
          </Stack>

          <Divider sx={{ border: '0.9px dashed #A6A6A6' }} />
        </Stack>

        <Stack
          flexDirection={'row'}
          gap={1}
          marginBottom={1}
          sx={{
            '& .react-international-phone-input-container': {
              width: '100%',
            },
            '& .react-international-phone-input': {
              width: '100%',
            },
          }}
        >
          <PhoneInput
            autoFocus
            fullWidth
            size="small"
            type="number"
            placeholder={'Contact number'}
            value={contact}
            onChange={(phone) => setContact(phone)}
            disabled={contactList.length >= (dailySummary || 1) && !isEditFlow}
            defaultCountry="IN"
            flags={[]} 
            disableDialCodePrefill={false}

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
              disabled={!contact || !isPhoneValid(contact)}
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
