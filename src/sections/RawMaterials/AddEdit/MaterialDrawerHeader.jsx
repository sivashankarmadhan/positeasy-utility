import { IconButton, Stack, Tooltip, Typography, useTheme, Divider, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadImage from 'src/components/upload/UploadImage';

const MaterialDrawerHeader = ({ setValue, values, productName, handleCancel, handleClear }) => {
  const theme = useTheme();

  return (
    <Stack
      flexDirection={'row'}
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1,
        mb: 1.5,
        backgroundColor: '#fff',
        p: 1,
        position: 'sticky',
        top: 0,
        zIndex: 999,
        width: '100%',
        mt: 1,
        ml: 1,
      }}
    >
      <Stack flexDirection={'row'} sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Stack alignItems="center">
          <Box
            sx={{
              height: 50,
              width: 50,
              borderRadius: 50,
              overflow: 'hidden',
            }}
          >
            <UploadImage
              name={'productImage'}
              setValue={setValue}
              values={values}
              style={{
                height: '50px',
                width: '50px',
                top: 0,
                left: 0,
              }}
              isShowDefaultImage
            />
          </Box>
          <Typography sx={{ fontSize: '10px', color: '#22bcff', mt: 0.5, ml: 0.5 }}>
            Product image
          </Typography>
        </Stack>
        <Typography variant="h6" sx={{ ml: 1, pb: 2 }}>
          {productName}
        </Typography>
      </Stack>
      <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          onClick={() => handleClear()}
          sx={{
            '&:hover': {
              textDecoration: 'underline',
            },
            fontSize: '14px',
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            mr: 1,
            cursor: 'pointer',
            // color: '#fff',
            pb: 2,
          }}
        >
          Reset
        </Typography>

        <Stack sx={{ pb: 2, mr: 2 }}>
          <Tooltip title="Close">
            <IconButton onClick={() => handleCancel()}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  );
};
export default MaterialDrawerHeader;
