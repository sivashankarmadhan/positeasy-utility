import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useRecoilState } from 'recoil';
import { SignInTypes } from 'src/constants/AppConstants';
import { signInAs } from 'src/global/recoilState';

export default function SignedInAs() {
  const [signedInAs, setSignedInAs] = useRecoilState(signInAs);

  const handleChange = (event, value) => {
    setSignedInAs(value);
  };
  return (
    <ToggleButtonGroup
      size="small"
      color="primary"
      value={signedInAs}
      exclusive
      onChange={handleChange}
      aria-label="Platform"
      sx={{ height: 30 }}
    >
      <ToggleButton value={SignInTypes.MASTER}>Master</ToggleButton>
      <ToggleButton value={SignInTypes.MANAGER}>Manager</ToggleButton>
      <ToggleButton value={SignInTypes.TERMINAL}>Terminal</ToggleButton>
    </ToggleButtonGroup>
  );
}
