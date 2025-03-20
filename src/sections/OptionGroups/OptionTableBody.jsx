import {
  Box,
  Checkbox,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { sentenceCase } from 'change-case';
import React, { useState } from 'react';
import { StatusConstants } from 'src/constants/AppConstants';
import { base64_images } from 'src/constants/ImageConstants';
import Iconify from 'src/components/iconify';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import Label from 'src/components/label';
// import ViewTimingDialog from '../OnlineCategory/ViewTimingDialog';
import { get, includes, isBoolean, map } from 'lodash';
import ViewTranslateDialog from './ViewTranslateDialog';
import moment from 'moment';
import VegNonIcon from './VegNonIcon';
import ViewTableDialog from 'src/components/ViewTableDialog';

const OptionTableBody = ({ data, setOpen, selected, setSelected }) => {
  const [isHover, setIsHover] = useState(false);
  const [isOpenTranslateDialog, setIsOpenTranslateDialog] = useState(false);
  const [isOpenOptionsDialog, setIsOpenOptionsDialog] = useState(false);
  const [isOpenTimingDialogOpen, setIsOpenTimingDialogOpen] = useState(false);

  const theme = useTheme();

  const isMobile = useMediaQuery('(max-width:600px');

  const mouseEnterFunction = () => {
    setIsHover(true);
  };

  const mouseLeaveFunction = () => {
    setIsHover(false);
  };

  const handleOpenMenu = (event, data) => {
    setOpen({ open: true, eventData: event.currentTarget, data: data });
  };

  const isActive = data?.attributes?.turnOnAt
    ? data?.attributes?.turnOnAt <= moment().unix() * 1000
    : data?.isAvailable === 'true' || data?.isAvailable === true;

  const selectedUser = selected.indexOf(data?.optionId) !== -1;

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  return (
    <>
      <TableRow
        onMouseEnter={mouseEnterFunction}
        onMouseLeave={mouseLeaveFunction}
        hover
        key={data?.optionId}
        tabIndex={-1}
        role="checkbox"
        selected={selectedUser}
      >
        <TableCell
          padding="checkbox"
          sx={{
            pr: 3,
            position: 'sticky',
            left: 0,
            backgroundColor: isHover ? '#F4F6F8' : 'white',
            zIndex: 95,
          }}
        >
          <Stack sx={{ display: 'flex', flexDirection: 'row' }}>
            <Checkbox
              checked={selectedUser}
              onChange={(event) => handleClick(event, data?.optionId)}
            />
            <IconButton
              size="large"
              color="inherit"
              onClick={(event) => handleOpenMenu(event, data)}
            >
              <Iconify icon={'eva:more-vertical-fill'} />
            </IconButton>
          </Stack>
        </TableCell>

        <TableCell
          align="left"
          sx={{
            position: isMobile ? 'static' : 'sticky',
            left: 80,
            backgroundColor: isHover ? '#F6F7F8' : 'white',
            zIndex: 95,
          }}
        >
          <Typography variant="subtitle2" noWrap>
            {data?.title}
            <Label sx={{ ml: 2 }} color={isActive ? 'success' : 'error'}>
              {isActive ? 'Active' : 'Disable'}
            </Label>
          </Typography>
        </TableCell>
        <TableCell>{data?.description || '--'}</TableCell>
        <TableCell>
          <div style={{ position: 'relative' }}>
            <IconButton onClick={() => setIsOpenOptionsDialog(true)}>
              <Iconify icon={'mdi:cart'} sx={{ mr: 1, color: theme.palette.primary.main }} />
            </IconButton>
            {data?.association?.length && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 18,
                  backgroundColor: theme.palette.success.main,
                  borderRadius: 20,
                  height: 15,
                  width: 15,
                  color: theme.palette.common.white,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 'bolder' }}>
                  {data?.association?.length}
                </Typography>
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>{data?.attributes?.weight || '--'}</TableCell>
        <TableCell>
          {data?.attributes?.food_type == 1 && <VegNonIcon color={'green'} />}
          {data?.attributes?.food_type == 2 && <VegNonIcon color={'red'} />}
          {data?.attributes?.food_type == 3 && <VegNonIcon color={'yellow'} />}
          {data?.attributes?.food_type == 4 && 'for Not specified'}
        </TableCell>
        <TableCell>{data?.price}</TableCell>
        {/* <TableCell align="left">
          <IconButton onClick={() => setIsOpenTranslateDialog(true)}>
            <Iconify
              icon={'material-symbols:translate'}
              sx={{ mr: 1, color: theme.palette.primary.main }}
            />
          </IconButton>
        </TableCell> */}
        <TableCell align="left">
          <Checkbox checked={!!data?.attributes?.recommended} disabled />
        </TableCell>
        <TableCell component="th" scope="row" padding="none" sx={{ pl: 1.5 }}>
          <Box
            sx={{
              position: 'relative',
            }}
          >
            <Box
              component="img"
              alt={data?.name}
              src={
                data?.attributes.img_url ? data?.attributes.img_url : base64_images.Custom_No_Image
              }
              sx={{
                minWidth: 60,
                width: 54,
                height: 59,
                borderRadius: 1,
                flexShrink: 0,
              }}
            />
          </Box>
        </TableCell>
      </TableRow>
      <ViewTranslateDialog
        isOpen={isOpenTranslateDialog}
        onClose={() => {
          setIsOpenTranslateDialog(false);
        }}
        translations={data?.attributes?.translations}
      />

      <ViewTableDialog
        isOpen={isOpenOptionsDialog}
        onClose={() => {
          setIsOpenOptionsDialog(false);
        }}
        data={map(data?.association, (_item) => ({
          ['Group ID']: get(_item, 'groupId'),
          Name: get(_item, 'title'),
        }))}
        title="Options group list"
      />
    </>
  );
};

export default OptionTableBody;
