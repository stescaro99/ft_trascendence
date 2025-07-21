import tournamentHtml from './tournament.html?raw';
import { Tournament } from '../../model/touranment.model';

export class TournamentPage {
    private tournament: Tournament = new Tournament();


	private render() {
		const appDiv = document.getElementById('app');

		if (appDiv) {
			appDiv.innerHTML = tournamentHtml;
			}
		}
	private addEventListeners() {
		const tournamentList = document.getElementById('tournamentList') as HTMLSelectElement;

		if (tournamentList) {
			tournamentList.addEventListener('change', (event) => {
				 const selectedPlayers = parseInt((event.target as HTMLSelectElement).value);
				console.log('Selected players:', selectedPlayers);
				
				     
                this.generatePlayerInputs(selectedPlayers);
            });
        }
    }

    private generatePlayerInputs(totalPlayers: number) {
        const tournamentName = document.getElementById('tournamentName');
        if (!tournamentName) return;

        // Svuota il contenitore
        tournamentName.innerHTML = '';

        if (totalPlayers > 0) {
            // Aggiungi un titolo
            const title = document.createElement('h3');
            title.className = 'text-white text-xl font-bold mb-4 text-center';
            title.textContent = 'Partecipanti al torneo:';
            tournamentName.appendChild(title);

            // Container per gli input con scroll
            const inputsContainer = document.createElement('div');
            inputsContainer.className = 'max-h-96 overflow-y-auto w-full space-y-4 mb-6';

            // PRIMO GIOCATORE: Utente loggato (readonly)
            const firstPlayerWrapper = document.createElement('div');
            firstPlayerWrapper.className = 'mb-4';

            const firstLabel = document.createElement('label');
            firstLabel.className = 'block text-white text-lg font-bold mb-2';
            firstLabel.textContent = 'Giocatore 1 (Tu):';
            firstLabel.setAttribute('for', 'player1');

            const firstInput = document.createElement('input');
            firstInput.type = 'text';
            firstInput.id = 'player1';
            firstInput.name = 'player1';
            firstInput.className = 'w-full px-4 py-2 text-gray-600 bg-gray-200 border border-gray-300 rounded-lg cursor-not-allowed';
            firstInput.value = localStorage.getItem('nickname') || 'Player 1';
            firstInput.readOnly = true; // Non modificabile

            firstPlayerWrapper.appendChild(firstLabel);
            firstPlayerWrapper.appendChild(firstInput);
            inputsContainer.appendChild(firstPlayerWrapper);

            // ALTRI GIOCATORI: Input modificabili
            for (let i = 2; i <= totalPlayers; i++) {
                const inputWrapper = document.createElement('div');
                inputWrapper.className = 'mb-4';

                const label = document.createElement('label');
                label.className = 'block text-white text-lg font-bold mb-2';
                label.textContent = `Giocatore ${i}:`;
                label.setAttribute('for', `player${i}`);

                const input = document.createElement('input');
                input.type = 'text';
                input.id = `player${i}`;
                input.name = `player${i}`;
                input.className = 'w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500';
                input.placeholder = `Nome del giocatore ${i}`;

                inputWrapper.appendChild(label);
                inputWrapper.appendChild(input);
                inputsContainer.appendChild(inputWrapper);
            }

            tournamentName.appendChild(inputsContainer);

            // Aggiungi un pulsante per iniziare il torneo
            const startButton = document.createElement('button');
            startButton.className = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg mt-4 w-full';
            startButton.textContent = 'Inizia Torneo';
            startButton.addEventListener('click', () => this.startTournament(totalPlayers));
            tournamentName.appendChild(startButton);
        }
    }

    private startTournament(totalPlayers: number) {
    let playerNames: string[] = [];
    
        for (let i = 1; i <= totalPlayers; i++) {
            const input = document.getElementById(`player${i}`) as HTMLInputElement;
            if (input && input.value.trim()) {
                playerNames.push(input.value.trim());
            } else {
                playerNames.push(`Player ${i}`); // Nome di default se vuoto
            }
        }   
        console.log('Tournament players:', playerNames);
        playerNames = this.ramdomizeArray(playerNames);
        console.log('Shuffled players:', playerNames);

        this.tournament.players = playerNames;
        for (let i = 0; i < playerNames.length; i += 2) {
            if (i + 1 < playerNames.length) {
                this.tournament.games.push([playerNames[i], playerNames[i + 1]]);
            }
        }
        this.tournament.number_of_players = playerNames.length;
        this.tournament.currentGameIndex = 0; // Aggiungi questa proprietà al modello
        this.tournament.results = []; // Per salvare i risultati
    

        localStorage.setItem('activeTournament', JSON.stringify(this.tournament));
        
        // Avvia la prima partita
        this.startNextGame();
    }

    private startNextGame() {
        const currentIndex = this.tournament.currentGameIndex || 0;
        
        if (currentIndex < this.tournament.games.length) {
            const currentGame = this.tournament.games[currentIndex];
            console.log(`Starting game ${currentIndex + 1}: ${currentGame[0]} vs ${currentGame[1]}`);
            
            // Salva che siamo in modalità torneo
            localStorage.setItem('tournamentMode', 'true');
            localStorage.setItem('currentGameIndex', currentIndex.toString());
            
            // Vai alla partita
            window.location.hash = `#/game?players=2&player1=${encodeURIComponent(currentGame[0])}&player2=${encodeURIComponent(currentGame[1])}&tournament=true`;
        } else {
            // Torneo finito, mostra risultati
            this.showTournamentResults();
        }
    }

    public onGameFinished(winner: string) {
    const tournament = JSON.parse(localStorage.getItem('activeTournament') || '{}');
    const currentIndex = parseInt(localStorage.getItem('currentGameIndex') || '0');
    
    // Salva il risultato
    if (!tournament.results) tournament.results = [];
    tournament.results.push({
        game: tournament.games[currentIndex],
        winner: winner
    });
    
    // Aggiorna l'indice
    tournament.currentGameIndex = currentIndex + 1;
    
    // Salva lo stato aggiornato
    localStorage.setItem('activeTournament', JSON.stringify(tournament));
    
    // Torna alla pagina del torneo per la prossima partita
    window.location.hash = '#/tournament?continue=true';
}

private showTournamentResults() {
    const results = this.tournament.results || [];
    
    // Pulisci il localStorage del torneo
    localStorage.removeItem('activeTournament');
    localStorage.removeItem('tournamentMode');
    localStorage.removeItem('currentGameIndex');
    
    // Mostra i risultati nella UI
    const tournamentName = document.getElementById('tournamentName');
    if (tournamentName) {
        tournamentName.innerHTML = `
            <div class="text-center">
                <h2 class="text-white text-2xl font-bold mb-6">🏆 Risultati Torneo</h2>
                <div class="space-y-4">
                    ${results.map((result, index) => `
                        <div class="bg-gray-800 p-4 rounded-lg">
                            <h3 class="text-white font-bold">Partita ${index + 1}</h3>
                            <p class="text-gray-300">${result.game[0]} vs ${result.game[1]}</p>
                            <p class="text-green-400 font-bold">Vincitore: ${result.winner}</p>
                        </div>
                    `).join('')}
                </div>
                <button id="newTournamentBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg mt-6">
                    Nuovo Torneo
                </button>
            </div>
        `;
        
        // Aggiungi listener per nuovo torneo
        const newTournamentBtn = document.getElementById('newTournamentBtn');
        if (newTournamentBtn) {
            newTournamentBtn.addEventListener('click', () => {
                window.location.hash = '#/tournament';
            });
        }
    }
}

// Metodo da chiamare nel costruttore per gestire la continuazione del torneo
private checkTournamentContinuation() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const continueParam = params.get('continue');
    
    if (continueParam === 'true') {
        const tournamentData = localStorage.getItem('activeTournament');
        if (tournamentData) {
            this.tournament = JSON.parse(tournamentData);
            this.startNextGame();
        }
    }
}

    constructor() {
        console.log('🔍 TournamentPage Debug:');
        this.render();
        this.addEventListeners();
        this.checkTournamentContinuation(); // Aggiungi questa chiamata
    }

    ramdomizeArray(array: any[]): any[] {
    
        const size = array.length;
        const shuffled = [...array];
        const rand = Math.floor(Math.random() * size + Math.random());
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }
}
