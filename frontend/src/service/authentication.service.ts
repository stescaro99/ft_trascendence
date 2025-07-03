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
			console.log('Redirecting to Google auth URL:', authUrl);
			
			// Salva lo stato prima del redirect
			localStorage.setItem('googleAuthPending', 'true');
			localStorage.setItem('googleAuthResolve', 'pending');
			
			// Redirect diretto alla pagina di autenticazione Google
			window.location.href = authUrl;
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