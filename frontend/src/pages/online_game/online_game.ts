import onlineGameHtml from './onlineGame.html?raw';
import { UserService } from '../../service/user.service';
import { User } from '../../model/user.model';

export class OnlineGamePage {
	user : User = new UserService().getUser() || new User();
	constructor() {
		this.init();
	}

	private init() {
		const nicknameElement = document.getElementById('nickname');

		if (nicknameElement) {
			nicknameElement.textContent = `Nickname: ${localStorage.getItem('nickname')}`;
		}
		
	}
}