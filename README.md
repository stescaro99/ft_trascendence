# ft_trascendence

## Dettagli

## Backend - stescaro-sfabi

### Moduli "Web"

- Modulo major: Utilizzare un framework per costruire il backend.  ✅
- Modulo minor: Utilizzare un database per il backend. ✅
- Modulo major: Memorizzare il punteggio di un torneo sulla Blockchain.  (?????????????)


### Moduli in collaborazione con frontend
- Modulo major: Gestione standard degli utenti, autenticazione, utenti attraverso i tornei. ✅
- Modulo major: Implementare un'autenticazione remota. (????)

- Modulo major: Introdurre un avversario AI. (da fare)

- Modulo major: 2fa (in corso)

## Piano dettagliato

### Configurazione del server

1. **Configura un server Fastify**:
   ~~- Inizializza un progetto Node.js e installa Fastify.~~
   ~~- Configura il server per caricare rotte modulari e utilizzare plugin per funzionalità come autenticazione e gestione utenti.~~

2. **Organizza la struttura del progetto**:
   ~~- Crea una struttura modulare con cartelle per rotte, controller, servizi, modelli, plugin e utilità.~~
   ~~- Assicurati che ogni componente abbia una responsabilità chiara.~~

---

### Database
1. **Configura SQLite**:
   ~~- Utilizza SQLite come database locale.~~
   ~~- Configura un file di connessione per interagire con il database.~~

2. **Configura un ORM/ODM (es. Sequelize)**:
   ~~- Installa e configura Sequelize per gestire il database in modo più semplice.~~
   ~~- Definisci i modelli per utenti, tornei e statistiche.~~

3. **Crea i modelli**:
   ~~- **Utenti**: Nome, email, password hashata, avatar, stato online.~~
   ~~- **Tornei**: Nome torneo, partecipanti, stato, vincitore.~~
   ~~- **Statistiche**: Partite giocate, vittorie, sconfitte, punteggi.~~

---

### Autenticazione
1. **Sistema di registrazione/login**:
   ~~- Implementa un sistema di registrazione che salva le credenziali degli utenti in modo sicuro.~~
   ~~- Implementa un sistema di login che verifica le credenziali e genera un token di sessione.~~

2. **Protezione delle rotte**:
   ~~- Proteggi le rotte sensibili con middleware di autenticazione.  ~~

---

### Blockchain  ??????????????????????????????///
1. **Utilizza la blockchain Avalanche**:
   - Configura un ambiente di sviluppo per Avalanche.
   - Crea un account e ottieni credenziali per interagire con la blockchain.

2. **Scrivi smart contract in Solidity**:
   - Scrivi uno smart contract per registrare i punteggi dei tornei.
   - Implementa funzioni per aggiungere, aggiornare e leggere i punteggi.

3. **Interagisci con la blockchain**:
   - Usa una libreria per comunicare con la blockchain dal backend.

---

### AI e dashboard
1. **Modulo AI**:
   - Implementa un avversario AI che simula un giocatore umano.
   - L'AI deve prendere decisioni basate sullo stato del gioco.

2. **Dashboard per statistiche**:
   - Crea endpoint per recuperare statistiche utente (es. vittorie, sconfitte, punteggi).
   - Progetta un sistema per aggregare e visualizzare i dati di gioco.

---

### Collaborazione con il frontend
1. **Esponi API RESTful o GraphQL**:
   ~~- Progetta endpoint per tutte le funzionalità (es. autenticazione, gestione tornei, statistiche).~~

2. **Documenta le API con Swagger**:
  ~~ - Usa un plugin per generare automaticamente la documentazione delle API. ~~
  ~~ - Includi dettagli su ogni endpoint (es. parametri, risposte, codici di errore).~~

---

### Docker
1. **Containerizzazione**:
   - Configura un container Docker per eseguire il progetto.
   - Assicurati che il progetto possa essere avviato con un singolo comando.

---