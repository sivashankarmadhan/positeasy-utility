export default {
  serialize(input) {
    return JSON.stringify({
      name: input.name || '',
      data: input.data || {},
      type: input.type || 'async',
    });
  },
};
