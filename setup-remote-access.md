# Accesso Remoto al Progetto ft_transcendence

## Per accedere da un'altra macchina nella stessa rete

### 1. Configurare il file hosts sulla macchina remota

Sulla macchina da cui vuoi accedere, aggiungi questa riga al file `/etc/hosts`:

```bash
sudo nano /etc/hosts
```

Aggiungi:
```
192.168.1.61 trascendence.be trascendence.fe
```

### 2. Accesso alle applicazioni

Una volta configurato il file hosts, potrai accedere da qualsiasi macchina nella rete:

- **Frontend**: https://trascendence.fe:8443
- **Backend API**: https://trascendence.be:9443
- **Immagini caricate**: https://trascendence.be:9443/uploads/nomefile.jpg
- **Swagger Documentation**: https://trascendence.be:9443/swagger

### 3. Certificati SSL

Le altre macchine mostreranno un avviso di certificato non sicuro perché i certificati sono self-signed. Gli utenti dovranno:

1. Cliccare su "Avanzate" o "Advanced"
2. Selezionare "Procedi comunque" o "Proceed anyway"

### 4. Test di connettività

Per verificare che tutto funzioni dalla macchina remota:

```bash
# Test connessione backend
curl -k https://trascendence.be:9443/api/health

# Test connessione frontend  
curl -k https://trascendence.fe:8443

# Test accesso a un'immagine (sostituisci con un'immagine esistente)
curl -k https://trascendence.be:9443/uploads/example.jpg
```

### 5. Firewall

Assicurati che il firewall sulla macchina host (192.168.1.61) permetta le connessioni sulle porte 8443 e 9443:

```bash
# Ubuntu/Debian
sudo ufw allow 8443
sudo ufw allow 9443

# CentOS/RHEL/Fedora
sudo firewall-cmd --permanent --add-port=8443/tcp
sudo firewall-cmd --permanent --add-port=9443/tcp
sudo firewall-cmd --reload
```

## Note Importanti

1. **Google OAuth**: Il callback è configurato per il dominio `trascendence.be:9443`, quindi il login Google funzionerà anche dalle macchine remote.

2. **Immagini**: Le immagini caricate saranno accessibili da qualsiasi macchina all'URL `https://trascendence.be:9443/uploads/nomefile.jpg`

3. **CORS**: Il backend è già configurato per accettare richieste dal frontend, indipendentemente dalla macchina.

4. **Rete**: Tutte le macchine devono essere nella stessa rete locale per accedere tramite l'IP 192.168.1.61.
