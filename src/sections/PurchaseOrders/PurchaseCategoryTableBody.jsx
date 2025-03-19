import { Box, Chip, IconButton, Stack, TableCell, TableRow, Typography, useTheme } from '@mui/material';
import { sentenceCase } from 'change-case';
import React, { useState } from 'react';
import { StatusConstants } from 'src/constants/AppConstants';
import { base64_images } from 'src/constants/ImageConstants';
import Iconify from 'src/components/iconify';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import Label from 'src/components/label';
import { get, includes } from 'lodash';
import { dateWithTimeAndSecFormatAMPM, fDatesWithTimeStamp, fDatesWithTimeStampFromUtc } from 'src/utils/formatTime';

const PurchaseCategoryTableBody = ({ data, setOpen }) => {
  const [isHover, setIsHover] = useState(false);
  const [isOpenTranslateDialog, setIsOpenTranslateDialog] = useState(false);
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

  const isActive = includes(data?.status?.activeIn, 'online');

  return (
    <>
      <TableRow
        onMouseEnter={mouseEnterFunction}
        onMouseLeave={mouseLeaveFunction}
        hover
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
            {data?.categoryName || '-'}
          </Typography>
        </TableCell>
        <TableCell>{data?.description || '-'}</TableCell>
        <TableCell>   <Chip
            size="small"
            color={'success'}
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '4px' },
            }}
            label={`${data?.status}`}
          /></TableCell>
           <TableCell component="th" scope="row" padding="none" sx={{ pl: 1.5 }}>
          <Box
            sx={{
              position: 'relative',
            }}
          >
            <Box
              component="img"
              alt={data?.categoryName}
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
        <TableCell align="left">
        {fDatesWithTimeStamp(
          `${get(data, 'createdAt')}`
        )}
      </TableCell>

       
      </TableRow>
    </>
  );
};

export default PurchaseCategoryTableBody;
