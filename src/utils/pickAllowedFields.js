const hasOwn = Object.prototype.hasOwnProperty;

const pickAllowedFields = (source, allowed) => {
  const result = {};

  for (const key of allowed) {
    if (hasOwn.call(source, key)) {
      result[key] = source[key];
    }
  }

  return result;
};

export default pickAllowedFields;
