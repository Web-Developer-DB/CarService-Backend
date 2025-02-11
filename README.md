# Backend-Dokumentation

Diese Dokumentation beschreibt die Nutzung der REST API, die im Rahmen des Backends entwickelt wurde. Das Backend basiert auf dem MERN-Stack (MongoDB, Express.js, React.js, Node.js) für die Frontend-Entwicklung. Es bietet eine Reihe von Endpunkten zur Verwaltung von Benutzer- und Fahrzeugdaten.

# Eingesetzte Technologien und Pakete 🛠️

Das Backend dieser Anwendung nutzt eine Vielzahl von Technologien und NPM-Paketen, um eine sichere und effiziente REST API bereitzustellen. Hier eine detaillierte Liste der Kernkomponenten:

## Core Technologien

- **Node.js**: Eine JavaScript-Laufzeitumgebung, die es ermöglicht, JavaScript auf dem Server auszuführen.
- **Express.js**: Ein web Application Framework für Node.js, das das Routing, die Middleware und vieles mehr vereinfacht.
- **MongoDB**: Eine NoSQL-Datenbank, die für ihre Flexibilität und Skalierbarkeit bekannt ist.
- **Mongoose**: Ein MongoDB Objektmodellierungstool, das eine schemabasierte Lösung zur Modellierung Ihrer Anwendungsdaten bietet.

## Sicherheit und Authentifizierung

- **bcrypt**: Ein Paket zur Hashierung von Passwörtern, das hilft, Benutzerpasswörter sicher zu speichern.
- **jsonwebtoken**: Wird verwendet, um JSON Web Tokens zu erstellen und zu verifizieren, eine wichtige Komponente für die Authentifizierung und Autorisierung in der Anwendung.

## Netzwerk und Middleware

- **cors**: Ein Paket, das Cross-Origin Resource Sharing ermöglicht, um RESTful APIs sicher über verschiedene Domains hinweg zugänglich zu machen.
- **body-parser**: Parse Middleware, die eingehende Request Bodies in einer Middleware vor dem Handler verfügbar macht.

## Entwicklung und Testing

- **nodemon**: Ein Hilfsprogramm, das die Entwicklung von Node.js-basierten Anwendungen vereinfacht, indem es automatisch den Server neu startet, wenn Dateiänderungen im Verzeichnis erkannt werden.



## Projektstruktur und Management

Das Projekt folgt einer modularen und übersichtlichen Struktur, um die Wartung und Erweiterbarkeit zu erleichtern. Das Hauptanwendungsdatei `app.js` initialisiert den Server und setzt grundlegende Middleware. Die Geschäftslogik ist in verschiedenen Routen und Controllern organisiert, die mit der Datenbank über Mongoose-Modelle interagieren.

## Sicherheit und Best Practices 🛡️

Zur Gewährleistung der Sicherheit der Anwendung und der Schutz der Benutzerdaten werden verschiedene Maßnahmen und Best Practices eingesetzt:

- **Passwortsicherheit**: `bcrypt` wird für das Hashing und Salzen von Passwörtern verwendet, um sicherzustellen, dass Passwörter auch im Falle eines Datenlecks geschützt sind.
- **Token-basierte Authentifizierung**: JSON Web Tokens (JWTs) ermöglichen eine sichere und effiziente Überprüfung der Benutzeridentität und unterstützen die Implementierung von zustandslosen Authentifizierungssystemen.
- **Umgang mit Umgebungsvariablen**: Sensible Konfigurationen wie Datenbankverbindungen und Geheimnisse werden in Umgebungsvariablen außerhalb des Codes verwaltet, um Sicherheitsrisiken zu minimieren.
- **HTTPS**: Es wird empfohlen, die API über HTTPS zu betreiben, um die Datenübertragung zu verschlüsseln und Man-in-the-Middle-Angriffe zu verhindern.

Diese Maßnahmen helfen dabei, eine robuste und sichere Backend-Anwendung zu gewährleisten, die moderne Sicherheitsanforderungen erfüllt.



## Voraussetzungen 📋

- Node.js und npm müssen installiert sein.
- Eine MongoDB-Datenbank ist erforderlich.
- Eine `.env` Datei mit den notwendigen Umgebungsvariablen (z.B. Datenbank-URL, JWT-Secret).

## Installation  🛠️

1. Klonen Sie das Repository und navigieren Sie in das Projektverzeichnis.
2. Installieren Sie die Abhängigkeiten mit `npm install`.
3. Starten Sie den Server mit `npm run dev`. Der Server läuft standardmäßig auf Port 3000, es sei denn, ein anderer Port ist in der `.env` Datei festgelegt.

## Verwendung der API  📡

Die API bietet Endpunkte zur Verwaltung von Benutzer- und Fahrzeugdaten. Für einige Aktionen ist eine Authentifizierung erforderlich. Im Folgenden finden Sie eine Beschreibung der verfügbaren Endpunkte.

### Benutzer-Endpunkte  🧑

#### 📝 Benutzer registrieren 

-  `POST /api/users/register`
  - Erwartet JSON mit `email`, `password` und `superPassword`.

#### 📝 Benutzer anmelden

- `POST /api/users/login`
  - Erwartet JSON mit `email` und `password`. Gibt einen JWT zurück.

#### 📝 Passwort zurücksetzen  

- `POST /api/users/reset-password`
  - Erwartet JSON mit `email`, `superPassword` und `newPassword`.

#### 📝 Benutzer löschen 

- `DELETE /api/users/delete-user`
  - Erfordert Authentifizierung. Erwartet JSON mit `email` und `superPassword`.

#### 📝 Benutzerdaten abrufen

- `GET /api/users/:userId`
  - Erfordert Authentifizierung.

#### 📝 Benutzerdaten aktualisieren

- `PUT /api/users/update-user`
  - Erfordert Authentifizierung. Erwartet JSON mit `email`, `superPassword` und `newPassword`.

### Fahrzeug-Endpunkte  🚗

#### 📝 Fahrzeug registrieren 

- `POST /api/cars/addCar`
  - Erfordert Authentifizierung. Erwartet JSON mit Fahrzeugdetails.

```json
{
  "userId": "5f8d0d55b54764421b7156d5",
  "fahrzeugart": "PKW",
  "kennzeichen": "B-XY123",
  "marke": "Volkswagen",
  "modell": "Golf",
  "baujahr": 2017,
  "kraftstoff": "Diesel",
  "schadstoffklasse": "Euro 6",
  "leistungKW": 110,
  "leistungPS": 150,
  "kilometerstand": 85000,
  "nächsteTüvUntersuchung": "2023-10-30",
  "nächsteoelwechsel": "2023-09-20",
  "nächsteoelwechselKm": 95000,
  "kilometerstandHistory": [
    {
      "datum": "2021-05-20",
      "kilometerstand": 75000
    },
    {
      "datum": "2022-05-20",
      "kilometerstand": 80000
    }
  ],
  "tuevHistory": [
    {
      "datum": "2021-06-15",
      "bemerkung": "ohne Mängel bestanden"
    }
  ],
  "oelwechselHistory": [
    {
      "datum": "2022-01-10",
      "kilometerstand": 78000,
      "naechsterOelwechselKm": 93000
    }
  ],
  "serviceHistory": [
    {
      "datum": "2022-04-22",
      "beschreibung": "Jahresservice inklusive Bremsenprüfung"
    }
  ]
}


```
### Array sind leer, wenn keine Einträge vorhanden sind
```json
{
  "userId": "5f8d0d55b54764421b7156d5",
  "fahrzeugart": "PKW",
  "kennzeichen": "B-XY123",
  "marke": "Volkswagen",
  "modell": "Golf",
  "baujahr": 2017,
  "kraftstoff": "Diesel",
  "schadstoffklasse": "Euro 6",
  "leistungKW": 110,
  "leistungPS": 150,
  "kilometerstand": 85000,
  "nächsteTüvUntersuchung": "2023-10-30",
  "nächsteoelwechsel": "2023-09-20",
  "nächsteoelwechselKm": 95000,
  "kilometerstandHistory": [],
  "tuevHistory": [],
  "oelwechselHistory": [],
  "serviceHistory": []
}
```


#### 📝 Kilometerstand hinzufügen 

- `POST /api/cars/:carId/kilometerstand`
  - Erfordert Authentifizierung. Erwartet JSON mit `kilometerstand`.
  

```json
{
  "kilometerstand": 87000
}
```


#### 📝 TÜV-Eintrag hinzufügen 

- `POST /api/cars/:carId/tuev`
  - Erfordert Authentifizierung. Erwartet JSON mit `tuev`.
  - 

```json
{
  "tuev": {
    "datum": "2025-07-23",
    "bemerkung": "ohne Mängel bestanden"
  }
}
```

#### 📝 Ölwechsel-Eintrag hinzufügen 

- `POST /api/cars/:carId/oelwechsel`
  - Erfordert Authentifizierung. Erwartet JSON mit `oelwechsel`.


```json
{
  "oelwechsel": {
    "datum": "2023-09-20",
    "kilometerstand": 95000,
    "naechsterOelwechselKm": 105000
  }
}
```

#### 📝 Service-Eintrag hinzufügen  

- `POST /api/cars/:carId/service`
  - Erfordert Authentifizierung. Erwartet JSON mit `service`.


```json
{
  "service": {
    "datum": "2023-10-01",
    "beschreibung": "Jährliche Inspektion inklusive Ölwechsel"
  }
}
```

#### 📝 Fahrzeugdetails abrufen  

- `GET /api/cars/:carId`
  - Erfordert Authentifizierung.



#### 📝 Alle Fahrzeuge eines Benutzers abrufen 

- `GET /api/cars/user/:userId`
  - Erfordert Authentifizierung.
  - 

#### 📝 Fahrzeug löschen 

- `DELETE /api/cars/:carId`
  - Erfordert Authentifizierung.
  - Löscht das Fahrzeug mit der angegebenen `carId`.
  - Löscht auch alle Einträge in den History-Arrays des Fahrzeugs.
  

## Fehlerbehandlung ❌

Die API sendet spezifische Fehlermeldungen und Statuscodes zurück, wenn Probleme auftreten. Zum Beispiel:

- `400 Bad Request`: Fehlende oder ungültige Anforderungsdaten.
- `401 Unauthorized`: Fehlende oder ungültige Authentifizierung.
- `404 Not Found`: Ressource nicht gefunden.
- `500 Internal Server Error`: Allgemeiner Serverfehler.

## Sicherheit 🛡️

Die API verwendet JWTs (JSON Web Tokens) für die Authentifizierung. Es ist wichtig, dass der JWT geheim gehalten und sicher übertragen wird. Zusätzlich wird empfohlen, HTTPS zu verwenden, um die Datenübertragung zu verschlüsseln.


## 🔒 Erfordert Authentifizierung  

Einige Endpunkte der API erfordern eine erfolgreiche Authentifizierung, bevor sie aufgerufen werden können. Dies bedeutet, dass für den Zugriff auf diese Endpunkte ein gültiger JWT (JSON Web Token) erforderlich ist, der im `Authorization`-Header der Anfrage übermittelt werden muss. Die Authentifizierung stellt sicher, dass nur registrierte und autorisierte Benutzer bestimmte Aktionen durchführen können.

### Wie funktioniert die Authentifizierung? 

1. **Benutzer anmelden**: Zuerst muss sich ein Benutzer über den `POST /api/users/login` Endpunkt anmelden. Bei erfolgreicher Anmeldung wird ein JWT zurückgegeben.
   
2. **Token verwenden**: Der erhaltene JWT muss bei folgenden Anfragen im `Authorization`-Header mitgeführt werden. Der Header sollte wie folgt aussehen: `Authorization: Bearer <Token>`.

### 🔐 Endpunkte, die Authentifizierung erfordern

Die folgenden Endpunkte erfordern, dass der `Authorization`-Header mit einem gültigen JWT vorhanden ist:

- **Benutzer löschen**: `DELETE /api/users/delete-user`
- **Benutzerdaten abrufen**: `GET /api/users/:userId`
- **Benutzerdaten aktualisieren**: `PUT /api/users/update-user`
- **Fahrzeug registrieren**: `POST /api/cars/`
- **Kilometerstand hinzufügen**: `POST /api/cars/:carId/kilometerstand`
- **TÜV-Eintrag hinzufügen**: `POST /api/cars/:carId/tuev`
- **Ölwechsel-Eintrag hinzufügen**: `POST /api/cars/:carId/oelwechsel`
- **Service-Eintrag hinzufügen**: `POST /api/cars/:carId/service`
- **Fahrzeugdetails abrufen**: `GET /api/cars/:carId`
- **Fahrzeug löschen**: `DELETE /api/cars/:carId`
- **Alle Fahrzeuge eines Benutzers abrufen**: `GET /api/cars/user/:userId`

### ❌ Fehlermeldungen bei Authentifizierung

- **Fehlender Token**: Falls kein Token im `Authorization`-Header angegeben ist, wird die Anfrage mit dem Statuscode `401 Unauthorized` und einer entsprechenden Fehlermeldung abgelehnt.
- **Ungültiger Token**: Wenn der übermittelte Token ungültig oder abgelaufen ist, wird die Anfrage mit dem Statuscode `403 Forbidden` und einer Fehlermeldung zurückgewiesen.

### 🛡️ Sicherheitshinweise

- **Sicherer Umgang mit Token**: Es ist wichtig, den JWT sicher zu speichern und zu übertragen, um Missbrauch zu verhindern.
- **HTTPS verwenden**: Für die Kommunikation mit der API sollte stets HTTPS verwendet werden, um die Übertragung des Tokens zu verschlüsseln.

Diese Authentifizierungsmethode sorgt für eine sichere und kontrollierte Nutzung der API, indem sie den Zugriff auf sensible Endpunkte auf autorisierte Benutzer beschränkt.
