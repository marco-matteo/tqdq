# Neue Features
## Security
- WAF eingebaut (Mario)
    - Erklärung in [`waf.md`](./waf.md)
## Code Quality
- SQL-Strings durch Query Builder (knex) ersetzt (Alle)
    - zb. in `delete.js:7`
## Application Extensions
- Health Endpoint & Docker Compose Healthcheck für web (Mario)
    - `/health` in app.js
