import { find, get, map } from 'lodash';
import React, { useState } from 'react';
import { Box, Card, Checkbox, Chip, IconButton, Stack, Typography, useTheme } from '@mui/material';
import RowContent from '../Billing/RowContent';
import { fCurrency } from 'src/utils/formatNumber';
import ArticleIcon from '@mui/icons-material/Article';
import Iconify from 'src/components/iconify';
import { ALWAYS_AVAILABLE } from 'src/constants/AppConstants';
import VegNonIcon from 'src/components/VegNonIcon';
import { base64_images } from 'src/constants/ImageConstants';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import ViewTableDialog from 'src/components/ViewTableDialog';

const CalalogueCard = ({
  onlineCategoryList,
  onlineOptionsGrpList,
  onlineItemsList,
  selectedTab,
  _item,
}) => {
  const [isOpenCategoriesDialog, setIsOpenCategoriesDialog] = useState(false);
  const [isOpenOptionGrpsDialog, setIsOpenOptionGrpsDialog] = useState(false);
  const [isOpenItemsDialog, setIsOpenItemsDialog] = useState(false);
  const theme = useTheme();

  const isItem = selectedTab?.id === 'items';
  const isCategories = selectedTab?.id === 'categories';
  const isOptions = selectedTab?.id === 'options';
  const isOptionGroups = selectedTab?.id === 'option_groups';
  const isTaxes = selectedTab?.id === 'taxes';
  const isCharges = selectedTab?.id === 'charges';

  const formatPrevItemsRefIds = map(get(_item, 'item_ref_ids'), (_id) => {
    const findData = find(onlineItemsList, (_list) => {
      return get(_list, 'productId') === _id;
    });
    return {
      ['Product ID']: get(findData, 'productId'),
      Name: get(findData, 'name'),
    };
  });

  console.log('formatPrevItemsRefIds', formatPrevItemsRefIds);

  const formatPrevCategoryRefIds = map(get(_item, 'category_ref_ids'), (_id) => {
    const findData = find(onlineCategoryList, (_list) => {
      return get(_list, 'id') === _id;
    });
    return {
      ['Category ID']: get(findData, 'id'),
      Name: get(findData, 'name'),
    };
  });

  const formatPrevOptionsGrpRefIds = map(get(_item, 'opt_grp_ref_ids'), (_id) => {
    const findData = find(onlineOptionsGrpList, (_list) => {
      return get(_list, 'groupId') === _id;
    });
    return {
      ['Group ID']: get(findData, 'groupId'),
      Name: get(findData, 'title'),
    };
  });

  const formatCurrentStock = _item?.current_stock === -1 ? ALWAYS_AVAILABLE : _item?.current_stock;
  let formatFoodType = 'Not specified';

  if (_item?.food_type === 1) {
    formatFoodType = <VegNonIcon color={'green'} />;
  } else if (_item?.food_type === 2) {
    formatFoodType = <VegNonIcon color={'red'} />;
  } else if (_item?.food_type === 3) {
    formatFoodType = <VegNonIcon color={'yellow'} />;
  }

  console.log('formatPrevCategoryRefIds', _item);

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
        px: 1.5,
        py: 2.5,
        my: 1,
        mx: 0.5,
      }}
    >
      {isItem && (
        <>
          <RowContent title="Title" value={get(_item, 'title') || '--'} />
          <RowContent title="Description" value={get(_item, 'description') || '--'} />
          <RowContent title="Ref title" value={get(_item, 'ref_title') || '--'} />
          <RowContent title="Price" value={fCurrency(get(_item, 'price')) || '--'} />
          <RowContent
            title="External price"
            value={fCurrency(get(_item, 'external_price')) || '--'}
          />
          <RowContent title="Markup price" value={fCurrency(get(_item, 'markup_price')) || '--'} />
          <RowContent
            title="Category associated"
            icon={
              <div style={{ position: 'relative', marginRight: '-10px' }}>
                <IconButton onClick={() => setIsOpenCategoriesDialog(true)}>
                  <Iconify icon={'mdi:cart'} sx={{ color: theme.palette.primary.main }} />
                </IconButton>

                {!!formatPrevCategoryRefIds?.length && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 20,
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
                      {formatPrevCategoryRefIds?.length}
                    </Typography>
                  </div>
                )}
              </div>
            }
          />

          <RowContent
            title="Included platforms"
            icon={
              <Stack flexDirection="row" gap={1}>
                {(get(_item, 'included_platforms')?.[0] === 'zomato' ||
                  get(_item, 'included_platforms')?.[1] === 'zomato') && (
                  <img
                    src={`/assets/images/zomato.png`}
                    style={{ width: '3rem', height: '1rem' }}
                    alt=""
                  />
                )}
                {(get(_item, 'included_platforms')?.[0] === 'swiggy' ||
                  get(_item, 'included_platforms')?.[1] === 'swiggy') && (
                  <img
                    src={`/assets/images/Swiggy.png`}
                    style={{ width: '3rem', height: '1rem' }}
                    alt=""
                  />
                )}
              </Stack>
            }
          />
          <RowContent
            title="Fulfillment modes"
            icon={
              <Stack flexDirection="row" gap={1}>
                {(get(_item, 'fulfillment_modes')?.[0] === 'delivery' ||
                  get(_item, 'fulfillment_modes')?.[1] === 'delivery') && (
                  <Chip size="small" color="warning" label="Delivery" sx={{ cursor: 'pointer' }} />
                )}
                {(get(_item, 'fulfillment_modes')?.[0] === 'pickup' ||
                  get(_item, 'fulfillment_modes')?.[1] === 'pickup') && (
                  <Chip size="small" color="info" label="Pickup" sx={{ cursor: 'pointer' }} />
                )}
              </Stack>
            }
          />

          <RowContent title="Current stock" value={formatCurrentStock} />
          <RowContent title="Food type" value={formatFoodType} />
          <RowContent title="Serves" value={`${get(_item, 'serves')}` || '--'} />
          <RowContent title="Weight" value={`${get(_item, 'weight')}` || '--'} />
          <RowContent
            title="Recommended"
            icon={
              <Checkbox
                sx={{
                  width: '10px',
                  height: '10px',
                  '& .MuiCheckbox-root': {
                    width: '10px',
                    height: '10px',
                  },
                }}
                checked={!!get(_item, 'recommended')}
                disabled
              />
            }
          />
          <RowContent
            title="Sold at store"
            icon={
              <Checkbox
                sx={{
                  width: '10px',
                  height: '10px',
                  '& .MuiCheckbox-root': {
                    width: '10px',
                    height: '10px',
                  },
                }}
                checked={!!get(_item, 'sold_at_store')}
                disabled
              />
            }
          />
        </>
      )}

      {isCategories && (
        <>
          <RowContent
            title="Ref ID"
            icon={
              <Stack flexDirection="row" gap={0.5} alignItems="center">
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(get(_item, 'ref_id'));
                    toast.success(SuccessConstants.COPY_CLIPBOARD);
                  }}
                >
                  <CopyAllIcon sx={{ fontSize: '20px' }} />
                </IconButton>
                <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {get(_item, 'ref_id')}
                </Typography>
              </Stack>
            }
          />
          <RowContent title="Name" value={get(_item, 'name') || '--'} />
          <RowContent title="Description" value={get(_item, 'description') || '--'} />
          <RowContent
            title="Active"
            icon={
              <Checkbox
                sx={{
                  width: '10px',
                  height: '10px',
                  '& .MuiCheckbox-root': {
                    width: '10px',
                    height: '10px',
                  },
                }}
                checked={!!get(_item, 'active')}
                disabled
              />
            }
          />
          <RowContent title="Sort order" value={get(_item, 'sort_order') || '--'} />
          <RowContent
            title="Image"
            icon={
              <Box
                sx={{
                  position: 'relative',
                  left: 5,
                }}
              >
                <Box
                  component="img"
                  alt={_item?.name}
                  src={
                    get(_item, 'img_url') ? get(_item, 'img_url') : base64_images.Custom_No_Image
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
            }
          />
        </>
      )}

      {isOptions && (
        <>
          <RowContent
            title="Ref ID"
            icon={
              <Stack flexDirection="row" gap={0.5} alignItems="center">
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(get(_item, 'ref_id'));
                    toast.success(SuccessConstants.COPY_CLIPBOARD);
                  }}
                >
                  <CopyAllIcon sx={{ fontSize: '20px' }} />
                </IconButton>
                <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {get(_item, 'ref_id')}
                </Typography>
              </Stack>
            }
          />
          <RowContent title="Title" value={get(_item, 'title') || '--'} />
          <RowContent title="Description" value={get(_item, 'description') || '--'} />
          <RowContent title="Price" value={`${fCurrency(get(_item, 'price'))}` || '--'} />
          <RowContent title="Food type" value={get(_item, 'food_type') || '--'} />
          <RowContent
            title="Option group associated"
            icon={
              <div style={{ position: 'relative', marginRight: '-10px' }}>
                <IconButton onClick={() => setIsOpenOptionGrpsDialog(true)}>
                  <Iconify icon={'mdi:cart'} sx={{ color: theme.palette.primary.main }} />
                </IconButton>

                {!!formatPrevOptionsGrpRefIds?.length && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 20,
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
                      {formatPrevOptionsGrpRefIds?.length}
                    </Typography>
                  </div>
                )}
              </div>
            }
          />
          <RowContent title="Weight" value={get(_item, 'weight') || '--'} />

          <RowContent
            title="Recommended"
            icon={
              <Checkbox
                sx={{
                  width: '10px',
                  height: '10px',
                  '& .MuiCheckbox-root': {
                    width: '10px',
                    height: '10px',
                  },
                }}
                checked={!!get(_item, 'recommended')}
                disabled
              />
            }
          />

          <RowContent
            title="Sold at store"
            icon={
              <Checkbox
                sx={{
                  width: '10px',
                  height: '10px',
                  '& .MuiCheckbox-root': {
                    width: '10px',
                    height: '10px',
                  },
                }}
                checked={!!get(_item, 'Sold at store')}
                disabled
              />
            }
          />
        </>
      )}

      {isOptionGroups && (
        <>
          <RowContent
            title="Ref ID"
            icon={
              <Stack flexDirection="row" gap={0.5} alignItems="center">
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(get(_item, 'ref_id'));
                    toast.success(SuccessConstants.COPY_CLIPBOARD);
                  }}
                >
                  <CopyAllIcon sx={{ fontSize: '20px' }} />
                </IconButton>
                <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {get(_item, 'ref_id')}
                </Typography>
              </Stack>
            }
          />
          <RowContent title="Title" value={get(_item, 'title') || '--'} />
          <RowContent title="Ref title" value={get(_item, 'ref_title') || '--'} />
          <RowContent
            title="Active"
            icon={
              <Checkbox
                sx={{
                  width: '10px',
                  height: '10px',
                  '& .MuiCheckbox-root': {
                    width: '10px',
                    height: '10px',
                  },
                }}
                checked={!!get(_item, 'active')}
                disabled
              />
            }
          />
          <RowContent
            title="Item associated"
            icon={
              <div style={{ position: 'relative', marginRight: '-10px' }}>
                <IconButton onClick={() => setIsOpenItemsDialog(true)}>
                  <Iconify icon={'mdi:cart'} sx={{ color: theme.palette.primary.main }} />
                </IconButton>

                {!!formatPrevItemsRefIds?.length && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 20,
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
                      {formatPrevItemsRefIds?.length}
                    </Typography>
                  </div>
                )}
              </div>
            }
          />
          <RowContent title="Min selectable" value={get(_item, 'min_selectable') || '--'} />
          <RowContent title="Max selectable" value={get(_item, 'max_selectable') || '--'} />
          <RowContent title="Weight" value={get(_item, 'weight') || '--'} />

          <RowContent
            title="Recommended"
            icon={
              <Checkbox
                sx={{
                  width: '10px',
                  height: '10px',
                  '& .MuiCheckbox-root': {
                    width: '10px',
                    height: '10px',
                  },
                }}
                checked={!!get(_item, 'recommended')}
                disabled
              />
            }
          />
          <RowContent
            title="Sold at store"
            icon={
              <Checkbox
                sx={{
                  width: '10px',
                  height: '10px',
                  '& .MuiCheckbox-root': {
                    width: '10px',
                    height: '10px',
                  },
                }}
                checked={!!get(_item, 'sold_at_store')}
                disabled
              />
            }
          />
        </>
      )}

      {isTaxes && (
        <>
          <RowContent title="Title" value={get(_item, 'title') || '--'} />
          <RowContent title="Code" value={get(_item, 'code') || '--'} />
          <RowContent title="Description" value={get(_item, 'description') || '--'} />
          <RowContent
            title="Active"
            icon={
              <Checkbox
                sx={{
                  width: '10px',
                  height: '10px',
                  '& .MuiCheckbox-root': {
                    width: '10px',
                    height: '10px',
                  },
                }}
                checked={!!get(_item, 'active')}
                disabled
              />
            }
          />
          <RowContent
            title="Item associated"
            icon={
              <div style={{ position: 'relative', marginRight: '-10px' }}>
                <IconButton onClick={() => setIsOpenItemsDialog(true)}>
                  <Iconify icon={'mdi:cart'} sx={{ color: theme.palette.primary.main }} />
                </IconButton>

                {!!formatPrevItemsRefIds?.length && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 20,
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
                      {formatPrevItemsRefIds?.length}
                    </Typography>
                  </div>
                )}
              </div>
            }
          />
          <RowContent
            title="Applicable on"
            value={`${get(_item, 'structure.applicable_on')}` || '--'}
          />
          <RowContent title="Type" value={`${get(_item, 'structure.type')}` || '--'} />
          <RowContent title="Value" value={`${get(_item, 'structure.value')}` || '--'} />
        </>
      )}

      {isCharges && (
        <>
          <RowContent title="Title" value={get(_item, 'title') || '--'} />
          <RowContent title="Code" value={get(_item, 'code') || '--'} />
          <RowContent title="Description" value={get(_item, 'description') || '--'} />
          <RowContent
            title="Active"
            icon={
              <Checkbox
                sx={{
                  width: '10px',
                  height: '10px',
                  '& .MuiCheckbox-root': {
                    width: '10px',
                    height: '10px',
                  },
                }}
                checked={!!get(_item, 'active')}
                disabled
              />
            }
          />
          <RowContent
            title="Item associated"
            icon={
              <div style={{ position: 'relative', marginRight: '-10px' }}>
                <IconButton onClick={() => setIsOpenItemsDialog(true)}>
                  <Iconify icon={'mdi:cart'} sx={{ color: theme.palette.primary.main }} />
                </IconButton>

                {!!formatPrevItemsRefIds?.length && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 20,
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
                      {formatPrevItemsRefIds?.length}
                    </Typography>
                  </div>
                )}
              </div>
            }
          />
          <RowContent
            title="Applicable on"
            value={`${get(_item, 'structure.applicable_on')}` || '--'}
          />
          <RowContent title="Type" value={`${get(_item, 'structure.type')}` || '--'} />
          <RowContent title="Value" value={`${get(_item, 'structure.value')}` || '--'} />
          <RowContent
            title="Included platforms"
            icon={
              <Stack flexDirection="row" gap={1}>
                {(get(_item, 'included_platforms')?.[0] === 'zomato' ||
                  get(_item, 'included_platforms')?.[1] === 'zomato') && (
                  <img
                    src={`/assets/images/zomato.png`}
                    style={{ width: '3rem', height: '1rem' }}
                    alt=""
                  />
                )}
                {(get(_item, 'included_platforms')?.[0] === 'swiggy' ||
                  get(_item, 'included_platforms')?.[1] === 'swiggy') && (
                  <img
                    src={`/assets/images/Swiggy.png`}
                    style={{ width: '3rem', height: '1rem' }}
                    alt=""
                  />
                )}
              </Stack>
            }
          />
          <RowContent
            title="Fulfillment modes"
            icon={
              <Stack flexDirection="row" gap={1}>
                {(get(_item, 'fulfillment_modes')?.[0] === 'delivery' ||
                  get(_item, 'fulfillment_modes')?.[1] === 'delivery') && (
                  <Chip size="small" color="warning" label="Delivery" sx={{ cursor: 'pointer' }} />
                )}
                {(get(_item, 'fulfillment_modes')?.[0] === 'pickup' ||
                  get(_item, 'fulfillment_modes')?.[1] === 'pickup') && (
                  <Chip size="small" color="info" label="Pickup" sx={{ cursor: 'pointer' }} />
                )}
              </Stack>
            }
          />
        </>
      )}

      <ViewTableDialog
        isOpen={isOpenItemsDialog}
        onClose={() => {
          setIsOpenItemsDialog(false);
        }}
        data={formatPrevItemsRefIds}
        title="Item list"
      />

      <ViewTableDialog
        isOpen={isOpenCategoriesDialog}
        onClose={() => {
          setIsOpenCategoriesDialog(false);
        }}
        data={formatPrevCategoryRefIds}
        title="Category list"
      />

      <ViewTableDialog
        isOpen={isOpenOptionGrpsDialog}
        onClose={() => {
          setIsOpenOptionGrpsDialog(false);
        }}
        data={formatPrevOptionsGrpRefIds}
        title="Options group list"
      />
    </Card>
  );
};

export default CalalogueCard;
