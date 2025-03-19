import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Box, Container, Dialog, Grid, Paper, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import { filter, get, isEmpty, map } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useSettingsContext } from 'src/components/settings';

import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import MobileStepper from '@mui/material/MobileStepper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import toast from 'react-hot-toast';
import SwipeableViews from 'react-swipeable-views';
import { useRecoilValue } from 'recoil';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { currentStoreId } from 'src/global/recoilState';
import S3Services from 'src/services/API/S3Services';
import BannerServices from 'src/services/API/SettingsUploadImageServices';
import AuthService from 'src/services/authService';
import { ROLES_DATA, StatusConstants } from 'src/constants/AppConstants';
import { base64_images } from 'src/constants/ImageConstants';
import TakeATourWithJoy from '../TakeATourWithJoy';
import { SettingTourBanner } from 'src/constants/TourConstants';
import uuid from 'react-uuid';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import ErrorIcon from '@mui/icons-material/Error';

export default function SettingsUploadImage() {
  const { themeStretch } = useSettingsContext();
  const currentStore = useRecoilValue(currentStoreId);

  const [images, setImages] = useState([]);
  const [hovering, setHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [errorScreen, setErrorScreen] = useState(false);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole;
  const hideScrollbar = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  };

  const handleOpenDeleteDrawer = (step) => {
    setCurrentStep(step);
    setOpenDelete(true);
  };
  const getBanners = async () => {
    try {
      setIsLoading(true);
      const resp = await BannerServices.getBannerImages();
      if (!isEmpty(get(resp, 'data.0.bannerImages')))
        setImages(get(resp, 'data.0.bannerImages', []));
      else setImages([]);
      setErrorScreen(false);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      setErrorScreen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentStore) getBanners();
  }, [currentStore]);

  const inputRef = useRef();

  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const infoItems = ['⚠️ Info', 'Please Upload Vertical Images for', 'Optimal Viewing Experience.'];
  const tip = infoItems.join('\n');
  const handleCloseDeleteDrawer = () => {
    setCurrentStep('');
    setOpenDelete(false);
  };
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const fileSizeLimit = 4 * 1024 * 1024;
  const checkFileReqs = (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > fileSizeLimit) {
        reject(ErrorConstants.FILE_LARGE);
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (e) => {
          const img = new Image();

          img.onload = () => {
            if (img.naturalHeight > img.naturalWidth) {
              resolve(true);
            } else {
              reject(ErrorConstants.VERTICAL_ASPECT);
            }
          };
          img.src = e.target.result;
        };
      }
    });
  };
  const handleFileSelect = async (event) => {
    if (images?.length > 9) return;
    try {
      if (!isEmpty(event.target.files)) {
        setIsLoading(true);
        const imageFile = event.target.files[0];

        try {
          await checkFileReqs(imageFile);

          const responseS3 = await S3Services.getS3Link({
            format: 'jpg',
          });

          await S3Services.sendImagesToS3({
            S3URL: responseS3.data.URL,
            file: imageFile,
          });
          const optiurl = responseS3.data.URL.split('?')[0];
          const options = {
            bannerImages: [
              ...images,
              {
                bannerId: uuid(),
                imageURL: optiurl,
                status: StatusConstants.ACTIVE,
              },
            ],
          };
          await handlePostBannerImage(options);
        } catch (error) {
          toast.error(
            error ||
              error?.response?.message ||
              error.detail ||
              error?.message ||
              error?.errorResponse?.message ||
              ErrorConstants.SOMETHING_WRONG
          );
        }
      }
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };
  const handlePostBannerImage = async (options) => {
    try {
      await BannerServices.postBannerImage(options);
      await getBanners();
    } catch (error) {
      toast.error(
        error ||
          error?.response?.message ||
          error.detail ||
          error?.message ||
          error?.errorResponse?.message ||
          ErrorConstants.SOMETHING_WRONG
      );
    }
  };
  const deleteBanners = async () => {
    try {
      setIsLoading(true);
      const filtered = filter(images, (e) => get(e, 'bannerId') !== get(currentStep, 'bannerId'));
      let options = {
        bannerImages: filtered,
      };
      await handlePostBannerImage(options);
      setOpenDelete(false);
      setHovering(false);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  const maxSteps = images?.length + 1;
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <>
      <Container
        maxWidth={themeStretch ? false : 'xl'}
        sx={{
          // height: isMobile ? 'calc(100vh - 100px)': "calc(100vh - 120px)",
          position: isMobile ?'absolute ':"relative",
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -45%)',
          display: errorScreen ? 'none' : '',
          alignContent: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {!isLoading ? (
          <Box
            sx={{
              width: '100%',
              overflow: 'hidden',
              flexGrow: 1,
            }}
          >
            <Stack sx={{ alignItems: 'center', width: '100%' }}>
              <Stack sx={{ mb: 2 , maxWidth: { md: '40%', xs: '100%' }}}>
                {!isMobile && 
                <Alert variant="outlined" severity="primary" icon={<ErrorIcon fontSize="inherit" />}>Upto 10 images or videos (1080x1920 resolution).</Alert>}
                {isMobile && <Typography variant='caption'>Upto 10 images or videos (1080x1920 resolution).</Typography>}
              </Stack>
            </Stack>
            <SwipeableViews
              axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
              index={activeStep}
              onChangeIndex={handleStepChange}
              enableMouseEvents
            >
              {map([...images, { id: -1, bannerImage: '' }], (step, index) => (
                <div
                  key={step?.bannerid}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative',
                    alignItems: 'flex-start',
                    // marginTop: '15%',
                  }}
                >
                  {step?.bannerid !== -1 && (
                    <DeleteIcon
                      sx={{
                        '&: hover': {
                          cursor: 'pointer',
                        },
                        display: hovering ? '' : 'none',
                        fill: 'red',
                        position: 'absolute',
                        top: isMobile?'45%':'55%',
                        left: isMobile?'45%':'47%',
                        height: '3rem',
                        width: '3rem',
                        right: { xl: 100, lg: 80, sm: 55, md: 80, xs: 20 },
                        zIndex: 99,
                        pointerEvents: !isAuthorizedRoles ? 'none' : '',
                      }}
                      onMouseOver={() => {
                        if (isAuthorizedRoles) setHovering(true);
                      }}
                      onClick={() => {
                        handleOpenDeleteDrawer(step);
                      }}
                    />
                  )}
                  {Math.abs(activeStep - index) <= 2 ? (
                    <>
                      {index === images?.length || isEmpty(images) ? (
                        isAuthorizedRoles ? (
                          <Box
                            sx={{
                              width: '20rem',
                              height:  isMobile ? '28rem': '33rem',
                              filter: hovering && index !== images?.length ? 'blur(4px)' : '',
                              display: 'block',
                              overflow: 'hidden',
                              position: 'relative',
                            }}
                          >
                            <input
                              disabled={images?.length > 9}
                              type="file"
                              accept="image/*"
                              onChange={(event) => handleFileSelect(event)}
                              hidden
                              ref={inputRef}
                            />

                            <Stack
                              sx={{
                                border: '1px dashed #A4A4A4',
                                height: isMobile ? '28rem': '33rem',
                                justifyContent: 'center',
                                borderRadius: '2rem',
                              }}
                            >
                              <Tooltip
                                title={
                                  <div style={{ whiteSpace: 'pre-line' }}>
                                    {images?.length > 9 ? 'Maximum 10 reached ' : tip}
                                  </div>
                                }
                              >
                                <Stack
                                  className="settingBannerStep1"
                                  sx={{
                                    cursor: images?.length > 9 ? 'not-allowed' : 'pointer',
                                    pointerEvents: !isAuthorizedRoles ? 'none' : '',
                                    height: '74vh',
                                  }}
                                  spacing={2}
                                  justifyContent="center"
                                  alignItems="center"
                                  onClick={() => inputRef.current.click()}
                                >
                                  {images?.length > 9 ? (
                                    <CancelIcon
                                      color="error"
                                      sx={{ height: '3rem', width: '10rem', mr: -6, ml: -5 }}
                                    />
                                  ) : (
                                    <AddPhotoAlternateOutlinedIcon
                                      sx={{ height: '3rem', width: '10rem', mr: -6, ml: -5 }}
                                    />
                                  )}
                                  <Typography variant={images?.length > 9 ? 'body2' : 'h5'}>
                                    {images?.length > 0
                                      ? images?.length > 9
                                        ? 'Reached Maximum, Allowed only  10 images'
                                        : 'Upload more'
                                      : 'Add banners'}
                                  </Typography>
                                </Stack>
                              </Tooltip>
                            </Stack>
                          </Box>
                        ) : (
                          <Box
                            component="img"
                            sx={{
                              width: '20rem',
                              height: isMobile ? '28rem': '33rem',

                              // marginTop: '15%',
                              filter: hovering ? 'blur(4px)' : '',
                              borderRadius: '2rem',
                              display: 'block',

                              overflow: 'hidden',
                              position: 'relative',
                            }}
                            src={base64_images.No_Image}
                            alt={''}
                            id={step?.bannerid}
                            onMouseOver={() => {
                              if (isAuthorizedRoles) setHovering(true);
                            }}
                            onMouseOut={() => {
                              if (isAuthorizedRoles) setHovering(false);
                            }}
                          />
                        )
                      ) : (
                        <Stack
                          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          <Box
                            component="img"
                            sx={{
                              width: '20rem',
                              height: isMobile ? '28rem': '33rem',
                              justifyContent: 'center',
                              alignItems: 'center',
                              // marginTop: '15%',
                              filter: hovering ? 'blur(4px)' : '',
                              borderRadius: '2rem',
                              display: 'block',

                              overflow: 'hidden',
                              position: 'relative',
                            }}
                            src={step?.imageURL}
                            alt={''}
                            id={step?.bannerid}
                            onMouseOver={() => {
                              if (isAuthorizedRoles) setHovering(true);
                            }}
                            onMouseOut={() => {
                              if (isAuthorizedRoles) setHovering(false);
                            }}
                          />
                        </Stack>
                      )}
                    </>
                  ) : null}
                </div>
              ))}
            </SwipeableViews>

            <MobileStepper
              steps={maxSteps}
              activeStep={activeStep}
              position="static"
              sx={{
                mx: 'auto',
                maxWidth: 500,
              }}
              nextButton={
                <Button
                  sx={{
                    top:isMobile ? -250 : -300,
                    right: 20,
                    borderRadius: '20px',
                    height: '40px',
                    minWidth: '40px',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    opacity: activeStep === maxSteps - 1 ? 0.4 : 1,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                    },
                    xs: { right: -40 },
                  }}
                  size="small"
                  onClick={handleNext}
                  disabled={
                    isAuthorizedRoles ? activeStep === maxSteps - 1 : activeStep === maxSteps - 2
                  }
                >
                  {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                </Button>
              }
              backButton={
                <Button
                  size="small"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  sx={{
                    position: 'relative',
                    top: isMobile ? -250 : -300,
                    left: 20,
                    borderRadius: '20px',
                    height: '40px',
                    minWidth: '40px',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    opacity: activeStep === 0 ? 0.4 : 1,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                    },
                    xs: { left: -40 },
                  }}
                >
                  {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                </Button>
              }
            />
          </Box>
        ) : (
          <Box sx={{ height: '30rem', width: '50%', mx: 'auto' }}>
            <LinearProgress sx={{ top: '50%' }} />
          </Box>
        )}
      </Container>
      <Dialog open={openDelete}>
        <Paper
          sx={{
            p: 2,
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
            Are you sure to delete ? This action cannot be undone.
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={handleCloseDeleteDrawer}
              sx={{ mr: 2 }}
              variant="contained"
              color="error"
            >
              Cancel
            </Button>
            <Button onClick={deleteBanners} variant="contained">
              Delete
            </Button>
          </div>
        </Paper>
      </Dialog>
      <TakeATourWithJoy config={SettingTourBanner} />
    </>
  );
}
