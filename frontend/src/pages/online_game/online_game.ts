import onlineGameHtml from './onlineGame.html?raw';
import { UserService } from '../../service/user.service';
import { User } from '../../model/user.model';
import { TranslationService } from '../../service/translation.service';

export class OnlineGamePage {
	user : User = new UserService().getUser() || new User();
	constructor(currentLang: string) {
		this.init();
	}

	private init() {
		this.render();
		const nicknameElement = document.getElementById('nickname');

		if (nicknameElement) {
			nicknameElement.textContent = `Nickname: ${localStorage.getItem('nickname')}`;
		}
		
	}
	render () {
		const container = document.getElementById('app');
		if (!container) return;

		const translation = new UserService().getUser()?.language || 'en';
		const translatedHtml = new TranslationService(translation).translateTemplate(onlineGameHtml);
		container.innerHTML = translatedHtml;

		const screen = container.querySelector('.screen');
		if (screen) screen.classList.add('visible');
	}
}