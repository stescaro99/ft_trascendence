/**
 * Utility per recuperare il token JWT dal localStorage
 * @returns Il token JWT se presente, null altrimenti
 */
export function getAuthToken(): string | null {
  const userDataString = localStorage.getItem("user");
  
  if (!userDataString) {
    return null;
  }
  
  try {
    const userData = JSON.parse(userDataString);
    return userData.token || null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
}

/**
 * Utility per recuperare il token JWT dal localStorage con controllo di validità
 * @returns Il token JWT se presente e valido
 * @throws Error se il token non è presente o non valido
 */
export function getAuthTokenOrThrow(): string {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No valid token found');
  }
  
  return token;
}
