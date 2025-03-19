import { Stack } from '@mui/material';
import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import POS from 'src/sections/Settings/Templates/POS';
import PDF from 'src/sections/Settings/Templates/PDF';
import { useMediaQuery } from '@poriyaalar/custom-hooks';

export const Templates = () => {
  const [selectedTab, setSelectedTab] = useState('pos');
  const isMinWidth900px = useMediaQuery('(min-width:900px)');
  const isMobileView = useMediaQuery('(max-width:992px)');

  return (
    <Stack
      sx={{
        flexDirection: {
          md: 'row',
        },
        mt: isMobileView ? '' : 5,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
      }}
    >
      <Tabs
        sx={{
          width: {
            md: 50,
          },
          mb: { xs: 3, md: 0 },
          // mx: { xs: 'auto', md: 'none' },
          borderRight: { md: '0.5px solid #D4D5CD', xs: 'none' },
        }}
        orientation={isMinWidth900px ? 'vertical' : 'horizontal'}
        variant="scrollable"
        scrollButtons={false}
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
      >
        <Tab value="pos" label="POS" />
        <Tab value="pdf" label="PDF" />
      </Tabs>
      {selectedTab === 'pos' && <POS />}
      {selectedTab === 'pdf' && <PDF />}
    </Stack>
  );
};
