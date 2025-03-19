// @mui
import { Box, Typography, Stack, useMediaQuery } from '@mui/material';
// assets
import { UploadIllustration } from '../../assets/illustrations';

// ----------------------------------------------------------------------

export default function BlockContent({ type, file }) {
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      direction={{ xs: 'column', md: 'row' }}
      sx={{ width: 1, height:isMobile? 260:180,textAlign: { xs: 'center', md: 'left' } }}
    >
      {!file && <UploadIllustration sx={{ width: 220 }} />}

      <Box sx={{ p: 3 }}>
        {!file && (
          <Typography gutterBottom variant="h5">
            {`Drop or Select ${type}`}
          </Typography>
        )}

        {!file && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Drop files here or click&nbsp;
            <Typography
              variant="body2"
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
