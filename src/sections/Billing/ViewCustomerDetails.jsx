import { Box, Typography, useTheme, Button, Stack } from '@mui/material';
import { get, isEmpty } from 'lodash';
import { hideScrollbar } from 'src/constants/AppConstants';
import RowContent from './RowContent';

export default function ViewCustomerDetails(props) {
  const { customerDetails, openCustomerModal } = props;
  const theme = useTheme();
  return (
    <>
      {isEmpty(customerDetails) ? (
        <Stack
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'colmn',
            alignItems: 'center',
          }}
        >
          <img
            src="/assets/background/Search.png"
            alt=""
            style={{
              height: 200,
              width: 200,
            }}
          />
          <Button onClick={openCustomerModal} variant="contained" sx={{ mt: 1 }}>
            Add Customer Details
          </Button>
        </Stack>
      ) : (
        <Box
          sx={{
            height: 'calc(100vh - 18.2rem)',
            overflowY: 'auto',
            ...hideScrollbar,
            overflowX: 'clip',
          }}
        >
          <Typography sx={{ fontSize: '20px' }}>Billing Address</Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 1.5,
              py: 2.5,
            }}
          >
            <RowContent title="Customer Name" value={get(customerDetails, 'name')} />
            <RowContent
              title="Customer Mobile Number"
              value={get(customerDetails, 'contactNumber', '-')}
            />
            <RowContent title="Customer Address" value={get(customerDetails, 'address', '-')} />
            <RowContent
              title="Alternate Contact Number"
              value={get(customerDetails, 'alternateNumber', '-')}
            />
            <RowContent title="GST Number" value={get(customerDetails, 'gstInfo.GSTNumber', '-')} />
          </Box>
        </Box>
      )}
    </>
  );
}
