# ft_trascendence

Backend - stescaro-sfabi
Frontend - aconciar(Pong)-ucolla-fgori

## Setup with Nginx

Il progetto è ora configurato per utilizzare Nginx come reverse proxy con domini personalizzati.

### Prerequisiti

1. Docker e Docker Compose installati
2. Permessi sudo per modificare il file `/etc/hosts`

### Configurazione Domini

1. Aggiungi i domini locali al file hosts:
   ```bash
   ./setup-hosts.sh
   ```
   
   Oppure manualmente:
   ```bash
   echo "127.0.0.1 trascendence.be trascendence.fe" | sudo tee -a /etc/hosts
   ```

### Avvio del Progetto

```bash
# Ferma eventuali container precedenti
docker-compose down

# Avvia il progetto
docker-compose up --build
```

### Accesso al Sito

- **Applicazione completa**: https://localhost:8443
  - Frontend servito alla root (`/`)
  - API backend accessibili tramite `/api/*`
  - WebSocket disponibili su `/ws/*`

### Architettura

- **Nginx**: Reverse proxy e server dei file statici (Alpine 3.20) - Porte 8080/8443
  - Serve il frontend alla root
  - Proxy delle API backend su `/api/*`
  - Gestione WebSocket su `/ws/*`
- **Backend**: API Node.js/Fastify con HTTPS (interno porta 2807)
- **Frontend**: Applicazione web statica (build con Vite)

### Note Tecniche

- **Domini personalizzati**: Non più necessari, tutto gira su `localhost:8443`
- **SSL**: Certificati auto-firmati generati automaticamente
- **Architettura a microservizi**: Backend e frontend separati ma serviti dallo stesso Nginx

### Google OAuth

Ricorda di aggiornare le credenziali OAuth su Google Cloud Console:
- Authorized redirect URI: `https://localhost:8443/api/google/callback`

### Certificati SSL

Il progetto utilizza certificati SSL auto-firmati generati automaticamente.
Per l'uso in produzione, sostituire con certificati validi.

### Troubleshooting

Se riscontri problemi:
1. Verifica che i domini siano nel file `/etc/hosts`
2. Controlla che le porte 80 e 443 siano libere
3. Verifica i log dei container: `docker-compose logs -f`

