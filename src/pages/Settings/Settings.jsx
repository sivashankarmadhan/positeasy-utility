import { Box, List, ListItem, Stack, Typography, Drawer } from '@mui/material';
import { map } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { ROLES_DATA, SettingsSections } from 'src/constants/AppConstants';
import { Icon } from '@iconify/react';
import CloseIcon from '@mui/icons-material/Close';
import AuthService from 'src/services/authService';
import { SelectedSection } from 'src/global/SettingsState';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { useRecoilState, useRecoilValue } from 'recoil';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { hideScrollbar } from 'src/constants/AppConstants';
import SettingServices from 'src/services/API/SettingServices';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { allConfiguration, billingState, currentStoreId } from 'src/global/recoilState';

export default function Settings() {
  const role = AuthService.getCurrentRoleInLocal();
  const canAccess = (roles) => roles?.includes?.(role);
  const navigate = useNavigate();
  const location = useLocation();
  const currentRole = AuthService.getCurrentRoleInLocal();
  const ROLES = ['master', 'store_staff', 'store_manager', 'marketing', 'manager_and_staff'];
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole;

  const [sections, setSection] = useRecoilState(SelectedSection);
  const [openDrawer, isOpenDrawer] = useState(true);
  const { isMobile, isTab, isLaptop, isDesktop, isTV } = useResponsive();
  const isMobileView = useMediaQuery('(max-width:992px)');
  const isLapScreen = useMediaQuery('(min-width:120px) and (max-width: 1340px)');

  const currentStore = useRecoilValue(currentStoreId);
  const [isBillingState, setIsBillingState] = useRecoilState(billingState);
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const [configurationData, setConfigurationData] = useState({});
  // const [configuration, setConfiguration] = useState({});
  const handleChange = (event, newValue) => {
    if (isMobileView) {
      isOpenDrawer(false);
    }
    setSection(newValue);
  };

  const handleOpenDrawer = () => {
    isOpenDrawer((prev) => !prev);
  };

  const getEbilling = async () => {
    try {
      const res = await SettingServices.getEbillConfiguration(currentStore);
      console.log('resres', res);
      setIsBillingState(res?.data?.isOrderBill);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    setIsBillingState(configuration?.featureSettings?.isEbillingEnabled);

    initialFetch();
    getEbilling();
  }, []);

  const initialFetch = async () => {
    try {
      const resp = await SettingServices.getConfiguration();
      setConfigurationData(resp?.data[0]?.featureSettings);
      console.log('res', resp);
      setConfiguration(resp?.data[0]);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (location.pathname !== sections) {
      navigate(sections);
    }
  }, [sections]);

  const data = {
    name: 'E-bill',
    path: '/dashboard/settings/eBilling',
    icon: 'ant-design:code-outlined',
    roleAllowed: [...ROLES],
  };

  console.log('SettingsSections', SettingsSections);

  useEffect(() => {
    initialFetch();
  }, [isBillingState]);

  return (
    <>
      <Helmet>
        <title> Report & Analytics | POSITEASY</title>
      </Helmet>

      <Stack
        sx={{
          mx: 2,
          my: 1,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          background: '#fff',
          height: isMobileView ? '80vh' : '85vh',
        }}
        // mt={5}
      >
        {/* <Box
          sx={{
            mb: 2,
            '& .MuiTabs-scroller': {
              borderBottom: '2px solid #ecebeb',
            },
            width: '100%',
            backgroundColor: 'common.white',
          }}
        >
          <Tabs
            // sx={{width : '84%'}}
            variant="scrollable"
            scrollButtons={false}
            value={location.pathname}
            onChange={handleChange}
          >
            {map(
              isBillingState ? [...SettingsSections, data] : SettingsSections,
              (_item) =>
                canAccess(_item.roleAllowed) && (
                  <Tab
                    icon={
                      <Icon icon={_item.icon} height={22} width={22} style={{ marginRight: 5 }} />
                    }
                    value={_item.path}
                    label={_item.name}
                  />
                )
            )}
          </Tabs>
        </Box> */}

        <Box
          sx={{
            // minHeight: '15rem',
            // maxHeight: '39rem',
            overflow: 'auto',
            width: '100%',
            // mt: 2,
            // ...hideScrollbar,
            px: 2,
            pb: 2,
          }}
        >
          <Outlet />
        </Box>
      </Stack>
    </>
  );
}
