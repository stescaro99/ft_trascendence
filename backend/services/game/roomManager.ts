import { GameRoom, Player, GameState, GAME_CONSTANTS } from './types';

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();

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
    return true;
  }

  removePlayerFromRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);
    
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    } else {
      if (room.isActive) {
        room.isActive = false;
      }
    }
  }

  findMatch(player: Player, gameType: 'two' | 'four' = 'two'): string | null {
    // Prima cerca una room esistente
    for (const [roomId, room] of this.rooms) {
      if (room.type === gameType && 
          room.players.length < room.maxPlayers && 
          !room.isActive) {
        // Trovata room esistente con spazio
        this.addPlayerToRoom(roomId, player);
        return roomId;
      }
    }

    // Nessuna room disponibile, crea una nuova
    const roomId = this.createRoom(gameType);
    this.addPlayerToRoom(roomId, player);
    return roomId;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  assignPlayersToPositions(room: GameRoom): void {
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

  getPlayerSide(room: GameRoom, player: Player): string {
    const playerIndex = room.players.indexOf(player);
    if (room.type === 'two') {
      return playerIndex === 0 ? 'left' : 'right';
    } else {
      return playerIndex < 2 ? 'left' : 'right';
    }
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  createInitialGameState(type: 'two' | 'four'): GameState {
    const paddleHeight = GAME_CONSTANTS.CANVAS_HEIGHT / 5;

    const baseState: GameState = {
      ball: {
        x: GAME_CONSTANTS.CANVAS_WIDTH / 2,
        y: GAME_CONSTANTS.CANVAS_HEIGHT / 2,
        dx: 5,
        dy: 5,
        radius: GAME_CONSTANTS.BALL_RADIUS,
        speed: 1.5
      },
      leftPaddle: [],
      rightPaddle: [],
      powerUp: {
        x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH / 2 + GAME_CONSTANTS.CANVAS_WIDTH / 4,
        y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT / 2 + GAME_CONSTANTS.CANVAS_HEIGHT / 4,
        width: 20,
        height: 20,
        active: true,
        type: "",
        color: ""
      },
      scoreLeft: 0,
      scoreRight: 0,
      paddleHeight: paddleHeight,
      paddleWidth: GAME_CONSTANTS.PADDLE_WIDTH,
      waitingForStart: false,
      maxScore: 5,
      paddleSpeed: 6
    };

    if (type === 'two') {
      baseState.leftPaddle = [{
        x: 30,
        y: GAME_CONSTANTS.CANVAS_HEIGHT / 2 - paddleHeight / 2,
        dy: 0,
        speed: 6,
        height: paddleHeight,
        nickname: ''
      }];
      baseState.rightPaddle = [{
        x: GAME_CONSTANTS.CANVAS_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH - 30,
        y: GAME_CONSTANTS.CANVAS_HEIGHT / 2 - paddleHeight / 2,
        dy: 0,
        speed: 6,
        height: paddleHeight,
        nickname: ''
      }];
    } else {
      baseState.leftPaddle = [
        {
          x: 30,
          y: GAME_CONSTANTS.CANVAS_HEIGHT / 4 - paddleHeight / 4,
          dy: 0,
          speed: 6,
          height: paddleHeight / 2,
          nickname: ''
        },
        {
          x: 30,
          y: 3 * GAME_CONSTANTS.CANVAS_HEIGHT / 4 - paddleHeight / 4,
          dy: 0,
          speed: 6,
          height: paddleHeight / 2,
          nickname: ''
        }
      ];
      baseState.rightPaddle = [
        {
          x: GAME_CONSTANTS.CANVAS_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH - 30,
          y: GAME_CONSTANTS.CANVAS_HEIGHT / 4 - paddleHeight / 4,
          dy: 0,
          speed: 6,
          height: paddleHeight / 2,
          nickname: ''
        },
        {
          x: GAME_CONSTANTS.CANVAS_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH - 30,
          y: 3 * GAME_CONSTANTS.CANVAS_HEIGHT / 4 - paddleHeight / 4,
          dy: 0,
          speed: 6,
          height: paddleHeight / 2,
          nickname: ''
        }
      ];
    }

    return baseState;
  }
}
