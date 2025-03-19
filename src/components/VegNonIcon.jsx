import React from 'react';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function VegNonIcon({
  text,
  style = {},
  firstIconStyle = {},
  circleIconStyle = {},
}) {
  const vegColor = text ? 'success' : 'error';
  return (
    <div style={{ position: 'absolute', left: 0, bottom: 170, ...style }}>
      <CropSquareIcon
        color={vegColor}
        sx={{ position: 'absolute', fontSize: '40px', color: vegColor, ...firstIconStyle }}
      />
      <FiberManualRecordIcon
        color={vegColor}
        sx={{ position: 'absolute', fontSize: '15px', left: 12, top: 12, ...circleIconStyle }}
      />
    </div>
  );
}
