import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { loadConfig } from '../config/env.js';
import { createLogger } from '../config/logger.js';
import { createMailer } from '../config/mailer.js';
import { createActionToken } from '../services/actions.js';
import { sendActionEmail } from '../services/email.js';

const dryRun = process.argv.includes('--dry-run');
const sendEmails = process.argv.includes('--send-emails');
const config = loadConfig();
const logger = createLogger(config);
const report = {
  dryRun,
  users: { migrated: 0, blocked: [], emailsSent: 0 },
  cars: { migrated: 0, blocked: [], eventsMigrated: 0 }
};
const normalizeEmail = (email) =>
  String(email || '')
    .trim()
    .toLowerCase();
const normalizePlate = (plate) =>
  String(plate || '')
    .replace(/\s+/g, '')
    .toUpperCase();

const migrateUsers = async (db) => {
  const users = await db.collection('users').find({}).toArray();
  const emails = new Map();
  for (const user of users) {
    const email = normalizeEmail(user.email);
    if (!email || (!user.password && !user.passwordHash)) {
      report.users.blocked.push({ id: user._id.toString(), reason: 'missing email or password hash' });
      continue;
    }
    if (emails.has(email)) {
      report.users.blocked.push({ id: user._id.toString(), reason: `duplicate email with ${emails.get(email)}` });
      continue;
    }
    emails.set(email, user._id.toString());
    if (dryRun) {
      report.users.migrated += 1;
      continue;
    }
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          email,
          passwordHash: user.passwordHash || user.password,
          emailVerifiedAt: null,
          tokenVersion: Number.isInteger(user.tokenVersion) ? user.tokenVersion + 1 : 1
        },
        $unset: { password: '', superPassword: '' }
      }
    );
    report.users.migrated += 1;
  }
};

const legacyEvents = (car) => [
  ...(car.kilometerstandHistory || []).map((item, index) => ({
    type: 'mileage',
    occurredAt: item.datum || car.createdAt || new Date(),
    odometerKm: item.kilometerstand,
    migrationKey: `${car._id}:mileage:${index}`
  })),
  ...(car.tuevHistory || []).map((item, index) => ({
    type: 'inspection',
    occurredAt: item.datum || car.createdAt || new Date(),
    note: item.bemerkung,
    migrationKey: `${car._id}:inspection:${index}`
  })),
  ...(car.oelwechselHistory || []).map((item, index) => ({
    type: 'oil_change',
    occurredAt: item.datum || car.createdAt || new Date(),
    odometerKm: item.kilometerstand,
    nextOilChangeKm: item.naechsterOelwechselKm,
    migrationKey: `${car._id}:oil_change:${index}`
  })),
  ...(car.serviceHistory || []).map((item, index) => ({
    type: 'service',
    occurredAt: item.datum || car.createdAt || new Date(),
    description: item.beschreibung,
    migrationKey: `${car._id}:service:${index}`
  }))
];

const migrateCars = async (db) => {
  const cars = await db.collection('cars').find({}).toArray();
  const plates = new Set();
  for (const car of cars) {
    const licensePlate = car.licensePlate || car.kennzeichen;
    const normalized = normalizePlate(licensePlate);
    const key = `${car.userId}:${normalized}`;
    if (!car.userId || !normalized || plates.has(key)) {
      report.cars.blocked.push({
        id: car._id.toString(),
        reason: !car.userId || !normalized ? 'missing owner or license plate' : 'duplicate license plate for user'
      });
      continue;
    }
    plates.add(key);
    const events = legacyEvents(car);
    if (
      events.some(
        (event) =>
          !event.occurredAt ||
          ((event.type === 'mileage' || event.type === 'oil_change') && !Number.isFinite(event.odometerKm))
      )
    ) {
      report.cars.blocked.push({ id: car._id.toString(), reason: 'invalid history event; source data was retained' });
      continue;
    }
    if (dryRun) {
      report.cars.migrated += 1;
      report.cars.eventsMigrated += events.length;
      continue;
    }
    await db.collection('cars').updateOne(
      { _id: car._id },
      {
        $set: {
          vehicleType: car.vehicleType || car.fahrzeugart,
          licensePlate,
          licensePlateNormalized: normalized,
          make: car.make || car.marke,
          model: car.model || car.modell,
          year: car.year || car.baujahr,
          fuelType: car.fuelType || car.kraftstoff,
          emissionClass: car.emissionClass || car.schadstoffklasse,
          powerKw: car.powerKw || car.leistungKW,
          powerPs: car.powerPs || car.leistungPS,
          odometerKm: Number.isFinite(car.odometerKm)
            ? car.odometerKm
            : Number.isFinite(car.kilometerstand)
              ? car.kilometerstand
              : 0,
          nextInspectionAt: car.nextInspectionAt || car.nächsteTüvUntersuchung,
          nextOilChangeAt: car.nextOilChangeAt || car.nächsteoelwechsel,
          nextOilChangeKm: car.nextOilChangeKm || car.nächsteoelwechselKm
        },
        $unset: {
          fahrzeugart: '',
          kennzeichen: '',
          marke: '',
          modell: '',
          baujahr: '',
          kraftstoff: '',
          schadstoffklasse: '',
          leistungKW: '',
          leistungPS: '',
          kilometerstand: '',
          nächsteTüvUntersuchung: '',
          nächsteoelwechsel: '',
          nächsteoelwechselKm: '',
          kilometerstandHistory: '',
          tuevHistory: '',
          oelwechselHistory: '',
          serviceHistory: ''
        }
      }
    );
    for (const event of events)
      await db.collection('vehicleevents').updateOne(
        { migrationKey: event.migrationKey },
        {
          $setOnInsert: { ...event, carId: car._id, userId: car.userId, createdAt: new Date(), updatedAt: new Date() }
        },
        { upsert: true }
      );
    report.cars.migrated += 1;
    report.cars.eventsMigrated += events.length;
  }
};

const sendMigrationEmails = async (db) => {
  if (!sendEmails || dryRun) return;
  const mailer = createMailer(config);
  const users = await db
    .collection('users')
    .find({ passwordHash: { $exists: true }, emailVerifiedAt: null })
    .toArray();
  for (const user of users) {
    const token = await createActionToken({ userId: user._id, type: 'password_reset', config });
    await sendActionEmail({ mailer, config, recipient: user.email, type: 'password_reset', token });
    report.users.emailsSent += 1;
  }
};

try {
  await connectDatabase(config, logger);
  const db = mongoose.connection.db;
  await migrateUsers(db);
  await migrateCars(db);
  if (!dryRun && report.users.blocked.length === 0 && report.cars.blocked.length === 0) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('cars').createIndex({ userId: 1, licensePlateNormalized: 1 }, { unique: true });
    await db.collection('vehicleevents').createIndex({ migrationKey: 1 }, { unique: true, sparse: true });
  }
  await sendMigrationEmails(db);
  console.log(JSON.stringify(report, null, 2));
  if (report.users.blocked.length || report.cars.blocked.length) process.exitCode = 2;
} catch (error) {
  logger.error({ error }, 'Migration failed');
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
