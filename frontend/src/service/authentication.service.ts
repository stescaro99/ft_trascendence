import { environment } from '../environments/environment';

export class AuthenticationService {

	private apiUrl = `${environment.apiUrl}`;

	async takeQrCodeFromApi(nickname: string, password: string): Promise<any> {
		console.log('nickname', nickname);
		const response = await fetch(`${this.apiUrl}/generate_2FA`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ nickname, password }),
		});
			if (!response.ok) {
				console.log('Error in takeQrCodeFromApi:', response);
				throw new Error('Network response was not ok');
			}
		return response.json();
	}

	async verifyQrCodeFromApi(nickname: string, token2FA : string): Promise<any> {
		const response = await fetch(`${this.apiUrl}/verify_2FA`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ nickname, token2FA }),
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json();
	}

	async loginUserToApi(nickname: string, password: string): Promise<any> {
		const response = await fetch(`${this.apiUrl}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ nickname, password }),
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		console.log('Response from loginUserToApi:', response);
		return response.json();
	}

	loginUserWithGoogleToApi(): Promise<any> {
		return new Promise((resolve, reject) => {
			const authUrl = `${this.apiUrl}/google_login`;
			console.log('Opening Google auth popup with URL:', authUrl);
			
			// Apre una finestra popup per il login Google
			const popup = window.open(
				authUrl,
				'googleLogin',
				'width=500,height=600,scrollbars=yes,resizable=yes'
			);

			if (!popup) {
				reject(new Error('Popup blocked. Please allow popups for this site.'));
				return;
			}

			// Ascolta i messaggi dal popup
			const messageHandler = (event: MessageEvent) => {
				// Verifica che il messaggio provenga dal popup
				if (event.source !== popup) {
					return;
				}

				if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
					console.log('Google auth success received:', event.data);
					
					// Salva i dati nel localStorage
					localStorage.setItem('user', JSON.stringify(event.data.user));
					localStorage.setItem('nickname', event.data.nickname);
					
					// Rimuovi il listener
					window.removeEventListener('message', messageHandler);
					
					// Risolvi la promise
					resolve({
						success: true,
						user: event.data.user,
						nickname: event.data.nickname,
						token: event.data.user.token
					});
				} else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
					console.log('Google auth error received:', event.data);
					
					// Rimuovi il listener
					window.removeEventListener('message', messageHandler);
					
					// Rifiuta la promise
					reject(new Error(event.data.error));
				}
			};

			// Aggiungi il listener per i messaggi
			window.addEventListener('message', messageHandler);

			// Controlla quando la finestra popup viene chiusa
			const checkClosed = setInterval(() => {
				if (popup.closed) {
					console.log('Popup was closed');
					clearInterval(checkClosed);
					
					// Rimuovi il listener se la finestra si chiude senza successo
					window.removeEventListener('message', messageHandler);
					
					// Se non abbiamo ricevuto un messaggio di successo, considera il login fallito
					reject(new Error('Login cancelled by user'));
				}
			}, 500);

			// Timeout dopo 5 minuti
			setTimeout(() => {
				if (popup && !popup.closed) {
					console.log('Popup timeout reached');
					popup.close();
					clearInterval(checkClosed);
					reject(new Error('Login timeout'));
				}
			}, 300000);
		});
	}

	async aviabilityCheck(field: string, value: string): Promise<any> {
		const api = `${this.apiUrl}/available_field?field=${field}&value=${value}`;
		const response = await fetch(api, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},  
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json();
	}
}