import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireCsrf } from '../middleware/csrf.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import * as auth from '../controllers/authController.js';
import * as cars from '../controllers/carControllerV2.js';
import * as users from '../controllers/userControllerV2.js';
import { schemas } from '../validation/v2.js';

export const createApiRouter = ({ config, mailer, limits }) => {
  const router = express.Router();
  const requireAuth = authenticate(config);
  const csrf = requireCsrf(config);
  router.post('/auth/register', limits.auth, validateBody(schemas.register), auth.register({ config, mailer }));
  router.post('/auth/verify-email', limits.auth, validateBody(schemas.actionToken), auth.verifyEmail({ config }));
  router.post('/auth/login', limits.auth, validateBody(schemas.login), auth.login({ config }));
  router.post('/auth/refresh', auth.refresh({ config }));
  router.post('/auth/logout', auth.logout({ config }));
  router.post(
    '/auth/password-reset/request',
    limits.reset,
    validateBody(schemas.emailRequest),
    auth.requestPasswordReset({ config, mailer })
  );
  router.post(
    '/auth/password-reset/confirm',
    limits.reset,
    validateBody(schemas.passwordReset),
    auth.confirmPasswordReset({ config })
  );

  router.get('/users/me', requireAuth, users.getMe);
  router.put('/users/me/password', requireAuth, csrf, validateBody(schemas.changePassword), users.changePassword);
  router.delete('/users/me', requireAuth, csrf, validateBody(schemas.deleteAccount), users.deleteMe);

  router.post('/cars', requireAuth, csrf, validateBody(schemas.car), cars.createCar);
  router.get('/cars', requireAuth, validateQuery(schemas.list), cars.listCars);
  router.get('/cars/:carId', requireAuth, validateParams(schemas.carId), cars.getCar);
  router.patch(
    '/cars/:carId',
    requireAuth,
    csrf,
    validateParams(schemas.carId),
    validateBody(schemas.carPatch),
    cars.updateCar
  );
  router.delete('/cars/:carId', requireAuth, csrf, validateParams(schemas.carId), cars.deleteCar);
  router.post(
    '/cars/:carId/events',
    requireAuth,
    csrf,
    validateParams(schemas.carId),
    validateBody(schemas.event),
    cars.addEvent
  );
  router.get(
    '/cars/:carId/events',
    requireAuth,
    validateParams(schemas.carId),
    validateQuery(schemas.eventList),
    cars.listEvents
  );
  return router;
};
