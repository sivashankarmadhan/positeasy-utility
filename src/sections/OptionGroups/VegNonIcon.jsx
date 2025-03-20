import React from 'react';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Stack } from '@mui/material';

export default function VegNonIcon({
  color,
  style = {},
  firstIconStyle = {},
  circleIconStyle = {},
}) {
  return (
    <div style={{ position: 'relative', left: 0, bottom: 20, ...style }}>
      <CropSquareIcon sx={{ position: 'absolute', fontSize: '35px', color, ...firstIconStyle }} />
      <FiberManualRecordIcon
        sx={{
          position: 'absolute',
          fontSize: '12px',
          left: 11.5,
          top: 11.5,
          color,
          ...circleIconStyle,
        }}
      />
    </div>
  );
}
