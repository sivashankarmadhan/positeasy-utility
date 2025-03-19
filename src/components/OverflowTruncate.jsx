import React, { useRef, useEffect, useState } from 'react';
import get from 'lodash/get';
import { Tooltip } from '@mui/material';

function OverflowTruncate({ name }) {
  // Create Ref
  const textElementRef = useRef();

  // Define state and function to update the value
  const [hoverStatus, setHover] = useState(false);

  const compareSize = () => {
    const compare =
      get(textElementRef, 'current.scrollWidth') > get(textElementRef, 'current.clientWidth');
    setHover(compare);
  };

  // compare once and add resize listener on "componentDidMount"
  useEffect(() => {
    compareSize();
    window.addEventListener('resize', compareSize);
  }, []);

  // remove resize listener again on "componentWillUnmount"
  useEffect(
    () => () => {
      window.removeEventListener('resize', compareSize);
    },
    []
  );

  return (
    <Tooltip title={name} interactive disableHoverListener={!hoverStatus}>
      <div
        ref={textElementRef}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </div>
    </Tooltip>
  );
}

export default OverflowTruncate;
