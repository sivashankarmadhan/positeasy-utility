export function formatTimeRange(number) {
    number =number-1; 
    const startHour = number % 12 || 12;
    const endHour = (number + 1) % 12 || 12;
    const startPeriod = number < 12 ? 'AM' : 'PM';
    const endPeriod = (number + 1) < 12 ? 'AM' : 'PM';
    return `${startHour}${startPeriod}-${endHour}${endPeriod}`;
  }

  export function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }