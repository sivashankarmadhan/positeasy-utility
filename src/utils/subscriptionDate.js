import 'moment-duration-format';

const subscriptionDate = (differenceInDays) => {
  if (differenceInDays < 30) {
    return `${differenceInDays} day${differenceInDays > 1 ? 's' : ''}`;
  } else if (differenceInDays < 365) {
    const months = Math.floor(differenceInDays / 30); // Approximate number of months
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(differenceInDays / 365); // Approximate number of years
    return `${years} year${years > 1 ? 's' : ''}`;
  }
};

export default subscriptionDate;
