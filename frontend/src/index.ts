import './style.css';
import {HomePage} from './pages/home/home';
import {IdentificationPage} from './pages/identification/identification';
import {StatsPage} from './pages/stats/stats';
import {LogInPage} from './pages/login/login';
import {ProfilePage} from './pages/profile/profile';
import { GamePage } from './pages/game/game';
import { TournamentPage } from './pages/tournament/tournament';
import { OnlineGamePage } from './pages/online_game/online_game';


console.log("Script caricato");

export let currentLang = 'it';
export function setLang(lang: string) {
  currentLang = lang;
}

const appDiv = document.getElementById('app')!;
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const nickname = params.get('nickname');
const error = params.get('error');
let navigationStack: string[] = [];

export function navigateWithHistory(route: string) {
  const currentRoute = location.hash.slice(1) || '/';
  
  // Aggiungi la route corrente allo stack (se non è già presente)
  if (navigationStack[navigationStack.length - 1] !== currentRoute) {
    navigationStack.push(currentRoute);
  }
  
  console.log('Navigation stack:', navigationStack);
  window.location.hash = route;
}

export function goBack() {
  if (navigationStack.length > 0) {
    const previousRoute = navigationStack.pop();
    console.log('Going back to:', previousRoute);
    window.location.hash = previousRoute || '/';
  } else {
    // Fallback alla home se non c'è storia
    window.location.hash = '/';
  }
}
// Definisci le rotte una volta sola
const routes: Record<string, () => string> = {
  '/': () => {
    if (localStorage.getItem('user')) {
      new HomePage(currentLang);
      return "";
    } else {
      window.location.hash = '/login';
      return "";
    }
  },
  '/identification': () => {
    new IdentificationPage(currentLang);
    return "";
  },
  '/login': () => {
    new LogInPage(currentLang);
    return "";
  },
  '/stats': () => {
    new StatsPage();
    return "";
  },
  '/profile': () => {
    new ProfilePage(currentLang);
    return "";
  },
  '/game': () => {
    console.log('LLLLL navigation stack', navigationStack);
    const fromPage = navigationStack[navigationStack.length - 2] || '/';

    const hash = location.hash.slice(1) || '/';
    const urlParams = hash.split('?')[1]; // Ottieni la parte dopo il '?'
    
    let player1 = localStorage.getItem('nickname') || 'Player 1';
    let player2 = 'Player 2';
    
    // Se ci sono parametri nell'URL, estraili
    if (urlParams) {
        // Formato: /game?Mario_Luigi
        const players = urlParams.split('_');
        if (players.length >= 2) {
            player1 = players[0];
            player2 = players[1];
        }
    }

    new GamePage(currentLang, fromPage, player1, player2);
    return "";
  },
  '/online_game': () => {
    new OnlineGamePage(currentLang);
    return "";
  },
  '/tournament': () => {
    new TournamentPage();
    return "";
  },
};

function router() {
  const hash = location.hash.slice(1) || '/';
  const path = hash.split('?')[0]; 
  console.log("Navigazione verso:", path);
  
  const currentRoute = hash;
    if (navigationStack[navigationStack.length - 1] !== currentRoute) {
      navigationStack.push(currentRoute);
      console.log('Navigation stack updated:', navigationStack);
    }
  // Gestisci la visibilità della navbar
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (localStorage.getItem('user')) {
      navbar.style.display = 'block';
    } else {
      navbar.style.display = 'none';
    }
  }
  
  const render = routes[path];

  if (render) {
    const content = render(); 
    if (content) {
      appDiv.innerHTML = content;
    }
  } else {
    appDiv.innerHTML = `<h1>404</h1><p>Pagina non trovata</p>`;
  }
}

// Gestione errore di autenticazione Google
if (error) {
  console.log('Google auth error detected:', error);
  
  // Controlla se eravamo in attesa di un'autenticazione Google
  const wasGoogleAuthPending = localStorage.getItem('googleAuthPending') === 'true';
  
  if (wasGoogleAuthPending) {
    // Pulisci lo stato di attesa
    localStorage.removeItem('googleAuthPending');
    localStorage.removeItem('googleAuthResolve');
    
    console.log('Processing Google auth error');
    alert('Google login failed: ' + error);
  }
  
  // Reindirizza alla pagina di login
  window.location.hash = '/login';
} else if (token && nickname) {
  console.log('Google auth success detected with token and nickname');
  
  // Controlla se eravamo in attesa di un'autenticazione Google
  const wasGoogleAuthPending = localStorage.getItem('googleAuthPending') === 'true';
  
  if (wasGoogleAuthPending) {
    // Pulisci lo stato di attesa
    localStorage.removeItem('googleAuthPending');
    localStorage.removeItem('googleAuthResolve');
    
    console.log('Processing Google auth success');
  }
  
  // Salva i dati nel localStorage
  localStorage.setItem('user', JSON.stringify({ token }));
  localStorage.setItem('nickname', nickname);
  
  // Mostra la navbar ora che l'utente è autenticato
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.style.display = 'block';
  }
  
  // Pulisci l'URL dai parametri e naviga alla home
  window.history.replaceState({}, document.title, window.location.pathname);
  window.location.hash = '/';
  
  console.log('Authentication completed, navigating to home');
  
  // Forza il routing dopo un breve delay per assicurarsi che tutto sia impostato
  setTimeout(() => {
    router();
  }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  const powerBtn = document.getElementById('powerBtn');
  if (powerBtn) {
	powerBtn.addEventListener('click', () => {
	  localStorage.removeItem('user');
	  localStorage.removeItem('nickname');
	  // Nascondi la navbar
	  const navbar = document.getElementById('navbar');
	  if (navbar) {
	    navbar.style.display = 'none';
	  }
	  window.location.hash = '/login';
	});
  }
});

window.addEventListener('hashchange', router);
window.addEventListener('load', router);