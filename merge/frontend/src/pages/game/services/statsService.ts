import * as statsApi from "../api/statsApi";

export async function addGameToStats(
  nickname: string,
  game_id: number,
  result: number,
  index: number
) {
  // result: 0 = sconfitta, 1 = pareggio, 2 = vittoria, 3 = vittoria torneo
  return statsApi.updateStats(nickname, game_id, result, index);
}

export async function getPlayerStats(nickname: string, index: number) {
  return statsApi.getStats(nickname, index);
}