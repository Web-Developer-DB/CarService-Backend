import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app.js';
import Car from '../src/models/Car.js';
import VehicleEvent from '../src/models/VehicleEvent.js';

let replset;
let app;
const inbox = [];
const config = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  corsOrigins: ['https://app.example.test'],
  trustProxy: false,
  bodyLimit: '64kb',
  ACCESS_TOKEN_SECRET: 'a-very-long-test-secret-with-at-least-32-bytes',
  JWT_ISSUER: 'https://api.example.test',
  JWT_AUDIENCE: 'car-service-web',
  APP_ORIGIN: 'https://app.example.test',
  SMTP_FROM: 'no-reply@example.test',
  COOKIE_SECURE: true,
  accessTokenTtl: '15m',
  refreshTokenTtlDays: 14,
  actionTokenTtlMinutes: 15,
  isDatabaseReady: () => mongoose.connection.readyState === 1
};
const mailer = {
  sendMail: async (message) => {
    inbox.push(message);
  }
};
const origin = 'https://app.example.test';
const extractToken = (message) => new URL(message.text.match(/https:\/\/[^\s]+/)[0]).searchParams.get('token');

before(async () => {
  replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replset.getUri());
  app = createApp({ config, mailer });
});
after(async () => {
  await mongoose.disconnect();
  await replset.stop();
});

const registerAndVerify = async (email) => {
  const password = 'StrongPassword123!';
  await request(app).post('/api/v2/auth/register').set('Origin', origin).send({ email, password }).expect(202);
  await request(app)
    .post('/api/v2/auth/verify-email')
    .set('Origin', origin)
    .send({ token: extractToken(inbox.at(-1)) })
    .expect(204);
  const login = await request(app)
    .post('/api/v2/auth/login')
    .set('Origin', origin)
    .send({ email, password })
    .expect(200);
  return {
    password,
    accessToken: login.body.accessToken,
    csrfToken: login.body.csrfToken,
    cookie: login.headers['set-cookie'][0],
    id: login.body.user.id
  };
};

test('v2 prevents cross-account access and never exposes password hashes', async () => {
  const alice = await registerAndVerify('alice@example.com');
  const bob = await registerAndVerify('bob@example.com');
  const carResponse = await request(app)
    .post('/api/v2/cars')
    .set('Origin', origin)
    .set('Authorization', `Bearer ${alice.accessToken}`)
    .set('X-CSRF-Token', alice.csrfToken)
    .send({ licensePlate: 'B AB 123', make: 'Test', odometerKm: 20 })
    .expect(201);
  const carId = carResponse.body.car.id;

  await request(app)
    .post('/api/v2/cars')
    .set('Origin', origin)
    .set('Authorization', `Bearer ${alice.accessToken}`)
    .send({ licensePlate: 'NO CSRF' })
    .expect(403);

  const ownProfile = await request(app)
    .get('/api/v2/users/me')
    .set('Authorization', `Bearer ${alice.accessToken}`)
    .expect(200);
  assert.equal(ownProfile.body.user.passwordHash, undefined);
  assert.equal(ownProfile.body.user.superPassword, undefined);
  await request(app).get(`/api/v2/cars/${carId}`).set('Authorization', `Bearer ${bob.accessToken}`).expect(404);
  await request(app)
    .delete(`/api/v2/cars/${carId}`)
    .set('Origin', origin)
    .set('Authorization', `Bearer ${bob.accessToken}`)
    .set('X-CSRF-Token', bob.csrfToken)
    .send({})
    .expect(404);
  await request(app)
    .post(`/api/v2/cars/${carId}/events`)
    .set('Origin', origin)
    .set('Authorization', `Bearer ${alice.accessToken}`)
    .set('X-CSRF-Token', alice.csrfToken)
    .send({ type: 'mileage', odometerKm: 25 })
    .expect(201);
  await request(app)
    .post(`/api/v2/cars/${carId}/events`)
    .set('Origin', origin)
    .set('Authorization', `Bearer ${alice.accessToken}`)
    .set('X-CSRF-Token', alice.csrfToken)
    .send({ type: 'mileage', odometerKm: 10 })
    .expect(409);
  await request(app).get(`/api/cars/${carId}`).set('Authorization', `Bearer ${alice.accessToken}`).expect(404);
});

test('schema validation blocks NoSQL operators and client-owned user IDs', async () => {
  await request(app)
    .post('/api/v2/auth/register')
    .set('Origin', origin)
    .send({ email: { $ne: '' }, password: 'StrongPassword123!' })
    .expect(400);
  const user = await registerAndVerify('validation@example.com');
  await request(app)
    .post('/api/v2/cars')
    .set('Origin', origin)
    .set('Authorization', `Bearer ${user.accessToken}`)
    .set('X-CSRF-Token', user.csrfToken)
    .send({ licensePlate: 'V AL 123', userId: '000000000000000000000000' })
    .expect(400);
});

test('refresh rotation rejects missing CSRF and rotates a valid session', async () => {
  const user = await registerAndVerify('refresh@example.com');
  await request(app).post('/api/v2/auth/refresh').set('Cookie', user.cookie).expect(403);
  const refreshed = await request(app)
    .post('/api/v2/auth/refresh')
    .set('Origin', origin)
    .set('Cookie', user.cookie)
    .set('X-CSRF-Token', user.csrfToken)
    .expect(200);
  assert.notEqual(refreshed.body.csrfToken, user.csrfToken);
  await request(app)
    .post('/api/v2/auth/refresh')
    .set('Origin', origin)
    .set('Cookie', user.cookie)
    .set('X-CSRF-Token', user.csrfToken)
    .expect(401);
});

test('password reset is one-time and revokes the previous password', async () => {
  const email = 'reset@example.com';
  const user = await registerAndVerify(email);
  await request(app).post('/api/v2/auth/password-reset/request').set('Origin', origin).send({ email }).expect(202);
  const token = extractToken(inbox.at(-1));
  await request(app)
    .post('/api/v2/auth/password-reset/confirm')
    .set('Origin', origin)
    .send({ token, newPassword: 'ChangedPassword123!' })
    .expect(204);
  await request(app)
    .post('/api/v2/auth/login')
    .set('Origin', origin)
    .send({ email, password: user.password })
    .expect(401);
  await request(app)
    .post('/api/v2/auth/password-reset/confirm')
    .set('Origin', origin)
    .send({ token, newPassword: 'AnotherPassword123!' })
    .expect(400);
});

test('account deletion cascades to cars and vehicle events', async () => {
  const user = await registerAndVerify('delete@example.com');
  const car = await request(app)
    .post('/api/v2/cars')
    .set('Origin', origin)
    .set('Authorization', `Bearer ${user.accessToken}`)
    .set('X-CSRF-Token', user.csrfToken)
    .send({ licensePlate: 'D EL 123' })
    .expect(201);
  await request(app)
    .post(`/api/v2/cars/${car.body.car.id}/events`)
    .set('Origin', origin)
    .set('Authorization', `Bearer ${user.accessToken}`)
    .set('X-CSRF-Token', user.csrfToken)
    .send({ type: 'service', occurredAt: '2026-01-01T00:00:00.000Z', description: 'Inspection' })
    .expect(201);
  await request(app)
    .delete('/api/v2/users/me')
    .set('Origin', origin)
    .set('Authorization', `Bearer ${user.accessToken}`)
    .set('X-CSRF-Token', user.csrfToken)
    .send({ currentPassword: user.password })
    .expect(204);
  assert.equal(await Car.countDocuments({ userId: user.id }), 0);
  assert.equal(await VehicleEvent.countDocuments({ userId: user.id }), 0);
});
