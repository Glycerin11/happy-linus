# GitHub Pages und Google Drive

Die Webseite wird als statische Seite über GitHub Pages veröffentlicht. Google Apps Script speichert das vollständige Umfrageergebnis als private `Happy-Linus-Ergebnis.txt` in deinem Google Drive. Die öffentliche Statusabfrage liefert nur die erste, kurze Ausgabe zurück.

## 1. Apps Script einrichten

1. Öffne [script.google.com](https://script.google.com) mit dem Google-Konto, in dessen Drive die Ergebnisdatei liegen soll.
2. Erstelle ein neues Projekt.
3. Ersetze den Inhalt der Datei `Code.gs` durch den Inhalt aus `apps-script/Code.gs` und speichere das Projekt.
4. Wähle **Bereitstellen > Neue Bereitstellung** und als Typ **Web-App**.
5. Wähle **Ausführen als: Ich** und **Zugriff: Jeder**. So braucht die Person, die die Umfrage ausfüllt, kein Google-Konto. Bestätige die Google-Berechtigungsabfrage.
6. Stelle die Web-App bereit und kopiere die URL, die auf `/exec` endet.

Das Script legt beim ersten gültigen Absenden eine private Textdatei in deinem Drive an und nimmt danach keine weiteren Ergebnisse an. Die Web-App ist öffentlich erreichbar; die Einmal-Sperre verhindert Überschreiben, ist aber keine Anmeldung und kann einen fremden ersten Aufruf nicht sicher ausschließen. Die `/exec`-URL wird in das öffentliche Seiten-JavaScript eingebaut und ist daher kein Geheimnis. Der Drive-Inhalt selbst wird über die Statusabfrage nicht offengelegt.

## 2. GitHub Pages konfigurieren

1. Öffne das GitHub-Repository und gehe zu **Settings > Secrets and variables > Actions > Variables**.
2. Lege eine Repository-Variable mit dem Namen `APPS_SCRIPT_URL` an und füge die `/exec`-URL als Wert ein. Die URL ist kein Passwort und wird beim Build in das öffentliche JavaScript übernommen.
3. Öffne **Settings > Pages** und wähle bei der Build-Quelle **GitHub Actions**.
4. Übernimm die Änderungen in den Branch `main`. Der Workflow veröffentlicht dann die Seite und setzt die Apps-Script-URL beim Build ein.

Der Workflow veröffentlicht nur `index.html`, `style.css`, `script.js` und `greedy_cat.jpg`. `server.js` und die lokale `ergebnis.txt` werden nicht veröffentlicht. Die lokale Ergebnisdatei ist außerdem in `.gitignore` eingetragen.

## 3. Lokale Entwicklung

Ohne gesetzte Apps-Script-URL verwendet `script.js` weiterhin die lokalen Endpunkte aus `server.js`. So kannst du die Seite lokal testen, ohne das Google-Script aufzurufen.
