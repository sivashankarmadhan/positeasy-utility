const transformCase = (string) => {
    return string.toLowerCase().replace(/^(.)(.*)$/, (match, firstLetter, restOfString) =>
      firstLetter.toUpperCase() + restOfString.toLowerCase()
    );
  };
  
  export default transformCase;