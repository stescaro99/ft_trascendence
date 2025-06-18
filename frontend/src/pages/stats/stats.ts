import statsHtml from './stats.html?raw';
import { Stats } from '../../model/stats.model';
import './stats.css';

export class StatsPage {
	private stats: Stats;

	constructor() {
		this.render();
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
	}

	private render() {
		const appDiv = document.getElementById('app');
		if (appDiv) {
			appDiv.innerHTML = statsHtml;
		}
	}
}