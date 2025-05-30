import autentificationHtml from './identification.html?raw';
import { User } from '../model/user.model';
import { UserService } from '../service/user.service';
import { AuthenticationService } from '../service/authentication.service';
import '../style.css';

export class IdentificationPage {
	user: User = new User();
	userService: UserService = new UserService();
	authenticationService: AuthenticationService = new AuthenticationService();
	qrCode: string = '';

	constructor() {
    this.render();
    this.addEventListeners();
  }

  private render() {
    document.body.innerHTML = autentificationHtml;
  }

  private handleSubmit(event: Event) {
	console.log('button');
	localStorage.setItem('user', JSON.stringify(this.user.nickname));
  event.preventDefault();
  this.userService.postUserToApi(this.user)
  .then((response) => {
    console.log('User saved successfully:', response);
	this.authenticationService.takeQrCodeFromApi(this.user.nickname, this.user.password) 
	.then((qrResponse) => {
		this.qrCode = qrResponse.qrCode;
		const qrLabel = document.querySelector('label[for="qrCode"]');
		if (qrLabel) { 
		  qrLabel.innerHTML = `<img src="${this.qrCode}" alt="QR Code" style="width: 200px; height: 200px;" /> \n 
		  <br><input type="text" id="token2FA" placeholder="Enter 2FA token" class=" bg-stone-600 round-mid" /></input>`;
		}
	})
    })
    .catch((error) => {
      console.error('Error saving user:', error);
    });
	// window.location.hash = '/';

  }

  private addEventListeners() {
    const form = document.querySelector('#loginForm');
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }
	const nameInput = document.getElementById('nameInput') as HTMLInputElement;
	if (nameInput) {
	nameInput.addEventListener('blur', () => {
			this.user.name = nameInput.value;
			console.log('name', this.user.name);
		});
	}
	const surnameInput = document.getElementById('surnameInput') as HTMLInputElement;
	if (surnameInput) {
	surnameInput.addEventListener('blur', () => {
			this.user.surname = surnameInput.value;
			console.log('surname', this.user.surname);
		});
	}
	const nicknameInput = document.getElementById('nicknameInput') as HTMLInputElement;
	if (nicknameInput) {
	nicknameInput.addEventListener('blur', () => {
			this.user.nickname = nicknameInput.value;
			console.log('nickname', this.user.nickname);
		});
	}
	const emailInput = document.getElementById('emailInput') as HTMLInputElement;
	if (emailInput) {
	emailInput.addEventListener('blur', () => {
			this.user.email = emailInput.value;
			console.log('surname', this.user.surname);
		});
	}
	const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
	if (passwordInput) {
	passwordInput.addEventListener('blur', () => {
			this.user.password = passwordInput.value;
			console.log('surname', this.user.surname);
		});
	}
	 const imageInput = document.getElementById('imageInput') as HTMLInputElement;
  if (imageInput) {
		imageInput.addEventListener('change', () => {
			const file = imageInput.files?.[0];
			if (file) {
				this.user.image_url = URL.createObjectURL(file);
				console.log('image_url', this.user.image_url);
			}
		});
	}
  }
}