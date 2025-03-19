export default function trimDescription(filename, startLength) {
  if (filename?.length <= startLength + 0) return filename;
  const start = filename?.slice(0, startLength);
  const middle = '...';
  // const end = filename.substr(filename.length - endLength);
  return `${start}${middle}`;
}
