const isProduction = process.env.NODE_ENV === 'production';

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 404 ? 'Die angeforderte Ressource wurde nicht gefunden.' : 'Es ist ein Serverfehler aufgetreten.';
  const response = { message };

  if (!isProduction && err.message) {
    response.details = err.message;
  }

  res.status(status).json(response);
};
