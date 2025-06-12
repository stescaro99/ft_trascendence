import * as gameApi from "../api/gameApi";

export async function createGame(players: string[], date?: string) {
  return gameApi.addGame(players, date);
}

export async function updateGameField(
  game_id: number,
  field: string,
  new_value: any
) {
  return gameApi.updateGame(game_id, field, new_value);
}


export async function getGameById(game_id: number) {
  return gameApi.getGame(game_id);
}

export async function removeGame(game_id: number) {
  return gameApi.deleteGame(game_id);
}