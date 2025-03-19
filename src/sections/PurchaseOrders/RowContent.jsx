import { Box, Chip, Stack, Tooltip } from '@mui/material';
import OverflowTruncate from 'src/components/OverflowTruncate';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';

const RowContent = ({ title, value, isChip, chipColor, isCopy }) => {
  return (
    <Stack
      sx={{ width: '100%', justifyContent: 'space-between' }}
      flexDirection="row"
      alignItems="center"
      px={2}
    >
      <Box sx={{ opacity: 0.5, fontSize: '14px', width: '55%' }}>{title}</Box>

      {!isChip ? (
        <Stack
          flexDirection="row"
          alignItems="center"
          gap={1}
          sx={{ fontSize: '14px', justifyContent: 'end' }}
          onClick={() => {
            if (isCopy && value) {
              navigator.clipboard.writeText(value);
              toast.success(SuccessConstants.COPY_CLIPBOARD);
            }
          }}
        >
          <OverflowTruncate name={value || '--'} />
          {isCopy && value && (
            <Tooltip title="Copy">
              <CopyAllIcon sx={{ fontSize: '20px' }} />
            </Tooltip>
          )}
        </Stack>
      ) : (
        <Chip
          size="small"
          color={chipColor}
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
  );
};

export default RowContent;
