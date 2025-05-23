import { User } from '../model/user.model';
import { environment } from '../environments/environment';


export class UserService {
    private user: User | null = null;

    private apiUrl = `${environment.apiUrl}/User`; 

    getUser(): User | null {
        if (localStorage.getItem('user')) {
            this.user = JSON.parse(localStorage.getItem('user') || '');
        } else {
            this.user = null;
        }
        return this.user;
    }

    async takeUserFromApi(): Promise<any>{
        const url = `${this.apiUrl}/GetUser`;
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

}