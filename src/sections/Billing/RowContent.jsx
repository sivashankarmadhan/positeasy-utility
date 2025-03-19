import { Box, Chip, Stack } from '@mui/material';
import Label from 'src/components/label';
import OverflowTruncate from 'src/components/OverflowTruncate';
import { ESTIMATE_STATUS } from 'src/constants/AppConstants';

const statusColor = (status) => {
  if (status === ESTIMATE_STATUS.COMPLETED) {
    return 'success';
  } else if (status === ESTIMATE_STATUS.FULL_PAYMENT) {
    return 'success';
  } else if (status === ESTIMATE_STATUS.PENDING) {
    return 'warning';
  } else if (status === ESTIMATE_STATUS.PARTIAL) {
    return 'warning';
  } else if (status === ESTIMATE_STATUS.CANCEL) {
    return 'error';
  } else if (status === ESTIMATE_STATUS.REFUND_INITIATED) {
    return 'success';
  } else if (status === ESTIMATE_STATUS.SUCCESS) {
    return 'success';
  } else return 'info';
};

const RowContent = ({ title, value, isChip, isLabel = false, icon }) => {
  return (
    <Stack
      sx={{ width: '100%', justifyContent: 'space-between' }}
      flexDirection="row"
      alignItems="center"
      px={2}
    >
      <Box sx={{ opacity: 0.5, fontSize: '14px', width: '55%' }}>{title}</Box>

      <Stack flexDirection="row" alignItems="center" gap={1.5}>
        {icon}

        {!isChip ? (
          <Box sx={{ fontSize: '14px', justifyContent: 'end', fontWeight: 'bold' }}>
            <OverflowTruncate name={value || '--'} />
          </Box>
        ) : isLabel ? (
          <Label
            capitalize={false}
            variant="soft"
            color={statusColor(value)}
            sx={{ fontSize: '13px' }}
          >
            {`${value || 'Status not found'}`}
          </Label>
        ) : (
          <Chip
            size="small"
            color={statusColor(value)}
            sx={{
              ml: 0.5,
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '4px' },
            }}
            label={`${value || 'Status not found'}`}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default RowContent;
