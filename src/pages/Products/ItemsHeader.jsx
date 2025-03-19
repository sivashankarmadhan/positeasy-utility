import {
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ExtensionIcon from '@mui/icons-material/Extension';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SortIcon from '@mui/icons-material/Sort';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useResetRecoilState } from 'recoil';
import InventoryAddOptions from 'src/components/InventoryAddOptions';
import UploadDialog from 'src/components/UploadDialog';
import TripleToggleSwitch from 'src/components/toggle/Triple';
import { SortingConstants, StatusConstants } from 'src/constants/AppConstants';
import { currentProduct } from 'src/global/recoilState';
import FilterPopOver from 'src/layouts/dashboard/header/FilterPopOver';
import { PATH_DASHBOARD } from 'src/routes/paths';
import UploadQRDialog from 'src/components/UploadQRDialog';
import FullScreenInventoryAdd from 'src/components/FullScreenInventoryAdd';
import FullScreenStockView from 'src/components/FullScreenStockView';

export default function ItemsHeader({
  handleOpenDrawer,
  dataStatusState,
  setDataStatusState,
  setNewProduct,
  setEditMode,
  sortingOrder,
  setSortingOrder,
  intialFetch,
  allProductsWithUnits,
}) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const resetCurrentProduct = useResetRecoilState(currentProduct);
  const [openImport, setOpenImport] = useState(false);
  const [openPartnerImport, setOpenPartnerImport] = useState(false);
  const [openQRImport, setOpenQRImport] = useState(false);
  const [openStockExport, setOpenStockExport] = useState(false);
  const theme = useTheme();

  const handleAddItems = () => {
    handleOpenDrawer();
    resetCurrentProduct();
    setNewProduct(true);
    setEditMode(true);
  };
  const handleOpenStockExport = () => {
    setOpenStockExport(true);
  };
  const handleCloseStockExport = () => {
    setOpenStockExport(false);
  };
  const handleOpenImport = () => {
    setOpenImport(true);
  };
  const handleSelectImportOptions = (e) => {
    handleCloseImport();
    if (e === 'partner') {
      handleOpenPartnerImport();
    }
    if (e === 'qr') {
      handleOpenQRImport();
    }
    if (e === 'stock') {
      handleOpenStockExport();
    }
  };
  const handleCloseImport = () => {
    setOpenImport(false);
  };
  const handleOpenPartnerImport = () => {
    setOpenPartnerImport(true);
  };
  const handleClosePartnerImport = () => {
    setOpenPartnerImport(false);
  };
  const handleOpenQRImport = () => {
    setOpenQRImport(true);
  };
  const handleCloseQRImport = (e) => {
    setOpenQRImport(false);
  };
  const toggleLabels = {
    center: {
      title: 'Inactive',
      value: StatusConstants.INACTIVE,
    },

    right: {
      title: 'Soldout',
      value: StatusConstants.SOLDOUT,
    },
    left: {
      title: 'Active',
      value: StatusConstants.ACTIVE,
    },
  };

  const onToggleChange = (value) => {
    setDataStatusState(
      value === 'left'
        ? StatusConstants.ACTIVE
        : value === 'center'
        ? StatusConstants.INACTIVE
        : StatusConstants.SOLDOUT
    );
  };
  return (
    <Stack
      flexDirection={'row'}
      sx={{
        justifyContent: 'space-between',
        px: 1,
        alignItems: isMobile ? 'center' : 'flex-end',
        pb: 1,
        mt: 1,
      }}
    >
      {isMobile && (
        <div
          style={{
            justifyItems: 'center',
            alignItems: 'center',
            display: 'flex',
            position: 'relative',
          }}
        >
          <FilterPopOver IconChildren={<FilterAltIcon fontSize="medium" />}>
            <FormControl>
              <RadioGroup
                defaultValue={dataStatusState}
                value={dataStatusState}
                onChange={(event) => {
                  setDataStatusState(event.target.value);
                }}
                sx={{ px: 2 }}
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
        </div>
      )}
      {!isMobile && (
        <Tooltip title="Click to view the statuswise Products">
          <div >
            <TripleToggleSwitch
              dataStatusState={dataStatusState}
              labels={toggleLabels}
              onChange={onToggleChange}
            />
          </div>
        </Tooltip>
      )}
      <Stack flexDirection={'row'} sx={{ alignItems: 'center' }}>
        {isMobile ? (
          <div
            onClick={() => navigate(PATH_DASHBOARD.addon, { replace: true })}
            style={{
              backgroundColor: theme.palette.info.main,
              borderRadius: 20,
              boxShadow: `1px 2px 5px ${theme.palette.info.light}`,
              marginLeft: 5,
              marginRight: 5,
            }}
          >
            <IconButton>
              <ExtensionIcon sx={{ color: theme.palette.common.white }} />
            </IconButton>
          </div>
        ) : (
          <Tooltip title="Manage Addons">
            <Button
              className="inventoryStep3"
              onClick={() => navigate(PATH_DASHBOARD.addon, { replace: true })}
              sx={{ ml: 1 }}
              variant="outlined"
              startIcon={<ExtensionIcon />}
            >
              Addon
            </Button>
          </Tooltip>
        )}

        {isMobile ? (
          <Tooltip title="Import or Export excel or pdf reports">
            <div
              className="inventoryStep4"
              onClick={handleOpenImport}
              style={{
                backgroundColor: theme.palette.primary.main,
                borderRadius: 20,
                boxShadow: `1px 2px 5px ${theme.palette.primary.light}`,
                marginLeft: 5,
                marginRight: 5,
              }}
            >
              <IconButton>
                <ImportExportIcon sx={{ color: theme.palette.common.white }} />
              </IconButton>
            </div>
          </Tooltip>
        ) : (
          <Tooltip title="Import or Export excel or pdf reports">
            <Button
              className="inventoryStep4"
              onClick={handleOpenImport}
              sx={{ mx: 1 }}
              variant="contained"
              startIcon={<ImportExportIcon />}
            >
              Import | Export
            </Button>
          </Tooltip>
        )}
        {isMobile ? (
          <div
            onClick={handleAddItems}
            style={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: 20,
              boxShadow: `1px 2px 5px ${theme.palette.primary.light}`,
            }}
          >
            <IconButton>
              <AddIcon sx={{ color: theme.palette.common.white }} />
            </IconButton>
          </div>
        ) : (
          <Tooltip title="Add new product">
            <Button className="inventoryStep5" 
              onClick={handleAddItems}
              sx={{ ml: 1 }}
              variant="contained"
              startIcon={<AddIcon />}
            >
              Add Items
            </Button>
          </Tooltip>
        )}
        {/* <div
          className="inventoryStep3"
          style={{
            justifyItems: 'center',
            alignItems: 'center',
            display: 'flex',
            position: 'relative',
            marginLeft: 8,
          }}
        >
          <FilterPopOver IconChildren={<SortIcon fontSize="medium" />}>
            <FormControl>
              <RadioGroup
                defaultValue={sortingOrder}
                onChange={(event) => {
                  setSortingOrder(event.target.value);
                }}
                sx={{ px: 2 }}
              >
                <FormControlLabel
                  value={SortingConstants.NEWEST}
                  control={<Radio />}
                  label="Newest"
                />
                <FormControlLabel
                  value={SortingConstants.OLDEST}
                  control={<Radio />}
                  label="Oldest"
                />
              </RadioGroup>
            </FormControl>
          </FilterPopOver>
        </div> */}
      </Stack>
      {openQRImport && (
        <FullScreenInventoryAdd open={openQRImport} handleClose={handleCloseQRImport} />
      )}
      {openStockExport && (
        <FullScreenStockView
          data={allProductsWithUnits}
          open={openStockExport}
          handleClose={handleCloseStockExport}
        />
      )}
      <UploadDialog
        intialFetch={intialFetch}
        open={openPartnerImport}
        handleClose={handleClosePartnerImport}
      />
      <InventoryAddOptions
        data={allProductsWithUnits}
        open={openImport}
        handleClose={handleSelectImportOptions}
      />
    </Stack>
  );
}
