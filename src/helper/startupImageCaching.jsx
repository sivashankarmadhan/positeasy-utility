import { isEmpty } from 'lodash';

async function startupImageCaching(productList) {
  if (isEmpty(productList)) return;

  await openIndexedDB(); // Open the IndexedDB before starting caching

  const promises = [];

  for (const e of productList) {
    try {
      const url = e.productImage;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${url}`);
      }

      const blob = await response.blob();

      const db = await openIndexedDB();
      const transaction = db.transaction('images', 'readwrite');
      const store = transaction.objectStore('images');
      await store.put(blob, url);

      URL.revokeObjectURL(URL.createObjectURL(blob)); // Clean up the created object URL

      promises.push(Promise.resolve()); // Add a resolved promise to the promises array for tracking
    } catch (error) {
      console.log('Unable to download', error);
      promises.push(Promise.reject(error)); // Add a rejected promise with the error for tracking
    }
  }

  try {
    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Error during image caching:', error);
  }
}

const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('imageDB', 1);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('images');
    };
  });
};

export default startupImageCaching;
