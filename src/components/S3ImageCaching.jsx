import { Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
import { base64_images } from 'src/constants/ImageConstants';

const S3ImageCaching = ({ src, alt, style }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  const imgStyle = {
    ...style,
    display: isLoading ? 'none' : 'block',
  };
  useEffect(() => {
    if (!src) setError(true);
  }, [src, isLoading]);
  //Function to download the image from the given URL
  // const downloadImage = async (url) => {
  //   try {
  //     const response = await fetch(url, { method: 'GET', mode: 'cors' });
  //     const blob = await response.blob();
  //     return URL.createObjectURL(blob);
  //   } catch (error) {
  //     setError(true);
  //     console.error(`Failed to download image: ${url}`, error);
  //     return null; // Return null on failure to indicate the error
  //   }
  // };

  // // Function to store the image in IndexedDB
  // const storeImageInIndexedDB = async (key, image) => {
  //   const db = await openIndexedDB();
  //   const transaction = db.transaction('images', 'readwrite');
  //   const store = transaction.objectStore('images');
  //   store.put(image, key);
  // };

  // // Function to retrieve the image from IndexedDB
  // const getImageFromIndexedDB = async (key) => {
  //   const db = await openIndexedDB();
  //   const transaction = db.transaction('images', 'readonly');
  //   const store = transaction.objectStore('images');

  //   return new Promise((resolve, reject) => {
  //     const request = store.get(key);

  //     request.onsuccess = (event) => {
  //       const imageBlob = event.target.result;
  //       resolve(imageBlob);
  //     };

  //     request.onerror = (event) => {
  //       console.error('Error fetching image from IndexedDB:', event.target.error);
  //       reject(event.target.error);
  //     };
  //   });
  // };

  // // Function to open IndexedDB database
  // const openIndexedDB = () => {
  //   return new Promise((resolve, reject) => {
  //     const request = indexedDB.open('imageDB', 1);

  //     request.onerror = (event) => {
  //       console.error('Error opening IndexedDB:', event.target.error);
  //       reject(event.target.error);
  //     };

  //     request.onsuccess = (event) => {
  //       const db = event.target.result;
  //       resolve(db);
  //     };

  //     request.onupgradeneeded = (event) => {
  //       const db = event.target.result;
  //       db.createObjectStore('images');
  //     };
  //   });
  // };

  // useEffect(() => {
  //   const getImage = async () => {
  //     try {
  //       const image = await getImageFromIndexedDB(src);
  //       if (image && typeof image !== 'object') {
  //         setImageUrl(image);
  //       } else {
  //         const downloadedImage = await downloadImage(src);
  //         if (downloadedImage) {
  //           await storeImageInIndexedDB(src, downloadedImage);
  //           setImageUrl(downloadedImage);
  //         } else {
  //           setError(true);
  //         }
  //       }
  //     } catch (error) {
  //       setError(true);
  //       console.error('Error fetching image:', error);
  //     }
  //   };

  //   getImage();
  // }, [src]);
  if (error) {
    return (
      <>
        {isLoading && <Skeleton animation="wave" variant="rectangular" sx={style} width={'100%'} />}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            background: '#F1F1EF',
            borderRadius:4,
          }}
        >
          <img
            draggable={false}
            onLoad={handleImageLoad}
            src={base64_images.Custom_No_Image}
            alt={alt}
            style={imgStyle}
          />
        </div>
      </>
      
    );
  }

  return (
    <>
      {isLoading && <Skeleton animation="wave" variant="rectangular" sx={style} width={'100%'} />}
      <img draggable={false} onLoad={handleImageLoad} src={src} alt={alt} style={imgStyle} />
    </>
  );
};
export default S3ImageCaching;


{/* <>
        {isLoading && <Skeleton animation="wave" variant="rectangular" sx={style} width={'100%'} />}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            background: '#A6B1BB',
            borderRadius:4,
          }}
        >
          <img
            draggable={false}
            onLoad={handleImageLoad}
            src={base64_images.Custom_No_Image}
            alt={alt}
            style={imgStyle}
          />
        </div>
      </> */}