// @mui
import { Box, Typography, Stack, useMediaQuery } from '@mui/material';
// assets
import { UploadIllustration } from '../../assets/illustrations';

// ----------------------------------------------------------------------

export default function BlockContent({ type, file, isMiniSize }) {
  console.log('isMiniSize', isMiniSize);
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        width: 1,
        height: isMiniSize ? 0 : isMobile ? 260 : 180,
        textAlign: { xs: 'center', md: 'left' },
      }}
    >
      {!file && <UploadIllustration sx={{ width: isMiniSize ? 120 : 220 }} />}

      <Box sx={{ p: isMiniSize ? 2 : 3 }}>
        {!file && !isMiniSize && (
          <Typography gutterBottom variant="h5">
            {`Drop or Select ${type}`}
          </Typography>
        )}

        {!file && (
          <Typography variant={isMiniSize ? 'subtitle2' : 'body2'} sx={{ color: 'text.secondary' }}>
            Drop files here or click&nbsp;
            <Typography
              variant={isMiniSize ? 'subtitle2' : 'body2'}
              component="span"
              sx={{ color: 'primary.main', textDecoration: 'underline' }}
            >
              browse
            </Typography>
            &nbsp;thorough your machine
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
