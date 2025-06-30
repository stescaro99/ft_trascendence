import './style.css';
import {HomePage} from './pages/home/home';
import {IdentificationPage} from './pages/identification/identification';
import {StatsPage} from './pages/stats/stats';
import {LogInPage} from './pages/login/login';
import {ProfilePage} from './pages/profile/profile';
import { GamePage } from './pages/game/game';


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

// Gestione errore di autenticazione Google
if (error && window.opener) {
  try {
    window.opener.postMessage({
      type: 'GOOGLE_AUTH_ERROR',
      error: error
    }, window.location.origin);
    window.close();
  } catch (postMessageError) {
    console.error('Error sending error message to opener:', postMessageError);
    window.close();
  }
} else if (token && nickname) {
  // Se siamo in una finestra popup, invia i dati alla finestra principale
  if (window.opener) {
    try {
      // Invia i dati di autenticazione alla finestra principale
      window.opener.postMessage({
        type: 'GOOGLE_AUTH_SUCCESS',
        user: { token },
        nickname: nickname
      }, window.location.origin);
      
      // Chiudi la finestra popup
      window.close();
    } catch (error) {
      console.error('Error sending message to opener:', error);
      // Fallback: salva in localStorage e chiudi
      localStorage.setItem('user', JSON.stringify({ token }));
      localStorage.setItem('nickname', nickname);
      window.close();
    }
  } else {
    // Se non siamo in una popup, salva in localStorage e reindirizza
    localStorage.setItem('user', JSON.stringify({ token }));
    localStorage.setItem('nickname', nickname);
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    window.location.hash = '/';
  }
} else {
  // Continua con il normale caricamento della pagina
  const routes: Record<string, () => string> = {
  '/': () => {
	/* Uncomment to make redirection work */
    // if (localStorage.getItem('user')) {
    //   new HomePage(currentLang);
    //   return "";
    // } else {
    //   window.location.hash = '/login';
    //   return "";
    // }
    new HomePage(currentLang);
    return "";
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
	new GamePage(currentLang);
	return "";
  }
};

function router() {
  const hash = location.hash.slice(1) || '/';
  const path = hash.split('?')[0]; 
  console.log("Navigazione verso:", path);
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

document.addEventListener('DOMContentLoaded', () => {
  const powerBtn = document.getElementById('powerBtn');
  if (powerBtn) {
	powerBtn.addEventListener('click', () => {
	  localStorage.removeItem('user');
	  window.location.hash = '/login';
	});
  }
});

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
}