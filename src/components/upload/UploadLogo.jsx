import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// form
import { useForm } from 'react-hook-form';

import { Box, Button, CircularProgress, Stack, Typography, useTheme } from '@mui/material';
// utils
import { fData } from 'src/utils/formatNumber';

import FormProvider, { RHFUploadAvatar } from 'src/components/hook-form';
import { alertDialogInformationState, currentStoreId, storeLogo } from 'src/global/recoilState';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import LogoServices from 'src/services/API/UploadLogoServices';
import { get } from 'lodash';
import S3ServicesLogo from 'src/services/API/S3ServicesLogo';
import AuthService from 'src/services/authService';
import { ROLES_DATA } from 'src/constants/AppConstants';
import TakeATourWithJoy from '../TakeATourWithJoy';
import { SettingTourLogo } from 'src/constants/TourConstants';
import CropImage from '../../sections/Settings/Logo/CropImage';

// ----------------------------------------------------------------------

const MAXIMUM_FILE_SIZE_LIMIT = 3145728;

UserNewEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
};

export default function UserNewEditForm() {
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole || ROLES_DATA.store_manager.role === currentRole;
  const [logo, setLogo] = useRecoilState(storeLogo);
  const theme = useTheme();

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const currentStore = useRecoilValue(currentStoreId);

  const [isLoading, setIsLoading] = useState(false);
  const [cropImage, setCropImage] = useState(false);
  const [imageURL, setImageURL] = useState('');
  const [imageData, setImageData] = useState({});

  const methods = useForm({
    defaultValues: {
      avatarUrl: '',
    },
  });

  const { setValue } = methods;

  const initialFetch = async () => {
    try {
      setIsLoading(true);
      const resp = await LogoServices.getLogoImage();
      if (get(resp, 'data.logoImage')) {
        setValue(
          'avatarUrl',
          Object.assign(get(resp, 'data.logoImage'), {
            preview: get(resp, 'data.logoImage'),
          })
        );
        setLogo(get(resp, 'data.logoImage'));
      } else {
        setValue('avatarUrl', '');
        setLogo('');
      }
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  const postLogoImage = async (file) => {
    try {
      setIsLoading(true);

      let options = {
        logoImage: null,
      };

      if (file) {
        const link = await S3ServicesLogo.getS3Link({ format: 'jpg' });

        await S3ServicesLogo.sendImagesToS3({
          S3URL: get(link, 'data.URL'),
          file: file,
        });
        const optiurl = get(link, 'data.URL')?.split('?')[0];
        options = {
          logoImage: optiurl,
        };
      }

      await LogoServices.postLogoImage(options);

      initialFetch();
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (get(file, 'size') <= MAXIMUM_FILE_SIZE_LIMIT) {
      setCropImage(true);
      setImageData(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageURL(reader.result));
      reader.readAsDataURL(file);
    }
  };

  function handleCancelImageCropper() {
    setCropImage(false);
  }

  useEffect(() => {
    if (currentStore) {
      initialFetch();
    }
  }, [currentStore]);

  const handleRemoveLogo = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to remove logo?`,
      actions: {
        primary: {
          text: 'Remove',
          onClick: async (onClose) => {
            postLogoImage();
            onClose();
          },
          sx: {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
            },
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          sx: {
            color: '#000',
          },
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };

  return (
    <>
    <FormProvider methods={methods}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 ,height:'75vh'}}>
        <Box
          sx={{
            mt: 1,
            border: '1px dashed #DEDEDE',
            borderRadius: '15px',
            maxWidth: 400,
            p: 5,
            mx: 'auto',
            pointerEvents: !isAuthorizedRoles ? 'none' : '',
          }}
        >
          {isAuthorizedRoles && (
            <Typography sx={{ mb: 1 }} variant="h6" textAlign="center">
               Logo
            </Typography>
          )}

          {isAuthorizedRoles && (
            <Typography
              variant="caption"
              sx={{
                mb: 2,
                mx: 'auto',
                display: 'block',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              JPEG, JPG, PNG and GIF format files are allowed
              <br /> max size of 3MB
            </Typography>
          )}

          <Box className="SettingLogoStep1" sx={{ position: 'relative' }}>
            <RHFUploadAvatar
              sx={{ width: 200, height: 200 }}
              name="avatarUrl"
              accept="image/*"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                isAuthorizedRoles ? (
                  <Stack flexDirection="column" justifyContent={'center'} alignItems="center">
                    {logo && (
                      <Button
                        variant="outlined"
                        sx={{ width: '6rem' }}
                        onClick={() => {
                          handleRemoveLogo();
                        }}
                      >
                        Remove
                      </Button>
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      Drag and drop or browse to choose an image
                    </Typography>
                  </Stack>
                ) : (
                  <></>
                )
              }
            />

            {isLoading && (
              <Box
                sx={{
                  mb: 2,
                  mx: 'auto',
                  display: 'block',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                JPEG, JPG, PNG and GIF format files are allowed
                <br /> max size of {fData(3145728)}
              </Box>
            )}

          </Box>
          <TakeATourWithJoy config={SettingTourLogo} />
        </Box>
        </Box>
      </FormProvider>
      <CropImage
        open={cropImage}
        onClose={handleCancelImageCropper}
        imageURL={imageURL}
        imageData={imageData}
        setValue={setValue}
        postLogoImage={postLogoImage}
      />
    </>
  );
}
