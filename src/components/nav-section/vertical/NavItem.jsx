import PropTypes from 'prop-types';
import { Link as RouterLink, useLocation } from 'react-router-dom';
// @mui
import { Box, Tooltip, Link, ListItemText } from '@mui/material';
// locales
import { useLocales } from '../../../locales';
// auth

//
import Iconify from '../../iconify';
//
import { StyledItem, StyledIcon, StyledDotIcon } from './styles';
import { useState } from 'react';
import useExecuteAfterCheck from 'src/hooks/useExecuteAfterCheck';
import { useRecoilState, useRecoilValue } from 'recoil';
import { allConfiguration, isEditHoldOnState, whatsappBalanceDetailsState } from 'src/global/recoilState';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { get } from 'lodash';
import ObjectStorage from 'src/modules/ObjectStorage';
import { ROLE_STORAGE } from 'src/constants/StorageConstants';
import { ROLES_DATA } from 'src/constants/AppConstants';

// ----------------------------------------------------------------------

NavItem.propTypes = {
  open: PropTypes.bool,
  active: PropTypes.bool,
  item: PropTypes.object,
  depth: PropTypes.number,
  isExternalLink: PropTypes.bool,
};

export default function NavItem({ item, depth, open, active, isExternalLink, ...other }) {
  const { translate } = useLocales();

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const [isHover, setIsHover] = useState();

  const executeAfterCheck = useExecuteAfterCheck();
  const isEditHoldOn = useRecoilValue(isEditHoldOnState);

  const balanceDetails = useRecoilValue(whatsappBalanceDetailsState);

  const isLowBalance = Number(Math.floor(get(balanceDetails, 'whatsappCredits') / 100 || 0)) <= 3;

  const isTab = useMediaQuery('(max-width:980px)');

  const { role } = ObjectStorage.getItem(ROLE_STORAGE.ROLE) || {};
  const isManager = role === ROLES_DATA.store_manager.role;

  const { title, path, icon, info, isDisabledInfoHover, children, disabled, caption, roles } = item;

  const subItem = depth !== 1;

  const configuration = useRecoilState(allConfiguration)[0];
  const featureSettings = get(configuration, 'featureSettings', {});
  const isShowBillng = get(featureSettings, 'isShowBillng', false);

  const isCreateBillingVisible = title !== "Orders" || isShowBillng;

  

  const renderContent = (
    <StyledItem depth={depth} active={active} disabled={disabled} caption={!!caption} {...other}>
      {icon && <StyledIcon>{icon}</StyledIcon>}

      {subItem && (
        <StyledIcon>
          <StyledDotIcon active={active && subItem} />
        </StyledIcon>
      )}

      <ListItemText
        primary={`${translate(title)}`}
        secondary={
          caption && (
            <Tooltip title={`${translate(caption)}`} placement="top-start">
              <span>{`${translate(caption)}`}</span>
            </Tooltip>
          )
        }
        primaryTypographyProps={{
          noWrap: true,
          component: 'span',
          variant: 'caption',
          fontWeight: 'bold',
        }}
        secondaryTypographyProps={{
          noWrap: true,
          variant: 'caption',
        }}
      />

      {info  && isCreateBillingVisible &&
        (isHover || isDisabledInfoHover || isTab) &&
        !(path === PATH_DASHBOARD.sale.viewbilling && isManager) && (
          <>
            {path === PATH_DASHBOARD.whatsappCredits && isLowBalance && (
              <Box component="span" sx={{ lineHeight: 0, color: active ? '#000' : 'inherit' }}>
                {info}
              </Box>
            )}
            {path !== PATH_DASHBOARD.whatsappCredits && (
              <Box component="span" sx={{ lineHeight: 0, color: active ? '#000' : 'inherit' }}>
                {info}
              </Box>
            )}
          </>
        )}

      {!!children && (
        <Iconify
          width={16}
          icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
          sx={{ ml: 1, flexShrink: 0 }}
        />
      )}
    </StyledItem>
  );

  const renderItem = () => {
    // ExternalLink
    if (isExternalLink)
      return (
        <Link href={isEditHoldOn ? pathname : path} target="_blank" rel="noopener" underline="none">
          {renderContent}
        </Link>
      );

    // Has child
    if (children) {
      return renderContent;
    }

    // Default
    return (
      <Link
        component={RouterLink}
        pathname
        to={isEditHoldOn ? pathname : path}
        underline="none"
        sx={{ '&:hover': { textDecoration: 'none' } }}
      >
        {renderContent}
      </Link>
    );
  };

  return (
    <div
      onClick={() => {
        if (isEditHoldOn) {
          executeAfterCheck(() => {
            navigate(path);
          });
        }
      }}
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
      roles={roles}
    >
      {' '}
      {renderItem()}{' '}
    </div>
  );
}
