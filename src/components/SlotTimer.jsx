import React, { useState, useMemo, useEffect } from 'react';
import differenceInSeconds from 'date-fns/differenceInSeconds';

const SlotTimer = ({
  startTime, // changed from deadline to startTime
  onlyMins = false,
  className,
  setIsTimeFinished,
  isTimeFinished,
  nohrsKey,
  showZeroTime,
}) => {
  const ONE_DAY = 60 * 60 * 24;
  const ONE_HOUR = 60 * 60;
  const ONE_MINUTE = 60;
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  // Calculate the time difference from the start time
  const diffInSeconds = differenceInSeconds(currentTime, startTime);

  const getCoundown = () => {
    if (diffInSeconds <= 1) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        daysInhour: 0,
      };
    }
    const days = Math.floor(diffInSeconds / ONE_DAY);
    const hours = Math.floor((diffInSeconds - days * ONE_DAY) / ONE_HOUR);
    const minutes = Math.floor((diffInSeconds - days * ONE_DAY - hours * ONE_HOUR) / ONE_MINUTE);
    const seconds = diffInSeconds - days * ONE_DAY - hours * ONE_HOUR - minutes * ONE_MINUTE;

    return {
      days,
      hours,
      minutes,
      seconds,
      daysInhour: days * 24 + hours,
    };
  };

  const countdown = useMemo(() => getCoundown(), [currentTime]);

  useEffect(() => {
    const intervalkey = setInterval(() => {
      const now = new Date().getTime();
      setCurrentTime(now);
    }, 1000);
    return () => clearInterval(intervalkey);
  }, []);

  return (
    <>
      {!onlyMins &&
        (countdown.daysInhour !== 0 ||
          countdown.minutes !== 0 ||
          countdown.seconds !== 0 ||
          showZeroTime) && (
          <div>
            {!!countdown.daysInhour && (
              <span>{String(countdown.daysInhour).padStart(2, '0')}:</span>
            )}
            <span>{String(countdown.minutes).padStart(2, '0')}</span>
            <span>:{String(countdown.seconds).padStart(2, '0')} </span>
            {countdown.daysInhour > 0 ? 'hrs' : countdown.minutes > 0 ? 'mins' : 'secs'}
          </div>
        )}
      {!onlyMins &&
        !showZeroTime &&
        countdown.daysInhour === 0 &&
        countdown.minutes === 0 &&
        countdown.seconds === 0 && <p>Time Expired</p>}
      {onlyMins && <span>{String(countdown.minutes + 1)} </span>}
    </>
  );
};

export default SlotTimer;
