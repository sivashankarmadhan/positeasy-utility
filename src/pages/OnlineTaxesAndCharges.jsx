import { Stack, Tab, Tabs } from '@mui/material';
import { map, get } from 'lodash';
import React, { useState } from 'react';
import TaxesAndCharges from 'src/sections/OnlineTaxesAndCharges/TaxesAndCharges';

const tabsOptions = [
  {
    label: 'Taxes',
    value: 'taxes',
  },
  {
    label: 'Charges',
    value: 'charges',
  },
];

const OnlineTaxesAndCharges = () => {
  const [selectedTab, setSelectedTab] = useState(get(tabsOptions, '0.value'));

  return (
    <Stack sx={{ ml: 2 }}>
      <Tabs
        sx={{
          width: '10rem',
          mb: 1,
          mb: 2,
          '& .MuiTabs-scroller': {
            borderBottom: '2px solid #ecebeb',
          },
          '& .MuiButtonBase-root': {
            color: '#a6a6a6',
          },
        }}
        value={selectedTab}
        onChange={(event, newValue) => {
          setSelectedTab(newValue);
        }}
        indicatorColor="primary"
      >
        {map(tabsOptions, (_tab) => {
          return <Tab value={get(_tab, 'value')} label={get(_tab, 'label')} />;
        })}
      </Tabs>
      {selectedTab === get(tabsOptions, '0.value') && <TaxesAndCharges type="TAX" />}
      {selectedTab === get(tabsOptions, '1.value') && <TaxesAndCharges type="CHARGES" />}
    </Stack>
  );
};

export default OnlineTaxesAndCharges;
