import jwtDecode from 'jwt-decode';
import moment from 'moment';
import AuthService from 'src/services/authService';

export const isTokenExpired = () => {
  const token = AuthService._getAccessToken();
  if (!token) return false;
  const { exp } = jwtDecode(token || '');
  const tokenExp = moment().add(10, 'minutes').unix() >= exp;
  return tokenExp;
};
