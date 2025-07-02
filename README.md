# ft_transcendence

Backend - stescaro-sfabi
Frontend - aconciar(Pong)-ucolla-fgori

## 🚀 Setup con HTTPS e Domini Personalizzati

Il progetto è configurato per utilizzare HTTPS con certificati SSL e domini personalizzati:
- **Frontend**: `https://trascendence.fe:8443`
- **Backend**: `https://trascendence.be:9443`

### 📋 Prerequisiti

1. Docker e Docker Compose installati
2. Permessi sudo per modificare il file `/etc/hosts`
3. OpenSSL installato (per generare certificati se necessario)

### ⚙️ Configurazione Rapida

1. **Genera i certificati SSL** (se non esistono già):
   ```bash
   ./generate-certs.sh
   ```

2. **Avvia tutto automaticamente**:
   ```bash
   ./launch.sh
   ```

### 🔧 Setup Manuale

1. **Configura il file .env**:
   ```bash
   # Modifica HOST_ID con il tuo IP
   HOST_ID=192.168.1.61
   ```

2. **Aggiungi i domini al file hosts**:
   ```bash
   ./setup-hosts.sh
   ```
   
   Oppure manualmente:
   ```bash
   echo "192.168.1.61 trascendence.be trascendence.fe" | sudo tee -a /etc/hosts
   ```

3. **Genera certificati SSL** (se necessario):
   ```bash
   ./generate-certs.sh
   ```

4. **Avvia i container**:
   ```bash
   docker-compose up --build
   ```

### 🌐 Accesso

- **Frontend**: https://trascendence.fe:8443
- **Backend API**: https://trascendence.be:9443/api
- **WebSocket** (multiplayer): wss://trascendence.be:9443/ws/game

## 🌐 Accesso da Altre Macchine

Per accedere al progetto da altre macchine nella stessa rete:

1. **Sulla macchina remota**, aggiungi la stessa voce hosts:
   ```bash
   echo "192.168.1.61 trascendence.be trascendence.fe" | sudo tee -a /etc/hosts
   ```

2. **Configura il firewall** sulla macchina host per permettere le connessioni:
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 8443
   sudo ufw allow 9443
   
   # CentOS/RHEL/Fedora  
   sudo firewall-cmd --permanent --add-port=8443/tcp
   sudo firewall-cmd --permanent --add-port=9443/tcp
   sudo firewall-cmd --reload
   ```

3. **Testa la connettività** dalla macchina remota:
   ```bash
   ./test-remote-connectivity.sh
   ```

4. **Accedi alle applicazioni**:
   - Frontend: https://trascendence.fe:8443
   - Backend: https://trascendence.be:9443
   - Immagini: https://trascendence.be:9443/uploads/nome_file.jpg

**Nota**: Le immagini caricate saranno automaticamente accessibili da tutte le macchine configurate!

---

### 🔒 Certificati SSL

I certificati sono condivisi tra frontend e backend e si trovano in `frontend/cert/`:
- `cert.pem` - Certificato pubblico
- `key.pem` - Chiave privata

⚠️ **Nota**: I certificati sono self-signed, quindi il browser mostrerà un avviso di sicurezza. Clicca su "Avanzate" → "Procedi comunque".

### 🔑 Google OAuth

Per il corretto funzionamento di Google OAuth, assicurati di configurare in Google Cloud Console:
- **Authorized redirect URI**: `https://trascendence.be:9443/api/google/callback`

⚠️ **Importante**: Google OAuth non accetta redirect URI su indirizzi IP privati, quindi è necessario usare il dominio `trascendence.be` configurato nel file hosts.

### 🐳 Avvio Container
### 🐳 Avvio Container

```bash
# Ferma eventuali container precedenti
docker-compose down

# Avvia il progetto
docker-compose up --build
```

### 🎯 Troubleshooting

Se riscontri problemi:

1. **Domini non risolti**: Verifica che i domini siano nel file `/etc/hosts`
2. **Porte occupate**: Controlla che le porte 8443 e 9443 siano libere
3. **Certificati SSL**: Il browser mostrerà un avviso per certificati self-signed
4. **Google OAuth**: Assicurati che `trascendence.be:9443` sia nella whitelist di Google
5. **Log dei container**: `docker-compose logs -f`

### 📝 Note per lo Sviluppo

- **Ambiente di sviluppo**: Usa HOST_ID per il tuo IP di rete
- **Produzione**: Sostituisci i certificati self-signed con certificati validi
- **Multiplayer**: I WebSocket sono configurati per connessioni remote tramite HOST_ID

