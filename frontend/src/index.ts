import './style.css';
import {HomePage} from './pages/home/home';
import {IdentificationPage} from './pages/identification/identification';
import {StatsPage} from './pages/stats/stats';
import {LogInPage} from './pages/login/login';
import {ProfilePage} from './pages/profile/profile';

console.log("Script caricato");

const appDiv = document.getElementById('app')!;

const routes: Record<string, () => string> = {
  '/': () => {
    /* Uncomment to make redirection work */
    // if (localStorage.getItem('user')) {
    //   new HomePage();
	  // return "";
    // } else {
    //   new IdentificationPage();
    //   return "";
    // }
    new HomePage();
	  return "";
  },
  '/identification': () => {
    new IdentificationPage();
    return "";
  },
  '/login': () => {
    new LogInPage();
    return "";
  },
  '/stats': () => {
    new StatsPage();
    return "";
  },
  '/profile': () => {
    new ProfilePage();
    return "";
  }
};

function router() {
  const path = location.hash.slice(1) || '/';
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

// if (render) {
//   const content = render(); // This calls new HomePage() or new IdentificationPage()
//   // Don't set innerHTML if content is empty (let the classes handle rendering)
//   if (content) {
//     appDiv.innerHTML = content;
//   }
// } else {
//   // Only set innerHTML for 404 pages
//   appDiv.innerHTML = `<h1>404</h1><p>Pagina non trovata</p>`;
// }