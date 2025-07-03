import { environment } from '../../../environments/environment';

const BASE_URL = environment.apiUrl;

export async function updateStats(
  nickname: string,
  game_id: number,
  result: number,
  index: number
) {
  // Recupera il token dall'oggetto user nel localStorage
  const userDataString = localStorage.getItem("user");
  let token: string | null = null;
  
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      token = userData.token;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
  }
  
  if (!token) {
    throw new Error('No valid token found');
  }
  
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