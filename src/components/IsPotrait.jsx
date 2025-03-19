import React, { useEffect, useState } from 'react';

export default function IsPotrait({ cb }) {
  const [isPortrait, setIsPortrait] = useState(
    window.matchMedia('(orientation: portrait)').matches
  );

  useEffect(() => {
    cb(isPortrait);
  }, [isPortrait]);
  useEffect(() => {
    const handleOrientationChange = (event) => {
      setIsPortrait(event.matches);
    };

    const mediaQuery = window.matchMedia('(orientation: portrait)');

    mediaQuery.addListener(handleOrientationChange);

    // Cleanup the listener on component unmount
    return () => {
      mediaQuery.removeListener(handleOrientationChange);
    };
  }, []);
  return <div />;
}
