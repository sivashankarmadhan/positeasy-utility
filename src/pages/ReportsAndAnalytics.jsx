import { Icon } from '@iconify/react';
import { Box, Stack, Tab, Tabs, Divider, useTheme } from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { get, map } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useSettingsContext } from 'src/components/settings';
import { ReportAnalyticsSections, hideScrollbar } from 'src/constants/AppConstants';
import {
  allConfiguration,
  categorizeList,
  currentStoreId,
  currentTerminalId,
  customCodeList,
  customerList,
} from 'src/global/recoilState';
import { PATH_DASHBOARD } from 'src/routes/paths';
import SettingServices from 'src/services/API/SettingServices';

export default function ReportsAndAnalytics() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const { themeLayout, onToggleLayout } = useSettingsContext();
  const [layoutState, setLayoutState] = useState(themeLayout === 'mini' ? 'mini' : '');
  const [sections, setSection] = useState(ReportAnalyticsSections[0].path);
  const setConfiguration = useSetRecoilState(allConfiguration);
  const setCategorize = useSetRecoilState(categorizeList);
  const setCustomCodes = useSetRecoilState(customCodeList);
  const setCustomerCodes = useSetRecoilState(customerList);

  const configuration = useRecoilValue(allConfiguration);

  const counterSettings = get(configuration, 'counterSettings', {});
  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false);

  const [openImport, setOpenImport] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();

  const handleChange = (event, newValue) => {
    setSection(newValue);
  };
  const handleOpenImport = () => {
    setOpenImport(true);
  };

  const handleCloseImport = () => {
    setOpenImport(false);
  };

  const initialFetch = async () => {
    try {
      const resp = await SettingServices.getConfiguration();
      if (resp) {
        setConfiguration({
          ...(configuration || {}),
          ...(get(resp, 'data.0') || {}),
        });
        setCategorize(get(resp, 'data.0', {}));
      }
      const customCodesDetails = await SettingServices.getCustomCodesData();
      setCustomCodes(get(customCodesDetails, 'data', []));
      const responseCustomerCodes = await SettingServices.getCustomerData();
      responseCustomerCodes && setCustomerCodes(get(responseCustomerCodes, 'data', [])?.reverse());
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (location.pathname !== sections) {
      navigate(sections);
    }
  }, [sections]);

  useEffect(() => {
    if (currentStore && currentTerminal) initialFetch();
  }, [currentStore, currentTerminal]);

  return (
    <>
      <Helmet>
        <title> Report & Analytics | POSITEASY</title>
      </Helmet>
      <Stack
        sx={{
          mx: {
            xs: 2,
            md: 2,
          },
        }}
      >
        <Box
          sx={{
            overflow: 'hidden',
            ...hideScrollbar,
          }}
        >
          <Outlet />
        </Box>
      </Stack>
      {/* <UploadDialog forUpload={'report'} open={openImport} handleClose={handleCloseImport} /> */}
    </>
  );
}
