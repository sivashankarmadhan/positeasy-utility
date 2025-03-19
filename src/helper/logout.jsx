import Auth_API from 'src/services/auth';
import AuthService from 'src/services/authService';
let isLogouting = false;
export const logoutBilling = async () => {
  isLogouting = true;
  try {
    AuthService.logout();
    isLogouting = false;
  } catch (e) {
    console.log(e);
    AuthService.logout();
    isLogouting = false;
  }
};
