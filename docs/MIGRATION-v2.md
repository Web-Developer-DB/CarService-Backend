# Migration auf v2

## Vorbedingungen

1. Ein getestetes, vollständiges MongoDB-Backup erstellen.
2. MongoDB als Replica Set und Redis bereitstellen.
3. `.env` vollständig konfigurieren.
4. Den Dry-Run ausführen und den JSON-Report prüfen:

```bash
npm run migrate:v2:dry-run
```

Der Prozess bricht vor Index-Erstellung mit Exit-Code `2` ab, wenn doppelte E-Mails, doppelte Kennzeichen pro Konto, fehlende Eigentümer oder ungültige historische Einträge vorliegen. Diese Datensätze werden nicht verändert.

## Ausführung

Nach Bereinigung aller Report-Einträge:

```bash
npm run migrate:v2
npm run migrate:v2 -- --send-emails
```

Die erste Ausführung überführt Passwort-Hashes, entfernt Superpasswort-Hashes, normalisiert Daten und schreibt Fahrzeughistorien idempotent als `VehicleEvent`. Die zweite Ausführung verschickt die einmaligen Reset-E-Mails. Bestandskonten bleiben bis zum Reset und zur E-Mail-Verifikation gesperrt.

## Rückfall

Bei Fehlern Anwendung stoppen, keine halb migrierten Daten manuell ändern und den zuvor getesteten MongoDB-Restore ausführen. Der Migrationsreport, Zeitstempel und Backup-Referenz gehören in das Deployment-Protokoll.
