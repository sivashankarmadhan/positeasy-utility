function convertTo12Hour(time24) {
  const [hour, minute] = time24.split(':');
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12; // Convert '0' to '12' for midnight

  return `${hour12}:${minute} ${period}`;
}

export default convertTo12Hour;
