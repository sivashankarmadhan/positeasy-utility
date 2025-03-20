import { Chip, IconButton, Stack, TableCell, TableRow, Typography, useTheme } from '@mui/material';
import { find, get, map } from 'lodash';

import React, { useState } from 'react';
import Iconify from 'src/components/iconify';

import Label from 'src/components/label';
import ViewTableDialog from 'src/components/ViewTableDialog';

const TaxesAndChargesTableBody = ({ data, setOpen, selected, setSelected, productList, type }) => {
  const theme = useTheme();
  const [isHover, setIsHover] = useState(false);
  const [isOpenItemsDialog, SetIsOpenItemsDialog] = useState(false);

  const isTax = type === 'TAX';

  const mouseEnterFunction = () => {
    setIsHover(true);
  };

  const mouseLeaveFunction = () => {
    setIsHover(false);
  };

  const selectedUser = selected.indexOf(data?.id) !== -1;

  const isActive = data?.isActive === 'true' || data?.isActive === true;

  const handleOpenMenu = (event, data) => {
    setOpen({ open: true, eventData: event.currentTarget, data: data });
  };

  const associatedItems =
    get(data, 'associatedItems')?.[0] !== 'all'
      ? map(get(data, 'associatedItems'), (_item) => {
          const findData = find(productList, (_product) => {
            return get(_product, 'productId') === _item;
          });

          return {
            Name: get(findData, 'name'),
            ['Product ID']: get(findData, 'productId'),
          };
        })
      : map(productList, (_product) => ({
          Name: get(_product, 'name'),
          ['Product ID']: get(_product, 'productId'),
        }));

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

        <TableCell>{data?.structure?.value}</TableCell>
        <TableCell>{data?.description}</TableCell>

        <TableCell>
          <div style={{ position: 'relative' }}>
            <IconButton onClick={() => SetIsOpenItemsDialog(true)}>
              <Iconify icon={'mdi:cart'} sx={{ mr: 1, color: theme.palette.primary.main }} />
            </IconButton>

            {associatedItems?.length && (
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
                  {associatedItems?.length}
                </Typography>
              </div>
            )}
          </div>
        </TableCell>
        {!isTax && (
          <>
            <TableCell>
              <Stack flexDirection="row" gap={1}>
                {(data?.attributes?.fulfillment_modes?.[0] === 'delivery' ||
                  data?.attributes?.fulfillment_modes?.[1] === 'delivery') && (
                  <Chip size="small" color="warning" label="Delivery" sx={{ cursor: 'pointer' }} />
                )}
                {(data?.attributes?.fulfillment_modes?.[0] === 'pickup' ||
                  data?.attributes?.fulfillment_modes?.[1] === 'pickup') && (
                  <Chip size="small" color="info" label="Pickup" sx={{ cursor: 'pointer' }} />
                )}
              </Stack>
            </TableCell>

            <TableCell>
              <Stack flexDirection="row" gap={1}>
                {(data?.attributes?.included_platforms?.[0] === 'zomato' ||
                  data?.attributes?.included_platforms?.[1] === 'zomato') && (
                  <img
                    src={`/assets/images/zomato.png`}
                    style={{ width: '3rem', height: '1rem' }}
                    alt=""
                  />
                )}
                {(data?.attributes?.included_platforms?.[0] === 'swiggy' ||
                  data?.attributes?.included_platforms?.[1] === 'swiggy') && (
                  <img
                    src={`/assets/images/Swiggy.png`}
                    style={{ width: '3rem', height: '1rem' }}
                    alt=""
                  />
                )}
              </Stack>
            </TableCell>

            {/* <TableCell>{data?.attributes?.included_platforms?.join(', ') || '--'}</TableCell> */}
          </>
        )}
      </TableRow>

      <ViewTableDialog
        isOpen={isOpenItemsDialog}
        onClose={() => {
          SetIsOpenItemsDialog(false);
        }}
        data={associatedItems}
        title="Item list"
      />
    </>
  );
};

export default TaxesAndChargesTableBody;
