// Importieren der benötigten Module
import test from 'ava';
import request from 'supertest';
import app from '../app.js'; 

let token;
let userId;
let carId;

test.before(async t => {
  const registerResponse = await request(app)
    .post('/api/users/register')
    .send({
      email: 'test@example.com',
      password: 'password123',
      superPassword: 'superPassword123'
    });
  userId = registerResponse.body.userId;

  const loginResponse = await request(app)
    .post('/api/users/login')
    .send({
      email: 'test@example.com',
      password: 'password123'
    });
  token = loginResponse.body.token;
});


test.serial('Fahrzeug registrieren', async t => {
  const response = await request(app)
    .post('/api/cars/')
    .set('Authorization', `Bearer ${token}`)
    .send({
      userId,
      kennzeichen: "B-XY123",
      marke: "Volkswagen",
      modell: "Golf",
      baujahr: 2017,
      kraftstoff: "Diesel",
      schadstoffklasse: "Euro 6",
      leistungKW: 110,
      leistungPS: 150,
      kilometerstand: 85000,
      nächsteTüvUntersuchung: "2023-10-30"
    });
  t.is(response.status, 201);
  carId = response.body.carId;
});

test.serial('Fahrzeug abfragen', async t => {
  const response = await request(app)
    .get(`/api/cars/${carId}`)
    .set
    ('Authorization', `Bearer ${token}`);
    t.is(response.status, 200);
    t.is(response.body.kennzeichen, "B-XY123");
});


test.serial('Fahrzeug TÜV-Eintrag hinzufügen', async t => {
    const response = await request(app)
        .post(`/api/cars/${carId}/tuev`) // Ändern zu POST und ggf. Endpoint anpassen
        .set('Authorization', `Bearer ${token}`)
        .send({
          tuev: {
            datum: "2023-10-30",
            bemerkung: "ohne Mängel bestanden"
          }
        });
    t.is(response.status, 201);
});


test.serial('Fahrzeug Kilometerstand hinzufügen', async t => {
    const response = await request(app)
        .post(`/api/cars/${carId}/kilometerstand`) // Ändern zu POST und ggf. Endpoint anpassen
        .set('Authorization', `Bearer ${token}`)
        .send({
          kilometerstand: 86000
        });
    t.is(response.status, 201);
});


test.serial('Fahrzeug Service-Eintrag hinzufügen', async t => {
    const response = await request(app)
        .post(`/api/cars/${carId}/service`) // Ändern zu POST und ggf. Endpoint anpassen
        .set('Authorization', `Bearer ${token}`)
        .send({
          service: {
            datum: "2023-10-30",
            bemerkung: "Ölwechsel, Bremsen erneuert"
          }
        });
    t.is(response.status, 201);
} );



test.serial('Fahrzeuge des Benutzers abfragen', async t => {
    const response = await request(app)
        .get(`/api/cars/user/${userId}`) 
        .set('Authorization', `Bearer ${token}`);
    t.is(response.status, 200);
});


test.serial('Fahrzeug löschen', async t => {
    const response = await request(app)
        .delete(`/api/cars/${carId}`)
        .set('Authorization', `Bearer ${token}`);
    t.is(response.status, 200);
});

test.after.always(async t => {
    await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);
    });


// Path: test/user.test.js