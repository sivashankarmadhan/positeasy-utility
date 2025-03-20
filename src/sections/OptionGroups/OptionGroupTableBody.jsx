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
import { ACTIVE, StatusConstants } from 'src/constants/AppConstants';
import { base64_images } from 'src/constants/ImageConstants';
import Iconify from 'src/components/iconify';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import Label from 'src/components/label';
// import ViewTimingDialog from '../OnlineCategory/ViewTimingDialog';
import { get, includes, map } from 'lodash';
import ViewTranslateDialog from './ViewTranslateDialog';
import moment from 'moment';
import { upperCase } from 'lodash';
import ViewTableDialog from 'src/components/ViewTableDialog';

const OptionGroupTableBody = ({ data, setOpen, selected, setSelected }) => {
  const [isHover, setIsHover] = useState(false);
  const [isOpenTranslateDialog, setIsOpenTranslateDialog] = useState(false);
  const [isOpenItemsDialog, SetIsOpenItemsDialog] = useState(false);
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

  const isActive = data?.status === upperCase(ACTIVE);

  const selectedUser = selected.indexOf(data?.groupId) !== -1;

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
      <TableRow onMouseEnter={mouseEnterFunction} onMouseLeave={mouseLeaveFunction} hover>
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
              onChange={(event) => handleClick(event, data?.groupId)}
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
            <IconButton onClick={() => SetIsOpenItemsDialog(true)}>
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
        <TableCell>{data?.attributes?.min_selectable || '--'}</TableCell>
        <TableCell>{data?.attributes?.max_selectable || '--'}</TableCell>

        {/* <TableCell align="left">
          <IconButton onClick={() => setIsOpenTranslateDialog(true)}>
            <Iconify
              icon={'material-symbols:translate'}
              sx={{ mr: 1, color: theme.palette.primary.main }}
            />
          </IconButton>
        </TableCell> */}
        <TableCell align="left">{data?.attributes?.sort_order}</TableCell>
      </TableRow>
      <ViewTranslateDialog
        isOpen={isOpenTranslateDialog}
        onClose={() => {
          setIsOpenTranslateDialog(false);
        }}
        translations={data?.attributes?.translations}
      />

      <ViewTableDialog
        isOpen={isOpenItemsDialog}
        onClose={() => {
          SetIsOpenItemsDialog(false);
        }}
        data={map(data?.association, (_product) => ({
          ['Product ID']: get(_product, 'productId'),
          Name: get(_product, 'name'),
        }))}
        title="Item list"
      />
    </>
  );
};

export default OptionGroupTableBody;
