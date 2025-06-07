import statsHtml from './stats.html?raw';


export class StatsPage {

    constructor() {
        this.render();
    }

    private render() {
        const appDiv = document.getElementById('app');
        if (appDiv) {
            appDiv.innerHTML = statsHtml;
        }
    }
}