import React, { useState } from 'react';
import { Stack, Tab, Tabs } from '@mui/material';
import { WHATSAPP_TABS } from 'src/constants/AppConstants';
import Balance from 'src/sections/WhatsappCredits/Balance';
import MessagesHistory from 'src/sections/WhatsappCredits/MessagesHistory';
import RechargeHistory from 'src/sections/WhatsappCredits/RechargeHistory';
import MessageHistory from 'src/sections/WhatsappCredits/MessageHistory';

const WhatsappCredits = () => {
  const [currentTab, setCurrentTab] = useState(WHATSAPP_TABS.BALANCE);

  const handleChangeTab = (e, value) => {
    setCurrentTab(value);
  };

  return (
    <Stack mx={2}>
      <Tabs
        variant="scrollable"
        scrollButtons={false}
        value={currentTab}
        onChange={handleChangeTab}
        allowScrollButtonsMobile
      >
        <Tab value={WHATSAPP_TABS.BALANCE} label={'Balance'} />
        {/* <Tab value={WHATSAPP_TABS.MESSAGES_HISTORY} label={'Messages History'} /> */}
        <Tab value={WHATSAPP_TABS.RECHARGE_HISTORY} label={'Recharge History'} />
        <Tab value={WHATSAPP_TABS.MESSAGES_HISTORY} label={'Message History'} />
      </Tabs>

      {currentTab === WHATSAPP_TABS.BALANCE && <Balance />}
      {/* {currentTab === WHATSAPP_TABS.MESSAGES_HISTORY && <MessagesHistory />} */}
      {currentTab === WHATSAPP_TABS.RECHARGE_HISTORY && <RechargeHistory />}
      {currentTab === WHATSAPP_TABS.MESSAGES_HISTORY && <MessageHistory />}
    </Stack>
  );
};

export default WhatsappCredits;
