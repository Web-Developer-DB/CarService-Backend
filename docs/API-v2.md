# API v2

Die Basis-URL ist `/api/v2`. Alle alten Endpunkte wurden entfernt.

## Authentifizierung

| Methode | Pfad                           | Zweck                                                |
| ------- | ------------------------------ | ---------------------------------------------------- |
| POST    | `/auth/register`               | Konto erzeugen und Verifikation senden               |
| POST    | `/auth/verify-email`           | E-Mail-Token einmalig einlösen                       |
| POST    | `/auth/login`                  | Access-Token, CSRF-Token und Refresh-Cookie erhalten |
| POST    | `/auth/refresh`                | Refresh-Cookie rotieren                              |
| POST    | `/auth/logout`                 | Aktuelle Refresh-Session widerrufen                  |
| POST    | `/auth/password-reset/request` | Reset-E-Mail anfordern                               |
| POST    | `/auth/password-reset/confirm` | Passwort mit Einmal-Token setzen                     |

Geschützte Endpunkte erwarten `Authorization: Bearer <access-token>`. Schreibende Endpunkte erwarten zusätzlich `Origin` aus der konfigurierten Allowlist und `X-CSRF-Token`. Der Access-Token gehört ausschließlich in den Arbeitsspeicher der SPA; der Refresh-Token ist ein `HttpOnly`-Cookie.

## Nutzer und Fahrzeuge

| Methode              | Pfad                  | Beschreibung                                     |
| -------------------- | --------------------- | ------------------------------------------------ |
| GET                  | `/users/me`           | Sicheres Profil des eingeloggten Nutzers         |
| PUT                  | `/users/me/password`  | Passwort mit `currentPassword` ändern            |
| DELETE               | `/users/me`           | Konto und alle eigenen Daten löschen             |
| POST / GET           | `/cars`               | Eigenes Fahrzeug erstellen bzw. paginiert listen |
| GET / PATCH / DELETE | `/cars/:carId`        | Eigenes Fahrzeug lesen, ändern oder löschen      |
| POST / GET           | `/cars/:carId/events` | Wartungsereignisse anlegen oder paginiert lesen  |

`POST /cars/:carId/events` akzeptiert genau einen Event-Typ: `mileage`, `inspection`, `oil_change` oder `service`. `mileage` und `oil_change` benötigen `odometerKm`; der Kilometerstand darf nicht sinken.

Listenendpunkte unterstützen `limit` (1–50) und `after` als Cursor aus `nextCursor`.
