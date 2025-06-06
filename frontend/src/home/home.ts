import homeHtml from './home.html?raw';
import '../style.css';
import { User } from '../model/user.model';
import { UserService } from '../service/user.service';

export class HomePage {
	user: User | null;
	userService: UserService = new UserService();
	constructor() {
	this.user = this.userService.getUser();
    this.render();
	
	const logoutButton = document.getElementById('logoutButton');
	if (logoutButton) {
	logoutButton.addEventListener('click', () => {
	  // Esegui il logout, ad esempio:
	  localStorage.removeItem('user');
	  window.location.hash = '/identification'; // o dove vuoi reindirizzare
	});
  }
}

	private render() {
	const appDiv = document.getElementById('app');
	if (appDiv) {
		appDiv.innerHTML = homeHtml;
	}
  }
}
