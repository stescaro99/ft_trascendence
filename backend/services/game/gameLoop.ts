import { GameRoom, GAME_CONSTANTS } from './types';
import { GamePhysics } from './physics';
import Game from '../../models/game';

export class GameLoop {
  private static activeLoops: Map<string, boolean> = new Map();

  static startGameLoop(roomId: string, room: GameRoom, broadcastCallback: (roomId: string, message: any) => void): void {
    if (this.activeLoops.get(roomId)) {
      console.warn(`Game loop already running for room ${roomId}`);
      return;
    }

    this.activeLoops.set(roomId, true);

    let lastUpdate = Date.now();
    const frameTime = 1000 / GAME_CONSTANTS.TARGET_FPS;
    let frameCounter = 0;

    const gameLoop = () => {
      if (!room.isActive || !this.activeLoops.get(roomId)) {
        this.activeLoops.delete(roomId);
        return;
      }
      const now = Date.now();
      const deltaTime = now - lastUpdate;

      lastUpdate = now;
      GamePhysics.updateGameStateWithDelta(room.gameState, deltaTime);
      const gameUpdateData = {
        ...room.gameState,
        frameId: frameCounter,
        timestamp: now
      };
      
      broadcastCallback(roomId, {
        type: 'gameUpdate',
        gameState: gameUpdateData,
        timestamp: now,
        frameId: frameCounter
      });
      if (room.gameState.scoreLeft >= room.gameState.maxScore || 
          room.gameState.scoreRight >= room.gameState.maxScore) {
        this.stopGameLoop(roomId);
        this.handleGameEnd(roomId, room, broadcastCallback);
        return;
      }

      frameCounter++;
      setTimeout(gameLoop, Math.max(0, frameTime - (Date.now() - now)));
    };
    gameLoop();
  }

  static stopGameLoop(roomId: string): void {
    this.activeLoops.delete(roomId);
    console.log(`Game loop stopped for room ${roomId}`);
  }

  static isLoopActive(roomId: string): boolean {
    return this.activeLoops.get(roomId) || false;
  }

  private static handleGameEnd(roomId: string, room: GameRoom, broadcastCallback: (roomId: string, message: any) => void): void {
    room.isActive = false;
    
    const winner = room.gameState.scoreLeft > room.gameState.scoreRight ? 'left' : 'right';
    const gameResult = {
      type: 'gameEnded',
      winner: winner,
      reason: 'normalEnd',
      finalScore: {
        left: room.gameState.scoreLeft,
        right: room.gameState.scoreRight
      },
      players: room.players.map(p => ({
        nickname: p.nickname,
        side: this.getPlayerSide(room, p),
        connected: true
      })),
      timestamp: Date.now()
    };

    broadcastCallback(roomId, gameResult);
    
    // Salva il risultato nel database
    this.saveGameResultToDatabase(room, winner);
    
    console.log(`Game ended in room ${roomId}:`, gameResult);
  }

  private static getPlayerSide(room: GameRoom, player: any): string {
    const playerIndex = room.players.indexOf(player);
    if (room.type === 'two') {
      return playerIndex === 0 ? 'left' : 'right';
    } else {
      return playerIndex < 2 ? 'left' : 'right';
    }
  }

  private static async saveGameResultToDatabase(room: GameRoom, winner: 'left' | 'right'): Promise<void> {
    try {
      const leftPlayers = room.players.filter((_, index) => {
        if (room.type === 'two') {
          return index === 0;
        } else {
          return index < 2;
        }
      });
      
      const rightPlayers = room.players.filter((_, index) => {
        if (room.type === 'two') {
          return index === 1;
        } else {
          return index >= 2;
        }
      });
      
      const winnerNicknames = winner === 'left' ? 
        leftPlayers.map(p => p.nickname) : 
        rightPlayers.map(p => p.nickname);
      
      const allPlayers = room.players.map(p => p.nickname);
      const finalScores = [room.gameState.scoreLeft, room.gameState.scoreRight];
      
      await (Game as any).create({
        players: allPlayers,
        scores: finalScores,
        winner_nickname: winnerNicknames.join(', '),
        game_status: 'finished',
        date: new Date()
      });
      
      console.log(`Game result saved to database for room ${room.id} (normal end)`);
    } catch (error) {
      console.error('Error saving game result to database:', error);
    }
  }
}
