import { useEffect, useState } from 'react';

const ImageComponent = ({ src, ...rest }) => {
  const [cachedSrc, setCachedSrc] = useState(null);

  useEffect(() => {
    // Check if the image is already cached in the browser
    const cachedImage = localStorage.getItem(src);
    if (cachedImage) {
      setCachedSrc(cachedImage);
    } else {
      // If not cached, fetch the image and cache it
      fetch(src)
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setCachedSrc(url);
          localStorage.setItem(src, url);
        })
        .catch((error) => {
          console.error('Error fetching image:', error);
        });
    }
  }, [src]);

  return <img src={cachedSrc || src} alt="Image" {...rest} />;
};
export default ImageComponent;
