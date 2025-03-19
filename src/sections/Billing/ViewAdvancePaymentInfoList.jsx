import { Box, Card, Stack, Tooltip, useTheme } from '@mui/material';
import { capitalCaseTransform } from 'change-case';
import { get, map } from 'lodash';
import { hideScrollbar } from 'src/constants/AppConstants';
import { fCurrency } from 'src/utils/formatNumber';
import { dateFormat, formatTime } from 'src/utils/formatTime';
import { Typography } from '@mui/material';
import CreditCardOffIcon from '@mui/icons-material/CreditCardOff';
import RowContent from './RowContent';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useState } from 'react';
import ViewRefundDetailsDialog from './ViewRefundDetailsDialog';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';

export default function ViewAdvancePaymentInfoList(props) {
  const { paymentsInfo, isPaymentRefundDone } = props;

  const [isOpenViewRefundDetailsDialog, setIsOpenViewRefundDetailsDialog] = useState(false);

  console.log('paymentsInfo', paymentsInfo);

  const theme = useTheme();
  return (
    <Box
      sx={{
        height: 'calc(100vh - 18.2rem)',
        overflowY: 'auto',
        ...hideScrollbar,
        overflowX: 'clip',
      }}
    >
      {paymentsInfo ? (
        <Stack gap={2}>
          {map(paymentsInfo, (_item) => {
            return (
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  px: 1.5,
                  py: 2.5,
                  my: 1,
                  mx: 2,
                }}
              >
                <RowContent title="Date" value={dateFormat(get(_item, 'createdAt', ''))} />
                <RowContent title="Time" value={formatTime(get(_item, 'createdAt', ''))} />

                <RowContent
                  title="Payment ID"
                  value={get(_item, 'paymentId', '')}
                  icon={
                    <Stack
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        navigator.clipboard.writeText(get(_item, 'paymentId', ''));
                        toast.success(SuccessConstants.COPY_CLIPBOARD);
                      }}
                    >
                      <Tooltip title="Copy">
                        <CopyAllIcon sx={{ fontSize: '20px' }} />
                      </Tooltip>
                    </Stack>
                  }
                />

                <RowContent title="Gateway Pay ID" value={get(_item, 'gatewayPayId', '')} />
                <RowContent title="Gateway Source" value={get(_item, 'gatewaySource', '')} />
                <RowContent title="Payment Mode" value={get(_item, 'mode', '')} />
                <RowContent
                  title="Paid Amount"
                  value={fCurrency(get(_item, 'paidAmount', '') / 100)}
                />

                <RowContent
                  title="Payment Status"
                  value={capitalCaseTransform(get(_item, 'paymentStatus', '') || '')}
                  isChip
                  isLabel={true}
                  icon={
                    isPaymentRefundDone ? (
                      <Stack
                        sx={{ cursor: 'pointer' }}
                        onClick={() => {
                          setIsOpenViewRefundDetailsDialog(true);
                        }}
                      >
                        <AccountBalanceWalletIcon />
                      </Stack>
                    ) : null
                  }
                />

                <RowContent
                  title="Reason"
                  value={capitalCaseTransform(get(_item, 'reason', '') || '')}
                />
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Stack
          style={{
            width: '100%',
            height: 'calc(100vh-100px)',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '10%',
          }}
        >
          <CreditCardOffIcon sx={{ fontSize: '5rem' }} />
          <Typography variant="h6" mt={1}>
            Your current order is empty
          </Typography>
        </Stack>
      )}

      <ViewRefundDetailsDialog
        isOpen={isOpenViewRefundDetailsDialog}
        onClose={() => {
          setIsOpenViewRefundDetailsDialog(false);
        }}
        paymentId={paymentsInfo?.[0]?.parentPaymentId}
      />
    </Box>
  );
}
