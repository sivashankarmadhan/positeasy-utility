import PropTypes from 'prop-types';
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// hooks
// components
import Navigation from 'src/services/NavigationService';
import AuthService from 'src/services/authService';
// ----------------------------------------------------------------------

AuthGuard.propTypes = {
  children: PropTypes.node,
};

export default function AuthGuard({ children }) {
  const isAuthenticated = AuthService._getAccessToken();
  const { pathname } = useLocation();

  const [requestedLocation, setRequestedLocation] = useState(null);

  if (!isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return Navigation.navigateToLogin();
  }

  if (requestedLocation && pathname !== requestedLocation) {
    setRequestedLocation(null);
    return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
}
