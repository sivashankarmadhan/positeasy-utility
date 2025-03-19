import { Stack, Typography } from '@mui/material';
import { useTimer } from 'react-timer-hook';

export default function MyTimer({ expiryTimestamp, onClose }) {
  const { seconds, minutes } = useTimer({
    expiryTimestamp,
    onExpire: () => onClose(),
  });

  const formatTime = (expiryTimestamp) => {
    return String(expiryTimestamp).padStart(2, '0');
  };

  return (
    <Stack flexDirection="row" justifyContent="center" alignItems="center">
      <Typography
        variant="h2"
        sx={{
          fontSize: minutes < 1 && seconds < 30 ? '60px' : '60px',
          color: minutes < 1 && seconds < 30 ? 'error.main' : undefined,
        }}
      >
        {formatTime(minutes)}
      </Typography>
      <Typography
        variant="h2"
        mb={1}
        sx={{
          fontSize: minutes < 1 && seconds < 30 ? '60px' : '60px',
          color: minutes < 1 && seconds < 30 ? 'error.main' : undefined,
        }}
      >
        :
      </Typography>
      <Typography
        variant="h2"
        sx={{
          fontSize: minutes < 1 && seconds < 30 ? '60px' : '60px',
          color: minutes < 1 && seconds < 30 ? 'error.main' : undefined,
        }}
      >
        {formatTime(seconds)}
      </Typography>
    </Stack>
  );
}
