import { environment } from '../environments/environment';

export class AuthenticationService {

    private apiUrl = `${environment.apiUrl}`;

    async takeQrCodeFromApi(message: string, password: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/generate_2FA`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, password }),
        });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        return response.json();
    }

    async verifyQrCodeFromApi(nickname: string, code : string): Promise<any> {
        const response = await fetch(`${this.apiUrl}/verify_2FA`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname, code }),
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
}