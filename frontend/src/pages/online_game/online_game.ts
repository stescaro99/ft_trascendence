import onlineGameHtml from './onlineGame.html?raw';
import { UserService } from '../../service/user.service';
import { User } from '../../model/user.model';
import { TranslationService } from '../../service/translation.service';
import { RemoteController } from "./RemoteController";
import { MultiplayerService } from '../../services/multiplayerService';

window.addEventListener("DOMContentLoaded", () => {
	const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
	const status = document.getElementById("status")!;
	const matchInfo = document.getElementById("matchInfo")!;

	MultiplayerService.connect();

	MultiplayerService.onGameStart(() => {
		status.textContent = "🎉 Partita trovata!";
		matchInfo.classList.remove("hidden");
		canvas.classList.remove("hidden");

		new RemoteController("gameCanvas");
	});
});

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