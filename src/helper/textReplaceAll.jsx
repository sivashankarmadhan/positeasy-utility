export const textReplaceAll = (text, actual, replaceContent) => {
  if (text) return text?.replaceAll(actual, replaceContent);
  else return text;
};
