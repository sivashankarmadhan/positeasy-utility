import AddIcon from '@mui/icons-material/Add';
import ExtensionIcon from '@mui/icons-material/Extension';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import React from 'react';
import { useNavigate } from 'react-router';
import { FLOATING_MENU } from 'src/constants/AppConstants';
import { PATH_DASHBOARD } from 'src/routes/paths';

const actions = [
  { icon: <AddIcon />, name: FLOATING_MENU.ADD_PRODUCT, action: '' },
  { icon: <ExtensionIcon />, name: FLOATING_MENU.ADDONS },
  { icon: <ImportExportIcon />, name: FLOATING_MENU.IMPORT_EXPORT },
];

export default function InventoryFloatingMenu(props) {
  const { handleOpenImport, handleOpenNewProduct } = props;
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const triggerAction = (name) => {
    switch (name) {
      case FLOATING_MENU.IMPORT_EXPORT:
        handleOpenImport();
        break;
      case FLOATING_MENU.ADDONS:
        navigate(PATH_DASHBOARD.inventory.addon, { replace: true });
        break;
      case FLOATING_MENU.ADD_PRODUCT:
        handleOpenNewProduct();
        break;
    }
    setOpen(false);
  };

  return (
    <SpeedDial
      className="inventoryStep6"
      ariaLabel="SpeedDial basic example"
      sx={{ position: 'absolute', bottom: 12, right: 16 }}
      icon={<SpeedDialIcon />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
    >
      {actions.map((action) => (
        <SpeedDialAction
          sx={{
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'common.white',
            },
            color: 'primary.main',
            backgroundColor: 'common.white',
          }}
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => triggerAction(action.name)}
        />
      ))}
    </SpeedDial>
  );
}
