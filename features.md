# Neue Features


## Security

In diesem Bereich haben wir Massnahmen getroffen, um die Webseite und die Daten der Benutzer vor Angreifern zu schützen.

- **Web Application Firewall WAF**
    - Ein Schutzschild, das automatisch bösartige Anfragen blockiert, bevor sie die Webseite erreichen.
    - Ort: [`doqqer/compose.yaml`](./doqqer/compose.yaml) (Dienst `waf`) & [`waf.md`](./waf.md).
- **Schutz vor gefälschten Anfragen (CSRF Protection)**
    - Verhindert, dass Angreifer heimlich Aktionen im Namen eines angemeldeten Benutzers ausführen können.
    - Ort: [`aqq/app.js`](./aqq/app.js).
- **Sichere Anmeldung & Verbindung (Session Management)**
    - Die Verbindung zwischen Benutzer und Server wurde so abgesichert, dass sie nicht von Fremden belauscht oder gestohlen werden kann.
    - Ort: [`aqq/app.js`](./aqq/app.js).
- **Schutz vor bösartigem Code (XSS Prevention)**
    - Alle Eingaben von Benutzern werden bereinigt, damit kein schädlicher Programmcode in die Webseite eingeschleust werden kann.
    - Orte: [`aqq/fw/security.js`](./aqq/fw/security.js) & [`aqq/user/tasklist.js`](./aqq/user/tasklist.js).
- **Sichere Passwort-Speicherung (Hashing)**
    - Passwörter werden nicht im Klartext, sondern in einer unleserlichen, verschlüsselten Form (Hash) gespeichert.
    - Orte: [`aqq/register.js`](./aqq/register.js) & [`aqq/login.js`](./aqq/login.js).
- **Schutz vor Brut Force (Account Lockout)**
    - Wenn jemand zu oft ein falsches Passwort eingibt, wird das Konto für 24 Stunden gesperrt, um automatisierte Angriffe zu stoppen.
    - Ort: [`aqq/login.js`](./aqq/login.js).
- **Zugriffsschutz für eigene Daten **
    - Stellt sicher, dass jeder Benutzer wirklich nur seine eigenen Aufgaben sehen, bearbeiten oder löschen kann.
    - Orte: [`aqq/delete.js`](./aqq/delete.js) & [`aqq/edit.js`](./aqq/edit.js).

## App Erweiterungen

Hier haben wir die Webseite um nützliche Funktionen erweitert, um die Bedienung zu verbessern.

- **Benutzer-Registrierung**
    - Neue Personen können sich ein eigenes Konto mit Benutzernamen und Passwort erstellen.
    - Ort: [`aqq/register.js`](./aqq/register.js).
- **Aufgaben löschen**
    - Erledigte oder falsch erstellte Aufgaben können mit einem Klick wieder entfernt werden.
    - Ort: [`aqq/delete.js`](./aqq/delete.js).
- **Wichtigkeit festlegen (Priorität)**
    - Aufgaben können nun als "Niedrig", "Mittel" oder "Hoch" markiert werden, um den Überblick zu behalten.
    - Orte: [`aqq/edit.js`](./aqq/edit.js) & [`aqq/user/tasklist.js`](./aqq/user/tasklist.js).
- **Suchen & Filtern**
    - Über ein Suchfeld können Aufgaben gezielt nach Stichworten durchsucht werden.
    - Orte: [`aqq/user/backgroundsearch.js`](./aqq/user/backgroundsearch.js) & [`aqq/search/v2/index.js`](./aqq/search/v2/index.js).
- **System-Überwachung (Health Check)**
    - Ein technischer Status-Check, der meldet, ob die Webseite und die Datenbank korrekt funktionieren.
    - Orte: [`aqq/app.js`](./aqq/app.js) & [`doqqer/compose.yaml`](./doqqer/compose.yaml).
- **Sichere Einstellungen (Dotenv)**
    - Geheime Daten wie Datenbank-Passwörter werden sicher in einer separaten Konfigurationsdatei aufbewahrt.
    - Ort: [`aqq/app.js`](./aqq/app.js).
- **Deadline für Tasks**
  - definieren einer Deadline, wenn du Task fertiggestellt werden soll.
  - Ort: [`aqq/taskList.js`](./aqq/taskList.js).

## Code-Qualität & Wartbarkeit

- **Datenbank-Zugriff (Knex)**
    - Wir nutzen ein Framework für die Datenbank, das automatisch gegen viele Angriffe (wie SQL-Injections) schützt.
    - Orte: [`aqq/fw/db.js`](./aqq/fw/db.js) und in allen Datenmodulen.
- **Aufräumarbeiten & Modernisierung**
    - Veralteter Code wurde ersetzt und die Struktur der Dateien wurde übersichtlicher gestaltet.
    - Ort: Verzeichnisstruktur unter [`aqq/`](./aqq/).
