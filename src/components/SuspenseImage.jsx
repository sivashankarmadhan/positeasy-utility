import { Skeleton } from '@mui/material';
import { useState } from 'react';

const SuspenseImg = ({ src, ...rest }) => {
  const [isLoading, setIsLoading] = useState(true);
  // const newURL = imgCache.read(src);
  // console.log(newURL);
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <Skeleton animation="pulse" variant="rectangular" width={'100%'} height={240} />
      )}
      <img
        alt=""
        src={src}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
        {...rest}
      />
    </>
  );
};

export default SuspenseImg;
