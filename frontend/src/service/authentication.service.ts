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
			const api = `${environment.apiUrl}/google_login`;
			
			// Apre una finestra popup per il login Google
			const popup = window.open(
				api,
				'googleLogin',
				'width=500,height=600,scrollbars=yes,resizable=yes'
			);

			if (!popup) {
				reject(new Error('Popup blocked. Please allow popups for this site.'));
				return;
			}

			// Listener per i messaggi dal popup
			const messageListener = (event: MessageEvent) => {
				// Verifica che il messaggio provenga dal dominio corretto
				if (event.origin !== window.location.origin) {
					return;
				}

				if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
					// Salva i dati nel localStorage della finestra principale
					localStorage.setItem('user', JSON.stringify(event.data.user));
					localStorage.setItem('nickname', event.data.nickname);
					
					popup.close();
					window.removeEventListener('message', messageListener);
					clearInterval(checkClosed);
					resolve(event.data);
				} else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
					popup.close();
					window.removeEventListener('message', messageListener);
					clearInterval(checkClosed);
					reject(new Error(event.data.error));
				}
			};

			window.addEventListener('message', messageListener);

			// Controlla quando la finestra popup viene chiusa
			const checkClosed = setInterval(() => {
				if (popup.closed) {
					clearInterval(checkClosed);
					window.removeEventListener('message', messageListener);
					reject(new Error('Login cancelled by user'));
				}
			}, 1000);

			// Timeout dopo 5 minuti
			setTimeout(() => {
				if (!popup.closed) {
					popup.close();
					window.removeEventListener('message', messageListener);
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