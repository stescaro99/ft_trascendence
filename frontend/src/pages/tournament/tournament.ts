import tournamentHtml from './tournament.html?raw';

export class TournamentPage {
	constructor() {
		console.log('🔍 TournamentPage Debug:');
		this.render();
		this.addEventListeners();
	}

	private render() {
		const appDiv = document.getElementById('app');

		if (appDiv) {
			appDiv.innerHTML = tournamentHtml;


				// Here you can handle the sele
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
    const playerNames: string[] = [];
    
    // Raccogli TUTTI i nomi dei giocatori (incluso il primo)
    for (let i = 1; i <= totalPlayers; i++) {
        const input = document.getElementById(`player${i}`) as HTMLInputElement;
        if (input && input.value.trim()) {
            playerNames.push(input.value.trim());
        } else {
            playerNames.push(`Player ${i}`); // Nome di default se vuoto
        }
    }

        console.log('Tournament players:', playerNames);
        
    }
}
