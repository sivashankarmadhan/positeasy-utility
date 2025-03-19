function localStorageSpace() {
  let totalSize = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    const urlSize = value.length;
    totalSize += urlSize;
  }

  // Convert totalSize from bytes to megabytes
  const totalSizeInMB = totalSize / (1024 * 1024);

  return { mb: totalSizeInMB };
}
