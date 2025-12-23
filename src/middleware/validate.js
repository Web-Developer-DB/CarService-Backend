export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(422).json({
      message: 'Ungültige Eingaben.',
      details: error.details.map((detail) => detail.message)
    });
  }

  req.body = value;
  next();
};

export const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(422).json({
      message: 'Ungültige Eingaben.',
      details: error.details.map((detail) => detail.message)
    });
  }

  req.params = value;
  next();
};
