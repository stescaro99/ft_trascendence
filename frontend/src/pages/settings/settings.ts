import settingsHtml from './settings.html?raw';
import '../../style.css';
import './settings.css';

export class SettingsPage {

    constructor() {

         this.render();
         this.setTheme('cyan');
    }

    private render() {
		const appDiv = document.getElementById('app');
		if (appDiv) {
		
			appDiv.innerHTML = settingsHtml;
		}
	}

    private setTheme(theme: string) {
		const element = document.querySelector('[data-theme]') as HTMLElement;

		element.dataset.theme = theme;
	}
}