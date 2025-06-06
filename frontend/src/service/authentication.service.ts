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
        return response.json();
    }

    async loginUserWithGoogleToApi(): Promise<any> {
        const api = `http://localhost:2807/api/google_login`;
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