// tests/app.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../models/User.js';

const mongoUrl = process.env.MONGO_TEST_URL || process.env.MONGO_URL;

describe('Gesamte App-Tests mit Jest & Supertest', () => {
  let userToken = '';
  let userId = '';
  let carId = '';

  beforeAll(async () => {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET /', () => {
    it('sollte die Begrüßungsnachricht zurückgeben', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('Backend-API läuft!');
    });
  });

  describe('Benutzer-Endpunkte', () => {
    const userData = {
      email: 'testuser@example.com',
      password: 'Test1234!',
      superPassword: 'SuperSecret'
    };

    it('POST /api/users/register - sollte einen neuen Benutzer registrieren', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('Benutzer erfolgreich registriert');
    });

    it('POST /api/users/login - sollte den Benutzer einloggen und ein JWT zurückgeben', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: userData.email, password: userData.password })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeDefined();
      userToken = response.body.token;

      const decoded = jwt.decode(userToken);
      userId = decoded.userId || '';
      if (!userId) {
        const foundUser = await User.findOne({ email: userData.email });
        userId = foundUser._id.toString();
      }
    });

    it('GET /api/users/:userId - sollte Benutzerdaten zurückgeben', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe(userData.email);
    });

    it('PUT /api/users/update-user - sollte das Benutzerpasswort aktualisieren', async () => {
      const response = await request(app)
        .put('/api/users/update-user')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: userData.email,
          superPassword: userData.superPassword,
          newPassword: 'NewPass123!'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Benutzerdaten erfolgreich aktualisiert');
    });
  });

  describe('Fahrzeug-Endpunkte', () => {
    const carData = {
      userId: '',
      fahrzeugart: "PKW",
      kennzeichen: "B-XY123",
      marke: "Volkswagen",
      modell: "Golf",
      baujahr: 2017,
      kraftstoff: "Diesel",
      schadstoffklasse: "Euro 6",
      leistungKW: 110,
      leistungPS: 150,
      kilometerstand: 85000,
      nächsteTüvUntersuchung: "2023-10-30",
      nächsteoelwechsel: "2023-09-20",
      nächsteoelwechselKm: 95000,
      kilometerstandHistory: [],
      tuevHistory: [],
      oelwechselHistory: [],
      serviceHistory: []
    };

    it('POST /api/cars/addCar - sollte ein neues Fahrzeug registrieren', async () => {
      carData.userId = userId;
      const response = await request(app)
        .post('/api/cars/addCar')
        .set('Authorization', `Bearer ${userToken}`)
        .send(carData)
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('Fahrzeug erfolgreich registriert');
      carId = response.body.carId;
    });

    it('POST /api/cars/:carId/kilometerstand - sollte einen neuen Kilometerstand hinzufügen', async () => {
      const response = await request(app)
        .post(`/api/cars/${carId}/kilometerstand`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ kilometerstand: 87000 })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Kilometerstand aktualisiert');
    });

    it('POST /api/cars/:carId/tuev - sollte einen TÜV-Eintrag hinzufügen', async () => {
      const response = await request(app)
        .post(`/api/cars/${carId}/tuev`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          tuev: {
            datum: "2025-07-23",
            bemerkung: "ohne Mängel bestanden"
          }
        })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('TÜV-Eintrag hinzugefügt');
    });

    it('POST /api/cars/:carId/oelwechsel - sollte einen Ölwechsel-Eintrag hinzufügen', async () => {
      const response = await request(app)
        .post(`/api/cars/${carId}/oelwechsel`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          oelwechsel: {
            datum: "2023-09-20",
            kilometerstand: 95000,
            naechsterOelwechselKm: 105000
          }
        })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Ölwechsel-Eintrag hinzugefügt');
    });

    it('POST /api/cars/:carId/service - sollte einen Service-Eintrag hinzufügen', async () => {
      const response = await request(app)
        .post(`/api/cars/${carId}/service`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          service: {
            datum: "2023-10-01",
            beschreibung: "Jährliche Inspektion inklusive Ölwechsel"
          }
        })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Service-Eintrag hinzugefügt');
    });

    it('GET /api/cars/:carId - sollte Fahrzeugdetails abrufen', async () => {
      const response = await request(app)
        .get(`/api/cars/${carId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.kennzeichen).toBe(carData.kennzeichen);
    });

    it('GET /api/cars/user/:userId - sollte alle Fahrzeuge des Benutzers abrufen', async () => {
      const response = await request(app)
        .get(`/api/cars/user/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('DELETE /api/cars/:carId - sollte das Fahrzeug samt History löschen', async () => {
      const response = await request(app)
        .delete(`/api/cars/${carId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Fahrzeug erfolgreich gelöscht');
    });
  });

  describe('Benutzer löschen', () => {
    it('DELETE /api/users/delete-user - sollte den Benutzer löschen', async () => {
      const response = await request(app)
        .delete('/api/users/delete-user')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'testuser@example.com', superPassword: 'SuperSecret' })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Benutzer erfolgreich gelöscht');
    });
  });
});
