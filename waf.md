# Web Application Firewall
- Alle Requests zum Webserver laufen jetzt über die WAF (Proxy)
- Verdächtige Requests werden blockiert (liefert 403 - Forbidden)
    - zb. http://localhost:8080/?id=1+union+select+1,2,3--
    - Auch wenn im Body etwas verdächtiges ist, wird der Request blockiert
- Wenn zu viele False Positives/Negatives auftauchen kann die `PARANOIA` env Variable im Docker Compose bearbeitet werden
    - Höherer Wert -> Mehr wird blockiert
    - Niedrigerer Wert -> Weniger wird blockiert
## Wie wird sie benutzt?
- Beim Starten über Docker Compose (`compose.yml`) wird die WAF automatisch auf Port 8080 gestartet
- Alle anderen Ports (web & db) sind nicht gemappt. (Man kommt nur durch die WAF auf die App)
- Wenn man die Logs anschaut, findet man mehr Infos zu Requests und blockierten Requests
    - `docker compose logs waf`
