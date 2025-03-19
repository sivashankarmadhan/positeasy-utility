import { yupResolver } from '@hookform/resolvers/yup';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useResponsive, useMediaQuery } from '@poriyaalar/custom-hooks';
import { get, isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRecoilValue } from 'recoil';
import DescriptionIcon from '@mui/icons-material/Description';
import FormProvider from 'src/components/FormProvider';
import S3ImageCaching from 'src/components/S3ImageCaching';
import { RHFSwitch, RHFTextField } from 'src/components/hook-form';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import UploadImage from 'src/components/upload/UploadImage';
import { currentAddon } from 'src/global/recoilState';
import { S3Service } from 'src/services/S3Service';
import PRODUCTS_API from 'src/services/products';
import * as Yup from 'yup';
import AddonDrawerHeader from './AddonDrawerHeader';
import { REQUIRED_CONSTANTS, VALIDATE_CONSTANTS } from 'src/constants/AppConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { hideScrollbar } from 'src/constants/AppConstants';
import PercentIcon from '@mui/icons-material/Percent';
import { textReplaceAll } from 'src/helper/textReplaceAll';

export default function HandleAddonDrawer({
  openDrawer,
  handleCloseDrawer,
  editMode,
  setEditMode,
  newAddon,
  getAddonList,
  setOpenDeleteAddOn,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [isLoading, setIsLoading] = useState(false);
  const currentAddonData = useRecoilValue(currentAddon);
  const [isAttributemode, setAttributeMode] = useState(false);
  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;

  const RegisterSchema = Yup.object().shape({
    name: Yup.string().required('Addon Name required'),
    description: Yup.string().nullable(),
    price: Yup.number()
      .required('Price Required')
      .transform((value) => (Number.isNaN(value) ? null : value))
      .test('Is positive?', VALIDATE_CONSTANTS.PRICE_NOT_ZERO, (value) => value > -1),
    isGST: Yup.boolean(),
    GSTPercent: Yup.number().when('isGST', {
      is: (value) => value === true,
      then: () =>
        Yup.number()
          .required(REQUIRED_CONSTANTS.GST)
          .transform((value) => (Number.isNaN(value) ? null : value))
          .test('Is positive?', VALIDATE_CONSTANTS.PERCENTAGE_NOT_BELOW, (value) => value > -1),
      otherwise: () =>
        Yup.number()
          .transform((value) => (Number.isNaN(value) ? null : value))
          .nullable()
          .test('Is positive?', VALIDATE_CONSTANTS.PERCENTAGE_NOT_BELOW, (value) => value > -1),
    }),
    ...(isAttributemode ? { isVeg: Yup.boolean().required(REQUIRED_CONSTANTS.VEG_NONVEG) } : {}),
    addOnImage: Yup.mixed(),
  });

  const defaultValues = {
    name: '',
    description: '',
    price: 1,
    ...(isAttributemode ? { isVeg: true } : {}),
    addOnImage: '',
    isGST: false,
    GSTPercent: 0,
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });
  const { reset, setError, setValue, handleSubmit, watch } = methods;
  const values = watch();
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      let updatedData = {
        ...data,
        description: textReplaceAll(get(data, 'description', ''), '\n', ','),
      };
      if (typeof get(data, 'addOnImage') === 'object') {
        const linkResponse = await S3Service.getLink();
        const payload = {
          s3URL: get(linkResponse, 'data.URL'),
          file: get(data, 'addOnImage'),
        };
        const imageResponse = await S3Service.sendFile(payload);
        updatedData = { ...updatedData, addOnImage: get(imageResponse, 'url').split('?')[0] };
      }
      if (newAddon) {
        const { name, description, price, isVeg, addOnImage, GSTPercent } = updatedData;
        const options = [
          {
            name,
            description,
            price,
            ...(isAttributemode ? { attributes: { isVeg: isVeg } } : { attributes: {} }),
            addOnImage,
            GSTPercent,
          },
        ];
        handleNewAddon(options);
      } else if (!newAddon) {
        const { name, description, price, isVeg, addOnImage, GSTPercent } = updatedData;
        const options = {
          addOnId: currentAddonData.addOnId,
          name,
          ...(isAttributemode ? { attributes: { isVeg: isVeg } } : { attributes: {} }),
          description,
          price,
          addOnImage,
          GSTPercent,
        };

        handleUpdateAddon(options);
      }
    } catch (error) {
      setError('afterSubmit', ErrorConstants.SOMETHING_WRONG);
      setIsLoading(false);
    }
  };

  const handleUpdateAddon = async (options) => {
    try {
      const response = await PRODUCTS_API.updateAddon(options);
      if (response) toast.success(SuccessConstants.ADDON_UPDATED);
      setIsLoading(false);
      getAddonList();
      handleReset();
      handleCloseDrawer();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
      setIsLoading(false);
    }
  };
  const handleNewAddon = async (options) => {
    try {
      const response = await PRODUCTS_API.addAddon(options);
      if (response) toast.success(SuccessConstants.ADDON_ADDED);
      setIsLoading(false);
      getAddonList();
      handleReset();
      handleCloseDrawer();
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_UPDATE);
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    reset(defaultValues);
  };
  const isShowGSTField = methods.watch('isGST');
  useEffect(() => {
    if (isEmpty(currentAddonData)) {
      handleReset();
    } else {
      reset({
        ...currentAddonData,
        isVeg: get(currentAddonData, 'attributes.isVeg') ? true : false,
        isGST: currentAddonData.GSTPercent > 0 ? true : false,
        description: textReplaceAll(get(currentAddonData, 'description', ''), ',', '\n'),
      });
    }
  }, [currentAddonData]);

  if (isLoading) return <LoadingScreen />;
  return (
    <Drawer
      anchor={'right'}
      open={openDrawer}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : isTab ? '60%' : !editMode ? '38%' : '35%',
          ...hideScrollbar,
        },
        // sx: { width: isMobile ? '100%' : !editMode ? '38%' : '35%', ...hideScrollbar },
      }}
    >
      <AddonDrawerHeader
        newAddon={newAddon}
        reset={reset}
        defaultValues={defaultValues}
        setEditMode={setEditMode}
        editMode={editMode}
        purpose={currentAddonData}
        handleCloseDrawer={handleCloseDrawer}
        setOpenDeleteAddOn={setOpenDeleteAddOn}
      />

      {!editMode && (
        <Grid
          container
          sx={{
            m: 1,
            px: 2,
          }}
          gap={2}
        >
          <Grid item xs={12} sm={12}>
            <S3ImageCaching
              src={get(currentAddonData, 'addOnImage')}
              alt={get(currentAddonData, 'name')}
              style={{ height: 240, width: '100%', borderRadius: 10 }}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <Typography variant="caption">Name</Typography>
            <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
              {currentAddonData.name}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <Typography variant="caption">Description</Typography>
            <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
              {get(currentAddonData, 'description')}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={5.5}>
            <Typography variant="caption">
              {get(currentAddonData, 'GSTPercent') > 0 ? `Price  without GST (₹)` : `Price (₹)`}
            </Typography>
            <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
              {currentAddonData.price}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>
          {get(currentAddonData, 'GSTPercent') > 0 && (
            <Grid item xs={12} sm={12} md={12} lg={5.5} sx={{ m: 1 }}>
              <Typography variant="caption">GST (%)</Typography>
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {get(currentAddonData, 'GSTPercent')}
              </Typography>{' '}
              <Divider sx={{ mt: 1 }} />
            </Grid>
          )}{' '}
          {get(currentAddonData, 'GSTPercent') > 0 && (
            <Grid item xs={12} sm={12} md={12} lg={5.5} sx={{ m: 1 }}>
              <Typography variant="caption">Price with GST (₹)</Typography>
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {(get(currentAddonData, 'price') * get(currentAddonData, 'GSTPercent')) / 100 +
                  get(currentAddonData, 'price')}
              </Typography>
              <Divider sx={{ mt: 1 }} />
            </Grid>
          )}
          {!isEmpty(get(currentAddonData, 'attributes')) && (
            <Grid item xs={!editMode ? 12 : 5} sm={12} md={12} lg={5.5}>
              <Typography variant="caption">Veg/Non-Veg </Typography>
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {get(currentAddonData, 'attributes.isVeg') ? 'Veg' : 'Non Veg'}
              </Typography>
              <Divider sx={{ mt: 1 }} />
            </Grid>
          )}
        </Grid>
      )}
      {editMode && (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid
            container
            sx={{
              m: 1,
              px: 2,
            }}
            gap={1}
          >
            <Grid item xs={12} lg={12} sx={{ m: 1 }}>
              <RHFTextField
                name="name"
                autoFocus
                inputProps={{ readOnly: !editMode }}
                variant="outlined"
                label="Enter Addon Name"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} lg={12} sx={{ m: 1 }}>
              <RHFTextField
                fullWidth
                multiline
                inputProps={{ readOnly: !editMode }}
                variant="outlined"
                name="description"
                label="Enter Description "
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} lg={12} sx={{ m: 1 }}>
              <RHFTextField
                fullWidth
                onWheel={(e) => e.target.blur()}
                inputProps={{ readOnly: !editMode }}
                variant="outlined"
                name="price"
                label="Enter Price "
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyRupeeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>{' '}
            <Grid item xs={5} sm={5} md={5.8} lg={5.8}>
              <Stack
                flexDirection={'row'}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography>GST </Typography>
                <RHFSwitch inputProps={{ readOnly: !editMode }} name="isGST" />
              </Stack>
            </Grid>
            <Grid
              item
              xs={5}
              sm={5}
              md={5.6}
              lg={5.8}
              sx={{ visibility: isShowGSTField ? 'visible' : 'hidden' }}
            >
              <RHFTextField
                fullWidth
                inputProps={{ readOnly: !editMode }}
                variant="outlined"
                name="GSTPercent"
                label="GST"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      <PercentIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={!editMode ? 12 : 5} md={5.8} lg={5.8}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      defaultChecked={isAttributemode}
                      checked={isAttributemode}
                      onChange={() => setAttributeMode(!isAttributemode)}
                      name={'attributeMode'}
                    />
                  }
                  label={'Attributes (optional)'}
                />
              </FormGroup>
            </Grid>
            {isAttributemode && (
              <Grid item xs={!editMode ? 12 : 5} md={5.8} lg={5.8}>
                {' '}
                <Stack
                  flexDirection={'row'}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '48.5%',
                  }}
                >
                  <Typography>Veg </Typography>
                  <RHFSwitch inputProps={{ readOnly: !editMode }} name="isVeg" />
                </Stack>
              </Grid>
            )}
            <Grid item xs={12} sm={12} sx={{ m: 1 }}>
              <div
                style={{
                  justifyContent: 'center',
                  display: 'flex',
                }}
              >
                <UploadImage name={'addOnImage'} setValue={setValue} values={values} />
              </div>
            </Grid>
            {editMode || isEmpty(currentAddonData) ? (
              <Button type="submit" variant="contained" fullWidth sx={{ py: 2, my: 2, mx: 2.5 }}>
                {!newAddon ? 'Update addon' : 'Add addon'}
              </Button>
            ) : (
              <div />
            )}
          </Grid>
        </FormProvider>
      )}
    </Drawer>
  );
}
