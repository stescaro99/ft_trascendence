import {HomePage} from './home/home';
import {IdentificationPage} from './identification/identification';

console.log("Script caricato");

const appDiv = document.getElementById('app')!;

const routes: Record<string, () => string> = {
  '/': () => {
    if (localStorage.getItem('user')) {
      new HomePage();
	  return "";
    } else {
      new IdentificationPage();
      return "";
    }
  },
  '/identification': () => {
    new IdentificationPage();
    return "";
  },
};

function router() {
  const path = location.hash.slice(1) || '/';
  console.log("Navigazione verso:", path);
  const render = routes[path];
  appDiv.innerHTML = render ? render() : `<h1>404</h1><p>Pagina non trovata</p>`;
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);