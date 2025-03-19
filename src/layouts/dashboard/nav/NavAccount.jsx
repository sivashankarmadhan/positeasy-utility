// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
// auth
// components
import { CustomAvatar } from '../../../components/custom-avatar';
import AuthService from 'src/services/authService';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

export default function NavAccount() {
  const user = AuthService._getMerchantDetails();

  return (
    <StyledRoot>
      <CustomAvatar src={''} alt={user?.name.slice(0, 1)} name={user?.name} />

      <Box sx={{ ml: 2, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {user?.name}
        </Typography>

        <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
          {user?.email}
        </Typography>
      </Box>
    </StyledRoot>
  );
}
