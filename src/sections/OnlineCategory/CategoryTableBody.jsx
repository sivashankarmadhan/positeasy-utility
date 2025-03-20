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
import ViewITranslateDialog from './ViewITranslateDialog';
import ViewTimingDialog from './ViewTimingDialog';
import { find, get, includes } from 'lodash';
import { map } from 'lodash';
import ViewTableDialog from 'src/components/ViewTableDialog';

const CategoryTableBody = ({
  data,
  setOpen,
  selected,
  setSelected,
  productList,
  onlineCategoryList,
}) => {
  const [isHover, setIsHover] = useState(false);
  const [isOpenTranslateDialog, setIsOpenTranslateDialog] = useState(false);
  const [isOpenTimingDialogOpen, setIsOpenTimingDialogOpen] = useState(false);
  const [isOpenItemsDialog, SetIsOpenItemsDialog] = useState(false);

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

  const isActive = includes(data?.status?.activeIn, 'online');

  const selectedUser = selected.indexOf(data?.id) !== -1;

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

  const formatAssociatedItems = map(data?.associatedItems, (_id) => {
    const findData = find(productList, (_product) => get(_product, 'productId') === _id);
    return {
      ['Product ID']: get(findData, 'productId'),
      Name: get(findData, 'name'),
    };
  });

  const parentRefName = find(
    onlineCategoryList,
    (_category) => get(_category, 'id') === data?.parent_ref_id
  )?.name;

  return (
    <>
      <TableRow
        onMouseEnter={mouseEnterFunction}
        onMouseLeave={mouseLeaveFunction}
        hover
        key={data?.id}
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
            <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, data?.id)} />
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
            {data?.name}
            <Label sx={{ ml: 2 }} color={isActive ? 'success' : 'error'}>
              {isActive ? 'Active' : 'Disable'}
            </Label>
          </Typography>
        </TableCell>
        <TableCell>{data?.description}</TableCell>
        <TableCell>{parentRefName || '--'}</TableCell>

        <TableCell align="center">
          <div style={{ position: 'relative' }}>
            <IconButton onClick={() => SetIsOpenItemsDialog(true)}>
              <Iconify icon={'mdi:cart'} sx={{ mr: 1, color: theme.palette.primary.main }} />
            </IconButton>

            {!!data?.associatedItems?.length && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 60,
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
                  {data?.associatedItems?.length}
                </Typography>
              </div>
            )}
          </div>
        </TableCell>

        {/* <TableCell align="left">
          <IconButton onClick={() => setIsOpenTranslateDialog(true)}>
            <Iconify
              icon={'material-symbols:translate'}
              sx={{ mr: 1, color: theme.palette.primary.main }}
            />
          </IconButton>
        </TableCell> */}
        <TableCell align="left">{data?.attributes?.sortOrder}</TableCell>
        <TableCell align="left">{data?.attributes?.sessionInfo?.title || '-'}</TableCell>
        <TableCell align="left">
          <IconButton
            onClick={() => setIsOpenTimingDialogOpen(true)}
            disabled={!data?.attributes?.sessionInfo}
          >
            <Iconify
              icon={'ri:time-line'}
              style={{
                mr: 1,
                color: data?.attributes?.sessionInfo ? theme.palette.primary.main : '',
              }}
              width={24}
            />
          </IconButton>
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
              src={data?.image ? data?.image : base64_images.Custom_No_Image}
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
      <ViewITranslateDialog
        isOpen={isOpenTranslateDialog}
        onClose={() => {
          setIsOpenTranslateDialog(false);
        }}
        translations={data?.attributes?.translations}
      />
      <ViewTimingDialog
        isOpen={isOpenTimingDialogOpen}
        onClose={() => {
          setIsOpenTimingDialogOpen(false);
        }}
        timing={data?.attributes?.sessionInfo}
      />

      <ViewTableDialog
        isOpen={isOpenItemsDialog}
        onClose={() => {
          SetIsOpenItemsDialog(false);
        }}
        data={formatAssociatedItems}
        title="Item list"
      />
    </>
  );
};

export default CategoryTableBody;
