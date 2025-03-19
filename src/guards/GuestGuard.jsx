import PropTypes from 'prop-types';
import Navigation from 'src/services/NavigationService';
import AuthService from 'src/services/authService';

// ----------------------------------------------------------------------

GuestGuard.propTypes = {
  children: PropTypes.node,
};

export default function GuestGuard({ children }) {
  const isAuthenticated = AuthService._getAccessToken();

  if (isAuthenticated) {
    return Navigation.navigateToHome();
  }

  return <>{children}</>;
}
