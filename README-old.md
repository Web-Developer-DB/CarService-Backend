# Autoverwaltungs-App Backend-Dokumentation

## Einrichtung

Stellen Sie sicher, dass Node.js und npm auf Ihrem System installiert sind.
Installieren Sie die notwendigen NPM-Pakete durch Ausführung von `npm install
express mongoose bcrypt jsonwebtoken dotenv cors` im Wurzelverzeichnis Ihres Projekts. 

Erstellen Sie eine `.env`-Datei im Wurzelverzeichnis und definieren Sie die Umgebungsvariablen

`MONGODB_URI` (Ihre MongoDB-Verbindungszeichenfolge) und `JWT_SECRET` (ein Geheimnis für die Signierung von JWTs).

# Auto-Management-System API Endpunkte

## Auth-Controller

Der Auth-Controller ist verantwortlich für die Authentifizierung von Benutzern und die Generierung von GWToken, die für die Sicherheit und den Zugriffskontrolle innerhalb der API verwendet werden.


### Registrierung

- **Endpunkt**: `POST /api/users/register`
- **Zweck**: Erstellt ein neues Benutzerkonto und generiert ein GWToken.
- **Anfrage**:
  - **Body**: `{ "email": "newUser@example.com", "password": "newUserPassword", "superPassword": "userSuperPassword" }`
- **Antwort**:
  - **Erfolg**: `200  `{ "Benutzer erfolgreich registriert." }`
  - **Fehler**: `400 Bad Request` bei bereits existierendem Benutzer.

## Passwort zurücksetzen

Der Endpunkt zum Zurücksetzen des Passworts ermöglicht es Benutzern, ihr Passwort sicher zu ändern. Dafür ist die Angabe des `superPassword` erforderlich, um die Identität des Benutzers zu verifizieren und unbefugten Zugriff zu verhindern.

### Anfrage

**POST** `/api/users/reset-password`

Um das Passwort zurückzusetzen, muss eine Anfrage an diesen Endpunkt gesendet werden, die die folgenden Informationen im Body enthält:

- `email`: Die E-Mail-Adresse des Benutzerkontos.
- `superPassword`: Das SuperPasswort des Benutzerkontos zur Überprüfung der Identität.
- `newPassword`: Das neue Passwort, das für das Konto festgelegt werden soll.


### Login

- **Endpunkt**: `POST /api/users/login`
- **Zweck**: Authentifiziert den Benutzer und generiert ein GWToken.
- **Anfrage**:
  - **Body**: `{ "email": "user@example.com", "password": "userPassword" }`
- **Antwort**:
  - **Erfolg**: `200 OK` mit GWToken im Body: `{ "token": "<GWToken>" }`
  - **Fehler**: `401 Unauthorized` bei falschen Anmeldedaten.

## Benutzer löschen

Ermöglicht es authentifizierten Benutzern, ihr Konto zu löschen.

- **Endpunkt**: `DELETE /api/users/:userId`
- **Authentifizierung**: Erforderlich (GWToken im `Authorization`-Header).
- **Anfrage**:
  - **Body**: `{ "superPassword": "userSuperPassword" }`
- **Antwort**:
  - **Erfolg**: `200 OK` mit der Nachricht: `{ "message": "Benutzerkonto erfolgreich gelöscht." }`
  - **Fehler**: `403 Forbidden` bei falschem `superPassword`.


## Benutzerdaten anzeigen

Ermöglicht es authentifizierten Benutzern, ihre persönlichen Daten einzusehen.

- **Endpunkt**: `GET /api/users/:userId`
- **Authentifizierung**: Erforderlich (GWToken im `Authorization`-Header).
- **Antwort**:
  - **Erfolg**: `200 OK` mit Benutzerdaten im Body.
  - **Fehler**: `404 Not Found` wenn der Benutzer nicht existiert.

## Benutzerdaten Aktualisierung

Ermöglicht es authentifizierten Benutzern, ihre persönlichen Daten zu aktualisieren.

- **Endpunkt**: `PUT /api/users/:userId`
- **Authentifizierung**: Erforderlich (GWToken im `Authorization`-Header).
- **Anfrage**:
  - **Body**: `{ "email": "(optional)", "password": "(optional)", "superPassword": "requiredForPasswordChange" }`
- **Antwort**:
  - **Erfolg**: `200 OK` mit der Nachricht: `{ "message": "Benutzerdaten erfolgreich aktualisiert." }`
  - **Fehler**: `403 Forbidden` bei falschem `superPassword`.


## Sicherheitsmaßnahmen

- Alle sensiblen Anfragen erfordern eine Authentifizierung mittels GWToken.
- Das `superPassword` wird für kritische Aktionen wie das Aktualisieren von Passwörtern benötigt.
