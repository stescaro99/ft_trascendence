// Esempio di implementazione logout nel frontend

class AuthService {
  private baseUrl = 'https://localhost:2807/api';
  
  /**
   * Effettua il logout dell'utente
   * @param token - JWT token dell'utente
   * @returns Promise con il risultato del logout
   */
  async logout(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Rimuovi il token dal localStorage/sessionStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userNickname');
        
        // Chiudi eventuali connessioni WebSocket
        this.closeWebSocketConnections();
        
        console.log('Logout successful:', data.message);
        return { success: true, message: data.message };
      } else {
        console.error('Logout failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error during logout'
      };
    }
  }

  /**
   * Chiude tutte le connessioni WebSocket attive
   */
  private closeWebSocketConnections(): void {
    // Se hai una connessione WebSocket globale, chiudila qui
    if ((window as any).gameWebSocket) {
      (window as any).gameWebSocket.close(1000, 'User logged out');
      (window as any).gameWebSocket = null;
    }
  }

  /**
   * Effettua logout automatico quando il token scade
   */
  handleTokenExpiration(): void {
    this.logout(localStorage.getItem('authToken') || '').then(() => {
      // Reindirizza alla pagina di login
      window.location.href = '/login';
    });
  }
}

// Esempio di utilizzo
const authService = new AuthService();

// Funzione per il pulsante di logout
async function handleLogout() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('No token found');
    return;
  }

  const result = await authService.logout(token);
  
  if (result.success) {
    // Reindirizza alla pagina di login o home
    window.location.href = '/login';
  } else {
    alert(`Logout failed: ${result.error}`);
  }
}

// Gestione automatica della scadenza del token
window.addEventListener('beforeunload', () => {
  // Optional: Logout automatico quando si chiude la pagina
  const token = localStorage.getItem('authToken');
  if (token) {
    // Nota: Questo è asincrono e potrebbe non completarsi
    navigator.sendBeacon(`https://localhost:2807/api/logout`, JSON.stringify({
      headers: { 'Authorization': `Bearer ${token}` }
    }));
  }
});

export { AuthService, handleLogout };
