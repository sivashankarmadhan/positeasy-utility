const ObjectToQueryParams = (obj) => {
  const query = '?' + new URLSearchParams(obj).toString();
  return query;
};

export default ObjectToQueryParams;
