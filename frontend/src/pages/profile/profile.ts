import profileHtml from './profile.html?raw';
import { Stats } from '../../model/stats.model';
import { User } from '../../model/user.model';
import { TranslationService } from '../../service/translation.service';
import './profile.css';
import { setLang } from '../..';

export class ProfilePage {
	private stats: Stats;
	private user: User;
	private currentLang: string;
	
	constructor(lang: string) {
		this.currentLang = lang;
		this.stats = {
			stat_index: 5,
			nickname: 'Ulli',
			number_of_games: 3,
			number_of_wins: 2,
			number_of_losses: 5,
			number_of_draws: 6,
			number_of_points: 7,
			average_score: 3,
			percentage_wins: 4,
			percentage_losses: 50,
			percentage_draws: 8
		}
		this.user = {
			id: 1,
			name: "Bulli",
			nickname: "The Boolers",
			email: "una@email.com",
			password: 'cccp',
			surname: "Alloc",
			language: 'it',
			image_url: './src/utils/images/mr_mime.png',
			stats: this.stats
		}

		this.render();
	}

	private render() {
		const appDiv = document.getElementById('app');

		if (appDiv) {
			const translation = new TranslationService(this.currentLang);
			const translatedHtml = translation.translateTemplate(profileHtml);
			
			appDiv.innerHTML = translatedHtml;
			
			this.setNewLang()
			
			this.showValueProfile("name");
			this.showValueProfile("nickname");
			this.showValueProfile("surname");
			this.showValueProfile("email");
			
			this.showValueStats("number_of_games")
			this.showValueStats("number_of_wins")
			this.showValueStats("number_of_losses")
			this.showValueStats("number_of_draws")
			this.showValueStats("number_of_points")
			this.showValueStats("average_score")
			this.showValueStats("percentage_wins")
			this.showValueStats("percentage_losses")
			this.showValueStats("percentage_draws")
			

			setTimeout(() => {
				const imgElement = document.getElementById('profile_image') as HTMLImageElement;
				imgElement.src = this.user.image_url;
			}, 0);

		}
	}

	private setNewLang() {
		const langBtns = document.querySelectorAll('[data-lang]');
			langBtns.forEach((btn) => {
				const lang = btn.getAttribute('data-lang');
				if (lang) {
					btn.addEventListener('click', () => {
						setLang(lang);
						this.currentLang = lang;
						this.render();
					})
				}
			})
	}

	private showValueStats(property: string) {
		const element = document.getElementById(property);
		if (element) {
			element.textContent = this.stats[property as keyof Stats]?.toString() || '0';
		}
	}

	private showValueProfile(property: string) {
		const id = "profile_" + property;
		const element = document.getElementById(id);
		if (element) {
			element.textContent = this.user[property as keyof User]?.toString() || '-';
		}
	}
}