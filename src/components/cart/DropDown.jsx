import { Autocomplete, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const DropDown = ({ value, handleChange, items, label, fullWidth = true }) => {
  const theme = useTheme();

  return (
    <Autocomplete
      size="small"
      fullWidth={fullWidth}
      disablePortal
      options={items}
      value={value}
      onChange={(event, newValue) => handleChange(newValue)}
      sx={{ width: '100%' }}
      renderInput={(params) => <TextField variant="filled" {...params} label={label} />}
    />
  );
};

export default DropDown;
