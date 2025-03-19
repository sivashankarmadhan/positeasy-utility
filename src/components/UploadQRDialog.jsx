import { Card, Dialog, IconButton, Stack, Tooltip, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import gif from '../assets/animation_llhrhcu0_small.gif';
import CloseIcon from '@mui/icons-material/Close';

export default function UploadQRDialog(props) {
  const theme = useTheme();
  const { open, handleClose } = props;
  const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const BACKSPACE = ['-'];
  const DELETE = ['.'];
  const ENTER = ['Enter'];
  const NUMBER2EXCEPTIONS = ['/', '*', 'Enter', '+'];
  const START_KEY = ['{'];
  const isQRData = useRef(false);
  const [value, setValue] = useState('');
  const handleKeyPress = (e) => {
    const key = e.key;
    return;
    if (!BACKSPACE.includes(key) && !DELETE.includes(key) && !NUMBER2EXCEPTIONS.includes(key)) {
      setValue((prevState) => {
        if (prevState.length < 10) {
          return prevState.concat(key);
        } else return prevState;
      });
    }

    if (START_KEY.includes(key)) {
      isQRData.current = true;
    }

    if (ENTER.includes(key)) {
      if (isQRData.current) {
        isQRData.current = false;
      }
    }

    if (BACKSPACE.includes(key)) {
      setValue((prevState) => {
        return prevState.slice(0, -1);
      });
    }
    if (DELETE.includes(key)) {
      setValue('');
    }
  };
  const handleCloseDialog = () => {
    const data = {
      name: 'demo',
      category: 'TEST',
      description: 'dfdfdffdfd',
      price: 10,
      counter: '',
      tag: '',
      isVeg: true,
      productImage:
        'https://positeasy.s3.ap-south-1.amazonaws.com/MID-128518ee-3db0-42cc-a282-a15365b648da/Store1s/product-image/photos/T1-Img-35757c7a-6b00-49bf-9ac5-9bf3e9666f9c.jpeg',
      unitsEnabled: false,
    };
    handleClose(data);
  };
  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress, false);
    return () => {
      document.removeEventListener('keypress', handleKeyPress, false);
    };
  }, []);

  return (
    <Dialog open={open}>
      <Card sx={{ p: 1 }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <img src={gif} alt="qr animation" />
          <Tooltip title="Close">
            <IconButton
              sx={{ color: theme.palette.main, height: 40 }}
              onClick={() =>  handleCloseDialog()}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Card>
    </Dialog>
  );
}
