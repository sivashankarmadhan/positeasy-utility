import { Grid, ListItem } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { fCurrency } from 'src/utils/formatNumber';
import S3ImageCaching from './S3ImageCaching';
import { get, some } from 'lodash';

export default function AutoCompleteChipWithCheckBox({
  options,
  selectedValues,
  currentProductAddon,
  setSelectedValues,
}) {
  const handleSelectedAddon = (e, value) => {
    setSelectedValues(value);
  };
  const checkCurrentProductAddon = (addOnId) => {
    const data = some(currentProductAddon, (e) => e.addOnId === addOnId);
    return data;
  };
  return (
    <Autocomplete
      multiple
      id="checkboxes-tags-demo"
      options={options}
      // disableCloseOnSelect
      filterSelectedOptions
      getOptionLabel={(option) => option.name}
      getOptionDisabled={(option) => checkCurrentProductAddon(option.addOnId)}
      renderOption={(props, option, { selected }) => (
        <ListItem {...props} sx={{ width: '100%' }}>
          <Grid
            container
            direction={'row'}
            sx={{
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Grid item sm={3} md={3}>
              <S3ImageCaching
                src={option.addOnImage}
                alt={option.name}
                style={{ width: 50, height: 50, borderRadius: 2, objectFit: 'contain', }}
              />
            </Grid>
            <Grid item sm={6} md={6}>
              {option.name}
            </Grid>

            <Grid item sm={3} md={3}>
              <b> {fCurrency(option.price)}</b>
            </Grid>
          </Grid>
        </ListItem>
      )}
      style={{ width: 300 }}
      renderInput={(params) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TextField {...params} label="Addons" placeholder="Select Addon" />
        </div>
      )}
      onChange={handleSelectedAddon}
      value={selectedValues}
    />
  );
}
