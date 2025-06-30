# Guida per Implementare Bot al Posto di Giocatori Scollegati nel 2vs2

## Analisi del Codice Esistente

### Architettura Attuale
- **Backend**: Gestisce le stanze di gioco, connessioni WebSocket, e stato del gioco
- **Frontend**: Gestisce la logica del bot locale e rendering
- **Sistema Bot Esistente**: Il bot è già implementato per giochi locali (vedi `BotState.ts`)

### Componenti Chiave Identificati

#### Backend
- `gameManager.ts`: Gestisce stanze e giocatori
- `websocketController.ts`: Gestisce connessioni WebSocket
- `roomManager.ts`: Gestisce creazione/rimozione stanze
- `handlePlayerDisconnectionWin()`: Attualmente termina la partita quando un giocatore si disconnette

#### Frontend
- `BotState.ts`: Logica bot già implementata
- `TwoController.ts`: Gestisce il loop di gioco per 2 giocatori
- Sistema di bot locale già funzionante

## Passaggi per Implementare Bot su Disconnessione

### 1. Modifica Backend - Rilevamento Disconnessione

#### File: `backend/services/gameManager.ts`
**Modifica la funzione `removePlayerFromRoom()`:**
```typescript
// Attualmente termina la partita, dobbiamo invece sostituire con bot
// Linea 53-70: Modificare per gestire sostituzione bot invece di terminare
```

**Aggiungere nuove funzioni:**
- `replacePlayerWithBot(roomId: string, playerId: string)`
- `notifyBotReplacement(roomId: string, disconnectedPlayerId: string)`

#### File: `backend/services/game/types.ts`
**Aggiungere al `Player` interface:**
```typescript
export interface Player {
  id: string;
  nickname: string;
  socket: WebSocket;
  ready: boolean;
  isBot: boolean; // NUOVO CAMPO
  botDifficulty?: 'easy' | 'medium' | 'hard'; // NUOVO CAMPO
}
```

#### File: `backend/controllers/websocketController.ts`
**Modificare `handlePlayerDisconnection()`:**
- Invece di rimuovere il giocatore, sostituirlo con un bot
- Inviare messaggio di "bot_replacement" ai giocatori rimanenti

### 2. Modifica Backend - Gestione Bot Server-Side

#### File: `backend/services/gameManager.ts`  
**Aggiungere nuove funzioni:**

```typescript
private createBotPlayer(disconnectedPlayer: Player): Player {
  return {
    id: `bot_${disconnectedPlayer.id}`,
    nickname: `Bot_${disconnectedPlayer.nickname}`,
    socket: disconnectedPlayer.socket, // Riutilizziamo socket per compatibilità
    ready: true,
    isBot: true,
    botDifficulty: 'medium'
  };
}

replacePlayerWithBot(roomId: string, playerId: string): void {
  const room = this.roomManager.getRoom(roomId);
  if (!room) return;
  
  const playerIndex = room.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return;
  
  const disconnectedPlayer = room.players[playerIndex];
  const botPlayer = this.createBotPlayer(disconnectedPlayer);
  
  // Sostituisci giocatore con bot
  room.players[playerIndex] = botPlayer;
  
  // Notifica altri giocatori
  this.broadcastToRoom(roomId, {
    type: 'botReplacement',
    replacedPlayerId: playerId,
    botPlayer: {
      id: botPlayer.id,
      nickname: botPlayer.nickname,
      isBot: true
    }
  });
}
```

#### File: `backend/services/gameManager.ts`
**Modificare `handlePlayerDisconnectionWin()`:**
```typescript
// Invece di terminare immediatamente, chiamare replacePlayerWithBot
// Solo per partite 2vs2, per 4vs4 mantenere logica attuale
if (room.type === 'two') {
  this.replacePlayerWithBot(roomId, disconnectedPlayer.id);
  return; // Non terminare la partita
}
```

### 3. Modifica Frontend - Gestione Messaggi Bot

#### File: `frontend/src/services/multiplayerService.ts`
**Implementare servizio multiplayer (attualmente vuoto):**

```typescript
export class MultiplayerService {
  private socket: WebSocket | null = null;
  private botReplacementCallbacks: Function[] = [];
  
  handleBotReplacement(data: any) {
    // Attiva bot locale per giocatore scollegato
    const playerIndex = this.getPlayerIndex(data.replacedPlayerId);
    setBotActive(playerIndex, true);
    
    // Notifica callbacks
    this.botReplacementCallbacks.forEach(callback => callback(data));
  }
  
  onBotReplacement(callback: Function) {
    this.botReplacementCallbacks.push(callback);
  }
}
```

### 4. Modifica Frontend - Integrazione Bot nel Multiplayer

#### File: `frontend/src/pages/game/TwoPlayers/TwoController.ts`
**Aggiungere gestione bot per multiplayer:**

```typescript
// Attualmente il bot funziona solo in locale
// Aggiungere logica per:
// 1. Ricevere notifica di bot replacement
// 2. Attivare bot per giocatore specifico
// 3. Inviare input bot al server come se fosse giocatore umano

function handleBotReplacement(data: any) {
  // Attiva bot per giocatore scollegato
  const playerIndex = data.replacedPlayerId === 'player1' ? 0 : 1;
  setBotActive(playerIndex, true);
  
  // Aggiorna UI per mostrare che è un bot
  updatePlayerDisplayName(playerIndex, data.botPlayer.nickname);
}

// Modificare sendPlayerInput per includere input bot
function sendBotInput(direction: number, playerId: string) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({
      type: 'playerInput',
      roomId: currentRoomId,
      playerId: playerId,
      input: { direction: direction },
      isBot: true
    }));
  }
}
```

### 5. Modifiche UI

#### File: `frontend/src/pages/game/game.ts`
**Aggiungere indicatore visivo per bot:**
```typescript
function updatePlayerDisplayForBot(playerIndex: number, isBot: boolean) {
  const playerNameElement = document.getElementById(`player${playerIndex + 1}Name`);
  if (playerNameElement) {
    if (isBot) {
      playerNameElement.textContent += ' (BOT)';
      playerNameElement.classList.add('bot-indicator');
    }
  }
}
```

### 6. Gestione Riconnessione (Opzionale)

#### Backend: `websocketController.ts`
**Aggiungere funzione per riconnessione:**
```typescript
function handlePlayerReconnection(player: Player, roomId: string) {
  // Se il giocatore si riconnette, sostituire il bot
  const room = gameManager.getRoomInfo(roomId);
  if (room) {
    const botIndex = room.players.findIndex(p => 
      p.isBot && p.nickname.includes(player.nickname)
    );
    if (botIndex !== -1) {
      // Sostituisci bot con giocatore riconnesso
      gameManager.replaceBotWithPlayer(roomId, botIndex, player);
    }
  }
}
```

## Flusso di Implementazione Consigliato

1. **Fase 1**: Modificare backend per rilevare disconnessioni senza terminare partita
2. **Fase 2**: Implementare sostituzione bot nel backend
3. **Fase 3**: Aggiungere gestione messaggi bot nel frontend
4. **Fase 4**: Integrare logica bot esistente con sistema multiplayer
5. **Fase 5**: Testare e raffinare difficoltà bot
6. **Fase 6**: Aggiungere UI per indicare bot attivi
7. **Fase 7**: (Opzionale) Implementare riconnessione giocatore

## Note Tecniche

### Vantaggi dell'Architettura Attuale
- Bot logic già implementato e funzionante in locale
- Sistema WebSocket già configurato
- Gestione disconnessioni già presente

### Sfide da Affrontare
- Sincronizzazione input bot con server
- Gestione stato giocatore vs bot
- Mantenimento compatibilità con sistema esistente
- Testing delle varie situazioni di disconnessione/riconnessione

### Considerazioni di Performance
- Bot deve inviare input alla stessa frequenza di un giocatore umano
- Evitare spam di messaggi WebSocket
- Gestire gracefully reconnection attempts

## File da Modificare (Riepilogo)

### Backend
- `services/gameManager.ts` - Logica principale sostituzione bot
- `services/game/types.ts` - Aggiungere campi bot a Player interface
- `controllers/websocketController.ts` - Gestione messaggi bot
- `services/game/roomManager.ts` - Supporto per giocatori bot

### Frontend  
- `services/multiplayerService.ts` - Implementare servizio (attualmente vuoto)
- `pages/game/TwoPlayers/TwoController.ts` - Integrazione bot con multiplayer
- `pages/game/game.ts` - UI per indicatori bot
- `pages/game/common/BotState.ts` - Possibili estensioni per difficoltà

Questa implementazione mantiene la logica bot esistente e la integra nel sistema multiplayer, fornendo una soluzione robusta per gestire le disconnessioni nel 2vs2.
