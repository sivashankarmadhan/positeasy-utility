export const isValidPassword = (password) => {
  const passwordRegex = /^\d{4,}$/;
  return passwordRegex.test(password);
};
