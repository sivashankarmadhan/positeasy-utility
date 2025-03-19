import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useRecoilState } from 'recoil';
import { SignInTypes } from 'src/constants/AppConstants';
import { monitorView } from 'src/global/recoilState';

export default function StoreMonitorViewToggle() {
  const [monitor, setMonitor] = useRecoilState(monitorView);

  const handleChange = (event, value) => {
    setMonitor(value);
  };
  return (
    <ToggleButtonGroup
      size="small"
      color="primary"
      value={monitor}
      exclusive
      onChange={handleChange}
      aria-label="Platform"
      sx={{ height: 30 }}
    >
      <ToggleButton value={false}>Access</ToggleButton>
      <ToggleButton value={true}>Monitor</ToggleButton>
    </ToggleButtonGroup>
  );
}
