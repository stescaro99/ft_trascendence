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

if (token && nickname) {
  localStorage.setItem('user', JSON.stringify({ token }));
  localStorage.setItem('nickname', nickname);
  window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
}

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