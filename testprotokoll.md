# Testprotokoll – Task-Management-Applikation (tqdq)

**Projekt:** tqdq – Node.js/Express Task-Manager  
**Tester:** Adrian Bischoff und Sandro Kossel  
**Datum:** 30. März 2026  
**Testart:** Manuelle Sicherheits- & Funktionsanalyse (White-Box)

---

## Testprotokoll-Tabelle

| # | Testname | Beschreibung | Erwartung | Eigentliches Resultat | Kurze Information zum Testresultat | Status |
|---|----------|-------------|-----------|----------------------|-------------------------------------|--------|
| 1 | SQL-Injection – Login | Im Login-Formular werden Sonderzeichen und klassische SQLi-Payloads (z. B. `' OR '1'='1`) als Benutzername eingegeben. | Eingaben werden als Parameter behandelt; kein unautorisierter Login möglich. | `login.js` verwendet `db.knex` mit parametrisierten Abfragen. SQLi-Payload wird nicht ausgeführt. | Knex übergibt alle Benutzereingaben als sichere Query-Parameter. SQL-Injection ist nicht möglich. | ✅ Passed |
| 2 | XSS – Task-Titel | Ein Task wird mit einem JavaScript-Payload als Titel erstellt (z. B. `<script>alert(1)</script>`). | Der Payload wird escaped und nicht als Code ausgeführt. | `edit.js` und `search/v2/index.js` verwenden `security.escapeHTML()` für alle Ausgaben. | HTML-Sonderzeichen werden korrekt escaped. XSS-Angriff schlägt fehl. | ✅ Passed |
| 3 | CSRF-Schutz – Formular-Aktionen | Ein POST-Request (z. B. Task erstellen) wird ohne gültiges CSRF-Token von einer externen Seite abgeschickt. | Server lehnt die Anfrage mit HTTP 403 ab. | `app.js` nutzt `csrf-sync`-Middleware global. Alle zustandsändernden Formulare enthalten `_csrf`-Token. | CSRF-Angriffe werden korrekt abgewehrt. Server antwortet mit „CSRF token validation failed." | ✅ Passed |
| 4 | IDOR – Fremden Task löschen | Ein eingeloggter Benutzer versucht, einen Task eines anderen Benutzers über `/delete?id=<fremde_ID>` zu löschen. | Nur der eigene Task wird gelöscht; fremder Task bleibt erhalten. | `delete.js` enthält eine `.where('UserId', req.session.userid)`-Prüfung. **Jedoch:** Variable `taskID` (Zeile 8) ist nicht definiert – korrekt wäre `taskId`. Dies verursacht einen `ReferenceError` zur Laufzeit. | Die Delete-Funktion wirft einen JavaScript-Laufzeitfehler (`ReferenceError: taskID is not defined`) und funktioniert gar nicht. IDOR-Schutz ist vorhanden, aber die gesamte Funktion ist defekt. | ❌ Failed |
| 5 | IDOR – Fremden Task bearbeiten | Ein Benutzer versucht, den Task eines anderen Benutzers über `/edit?id=<fremde_ID>` zu bearbeiten. | Zugriff wird verweigert; eigene Tasks sind weiterhin editierbar. | `edit.js` prüft `.where('userID', req.session.userId)`. Bei fehlender Übereinstimmung wird eine Fehlermeldung zurückgegeben. | IDOR-Schutz ist korrekt implementiert und funktionsfähig. | ✅ Passed |
| 6 | Authentifizierung – Hauptseite ohne Session | Ein nicht eingeloggter Benutzer ruft `/` direkt im Browser auf. | Weiterleitung zur Login-Seite. | `app.js` prüft `activeUserSession(req)` vor jeder geschützten Route. | Unautorisierter Zugriff auf die Hauptseite wird korrekt blockiert. | ✅ Passed |
| 7 | Authentifizierung – `/search` ohne Login | Ein nicht eingeloggter Benutzer sendet einen POST-Request an `/search`. | Anfrage sollte abgelehnt oder zur Login-Seite weitergeleitet werden. | In `app.js` (Zeile 182–185) fehlt eine `activeUserSession(req)`-Prüfung für die `/search`-Route. Die Route ist ohne Login zugänglich. | **Schwachstelle:** Die `/search`-Route ist nicht durch Authentifizierung geschützt. Unautorisierte Benutzer können Suchanfragen stellen. | ❌ Failed |
| 8 | Authentifizierung – `/search/v2/` ohne Login | Ein nicht eingeloggter Benutzer sendet einen GET-Request an `/search/v2/?terms=test`. | Anfrage sollte abgelehnt werden. | In `app.js` fehlt die Auth-Prüfung für `/search/v2/`. Die Route selbst (`search/v2/index.js`) prüft jedoch intern `req.session.userId` und gibt „Not enough information to search" zurück. | Kein serverseitiger HTTP-Fehler (z. B. 401/403), aber die Suche liefert keine Daten. Schutz ist funktional, aber nicht korrekt nach HTTP-Standard umgesetzt. | ⚠️ Partial |
| 9 | Admin-Bereich – Zugriff ohne Admin-Rolle | Ein eingeloggter Benutzer ohne Admin-Rolle versucht, `/admin/users` aufzurufen. | HTTP 403 Forbidden wird zurückgegeben. | `app.js` prüft `isAdmin(req)`, was `activeUserSession` und `req.session.role === 'Admin'` kombiniert. | Zugriff für Nicht-Admins wird korrekt mit HTTP 403 abgelehnt. | ✅ Passed |
| 10 | Passwort-Hashing – Registrierung | Ein neuer Benutzer wird registriert. Das Passwort wird in der Datenbank inspiziert. | Passwort ist als bcrypt-Hash gespeichert, nicht im Klartext. | `register.js` verwendet `bcrypt.hash(password, 12)` mit Salt-Runden 12. | Passwörter werden sicher gehasht gespeichert. Klartext-Passwörter sind nicht abrufbar. | ✅ Passed |
| 11 | Schwaches Passwort – Registrierung | Registrierung wird mit einem kurzen Passwort (< 12 Zeichen) versucht. | Fehlermeldung: Passwort muss mindestens 12 Zeichen lang sein. | `register.js` prüft `password.length < 12` serverseitig. Das HTML-Formular setzt jedoch nur `minlength="8"`. | Serverseitige Validierung ist korrekt (12 Zeichen). Das HTML-Formular ist mit `minlength="8"` inkonsistent zur Backend-Regel. | ⚠️ Partial |
| 12 | Brute-Force-Schutz – Login | Wiederholte fehlgeschlagene Login-Versuche mit falschen Passwörtern werden durchgeführt. | Nach mehreren Fehlversuchen sollte ein Rate-Limit oder eine Sperrung greifen. | In `login.js` und `app.js` gibt es kein Rate-Limiting, keine Account-Sperrung und keine Verzögerung bei Fehlversuchen. | **Schwachstelle:** Brute-Force-Angriffe auf den Login sind uneingeschränkt möglich. Es existiert kein Schutz gegen automatisierte Passwort-Rateversuche. | ❌ Failed |
| 13 | Session-Cookie – Sicherheits-Flags | Der Session-Cookie wird nach dem Login im Browser inspiziert (DevTools). | Cookie ist mit `httpOnly`-Flag gesetzt; kein Zugriff via JavaScript möglich. | `app.js` konfiguriert `cookie: { httpOnly: true, sameSite: 'strict' }`. Das `secure`-Flag ist jedoch auf `false` gesetzt. | `httpOnly` und `sameSite: strict` sind korrekt gesetzt. Das fehlende `secure: true` bedeutet, dass der Cookie auch über unverschlüsseltes HTTP übertragen wird. In Produktion ein Risiko. | ⚠️ Partial |
| 14 | Registrierung – Duplikat-Benutzername | Es wird versucht, einen Benutzer mit einem bereits vorhandenen Benutzernamen zu registrieren. | Fehlermeldung: „Username already taken". | `register.js` prüft vor dem Insert auf Existenz des Benutzernamens mit einer Datenbankabfrage. | Doppelte Benutzernamen werden korrekt abgefangen und eine entsprechende Meldung angezeigt. | ✅ Passed |
| 15 | Logout – Session-Invalidierung | Der Benutzer klickt auf Logout und versucht anschliessend, mit der alten Session-ID auf `/` zuzugreifen. | Session wird serverseitig zerstört; Zugriff auf geschützte Seiten ist nicht mehr möglich. | `app.js` ruft `req.session.destroy()` beim Logout auf und löscht die Cookies. | Session wird korrekt beendet. Ein erneuter Zugriff auf `/` leitet zur Login-Seite weiter. | ✅ Passed |

---

## Zusammenfassung

| Status | Anzahl |
|--------|--------|
| ✅ Passed | 9 |
| ❌ Failed | 3 |
| ⚠️ Partial | 3 |
| **Total** | **15** |

---

## Kritische Befunde (Failed)

### 1. Defekte Delete-Funktion (`delete.js`, Zeile 8)
**Schweregrad:** Hoch  
`taskID` ist nicht definiert – korrekt wäre `taskId`. Dies verursacht einen `ReferenceError` bei jedem Löschversuch. Die Funktion ist vollständig nicht funktionsfähig.  
**Empfehlung:** Variable auf Zeile 8 von `taskID` zu `taskId` korrigieren.

### 2. Fehlende Authentifizierung auf `/search`-Route
**Schweregrad:** Mittel  
Die `POST /search`-Route in `app.js` prüft `activeUserSession` nicht. Unautorisierte Benutzer können Suchanfragen stellen.  
**Empfehlung:** `activeUserSession(req)`-Prüfung analog zu anderen Routen hinzufügen.

### 3. Kein Brute-Force-Schutz auf Login
**Schweregrad:** Hoch  
Es gibt kein Rate-Limiting, keine Account-Sperrung und keine Login-Verzögerung.  
**Empfehlung:** Middleware wie `express-rate-limit` einsetzen; nach N Fehlversuchen temporäre Sperrung oder CAPTCHA einführen.
