import APIService from 'src/services/apiService';
import handleCallback from 'src/services/API/Callback';
import AuthService from 'src/services/authService';
const API = AuthService.getRemoteURL();

const Attendance_API = {
  markAttendance(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/mark-attendance`,
          method: 'POST',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  changeStaffAttendance(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/mark-staffAttendance`,
          method: 'PUT',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  markExtraHoursHours(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/mark-extraHours`,
          method: 'PUT',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getAttendance(startDate, endDate, accessId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: accessId
            ? `${API}/api/v1/POS/merchant/get-attendance?accessId=${accessId}&startDate=${startDate}&endDate=${endDate}`
            : `${API}/api/v1/POS/merchant/get-attendance?startDate=${startDate}&endDate=${endDate}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default Attendance_API;
