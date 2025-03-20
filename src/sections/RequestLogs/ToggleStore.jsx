import { Box, Chip, Typography } from '@mui/material';
import { get } from 'lodash';
import React from 'react';
import { dateWithTimeAndSecFormatAMPM } from 'src/utils/formatTime';
import RowContent from '../Billing/RowContent';

const ToggleStore = ({ receivedLog }) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 1.5,
          mr: 1,
        }}
      >
        <RowContent
          noPx
          title="Action"
          icon={
            get(receivedLog, 'action') === 'enable' ? (
              <Chip
                color={'success'}
                // variant="outlined"
                sx={{
                  fontSize: '10px',
                  fontWeight: 600,
                  '&.MuiChip-root': { borderRadius: '3px' },
                  height: '25px',
                }}
                label="Enabled"
              />
            ) : (
              <Chip
                color={'error'}
                // variant="outlined"
                sx={{
                  fontSize: '10px',
                  fontWeight: 600,
                  '&.MuiChip-root': { borderRadius: '3px' },
                  height: '25px',
                }}
                label="Disabled"
              />
            )
          }
        />
        <RowContent
          noPx
          title="Platform"
          icon={
            <>
              {get(receivedLog, 'platform', '-') === 'zomato' && (
                <img
                  src={`/assets/images/zomato.png`}
                  style={{ width: '3rem', height: '1rem' }}
                  alt=""
                />
              )}
              {get(receivedLog, 'platform', '-') === 'swiggy' && (
                <img
                  src={`/assets/images/Swiggy.png`}
                  style={{ width: '3rem', height: '1rem' }}
                  alt=""
                />
              )}
            </>
          }
          value={get(receivedLog, 'platform', '-')}
        />
        <RowContent noPx title="Reason code" value={get(receivedLog, 'reason_code', '-')} />
        <RowContent
          noPx
          title="Status"
          icon={
            get(receivedLog, 'status', '-') ? (
              <Chip
                color={'success'}
                variant="outlined"
                sx={{
                  fontSize: '10px',
                  fontWeight: 600,
                  '&.MuiChip-root': { borderRadius: '15px' },
                  height: '25px',
                }}
                label="Success"
              />
            ) : (
              <Chip
                color={'error'}
                variant="outlined"
                sx={{
                  fontSize: '10px',
                  fontWeight: 600,
                  '&.MuiChip-root': { borderRadius: '15px' },
                  height: '25px',
                }}
                label="Error"
              />
            )
          }
        />
        <RowContent
          noPx
          title="Date"
          value={
            get(receivedLog, 'ts_utc', '-')
              ? dateWithTimeAndSecFormatAMPM(get(receivedLog, 'ts_utc', '-'))
              : '-'
          }
        />
      </Box>
    </Box>
  );
};

export default ToggleStore;
