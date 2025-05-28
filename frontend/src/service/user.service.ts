import { User } from '../model/user.model';
import { environment } from '../environments/environment';


export class UserService {
    private user: User | null = null;

    private apiUrl = `${environment.apiUrl}`; 

    getUser(): User | null {
        if (localStorage.getItem('user')) {
            this.user = JSON.parse(localStorage.getItem('user') || '');
        } else {
            this.user = null;
        }
        return this.user;
    }

    async takeUserFromApi(nick: string): Promise<any>{
        const url = `${this.apiUrl}/get_user?nickname=${nick}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if(!response.ok){
            throw new Error('Network response was not ok');
        }
        return response.json();
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

}