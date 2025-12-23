import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let app;
let mongoServer;

describe('CarService Backend', () => {
  let userToken = '';
  let userId = '';
  let otherUserToken = '';
  let carId = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_ISSUER = 'carservice-test';
    process.env.JWT_AUDIENCE = 'carservice-test';

    if (process.env.MONGO_TEST_URL) {
      await mongoose.connect(process.env.MONGO_TEST_URL);
    } else {
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }

    ({ default: app } = await import('../../app.js'));
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('GET / liefert die README gerendert', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Backend-Dokumentation');
  });

  it('POST /api/users/register validiert Eingaben', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({ password: 'Test1234!', superPassword: 'SuperSecret123' })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(422);
  });

  it('POST /api/users/register erstellt Benutzer', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        email: 'testuser@example.com',
        password: 'Test1234!',
        superPassword: 'SuperSecret123'
      })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(201);
    expect(response.body.userId).toBeDefined();
  });

  it('POST /api/users/login meldet Benutzer an', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: 'testuser@example.com', password: 'Test1234!' })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    userToken = response.body.token;
    userId = response.body.userId;
  });

  it('GET /api/users/:userId liefert Benutzerdaten', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.user.email).toBe('testuser@example.com');
    expect(response.body.user.password).toBeUndefined();
  });

  it('POST /api/users/register erstellt zweiten Benutzer', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        email: 'other@example.com',
        password: 'Test1234!',
        superPassword: 'SuperSecret123'
      })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(201);
  });

  it('POST /api/users/login meldet zweiten Benutzer an', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: 'other@example.com', password: 'Test1234!' })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    otherUserToken = response.body.token;
  });

  it('GET /api/users/:userId verhindert Fremdzugriff', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(response.statusCode).toBe(403);
  });

  it('PUT /api/users/update-user aktualisiert Passwort', async () => {
    const response = await request(app)
      .put('/api/users/update-user')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        email: 'testuser@example.com',
        superPassword: 'SuperSecret123',
        newPassword: 'NewPass123!'
      });

    expect(response.statusCode).toBe(200);
  });

  it('POST /api/cars/addCar erstellt Fahrzeug', async () => {
    const response = await request(app)
      .post('/api/cars/addCar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fahrzeugart: 'PKW',
        kennzeichen: 'B-XY123',
        marke: 'Volkswagen',
        modell: 'Golf',
        baujahr: 2017,
        kraftstoff: 'Diesel',
        schadstoffklasse: 'Euro 6',
        leistungKW: 110,
        leistungPS: 150,
        kilometerstand: 85000,
        'nächsteTüvUntersuchung': '2023-10-30',
        'nächsteoelwechsel': '2023-09-20',
        'nächsteoelwechselKm': 95000
      })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(201);
    carId = response.body.carId;
  });

  it('POST /api/cars/:carId/kilometerstand fügt Historie hinzu', async () => {
    const response = await request(app)
      .post(`/api/cars/${carId}/kilometerstand`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ kilometerstand: 87000 })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(201);
  });

  it('POST /api/cars/:carId/tuev fügt TÜV-Eintrag hinzu', async () => {
    const response = await request(app)
      .post(`/api/cars/${carId}/tuev`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        tuev: {
          datum: '2025-07-23',
          bemerkung: 'ohne Mängel bestanden'
        }
      })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(201);
  });

  it('POST /api/cars/:carId/oelwechsel fügt Ölwechsel hinzu', async () => {
    const response = await request(app)
      .post(`/api/cars/${carId}/oelwechsel`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        oelwechsel: {
          datum: '2023-09-20',
          kilometerstand: 95000,
          naechsterOelwechselKm: 105000
        }
      })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(201);
  });

  it('POST /api/cars/:carId/service fügt Service hinzu', async () => {
    const response = await request(app)
      .post(`/api/cars/${carId}/service`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        service: {
          datum: '2023-10-01',
          beschreibung: 'Jährliche Inspektion inklusive Ölwechsel'
        }
      })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(201);
  });

  it('GET /api/cars/:carId liefert Fahrzeugdetails', async () => {
    const response = await request(app)
      .get(`/api/cars/${carId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.kennzeichen).toBe('B-XY123');
  });

  it('GET /api/cars/user/:userId liefert alle Fahrzeuge', async () => {
    const response = await request(app)
      .get(`/api/cars/user/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.cars)).toBe(true);
    expect(response.body.cars.length).toBeGreaterThan(0);
  });

  it('DELETE /api/cars/:carId löscht Fahrzeug', async () => {
    const response = await request(app)
      .delete(`/api/cars/${carId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
  });

  it('DELETE /api/users/delete-user löscht Benutzer', async () => {
    const response = await request(app)
      .delete('/api/users/delete-user')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ email: 'testuser@example.com', superPassword: 'SuperSecret123' })
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
  });
});
