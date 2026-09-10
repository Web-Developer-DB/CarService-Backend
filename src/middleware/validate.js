import { ApiError } from './errors.js';

const validate = (target, schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req[target], { abortEarly: false, stripUnknown: false, convert: true });
  if (error) return next(new ApiError(400, error.details.map(({ message }) => message).join('; '), 'VALIDATION_ERROR'));
  req[target] = value;
  return next();
};

export const validateBody = (schema) => validate('body', schema);
export const validateParams = (schema) => validate('params', schema);
export const validateQuery = (schema) => validate('query', schema);
