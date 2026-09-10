# Betrieb

## Voraussetzungen

Die Produktion benötigt Node.js 22 LTS, MongoDB als Replica Set, Redis und SMTP. Start verweigert sich bei fehlenden Geheimnissen oder unsicherem Cookie-Setup.

## Sicherheitsbetrieb

- `ACCESS_TOKEN_SECRET` mit mindestens 32 zufälligen Zeichen über einen Secret Manager bereitstellen und regelmäßig rotieren.
- Ausschließlich HTTPS vor der API terminieren; `COOKIE_SECURE=true` beibehalten.
- `CORS_ORIGINS` auf exakte SPA-Origins begrenzen, nie `*` verwenden.
- Redis-Ausfälle, Mongo-Readiness, SMTP-Fehler, Rate-Limit-Ereignisse und Fehlerquoten überwachen.
- Strukturierte Logs nicht um Tokens, Cookies, Passwörter oder Reset-Links erweitern.

## Prüfroutine

```bash
npm ci
npm run lint
npm run format:check
npm test
npm run audit:production
```
