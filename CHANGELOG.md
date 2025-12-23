# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## 2025-12-23

### Added
- Request-Validierung und Sanitizing per Joi für Body/Params.
- Zentrale Error-Middleware für konsistente Fehlerantworten.
- Security-Middleware: Helmet, allgemeines Rate Limiting und Auth-Rate-Limiter.
- In-Memory Integrationstests mit `mongodb-memory-server`.
- `.env.example` mit erforderlichen Umgebungsvariablen.

### Changed
- JWT-Verifikation mit festem Algorithmus (HS256) und optionalem Issuer/Audience.
- Owner-Checks für User- und Car-Endpunkte (kein Zugriff auf fremde Daten).
- Car-Erstellung nutzt die User-ID aus dem JWT (Body-Wert wird ignoriert).
- API-Antworten für User-Objekte enthalten keine Passwörter mehr.

### Fixed
- Route-Kollision zwischen `/api/cars/user/:userId` und `/api/cars/:carId`.
- Konsistentere Statuscodes und Fehlertexte bei Validierungs- und Auth-Fehlern.
- Mongoose-Filter-Sanitizing gegen Query-Injection.
