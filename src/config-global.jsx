// routes
import { ROLES_WITHOUT_STORE_STAFF } from './constants/AppConstants';
import { PATH_DASHBOARD } from './routes/paths';
import AuthService from './services/authService';

// API
// ----------------------------------------------------------------------

export const HOST_API_KEY = import.meta.env.REACT_APP_HOST_API_KEY || '';

export const FIREBASE_API = {
  apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.REACT_APP_FIREBASE_APPID,
  measurementId: import.meta.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

export const COGNITO_API = {
  userPoolId: import.meta.env.REACT_APP_AWS_COGNITO_USER_POOL_ID,
  clientId: import.meta.env.REACT_APP_AWS_COGNITO_CLIENT_ID,
};

export const AUTH0_API = {
  clientId: import.meta.env.REACT_APP_AUTH0_CLIENT_ID,
  domain: import.meta.env.REACT_APP_AUTH0_DOMAIN,
};

export const MAP_API = import.meta.env.REACT_APP_MAPBOX_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = () => {
  const currentRole = AuthService.getCurrentRoleInLocal();

  return ROLES_WITHOUT_STORE_STAFF.includes(currentRole)
    ? PATH_DASHBOARD.dashboard
    : PATH_DASHBOARD.inventory.products;
};

// LAYOUT
// ----------------------------------------------------------------------

export const HEADER = {
  H_MOBILE: 64,
  H_MAIN_DESKTOP: 88,
  H_DASHBOARD_DESKTOP: 92,
  H_DASHBOARD_DESKTOP_OFFSET: 92 - 32,
};

export const NAV = {
  W_BASE: 260,
  W_LARGE: 320,
  W_DASHBOARD: 240,
  W_DASHBOARD_MINI: 240,
  //
  H_DASHBOARD_ITEM: 44,
  H_DASHBOARD_ITEM_SUB: 36,
  //
  H_DASHBOARD_ITEM_HORIZONTAL: 32,
};

export const ICON = {
  NAV_ITEM: 24,
  NAV_ITEM_HORIZONTAL: 22,
  NAV_ITEM_MINI: 22,
};
