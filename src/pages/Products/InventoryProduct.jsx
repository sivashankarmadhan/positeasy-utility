import DifferenceOutlinedIcon from '@mui/icons-material/DifferenceOutlined';
import ExtensionIcon from '@mui/icons-material/Extension';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import QrCodeIcon from '@mui/icons-material/QrCode';
import {
  Box,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import Select from '@mui/material/Select';
import { filter, find, get, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import ProductLoader from 'src/components/ProductLoader';
import S3ImageCaching from 'src/components/S3ImageCaching';
import { StatusConstants } from 'src/constants/AppConstants';
import { allProducts } from 'src/global/recoilState';
import trimDescription from 'src/helper/trimDescription';
import FilterPopOver from 'src/layouts/dashboard/header/FilterPopOver';
import { fCurrency } from 'src/utils/formatNumber';
import GenerateQRBarCodeDialog from 'src/components/GenerateQRBarCodeDialog';

export default function InventoryProduct({
  item,
  category,
  handleItem,
  handleOpenAddonDialog,
  handleChangeProductStatus,
  handleOpenStockDialog,
  dataStatusState,
  sortingOrder,
  isLoading,
}) {
  const theme = useTheme();
  const [selectedUnit, setSelectedUnit] = useState(item);
  const [unitsData, setUnitsData] = useState([item]);
  const [childHover, setChildHover] = useState(false);
  const [parentHover, setParentHover] = useState(false);
  const [openGenerateQR, setOpenGenerateQR] = useState({ isOpen: false, data: {} });
  const allProductsWithUnits = useRecoilValue(allProducts);
  const handleUnitsChange = (e) => {
    const data = find(unitsData, (d) => get(d, 'productId') === e.target.value);
    setSelectedUnit(data);
  };
  const getUnits = (e) => {
    const units = filter(
      allProductsWithUnits,
      (d) => get(d, 'shortCode') === get(e, 'shortCode') && dataStatusState === get(d, 'status')
    );
    return units;
  };
  const handleUnitsDropDownClick = () => {
    try {
      const units = getUnits(item);
      if (!isEmpty(units)) {
        setUnitsData(units);
        setSelectedUnit(units[0]);
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    handleUnitsDropDownClick();
  }, [item, allProductsWithUnits, dataStatusState, sortingOrder]);

  return (
    <Grid item id={category} xs={12} sm={12} md={6} lg={4} key={get(selectedUnit, 'productId')}>
      {get(isLoading, 'loading') &&
      get(isLoading, 'productId') === get(selectedUnit, 'productId') ? (
        <ProductLoader width={50} />
      ) : (
        <Tooltip
          open={!childHover && parentHover}
          title={`Click to View and Manage  ${get(selectedUnit, 'name')}`}
        >
          <Paper
            sx={{
              border: 1,
              borderColor: 'rgba(0,0,0,0.1)',
              height: 125,
              width: '100%',
              p: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack
              onMouseEnter={(event) => {
                setParentHover(true);
              }}
              onMouseLeave={(event) => {
                setParentHover(false);
              }}
              flexDirection={'row'}
              onClick={(event) => {
                handleItem(selectedUnit);
              }}
              sx={{ cursor: 'pointer' }}
            >
              <Stack flexDirection={'row'}>
                <div
                  style={{
                    height: 100,
                    width: 100,
                    overflow: 'hidden',
                    borderRadius: 5,
                    opacity: get(selectedUnit, 'status') === StatusConstants.ACTIVE ? 1 : 0.3,
                  }}
                >
                  <S3ImageCaching
                    style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                    src={get(selectedUnit, 'productImage')}
                    alt="image"
                  />
                </div>
                <Stack
                  sx={{
                    ml: 1,
                    flexDirection: 'column',
                    opacity: get(selectedUnit, 'status') === StatusConstants.ACTIVE ? 1 : 0.3,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontSize: get(selectedUnit, 'name')?.length > 12 ? 14 : 16 }}
                  >
                    {get(selectedUnit, 'name')}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 'normal',
                      color: 'grey',
                      mt: -0.2,
                      fontSize: '9px',
                      ml: 0.2,
                    }}
                  >
                    {get(selectedUnit, 'category')?.toUpperCase()}
                  </Typography>
                  <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize:
                          get(selectedUnit, 'offerPrice') !== get(selectedUnit, 'price') &&
                          get(selectedUnit, 'offerPrice') > 0 &&
                          typeof get(selectedUnit, 'offerPrice') !== 'object'
                            ? '10px'
                            : '16px',
                        textDecorationLine:
                          get(selectedUnit, 'offerPrice') !== get(selectedUnit, 'price') &&
                          get(selectedUnit, 'offerPrice') > 0 &&
                          typeof get(selectedUnit, 'offerPrice') !== 'object'
                            ? 'line-through'
                            : '',
                        opacity:
                          get(selectedUnit, 'offerPrice') !== get(selectedUnit, 'price') &&
                          get(selectedUnit, 'offerPrice') > 0 &&
                          typeof get(selectedUnit, 'offerPrice') !== 'object'
                            ? 0.6
                            : 1,
                        fontWeight: 'bold',
                      }}
                    >
                      {fCurrency(
                        get(selectedUnit, 'unitsEnabled')
                          ? get(selectedUnit, 'price')
                          : get(selectedUnit, 'price')
                      )}
                    </Typography>
                    {get(selectedUnit, 'offerPrice') !== get(selectedUnit, 'price') &&
                      get(selectedUnit, 'offerPrice') > 0 &&
                      typeof get(selectedUnit, 'offerPrice') !== 'object' && (
                        <Typography
                          sx={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            mt: 0.5,
                            ml: 1,
                          }}
                        >
                          {fCurrency(get(selectedUnit, 'offerPrice'))}
                        </Typography>
                      )}
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: '10px',
                      borderRadius: 20,
                      backgroundColor: 'red',
                      display: 'flex',
                      width: '4rem',
                      textAlign: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                    }}
                  >
                    {get(selectedUnit, 'tag')}
                  </Typography>
                </Stack>
              </Stack>
              <Stack
                sx={{
                  flexDirection: {
                    xs: 'column',
                    sm: 'column',
                    md: 'row',
                    lg: 'row',
                  },
                }}
              ></Stack>
            </Stack>

            <Stack
              flexDirection={'column'}
              alignItems={'flex-end'}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                // height: '100%',
              }}
            >
              <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Click to generate QR or Barcode">
                  <IconButton
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                    onClick={() => setOpenGenerateQR({ isOpen: true, data: selectedUnit })}
                  >
                    <QrCodeIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Click to view and manage addons">
                  <ExtensionIcon
                    className="inventoryProductStep6"
                    onMouseEnter={(event) => {
                      setChildHover(true);
                    }}
                    onMouseLeave={(event) => {
                      setChildHover(false);
                    }}
                    sx={{
                      color: isEmpty(get(selectedUnit, 'addOn')) ? '#EEEEEE' : '#40B8D9',
                      cursor: 'pointer',
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenAddonDialog(selectedUnit);
                    }}
                  />
                </Tooltip>
              </Stack>

              <Tooltip title="Click to manage stock">
                <DifferenceOutlinedIcon
                  className="inventoryProductStep7"
                  onMouseEnter={(event) => {
                    setChildHover(true);
                  }}
                  onMouseLeave={(event) => {
                    setChildHover(false);
                  }}
                  sx={{
                    color: get(selectedUnit, 'stockMonitor')
                      ? theme.palette.success.main
                      : '#EEEEEE',
                    cursor: 'pointer',
                    my: get(selectedUnit, 'unitsEnabled') ? 1 : 2,
                    mt: get(selectedUnit, 'unitsEnabled') ? 2 : 2.5,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpenStockDialog(selectedUnit);
                  }}
                />
              </Tooltip>
              <Stack direction={'row'} spacing={1} alignItems="center">
                {get(selectedUnit, 'unitsEnabled') && (
                  <FormControl sx={{ minWidth: 75, mt: -3, mr: 1 }} size="small">
                    <InputLabel id="demo-simple-select-label">Units</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      defaultValue={get(selectedUnit, 'productId')}
                      label="Units"
                      value={get(selectedUnit, 'productId')}
                      autoWidth
                      onChange={handleUnitsChange}
                      inputProps={{ style: { height: 10 } }}
                    >
                      {map(unitsData, (e) => (
                        <MenuItem key={get(e, 'productId')} value={get(e, 'productId')}>
                          {get(e, 'unit')} {e.unitName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Box className="inventoryProductStep8">
                  <FilterPopOver
                    IconChildren={
                      <MoreVertIcon
                        onMouseEnter={(event) => {
                          setChildHover(true);
                        }}
                        onMouseLeave={(event) => {
                          setChildHover(false);
                        }}
                      />
                    }
                  >
                    <FormControl>
                      <RadioGroup
                        defaultValue={get(selectedUnit, 'status')}
                        onChange={(event) => {
                          event.stopPropagation();
                          handleChangeProductStatus(event, get(selectedUnit, 'productId'));
                        }}
                        sx={{ px: 2 }}
                        onMouseEnter={(event) => {
                          setChildHover(true);
                        }}
                        onMouseLeave={(event) => {
                          setChildHover(false);
                        }}
                      >
                        <FormControlLabel
                          value={StatusConstants.ACTIVE}
                          control={<Radio />}
                          label="Active"
                        />
                        <FormControlLabel
                          value={StatusConstants.INACTIVE}
                          control={<Radio />}
                          label="Inactive"
                        />
                        <FormControlLabel
                          value={StatusConstants.SOLDOUT}
                          control={<Radio />}
                          label="Soldout"
                        />
                      </RadioGroup>
                    </FormControl>
                  </FilterPopOver>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Tooltip>
      )}
      {get(openGenerateQR, 'isOpen') && (
        <GenerateQRBarCodeDialog
          data={get(openGenerateQR, 'data')}
          open={get(openGenerateQR, 'isOpen')}
          handleClose={() => setOpenGenerateQR({ isOpen: false, data: {} })}
        />
      )}
    </Grid>
  );
}
