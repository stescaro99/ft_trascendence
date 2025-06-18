const BASE_URL = "https://localhost:2807/api";

export async function updateStats(
  nickname: string,
  game_id: number,
  result: number,
  index: number
) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/update_stats`, {
	method: "PUT",
	headers: {
	  "Content-Type": "application/json",
	  Authorization: `Bearer ${token}`,
	},
	body: JSON.stringify({ nickname, game_id, result, index }),
  });
  return res.json();
}

export async function getStats(nickname: string, index: number) {
  const res = await fetch(
	`${BASE_URL}/get_stats?nickname=${nickname}&index=${index}`
  );
  return res.json();
}