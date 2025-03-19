import React from 'react';
// @mui
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
// config
import { NAV } from '../../../config-global';
// utils
import { hideScrollbarX } from '../../../utils/cssStyles';
// components
import Logo from '../../../components/logo';
import { NavSectionMini } from '../../../components/nav-section';
//
import { formatNavConfigByRole } from 'src/helper/formatNavConfigByRole';
import AuthService from 'src/services/authService';
import NavToggleButton from './NavToggleButton';
import navConfig from './config-navigation';
import { useRecoilState, useRecoilValue } from 'recoil';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { allConfiguration, estimateMode, isMembershipState, whatsappDetailsState } from 'src/global/recoilState';
import { find, forEach, get, map } from 'lodash';
import { useLocation, useNavigate } from 'react-router';
import Navigation from 'src/services/NavigationService';
import { ReportAnalyticsSections } from 'src/constants/AppConstants';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ----------------------------------------------------------------------

export default function NavMini({ expiryContent, onCloseNav, sx, isPayCard }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const role = AuthService.getCurrentRoleInLocal();
  const configuration = useRecoilValue(allConfiguration);
  const isEstimate = get(configuration, 'isEstimator');
  const featureSettings = get(configuration, 'featureSettings', {});
  const isTable = get(featureSettings, 'isTable', false);
  const isQrCode = get(featureSettings, 'isQrCode', false);
  const [isMembershipEnable, setIsMembershipEnable] = useRecoilState(isMembershipState);

  const counterSettings = get(configuration, 'counterSettings', {});
  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false);

  const whatsappDetails = useRecoilValue(whatsappDetailsState);

  const blockedNavigation = !isEstimate
    ? [PATH_DASHBOARD.createestimate, PATH_DASHBOARD.viewestimate]
    : [];

  if (!isTable) {
    blockedNavigation.push(PATH_DASHBOARD.table);
    blockedNavigation.push(PATH_DASHBOARD.reservation);
  }

  if (!isTable) {
    blockedNavigation.push(PATH_DASHBOARD.table);
  }
  if (!isCountersEnabled) {
    blockedNavigation.push(PATH_DASHBOARD.inventory.counters);
  }

  const newNavConfig = formatNavConfigByRole(role, navConfig, blockedNavigation);

  const [expanded, setExpanded] = React.useState('');

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  let activePathDetails = {};

  forEach(newNavConfig, (_item) => {
    forEach(get(_item, 'items'), (_list) => {
      if (get(_list, 'activePaths')?.includes(pathname)) {
        activePathDetails = _list;
      }
    });
  });

  const nestedList = [...(get(activePathDetails, 'nestedList') || [])];
  if (isMembershipEnable && activePathDetails?.title === "reports") {
    nestedList.push({ title: 'Membership', path: PATH_DASHBOARD.report.membership });
  }
  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_DASHBOARD_MINI },
      }}
    >
      {/* <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_DASHBOARD_MINI - 12,
        }}
      /> */}

      <Stack
        sx={{
          pb: 2,
          height: 1,
          position: 'fixed',
          width: NAV.W_DASHBOARD_MINI,
          ...hideScrollbarX,
        }}
      >
        <Logo
          sx={{ mx: 'auto', mt: 1, mb: 1 }}
          // disabledLink
          // sx={{
          //   mx: 'auto',
          //   my: 2,
          //   height: 50,
          //   width: 55,
          //   transform: 'rotate(0deg)', // Initial rotation
          //   transition: 'transform 0.3s ease-in-out', // Add ease-in and ease-out transition
          //   '&:hover': { transform: 'rotate(360deg)' },
          // }}
          onClick={() => {
            Navigation.navigateToHome();
          }}
        />

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack flexDirection="row">
          <NavSectionMini
            sx={{
              height: isPayCard ? 'calc(100vh - 300px)' : 'calc(100vh - 170px)',
              overflow: 'auto',
            }}
            data={newNavConfig}
          />

          <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />

          <List
            sx={{
              width: '100%',
              mx: 1,
              my: 1,
              height: isPayCard ? 'calc(100vh - 303px)' : 'calc(100vh - 170px)',
              overflow: 'auto',
              marginLeft:0
            }}
          >
            {map(nestedList, (_nav, index) => {
              // if (get(_nav, 'title') === 'Scan QR' && !isQrCode) return;

              if (get(_nav, 'children')) {
                return (
                  <Accordion
                    sx={{ mb: 1 }}
                    expanded={expanded === `panel${index + 1}`}
                    onChange={handleChange(`panel${index + 1}`)}
                  >
                    <AccordionSummary
                      sx={{ py: 0, minHeight: 38, maxHeight: 38 }}
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography> {get(_nav, 'name')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List sx={{ width: '100%',margin:0 }}>
                        {map(get(_nav, 'children'), (_childrenNav) => {
                          return (
                            <ListItem
                              sx={{
                                p: 0,
                                backgroundColor:
                                  get(_childrenNav, 'path') === pathname
                                    ? theme.palette.primary.main
                                    : '',
                                color: get(_childrenNav, 'path') === pathname ? 'white' : '#4D2943',
                              }}
                            >
                              <ListItemButton
                                onClick={() => {
                                  onCloseNav?.();
                                  navigate(get(_childrenNav, 'path'));
                                }}
                              >
                                <ListItemText
                                  sx={{
                                    '& .MuiTypography-root': {
                                      fontSize: '15px',
                                      fontWeight: '500',
                                    },
                                  }}
                                >
                                  {get(_childrenNav, 'name')}
                                </ListItemText>
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                );
              }

              return (
                <ListItem
                  sx={{
                    p: 0,
                    backgroundColor:
                      get(_nav, 'path') === pathname ? theme.palette.primary.main : '',
                    color: get(_nav, 'path') === pathname ? 'white' : '#4D2943',
                  }}
                >
                  <ListItemButton
                    onClick={() => {
                      navigate(get(_nav, 'path'));
                      onCloseNav?.();
                    }}
                  >
                    <ListItemText
                      sx={{ '& .MuiTypography-root': { fontSize: '0.75rem', fontWeight: 'bold' } }}
                    >
                      {get(_nav, 'title')}
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Stack>

        {/* {expiryContent(true)} */}
      </Stack>
    </Box>
  );
}
