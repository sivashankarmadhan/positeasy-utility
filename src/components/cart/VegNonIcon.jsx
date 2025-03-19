import React from 'react';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function VegNonIcon({ text, styles={},squareStyles={},dotStyles={}}) {
  const vegColor = text ? 'success' : 'error';
  return (
    <div
      style={{
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.8)',
        height: 25,
        width: 25,
        borderRadius: 5,
        right: 17,
        top: 18,
        ...styles
      }}
    >
      <CropSquareIcon
        color={vegColor}
        sx={{ position: 'absolute', fontSize: '25px', color: vegColor,...squareStyles }}
      />
      <FiberManualRecordIcon
        color={vegColor}
        sx={{ position: 'absolute', fontSize: '10px', left: 7.5, top: 7.5,...dotStyles }}
      />
    </div>
  );
}
