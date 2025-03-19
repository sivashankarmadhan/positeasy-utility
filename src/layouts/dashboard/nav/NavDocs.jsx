// @mui
import { Stack, Button, Typography, Box } from '@mui/material';
// auth
// locales
import { useLocales } from '../../../locales';
import AuthService from 'src/services/authService';

// ----------------------------------------------------------------------

export default function NavDocs() {
  const user = AuthService._getMerchantDetails();

  const { translate } = useLocales();

  return (
    <Stack
      spacing={3}
      sx={{
        px: 5,
        pb: 5,
        mt: 10,
        width: 1,
        display: 'block',
        textAlign: 'center',
      }}
    >
      <Box component="img" src="/assets/illustrations/illustration_docs.svg" />

      <div>
        <Typography variant="subtitle2" noWrap>
          {user?.name}
        </Typography>

        <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
          {user?.email}
        </Typography>
      </div>

      <Button variant="contained">{`${translate('docs.documentation')}`}</Button>
    </Stack>
  );
}
