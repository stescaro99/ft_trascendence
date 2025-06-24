
import { UserService } from '../../service/user.service';
import { AuthenticationService } from '../../service/authentication.service';
import { TranslationService } from '../../service/translation.service';
import '../../style.css';
import './login.css';
import loginHtml from './login.html?raw';

export class LogInPage{
	nickname: string = '';
	password: string = '';
	qrCode: string = '';
	userService: UserService = new UserService();
	authenticationService: AuthenticationService = new AuthenticationService();
	private currentLang: string;
	
	constructor(lang: string) {
		this.currentLang = lang;
		this.render();
		this.setTheme('green');
		this.addEventListeners();
	}
	private render() {
		const appDiv = document.getElementById('app');
		if (appDiv) {
			const translation = new TranslationService(this.currentLang);
			const translatedHtml = translation.translateTemplate(loginHtml);
			appDiv.innerHTML = translatedHtml;
		}
	}

	handleSubmit() {
		this.authenticationService.loginUserToApi(this.nickname, this.password)
		.then((response) => {
		
			this.authenticationService.takeQrCodeFromApi(this.nickname, this.password)
			.then((qrResponse) => {
				console.log('QR Code received:', qrResponse);
				this.qrCode = qrResponse.qrCode;
				const qrDiv = document.getElementById('qrCode');
				if (qrDiv) {
				qrDiv.innerHTML = `
					<div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
					<img src="${this.qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
					<div id="token2FA" style="display: flex; gap: 8px; justify-content: center;">
						<input maxlength="1" type="text" class="bg-gray-200 rounded text-center text-black" style="width: 32px; height: 40px; font-size: 2rem;" />
						<input maxlength="1" type="text" class="bg-gray-200 rounded text-center text-black" style="width: 32px; height: 40px; font-size: 2rem;" />
						<input maxlength="1" type="text" class="bg-gray-200 rounded text-center text-black" style="width: 32px; height: 40px; font-size: 2rem;" />
						-
						<input maxlength="1" type="text" class="bg-gray-200 rounded text-center text-black" style="width: 32px; height: 40px; font-size: 2rem;" />
						<input maxlength="1" type="text" class="bg-gray-200 rounded text-center text-black" style="width: 32px; height: 40px; font-size: 2rem;" />
						<input maxlength="1" type="text" class="bg-gray-200 rounded text-center text-black" style="width: 32px; height: 40px; font-size: 2rem;" />
					</div>
					<button id="verify2FA" class="button">Verify</button>
					</div>
				`;
				}
				const inputs = document.querySelectorAll('#token2FA input');
				inputs.forEach((input, idx) => {
					input.addEventListener('input', () => {
						if ((input as HTMLInputElement).value.length === 1 && idx < inputs.length - 1) {
							(inputs[idx + 1] as HTMLInputElement).focus();
						}	
					});
				});
				const verifyBtn = document.getElementById('verify2FA');
				if (verifyBtn) {
					verifyBtn.addEventListener('click', () => {
						const inputs = document.querySelectorAll('#token2FA input');
						let code = '';
						inputs.forEach(input => {
							code += (input as HTMLInputElement).value;
						});
						this.authenticationService.verifyQrCodeFromApi(this.nickname, code)
						.then((verifyResponse) => {
						console.log('2FA verified successfully:', verifyResponse);
						localStorage.setItem('user', JSON.stringify(verifyResponse.user));
						window.location.hash = '/';
				})
					.catch((verifyError) => {
						console.error('Error verifying 2FA:', verifyError);
						alert('Verification failed. Please try again.');
					});
				});
			}
		})
	})
		.catch((error) => {
			console.error('Login failed:', error);
			alert('Login failed. Please check your credentials and try again.');
		});
	}

	private addEventListeners() {
		const takeName = document.getElementById('username') as HTMLInputElement;
		if (takeName) {
			takeName.addEventListener('blur', () => {
				this.nickname = takeName.value;
				console.log('Nickname:', this.nickname);
			});
		}
		const takePassword = document.getElementById('password') as HTMLInputElement;
		if (takePassword) {
			takePassword.addEventListener('blur', () => {
				this.password = takePassword.value;
				console.log('Password', this.password);
			});
		}
		const loginForm = document.getElementById('loginForm');
		if (loginForm) {
			loginForm.addEventListener('submit', () => this.handleSubmit());
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
		const debugButton = document.getElementById('debugLogin');
		if (debugButton) {
			debugButton.addEventListener('click', () => {
				localStorage.setItem('user', 'debug');
				localStorage.setItem('nickname', 'fgori');
				window.location.hash = '#/';
			});
		}
	}

	private setTheme(theme: string) {
		const element = document.querySelector('[data-theme]') as HTMLElement;

		element.dataset.theme = theme;
	} 
}