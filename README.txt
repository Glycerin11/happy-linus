# Bunte Geburtstagsseite 🎂

## Schnell anpassen

Öffne `script.js` und ändere:

```js
const START_DATE = "2026-09-25";
const EXPIRES_AFTER_DAYS = 365;
```

`START_DATE` ist das Datum, ab dem die Tage gezählt werden.

Die Seite blendet sich nach 365 Tagen aus. Wichtig: Das ist nur eine clientseitige Sperre und keine sichere Hosting-Sperre. Wer die HTML/JS-Dateien direkt besitzt, kann diese Sperre entfernen. Für eine echte Zugriffsbeschränkung muss die Hosting-Plattform den Ablauf serverseitig durchsetzen.

## Starten

`index.html` im Browser öffnen. Es werden keine externen Bibliotheken benötigt.

Die Seite enthält:
- dynamische Anzahl der vergangenen Tage
- bunte Geburtstagsgestaltung
- animiertes Flugzeug am Bildschirmrand
- fahrenden Zug
- Ablauf nach maximal 365 Tagen
- Rücksicht auf `prefers-reduced-motion`
