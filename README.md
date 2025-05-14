# ft_trascendence

Backend - stescaro-sfabi

Fastify-node.js

Modulo major: Utilizzare un framework per costruire il backend.  
Modulo minor: Utilizzare un database per il backend.
Modulo major: Memorizzare il punteggio di un torneo sulla Blockchain.  


(Collaborare con frontend)
Modulo major: Gestione standard degli utenti, autenticazione, utenti attraverso i tornei.
Modulo major: Implementare un'autenticazione remota.

Modulo major: Introdurre un avversario AI.
Modulo minor: Dashboard per statistiche utente e di gioco.

Per impostare il backend del progetto descritto nel tuo file README.md, puoi seguire questi passaggi. Il backend utilizzerà Fastify (un framework Node.js) e avrà funzionalità come autenticazione, gestione utenti, interazione con un database e memorizzazione dei dati sulla blockchain.



Piano dettagliato:

Inizializzazione del progetto:
-Inizializza un progetto Node.js.
-Installa Fastify e le dipendenze necessarie.

Struttura del progetto:
-Organizza il progetto in cartelle per modularità:
ft_trascendence/
├── backend/
│   ├── routes/          # Rotte API
│   ├── controllers/     # Logica per le rotte API
│   ├── services/        # Interazioni con blockchain e database
│   │   ├── blockchain/  # Interazioni con Avalanche e smart contract
│   ├── plugins/         # Plugin Fastify
│   ├── models/          # Modelli per il database
│   ├── utils/           # Funzioni di utilità
│   └── contracts/       # Smart contract Solidity

Configurazione del server:
-Configura un server Fastify con rotte modulari.
-Usa plugin per autenticazione e gestione utenti.

Database:
-Configura SQLite
-Configura un ORM/ODM (es. Sequelize). (se si può fare)
-Crea modelli per utenti, tornei e statistiche.

Autenticazione:
-Configura un sistema di registrazione/login.

Blockchain:
-Utilizza la blockchain Avalanche per memorizzare i punteggi dei tornei.
-Scrivi smart contract in Solidity per gestire i punteggi dei tornei.

AI e dashboard:
Implementa un modulo per l'AI (es. con TensorFlow.js o un'API esterna).
Crea endpoint per fornire statistiche utente e di gioco.

Collaborazione con il frontend:
Esponi API RESTful o GraphQL per il frontend.
Documenta le API con Swagger.