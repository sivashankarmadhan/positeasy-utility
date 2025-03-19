import { useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import Joyride from 'react-joyride';
import { useRecoilState } from 'recoil';
import { finishedStatuses } from 'src/constants/TourConstants';
import { isTourOpenState } from 'src/global/recoilState';

export default function TakeATourWithJoy({ config }) {
  const [isTourOpen, setIsTourOpen] = useRecoilState(isTourOpenState);
  const theme = useTheme();

  useEffect(() => {
    return () => {
      setIsTourOpen(false);
    };
  }, []);

  const handleJoyrideCallback = (data) => {
    const { action } = data;
    if (finishedStatuses.includes(action)) {
      setIsTourOpen(false);
    }
  };

  return (
    <div style={{ textAlign: 'Right' }}>
      <Joyride
        disableScrollParentFix
        autoStart
        scrollToFirstStep
        showProgress
        continuous
        run={isTourOpen}
        callback={handleJoyrideCallback}
        steps={config}
        scrollOffset={200}
        styles={{
          buttonBack: {
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            borderRadius: '5px',
            padding: '5px 10px',
            marginRight: '10px',
            cursor: 'pointer',
          },
          buttonNext: {
            color: 'white',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
          },
          options: {
            zIndex: 10000,
            primaryColor: theme.palette.primary.main,
            textColor: theme.palette.primary.main,
            arrowColor: theme.palette.primary.lighter,
          },
          tooltip: {
            backgroundColor: theme.palette.primary.lighter,
            color: theme.palette.primary.main,
            borderRadius: '15px',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
        }}
      />
    </div>
  );
}
