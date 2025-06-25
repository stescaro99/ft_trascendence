import { WebSocket } from 'ws';

export interface Player {
  id: string;
  nickname: string;
  socket: WebSocket;
  ready: boolean;
}

export interface GameRoom {
  id: string;
  players: Player[];
  gameState: any;
  isActive: boolean;
  maxPlayers: number;
  type: 'two' | 'four';
}

export interface GameState {
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
    speed: number;
  };
  leftPaddle: Array<{
    x: number;
    y: number;
    dy: number;
    speed: number;
    height: number;
    nickname: string;
  }>;
  rightPaddle: Array<{
    x: number;
    y: number;
    dy: number;
    speed: number;
    height: number;
    nickname: string;
  }>;
  powerUp: {
    x: number;
    y: number;
    width: number;
    height: number;
    active: boolean;
    type: string;
    color: string;
  };
  scoreLeft: number;
  scoreRight: number;
  paddleHeight: number;
  paddleWidth: number;
  waitingForStart: boolean;
  maxScore: number;
  paddleSpeed: number;
}

class GameManager {
  private rooms: Map<string, GameRoom> = new Map();
  private waitingPlayers: Player[] = [];

  // Crea una nuova stanza di gioco
  createRoom(type: 'two' | 'four' = 'two'): string {
    const roomId = this.generateRoomId();
    const room: GameRoom = {
      id: roomId,
      players: [],
      gameState: this.createInitialGameState(type),
      isActive: false,
      maxPlayers: type === 'two' ? 2 : 4,
      type
    };
    this.rooms.set(roomId, room);
    return roomId;
  }

  // Aggiungi un giocatore a una stanza
  addPlayerToRoom(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length >= room.maxPlayers) {
      return false;
    }

    room.players.push(player);
    this.broadcastToRoom(roomId, {
      type: 'playerJoined',
      player: { id: player.id, nickname: player.nickname },
      totalPlayers: room.players.length,
      maxPlayers: room.maxPlayers
    });

    return true;
  }

  // Trova una partita automaticamente
  findMatch(player: Player, gameType: 'two' | 'four' = 'two'): string | null {
    // Cerca una stanza esistente con spazio
    for (const [roomId, room] of this.rooms) {
      if (room.type === gameType && 
          room.players.length < room.maxPlayers && 
          !room.isActive) {
        this.addPlayerToRoom(roomId, player);
        
        // Se la stanza è piena, inizia la partita
        if (room.players.length === room.maxPlayers) {
          this.startGame(roomId);
        }
        
        return roomId;
      }
    }

    // Crea una nuova stanza
    const roomId = this.createRoom(gameType);
    this.addPlayerToRoom(roomId, player);
    return roomId;
  }

  // Rimuovi un giocatore da una stanza
  removePlayerFromRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);
    
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    } else {
      this.broadcastToRoom(roomId, {
        type: 'playerLeft',
        playerId,
        totalPlayers: room.players.length
      });
      
      // Se la partita era attiva, mettila in pausa o termina
      if (room.isActive) {
        room.isActive = false;
        this.broadcastToRoom(roomId, {
          type: 'gamePaused',
          reason: 'Player disconnected'
        });
      }
    }
  }

  // Inizia una partita
  startGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length !== room.maxPlayers) return;

    room.isActive = true;
    room.gameState = this.createInitialGameState(room.type);
    
    // Assegna i giocatori alle paddle
    this.assignPlayersToPositions(room);

    this.broadcastToRoom(roomId, {
      type: 'gameStarted',
      gameState: room.gameState
    });

    // Inizia il game loop
    this.startGameLoop(roomId);
  }

  // Gestisci input del giocatore
  handlePlayerInput(roomId: string, playerId: string, input: any): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.isActive) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    // Aggiorna il movimento della paddle in base all'input
    this.updatePaddleMovement(room, player, input);
  }

  // Broadcast messaggio a tutti i giocatori in una stanza
  private broadcastToRoom(roomId: string, message: any): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    room.players.forEach(player => {
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(messageStr);
      }
    });
  }

  // Genera ID stanza univoco
  private generateRoomId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Crea stato iniziale del gioco
  private createInitialGameState(type: 'two' | 'four'): GameState {
    const canvasWidth = 1200;
    const canvasHeight = 750;
    const paddleHeight = canvasHeight / 5;
    const paddleWidth = 10;

    const baseState: GameState = {
      ball: {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        dx: 5,
        dy: 5,
        radius: 10,
        speed: 1.5
      },
      leftPaddle: [],
      rightPaddle: [],
      powerUp: {
        x: Math.random() * canvasWidth / 2 + canvasWidth / 4,
        y: Math.random() * canvasHeight / 2 + canvasHeight / 4,
        width: 20,
        height: 20,
        active: true,
        type: "",
        color: ""
      },
      scoreLeft: 0,
      scoreRight: 0,
      paddleHeight: paddleHeight,
      paddleWidth: paddleWidth,
      waitingForStart: false,
      maxScore: 5,
      paddleSpeed: 6
    };

    if (type === 'two') {
      baseState.leftPaddle = [{
        x: 30,
        y: canvasHeight / 2 - paddleHeight / 2,
        dy: 0,
        speed: 6,
        height: paddleHeight,
        nickname: ''
      }];
      baseState.rightPaddle = [{
        x: canvasWidth - paddleWidth - 30,
        y: canvasHeight / 2 - paddleHeight / 2,
        dy: 0,
        speed: 6,
        height: paddleHeight,
        nickname: ''
      }];
    } else {
      // Per 4 giocatori, 2 paddle per lato
      baseState.leftPaddle = [
        {
          x: 30,
          y: canvasHeight / 4 - paddleHeight / 4,
          dy: 0,
          speed: 6,
          height: paddleHeight / 2,
          nickname: ''
        },
        {
          x: 30,
          y: 3 * canvasHeight / 4 - paddleHeight / 4,
          dy: 0,
          speed: 6,
          height: paddleHeight / 2,
          nickname: ''
        }
      ];
      baseState.rightPaddle = [
        {
          x: canvasWidth - paddleWidth - 30,
          y: canvasHeight / 4 - paddleHeight / 4,
          dy: 0,
          speed: 6,
          height: paddleHeight / 2,
          nickname: ''
        },
        {
          x: canvasWidth - paddleWidth - 30,
          y: 3 * canvasHeight / 4 - paddleHeight / 4,
          dy: 0,
          speed: 6,
          height: paddleHeight / 2,
          nickname: ''
        }
      ];
    }

    return baseState;
  }

  // Assegna giocatori alle posizioni
  private assignPlayersToPositions(room: GameRoom): void {
    room.players.forEach((player, index) => {
      if (room.type === 'two') {
        if (index === 0) {
          room.gameState.leftPaddle[0].nickname = player.nickname;
        } else if (index === 1) {
          room.gameState.rightPaddle[0].nickname = player.nickname;
        }
      } else {
        // Per 4 giocatori
        if (index < 2) {
          room.gameState.leftPaddle[index].nickname = player.nickname;
        } else {
          room.gameState.rightPaddle[index - 2].nickname = player.nickname;
        }
      }
    });
  }

  // Aggiorna movimento paddle
  private updatePaddleMovement(room: GameRoom, player: Player, input: any): void {
    const playerIndex = room.players.indexOf(player);
    
    if (room.type === 'two') {
      if (playerIndex === 0) {
        // Giocatore sinistro
        room.gameState.leftPaddle[0].dy = input.direction * room.gameState.paddleSpeed;
      } else if (playerIndex === 1) {
        // Giocatore destro
        room.gameState.rightPaddle[0].dy = input.direction * room.gameState.paddleSpeed;
      }
    } else {
      // Per 4 giocatori
      if (playerIndex < 2) {
        room.gameState.leftPaddle[playerIndex].dy = input.direction * room.gameState.paddleSpeed;
      } else {
        room.gameState.rightPaddle[playerIndex - 2].dy = input.direction * room.gameState.paddleSpeed;
      }
    }
  }

  // Game loop
  private startGameLoop(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.isActive) return;

    const gameLoop = () => {
      if (!room.isActive) return;

      // Aggiorna lo stato del gioco (logica dal frontend)
      this.updateGameState(room.gameState);

      // Broadcast dello stato aggiornato
      this.broadcastToRoom(roomId, {
        type: 'gameUpdate',
        gameState: room.gameState
      });

      // Controlla se la partita è finita
      if (room.gameState.scoreLeft >= room.gameState.maxScore || 
          room.gameState.scoreRight >= room.gameState.maxScore) {
        room.isActive = false;
        this.broadcastToRoom(roomId, {
          type: 'gameEnded',
          winner: room.gameState.scoreLeft > room.gameState.scoreRight ? 'left' : 'right',
          finalScore: {
            left: room.gameState.scoreLeft,
            right: room.gameState.scoreRight
          }
        });
        return;
      }

      setTimeout(gameLoop, 1000 / 60); // 60 FPS
    };

    gameLoop();
  }

  // Aggiorna stato del gioco (implementa la logica dal frontend)
  private updateGameState(gameState: GameState): void {
    // Movimento della palla
    gameState.ball.x += gameState.ball.dx * gameState.ball.speed;
    gameState.ball.y += gameState.ball.dy * gameState.ball.speed;

    // Aggiorna posizioni paddle
    gameState.leftPaddle.forEach(paddle => {
      paddle.y += paddle.dy;
      // Limiti del campo
      paddle.y = Math.max(0, Math.min(750 - paddle.height, paddle.y));
    });

    gameState.rightPaddle.forEach(paddle => {
      paddle.y += paddle.dy;
      // Limiti del campo
      paddle.y = Math.max(0, Math.min(750 - paddle.height, paddle.y));
    });

    // Rimbalzi sui bordi superiore e inferiore
    if (gameState.ball.y <= gameState.ball.radius || 
        gameState.ball.y >= 750 - gameState.ball.radius) {
      gameState.ball.dy = -gameState.ball.dy;
    }

    // Collision detection con le paddle (semplificata)
    this.checkPaddleCollisions(gameState);

    // Reset se la palla esce dai lati
    if (gameState.ball.x <= 0) {
      gameState.scoreRight++;
      this.resetBall(gameState);
    } else if (gameState.ball.x >= 1200) {
      gameState.scoreLeft++;
      this.resetBall(gameState);
    }
  }

  private checkPaddleCollisions(gameState: GameState): void {
    // Collision con paddle sinistre
    gameState.leftPaddle.forEach(paddle => {
      if (gameState.ball.x - gameState.ball.radius <= paddle.x + gameState.paddleWidth &&
          gameState.ball.x + gameState.ball.radius >= paddle.x &&
          gameState.ball.y >= paddle.y &&
          gameState.ball.y <= paddle.y + paddle.height) {
        gameState.ball.dx = -gameState.ball.dx;
      }
    });

    // Collision con paddle destre
    gameState.rightPaddle.forEach(paddle => {
      if (gameState.ball.x + gameState.ball.radius >= paddle.x &&
          gameState.ball.x - gameState.ball.radius <= paddle.x + gameState.paddleWidth &&
          gameState.ball.y >= paddle.y &&
          gameState.ball.y <= paddle.y + paddle.height) {
        gameState.ball.dx = -gameState.ball.dx;
      }
    });
  }

  private resetBall(gameState: GameState): void {
    gameState.ball.x = 1200 / 2;
    gameState.ball.y = 750 / 2;
    gameState.ball.dx = Math.random() > 0.5 ? 5 : -5;
    gameState.ball.dy = Math.random() > 0.5 ? 5 : -5;
  }

  // Ottieni info stanza
  getRoomInfo(roomId: string): GameRoom | null {
    return this.rooms.get(roomId) || null;
  }

  // Lista stanze attive
  getActiveRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }
}

export const gameManager = new GameManager();
