import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Grid, ListItem, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { fCurrency } from 'src/utils/formatNumber';
import S3ImageCaching from './S3ImageCaching';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function AutoCompleteList({ options, onChange, selectedValues, handleSubmit }) {
  return (
    <Autocomplete
      multiple
      id="checkboxes-tags-demo"
      options={options}
      // disableCloseOnSelect
      filterSelectedOptions
      getOptionLabel={(option) => option.customCode}
      renderOption={(props, option, { selected }) => (
        <ListItem {...props} sx={{ width: '100%' }}>
          <Typography>{option.customCodeName}</Typography>
        </ListItem>
      )}
      style={{ width: 300 }}
      renderInput={(params) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TextField {...params} label="Custom Code" placeholder="Select Code" />
        </div>
      )}
      onChange={onChange}
      value={selectedValues}
    />
  );
}
