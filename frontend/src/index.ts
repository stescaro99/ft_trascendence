import './style.css';
import { HomePage } from './pages/home/home';
import { IdentificationPage } from './pages/identification/identification';
import { StatsPage } from './pages/stats/stats';
import { LogInPage } from './pages/login/login';
import { ProfilePage } from './pages/profile/profile';
import { GamePage } from './pages/game/game';
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
    new GamePage(currentLang);
    return "";
  },
  '/online_game': () => {
    new OnlineGamePage(currentLang);
    return "";
  }
};

function router() {
  const hash = location.hash.slice(1) || '/';
  const path = hash.split('?')[0]; 
  console.log("Navigazione verso:", path);
  
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