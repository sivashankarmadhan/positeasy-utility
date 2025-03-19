import { PATH_AUTH, PATH_DASHBOARD } from 'src/routes/paths';

const Navigation = {
  navigateToLogin() {
    window.location.href = PATH_AUTH.login;
  },
  navigateToHome() {
    window.location.href = PATH_DASHBOARD.dashboard;
  },
};

export default Navigation;
