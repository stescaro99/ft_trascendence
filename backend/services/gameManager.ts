import { WebSocket } from 'ws';
import { Player, GameRoom } from './game/types';
import { RoomManager } from './game/roomManager';
import { GameValidator } from './game/validator';
import { GameLoop } from './game/gameLoop';
import { HeartbeatManager } from './game/heartbeat';
import Game from '../models/game';

class GameManager {
  private roomManager: RoomManager;
  private heartbeatManager: HeartbeatManager;
  private waitingPlayers: Player[] = [];

  constructor() {
    this.roomManager = new RoomManager();
    this.heartbeatManager = new HeartbeatManager();

    this.heartbeatManager.startHeartbeatMonitoring((playerId) => {
      this.removePlayerFromAllRooms(playerId);
    });
  }

  // ===== GESTIONE STANZE =====
  
  createRoom(type: 'two' | 'four' = 'two'): string {
    return this.roomManager.createRoom(type);
  }

  addPlayerToRoom(roomId: string, player: Player): boolean {
    const success = this.roomManager.addPlayerToRoom(roomId, player);
    if (success) {
      this.broadcastToRoom(roomId, {
        type: 'playerJoined',
        player: { id: player.id, nickname: player.nickname },
        totalPlayers: this.roomManager.getRoom(roomId)?.players.length,
        maxPlayers: this.roomManager.getRoom(roomId)?.maxPlayers
      });
    }
    return success;
  }

  findMatch(player: Player, gameType: 'two' | 'four' = 'two'): string | null {
    const roomId = this.roomManager.findMatch(player, gameType);
    if (roomId) {
      const room = this.roomManager.getRoom(roomId);
      if (room && room.players.length === room.maxPlayers) {
        this.startGame(roomId);
      }
    }
    return roomId;
  }

  removePlayerFromRoom(roomId: string, playerId: string): void {
    const room = this.roomManager.getRoom(roomId);
    if (!room) return;

    const disconnectedPlayer = room.players.find(p => p.id === playerId);
    
    this.roomManager.removePlayerFromRoom(roomId, playerId);
    
    if (room.players.length === 0) {
      GameLoop.stopGameLoop(roomId);
    } else {
      this.broadcastToRoom(roomId, {
        type: 'playerLeft',
        playerId,
        totalPlayers: room.players.length
      });
      if (room.isActive) {
        this.handlePlayerDisconnectionWin(roomId, room, disconnectedPlayer);
      }
    }
  }

  // ===== GESTIONE GIOCO =====

  startGame(roomId: string): void {
    const room = this.roomManager.getRoom(roomId);
    if (!room || room.players.length !== room.maxPlayers) return;

    room.isActive = true;
    room.gameState = this.roomManager.createInitialGameState(room.type);
    this.roomManager.assignPlayersToPositions(room);
    this.broadcastToRoom(roomId, {
      type: 'gameStarted',
      gameState: room.gameState
    });

    GameLoop.startGameLoop(roomId, room, (roomId, message) => {
      this.broadcastToRoom(roomId, message);
    });
  }

  handlePlayerInput(roomId: string, playerId: string, input: any): void {
    const room = this.roomManager.getRoom(roomId);
  
    if (!room || !room.isActive) return;
    const player = room.players.find(p => p.id === playerId);

    if (!player) return;
    if (!GameValidator.validateInputRate(playerId, player.nickname)) {
      return;
    }
    if (!GameValidator.validateAdvancedInput(input, player)) {
      console.warn(`Suspicious input detected from player ${player.nickname}:`, input);
      return;
    }
    this.updatePaddleMovement(room, player, input);
  }

  syncClientState(roomId: string, playerId: string): void {
    const room = this.roomManager.getRoom(roomId);

    if (!room) return;
    const player = room.players.find(p => p.id === playerId);

    if (!player || player.socket.readyState !== WebSocket.OPEN) return;
    const fullState = {
      type: 'fullStateSync',
      gameState: room.gameState,
      roomInfo: {
        id: room.id,
        players: room.players.map(p => ({ id: p.id, nickname: p.nickname })),
        isActive: room.isActive,
        type: room.type
      },
      timestamp: Date.now()
    };
    player.socket.send(JSON.stringify(fullState));
  }

  // ===== GESTIONE HEARTBEAT =====

  updatePlayerHeartbeat(playerId: string): void {
    this.heartbeatManager.updatePlayerHeartbeat(playerId);
  }

  // ===== UTILITY =====

  getRoomInfo(roomId: string): GameRoom | null {
    return this.roomManager.getRoom(roomId) || null;
  }

  getActiveRooms(): GameRoom[] {
    return this.roomManager.getAllRooms();
  }

  disconnectUserFromAllRooms(nickname: string): void {
    const roomsToUpdate: string[] = [];
    for (const room of this.roomManager.getAllRooms()) {
      const playerIndex = room.players.findIndex(p => p.nickname === nickname);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        roomsToUpdate.push(room.id);
        if (player.socket.readyState === 1) {
          player.socket.close(1000, 'User logged out');
        }
        this.removePlayerFromRoom(room.id, player.id);
      }
    }
    console.log(`User ${nickname} disconnected from ${roomsToUpdate.length} rooms due to logout`);
  }

  // ===== METODI PRIVATI =====

  private updatePaddleMovement(room: GameRoom, player: Player, input: any): void {
    const playerIndex = room.players.indexOf(player);
    const maxSpeed = room.gameState.paddleSpeed;
    const validatedDirection = GameValidator.sanitizeDirection(input.direction);
    
    if (room.type === 'two') {
      if (playerIndex === 0) {
        room.gameState.leftPaddle[0].dy = validatedDirection * maxSpeed;
      } else if (playerIndex === 1) {
        room.gameState.rightPaddle[0].dy = validatedDirection * maxSpeed;
      }
    } else {
      if (playerIndex < 2) {
        room.gameState.leftPaddle[playerIndex].dy = validatedDirection * maxSpeed;
      } else {
        room.gameState.rightPaddle[playerIndex - 2].dy = validatedDirection * maxSpeed;
      }
    }
  }

  private broadcastToRoom(roomId: string, message: any): void {
    const room = this.roomManager.getRoom(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    room.players.forEach(player => {
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(messageStr);
      }
    });
  }

  private removePlayerFromAllRooms(playerId: string): void {
    for (const room of this.roomManager.getAllRooms()) {
      const playerIndex = room.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        this.removePlayerFromRoom(room.id, playerId);
      }
    }
    GameValidator.clearPlayerInputHistory(playerId);
    this.heartbeatManager.removePlayer(playerId);
  }

  private handlePlayerDisconnectionWin(roomId: string, room: GameRoom, disconnectedPlayer?: Player): void {
    GameLoop.stopGameLoop(roomId);
    room.isActive = false;

    const remainingPlayers = room.players.filter(p => p.id !== disconnectedPlayer?.id);
    
    if (remainingPlayers.length === 0) {
      this.roomManager.deleteRoom(roomId);
      return;
    }
    let winner: 'left' | 'right';
    const winnerNicknames: string[] = [];
    const loserNicknames: string[] = [];

    if (room.type === 'two') {
      const remainingPlayer = remainingPlayers[0];
      const playerIndex = room.players.indexOf(remainingPlayer);
      winner = playerIndex === 0 ? 'left' : 'right';
      winnerNicknames.push(remainingPlayer.nickname);
      if (disconnectedPlayer) {
        loserNicknames.push(disconnectedPlayer.nickname);
      }
    } else {
      const leftPlayers = remainingPlayers.filter((_, index) => 
        room.players.indexOf(remainingPlayers[index]) < 2
      );
      const rightPlayers = remainingPlayers.filter((_, index) => 
        room.players.indexOf(remainingPlayers[index]) >= 2
      );
      
      if (leftPlayers.length > rightPlayers.length) {
        winner = 'left';
        winnerNicknames.push(...leftPlayers.map(p => p.nickname));
      } else if (rightPlayers.length > leftPlayers.length) {
        winner = 'right';
        winnerNicknames.push(...rightPlayers.map(p => p.nickname));
      } else {
        winner = 'left';
        winnerNicknames.push(...leftPlayers.map(p => p.nickname));
      }
      
      if (disconnectedPlayer) {
        loserNicknames.push(disconnectedPlayer.nickname);
      }
    }

    if (winner === 'left') {
      room.gameState.scoreLeft = room.gameState.maxScore;
    } else {
      room.gameState.scoreRight = room.gameState.maxScore;
    }

    const gameResult = {
      type: 'gameEnded',
      winner: winner,
      reason: 'playerDisconnection',
      disconnectedPlayer: disconnectedPlayer?.nickname,
      finalScore: {
        left: room.gameState.scoreLeft,
        right: room.gameState.scoreRight
      },
      players: room.players.map(p => ({
        nickname: p.nickname,
        side: this.getPlayerSide(room, p),
        connected: remainingPlayers.some(rp => rp.id === p.id)
      })),
      timestamp: Date.now()
    };

    this.broadcastToRoom(roomId, gameResult);
    
    this.saveGameResultToDatabase(room, winner, winnerNicknames, loserNicknames, true);
    console.log(`Game ended in room ${roomId} due to disconnection. Winner: ${winner}`, gameResult);
  }

  private async saveGameResultToDatabase(
    room: GameRoom, 
    winner: 'left' | 'right', 
    winnerNicknames: string[], 
    loserNicknames: string[],
    isDisconnectionWin: boolean = false
  ): Promise<void> {
    try {
      const allPlayers = [...winnerNicknames, ...loserNicknames];
      const finalScores = [room.gameState.scoreLeft, room.gameState.scoreRight];
      
      await (Game as any).create({
        players: allPlayers,
        scores: finalScores,
        winner_nickname: winnerNicknames.join(', '),
        game_status: 'finished',
        date: new Date()
      });
      
      console.log(`Game result saved to database for room ${room.id} - Disconnection win: ${isDisconnectionWin}`);
    } catch (error) {
      console.error('Error saving game result to database:', error);
    }
  }

  private getPlayerSide(room: GameRoom, player: Player): string {
    const playerIndex = room.players.indexOf(player);
    if (room.type === 'two') {
      return playerIndex === 0 ? 'left' : 'right';
    } else {
      return playerIndex < 2 ? 'left' : 'right';
    }
  }
}

export const gameManager = new GameManager();
export { Player, GameRoom, GameState } from './game/types';
