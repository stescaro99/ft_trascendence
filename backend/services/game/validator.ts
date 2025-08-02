import { Player, GAME_CONSTANTS } from './types';

export class GameValidator {
  private static lastInputTime: Map<string, number> = new Map();

  static validatePaddleInput(input: any): boolean {
    if (!input || typeof input !== 'object') 
      return false;
    if (typeof input.direction !== 'number' || 
        isNaN(input.direction) || 
        Math.abs(input.direction) > 1)
    {
      return false;
    }
    return true;
  }

  static validateAdvancedInput(input: any, player: Player): boolean {
    if (!this.validatePaddleInput(input)) return false;
    if (input.timestamp) {
      const now = Date.now();
      const timeDiff = Math.abs(now - input.timestamp);
      if (timeDiff > 1000) {
        console.warn(`Timestamp too old/future from ${player.nickname}: ${timeDiff}ms`);
        return false;
      }
    }
    if (Math.abs(input.direction) > 1) {
      return false;
    }
    return true;
  }

  static validateInputRate(playerId: string, playerNickname: string): boolean {
    const now = Date.now();
    const lastInput = this.lastInputTime.get(playerId) || 0;
    
    if (now - lastInput < GAME_CONSTANTS.INPUT_RATE_LIMIT) {
      console.warn(`Input rate limit exceeded for player ${playerNickname}`);
      return false;
    }
    this.lastInputTime.set(playerId, now);
    return true;
  }

  static sanitizeDirection(direction: any): number {
    if (typeof direction === 'number') {
        return Math.max(-1, Math.min(1, direction));
    }
    
    if (typeof direction === 'string') {
        switch (direction.toLowerCase()) {
            case 'up': return -1;
            case 'down': return 1;
            case 'stop': return 0;
            default: return 0;
        }
    }
    
    return 0;
  }

  static clearPlayerInputHistory(playerId: string): void {
    this.lastInputTime.delete(playerId);
  }
}
