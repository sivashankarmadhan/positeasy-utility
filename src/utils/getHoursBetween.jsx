import React from 'react';

const getHoursBetween = ({ startHour, endHour }) => {
  function getHoursBetweenYesterdayAndToday(startHour, endHour) {
    // Get current date and time
    const currentDate = new Date();

    // Set start time for yesterday
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 1);
    startDate.setHours(startHour, 0, 0, 0);

    // Set end time for today
    const endDate = new Date(currentDate);
    endDate.setHours(endHour, 0, 0, 0);

    // Validate start and end times
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid hour format');
      return [];
    }

    // Initialize result array
    const hoursArray = [];

    // Iterate through hours
    let currentHour = startDate;
    while (currentHour <= endDate) {
      const formattedHour = currentHour.toLocaleTimeString([], { hour: '2-digit', hour12: false });
      hoursArray.push(Number(formattedHour));

      // Increment currentHour by 1 hour
      currentHour = new Date(currentHour.getTime() + 60 * 60 * 1000);
    }

    return hoursArray;
  }

  // Example usage
  const hoursBetween = getHoursBetweenYesterdayAndToday(startHour, endHour);
  return hoursBetween;
};

export default getHoursBetween;
