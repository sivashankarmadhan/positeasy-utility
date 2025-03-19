const terminalQuery = (terminalId) => {
  var query = '';
  if (terminalId !== 'all' && terminalId) {
    query = `&terminalId=${terminalId}`;
  }
  return query;
};

export default terminalQuery;
