import {
  Box,
  Card,
  Container,
  Grid,
  List,
  ListItemText,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { map } from 'lodash';
import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from 'src/components/settings';
import { SettingsSections, SettingsSectionsLabels } from 'src/constants/AppConstants';

import { useTheme } from '@mui/material';
import { StyledItem } from 'src/components/nav-section/mini/styles';
import SettingsUploadImage from 'src/components/upload/SettingsUploadImage';
import { hideScrollbar } from 'src/constants/AppConstants';
import { useLocales } from 'src/locales';

export default function Settings_old() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { isMobile } = useResponsive();
  const [settings, setSettings] = useState(SettingsSectionsLabels.upload);
  const { translate } = useLocales();
  const textRef = useRef();

  return (
    <>
      <Helmet>
        <title> Settings | POSITEASY</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Grid spacing={1} container sx={{ width: '100%', mt: 1 }}>
          <Grid item xs={12} sm={3} md={1.5} lg={1.5}>
            <>
              {isMobile && (
                <Card
                  sx={{
                    p: 1,
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      minHeight: '3rem',
                      overflow: 'auto',
                      ...hideScrollbar,
                    }}
                  >
                    <Stack
                      flexDirection={'row'}
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      {map(SettingsSections, (e) => (
                        <Typography
                          onClick={() => setSettings(e)}
                          key={e}
                          sx={{
                            my: 2,
                            mx: 1,
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            borderColor: alpha(
                              theme.palette.primary.main,
                              theme.palette.action.selectedOpacity
                            ),
                            border: 1,
                            ...(e === settings
                              ? {
                                  color: theme.palette.primary.main,
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    theme.palette.action.selectedOpacity
                                  ),
                                }
                              : {}),
                          }}
                        >
                          {e}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                </Card>
              )}
              {!isMobile && (
                <Card
                  sx={{
                    p: 1,
                    position: 'relative',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    sx={{
                      minHeight: '15rem',
                      height: 'calc(100vh - 12rem)',
                      overflow: 'auto',

                      ...hideScrollbar,
                    }}
                  >
                    <List>
                      {map(SettingsSections, (e) => (
                        <StyledItem
                          sx={{
                            mb: 1,

                            ...(e === settings
                              ? {
                                  color: theme.palette.primary.main,
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    theme.palette.action.selectedOpacity
                                  ),
                                }
                              : {}),
                          }}
                          onClick={() => setSettings(e)}
                          open={e === settings}
                          active={e === settings}
                        >
                          <ListItemText
                            ref={textRef}
                            primary={`${translate(e)}`}
                            primaryTypographyProps={{
                              noWrap: true,
                              sx: {
                                minWidth: 80,
                                fontSize: 14,
                                lineHeight: '16px',
                                textAlign: 'Left',
                                ...(settings === e && {
                                  fontWeight: 'fontWeightMedium',
                                }),
                              },
                              textOverflow: 'initial',
                            }}
                          />
                        </StyledItem>
                      ))}
                    </List>
                  </Box>
                </Card>
              )}
            </>
          </Grid>
          <Grid item xs={12} sm={9} md={10} lg={10}>
            <Card
              sx={{
                p: 2,

                position: 'relative',
                ...(isMobile
                  ? {}
                  : {
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderLeft: (theme) => `dashed 1px ${theme.palette.divider}`,
                    }),
              }}
            >
              <Box
                sx={{
                  minHeight: isMobile ? '15rem' : '15rem',
                  height: isMobile ? 'calc(100vh - 13rem)' : 'calc(100vh - 13rem)',
                  overflow: 'auto',

                  ...hideScrollbar,
                }}
              >
                {/* <Stack direction="row" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="outlined" endIcon={<AddIcon />}>
                    Upload Banners
                  </Button>
                </Stack> */}

                <SettingsUploadImage />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
