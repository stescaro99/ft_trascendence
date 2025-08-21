import { User } from '../model/user.model';
import { environment } from '../environments/environment';


export class UserService {
	private user: User = new User();

	private apiUrl = `${environment.apiUrl}`; 
	
	getUser(): User | null {
		const nickname = localStorage.getItem('nickname');
		console.log('[UserService] getUser() chiamato');
		console.log('[UserService] localStorage.nickname:', nickname);
		console.log('[UserService] localStorage.user:', localStorage.getItem('user'));

		if (localStorage.getItem('user') || nickname) {
			if (nickname) {
				console.log('[UserService] Chiamo takeUserFromApi con nickname:', nickname);
				this.takeUserFromApi(nickname)
				.then((userData) => {
					console.log('[UserService] Dati utente ricevuti da API:', userData);
					this.user.name = userData.name || '';
					this.user.surname = userData.surname;
					this.user.nickname = userData.nickname;
					this.user.email = userData.email;
					this.user.image_url = userData.image_url;
					this.user.stats = userData.stats;
					this.user.id = userData.id;
					return this.user;
				})
				.catch((error) => {
					console.error('[UserService] Errore nel recupero dati utente:', error);
				});
			}
		} else {
			console.warn('[UserService] Nessun dato utente trovato in localStorage');
			return null;
		}
		return this.user;
	}

	async takeUserFromApi(nick: string): Promise<any> {
		const apiEnv = import.meta.env.VITE_BACKEND_URL;
		const baseUrl = apiEnv || environment.apiUrl;
		const url = `${baseUrl}/get_user?nickname=${encodeURIComponent(nick)}`;

		console.log('[UserService] 🌐 URL chiamato:', url);

		let token: string | null = null;

		// 1) prova chiave diretta
		const directToken = localStorage.getItem('token');
		console.log('[UserService] Token diretto da localStorage:', directToken);
		if (directToken) {
			token = directToken;
		} else {
			// 2) fallback: estrai da localStorage.user
			const userDataString = localStorage.getItem('user');
			console.log('[UserService] userDataString:', userDataString);
			if (userDataString) {
				try {
					const userData = JSON.parse(userDataString);
					token = userData.token || null;
					console.log('[UserService] Token trovato in userData:', token);
					// Salva anche la chiave diretta per altri servizi (es. MultiplayerService)
					if (token) {
						localStorage.setItem('token', token);
						console.log('[UserService] Token salvato come chiave diretta in localStorage.token');
					}
				} catch (error) {
					console.error('[UserService] Errore parsing userData:', error);
				}
			}
		}

		console.log('[UserService] Token finale usato per la chiamata:', token);
		if (!token) {
			throw new Error('No valid token found');
		}

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});

		console.log('[UserService] Response status:', response.status);
		const text = await response.text();
		console.log('[UserService] Response body:', text);
		if (!response.ok) {
			throw new Error(`Network response was not ok: ${response.status} - ${text}`);
		}
		return JSON.parse(text);
	}

	async postUserToApi(user: User): Promise<any> {
		const url = `${this.apiUrl}/add_user`;
		console.log('url', url);
		const body = JSON.stringify({
			name: user.name,
			surname: user.surname,
			nickname: user.nickname,
			email: user.email,
			password: user.password,
			image_url: user.image_url,
		});
		console.log('Request body:', body);
		const response = await fetch(url, {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json',
			},
			body: body,
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json();
	}

	async deleteUserFromApi(nickname : string): Promise<any> {
		const url = `${this.apiUrl}/delete_user`;
		const body = JSON.stringify({
			nickname: nickname,
		});
		const response = await fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: body,
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json();
	}

	async UpdateImageUrl(file: File): Promise<any> {
		const url = `${this.apiUrl}/upload_image`;
		const formData = new FormData();
		formData.append('image', file);

		const response = await fetch(url, {
			method: 'POST',
			body: formData,
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json();
	}

}