import { environment } from '../../../environments/environment';

const BASE_URL = environment.apiUrl;

export async function addGame(
  players: string[],
  date?: string
) {
  const token = localStorage.getItem("token");
  const body: any = { players };
  if (date) body.date = date;

  const res = await fetch(`${BASE_URL}/add_game`, {
	method: "POST",
	headers: {
	  "Content-Type": "application/json",
	  Authorization: `Bearer ${token}`,
	},
	body: JSON.stringify(body),
  });
  return res.json();
}

export async function updateGame(
  game_id: number,
  field: string,
  new_value: any
) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/update_game`, {
	method: "PUT",
	headers: {
	  "Content-Type": "application/json",
	  Authorization: `Bearer ${token}`,
	},
	body: JSON.stringify({ game_id, field, new_value }),
  });
  return res.json();
}

export async function getGame(game_id: number) {
  const res = await fetch(`${BASE_URL}/get_game?game_id=${game_id}`);
  return res.json();
}

export async function deleteGame(game_id: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/delete_game?game_id=${game_id}`, {
	method: "DELETE",
	headers: {
	  Authorization: `Bearer ${token}`,
	},
  });
  return res.json();
}