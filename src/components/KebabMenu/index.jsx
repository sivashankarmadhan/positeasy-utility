import PropTypes from 'prop-types';
// @mui
import { IconButton } from '@mui/material';
//

import MenuPopover from './MenuPopover';
import Iconify from 'src/components/iconify';
import { isUndefined } from 'lodash';

// ----------------------------------------------------------------------

kebabMenu.propTypes = {
  actions: PropTypes.node,
  open: PropTypes.object,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
};

export default function kebabMenu({
  className = 'menu',
  actions,
  open,
  onClose,
  onOpen,
  anchorOrigin,
  arrow,
  customWidth,
  btnMarginTop,
  icon,
  height,
  width,
}) {
  return (
    <>
      <IconButton
        className={className}
        onClick={onOpen}
        sx={{ mt: isUndefined(btnMarginTop) ? 1 : btnMarginTop, '&:hover': { color: '#5A0A45' } }}
      >
        <Iconify
          icon={icon ? icon : 'eva:more-vertical-fill'}
          width={width ? width : 20}
          height={height ? height : 20}
        />
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={onClose}
        anchorOrigin={anchorOrigin || { vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        arrow={arrow || 'right-top'}
        sx={{
          mt: -1,
          width: customWidth || { xs: 120, sm: 160 },
          boxShadow:
            '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 10px -4px rgba(145, 158, 171, 0.12)',
          '& .MuiMenuItem-root': {
            px: 1,
            typography: { xs: 'caption', sm: 'body2' },
            borderRadius: 0.75,
            '& svg': { mr: 2, width: { xs: 15, sm: 20 }, height: { xs: 15, sm: 20 } },
          },
        }}
      >
        {actions}
      </MenuPopover>
    </>
  );
}
