# Progetto NoSQL – Gestione Eventi con MongoDB

Questo repository contiene il progetto sviluppato per il corso di Basi di Dati, incentrato sulla gestione di eventi e prenotazioni tramite un database NoSQL (MongoDB). Le funzionalità principali sono state implementate in TypeScript, con focus su operazioni CRUD e join manuali tra collezioni.

## Struttura del Progetto

### 📁 MONGODB/CRUD

Contiene i file TypeScript per la gestione delle principali entità del progetto. Le operazioni interagiscono direttamente con il database MongoDB, simulando l'intero flusso applicativo senza l'uso di ORM.

- `events.ts` – Operazioni CRUD sulla collezione degli eventi (creazione, aggiornamento, cancellazione, ricerca).
- `organization.ts` – Operazioni CRUD per la gestione delle organizzazioni che pubblicano eventi.
- `prenotazione.ts` – Gestione delle prenotazioni degli utenti per gli eventi.
- `join-operation.ts` – Operazioni di join tra collezioni
### 📁 scripts

Generazione dati.

- `generate-json.mjs` – Script in JavaScript per generare dati sintetici in formato JSON utili al popolamento iniziale del database MongoDB.
