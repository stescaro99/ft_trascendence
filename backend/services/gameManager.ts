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

  findMatch(player: Player, gameType: 'two' | 'four' = 'two'): string | null {
    for (const [roomId, room] of this.rooms) {
      if (room.type === gameType && 
          room.players.length < room.maxPlayers && 
          !room.isActive) {
        this.addPlayerToRoom(roomId, player);
        
        if (room.players.length === room.maxPlayers) {
          this.startGame(roomId);
        }
        
        return roomId;
      }
    }

    const roomId = this.createRoom(gameType);
    this.addPlayerToRoom(roomId, player);
    return roomId;
  }

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
      
      if (room.isActive) {
        room.isActive = false;
        this.broadcastToRoom(roomId, {
          type: 'gamePaused',
          reason: 'Player disconnected'
        });
      }
    }
  }

  startGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length !== room.maxPlayers) return;

    room.isActive = true;
    room.gameState = this.createInitialGameState(room.type);
    
    this.assignPlayersToPositions(room);

    this.broadcastToRoom(roomId, {
      type: 'gameStarted',
      gameState: room.gameState
    });

    this.startGameLoop(roomId);
  }

  handlePlayerInput(roomId: string, playerId: string, input: any): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.isActive) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    this.updatePaddleMovement(room, player, input);
  }

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

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

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

  private assignPlayersToPositions(room: GameRoom): void {
    room.players.forEach((player, index) => {
      if (room.type === 'two') {
        if (index === 0) {
          room.gameState.leftPaddle[0].nickname = player.nickname;
        } else if (index === 1) {
          room.gameState.rightPaddle[0].nickname = player.nickname;
        }
      } else {
        if (index < 2) {
          room.gameState.leftPaddle[index].nickname = player.nickname;
        } else {
          room.gameState.rightPaddle[index - 2].nickname = player.nickname;
        }
      }
    });
  }

  private updatePaddleMovement(room: GameRoom, player: Player, input: any): void {
    const playerIndex = room.players.indexOf(player);
    
    if (room.type === 'two') {
      if (playerIndex === 0) {
        room.gameState.leftPaddle[0].dy = input.direction * room.gameState.paddleSpeed;
      } else if (playerIndex === 1) {
        room.gameState.rightPaddle[0].dy = input.direction * room.gameState.paddleSpeed;
      }
    } else {
      if (playerIndex < 2) {
        room.gameState.leftPaddle[playerIndex].dy = input.direction * room.gameState.paddleSpeed;
      } else {
        room.gameState.rightPaddle[playerIndex - 2].dy = input.direction * room.gameState.paddleSpeed;
      }
    }
  }

  private startGameLoop(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.isActive) return;

    const gameLoop = () => {
      if (!room.isActive) return;

      this.updateGameState(room.gameState);

      this.broadcastToRoom(roomId, {
        type: 'gameUpdate',
        gameState: room.gameState
      });

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

  private updateGameState(gameState: GameState): void {
    gameState.ball.x += gameState.ball.dx * gameState.ball.speed;
    gameState.ball.y += gameState.ball.dy * gameState.ball.speed;

    gameState.leftPaddle.forEach(paddle => {
      paddle.y += paddle.dy;
      paddle.y = Math.max(0, Math.min(750 - paddle.height, paddle.y));
    });

    gameState.rightPaddle.forEach(paddle => {
      paddle.y += paddle.dy;
      paddle.y = Math.max(0, Math.min(750 - paddle.height, paddle.y));
    });

    if (gameState.ball.y <= gameState.ball.radius || 
        gameState.ball.y >= 750 - gameState.ball.radius) {
      gameState.ball.dy = -gameState.ball.dy;
    }

    this.checkPaddleCollisions(gameState);

    if (gameState.ball.x <= 0) {
      gameState.scoreRight++;
      this.resetBall(gameState);
    } else if (gameState.ball.x >= 1200) {
      gameState.scoreLeft++;
      this.resetBall(gameState);
    }
  }

  private checkPaddleCollisions(gameState: GameState): void {
    gameState.leftPaddle.forEach(paddle => {
      if (gameState.ball.x - gameState.ball.radius <= paddle.x + gameState.paddleWidth &&
          gameState.ball.x + gameState.ball.radius >= paddle.x &&
          gameState.ball.y >= paddle.y &&
          gameState.ball.y <= paddle.y + paddle.height) {
        gameState.ball.dx = -gameState.ball.dx;
      }
    });

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

  getRoomInfo(roomId: string): GameRoom | null {
    return this.rooms.get(roomId) || null;
  }
  
  disconnectUserFromAllRooms(nickname: string): void {
    const roomsToUpdate: string[] = [];
    for (const [roomId, room] of this.rooms) {
      const playerIndex = room.players.findIndex(p => p.nickname === nickname);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        roomsToUpdate.push(roomId);
        if (player.socket.readyState === 1) {
          player.socket.close(1000, 'User logged out');
        }
        this.removePlayerFromRoom(roomId, player.id);
      }
    }
    
    console.log(`User ${nickname} disconnected from ${roomsToUpdate.length} rooms due to logout`);
  }

  getActiveRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }
}

export const gameManager = new GameManager();
