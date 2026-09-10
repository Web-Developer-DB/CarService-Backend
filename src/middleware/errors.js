export class ApiError extends Error {
  constructor(status, message, code = 'REQUEST_FAILED') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const notFound = (_req, _res, next) => next(new ApiError(404, 'Resource not found', 'NOT_FOUND'));

export const errorHandler = (error, req, res, _next) => {
  const duplicateKey = error.code === 11000;
  const status = error.status || (duplicateKey ? 409 : error.type === 'entity.too.large' ? 413 : 500);
  const code = duplicateKey ? 'CONFLICT' : error.code || (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED');
  if (status >= 500) req.log?.error({ err: error, requestId: req.id }, 'Unhandled request error');
  else req.log?.warn({ code, requestId: req.id }, 'Request rejected');
  res.status(status).json({
    error: {
      code,
      message: duplicateKey ? 'Resource already exists' : status >= 500 ? 'An unexpected error occurred' : error.message
    },
    requestId: req.id
  });
};
