import { User } from '../../model/user.model';
import { UserService } from '../../service/user.service';
import { AuthenticationService } from '../../service/authentication.service';
import '../../style.css';
import './login.css';
import loginHtml from './login.html?raw';

export class LogInPage{
	user: User = new User();
	userService: UserService = new UserService();
	authenticationService: AuthenticationService = new AuthenticationService();
	
	constructor() {
		this.render();
		this.addEventListeners();
		this.setTheme('green');
	}
	private render() {
		const appDiv = document.getElementById('app');
		if (appDiv) {
			appDiv.innerHTML = loginHtml;
		}
	}

	handleSubmit() {
		// TO DO
	}

	private addEventListeners() {
		const loginForm = document.getElementById('loginForm');
		if (loginForm) {
			loginForm.addEventListener('submit', (event) => this.handleSubmit());
		}
		const googleid = document.getElementById('googleid');
		if (googleid) {
			googleid.addEventListener('click', () => {
				this.authenticationService.loginUserWithGoogleToApi()
				.then((response) => {
					console.log('Google login successful:', response);
					localStorage.setItem('user', JSON.stringify(response.user));
					location.hash = '/';
				})
				.catch((error) => {
					console.error('Google login failed:', error);
					alert('Google login failed. Please try again.');
				});
			});
		}
	}

	private setTheme(theme: string) {
		const element = document.querySelector('[data-theme]') as HTMLElement;

		element.dataset.theme = theme;
	} 
}