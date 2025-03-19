export function ConsoleLog(data, backgroundColor = 'red', textColor = 'white') {
  const stringType = typeof data === 'string';
  const objectType = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  let formattedData = data;

  if (isArray || objectType) {
    formattedData = JSON.stringify(data, null, 2);
  } else if (stringType) {
    formattedData = `"${data}"`;
  }

  const logStyle = `background-color: ${backgroundColor}; color: ${textColor}; padding: 2px 4px; border-radius: 4px;`;

  console.log(`%c${formattedData}`, logStyle);
}
