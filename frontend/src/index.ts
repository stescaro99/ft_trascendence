/**
 * Versione vecchia, about non funzionava.
 * Il router si aspetta una stringa con l'html dentro, ma veniva ritornata un classe intera
 */

/* import homePage from './home/home';
import autentificationPage from './identification/identification';

console.log("Script caricato");

const appDiv = document.getElementById('app')!;

const routes: Record<string, () => string> = {
  '/': homePage,
  '/about': autentificationPage,
};

function router() {
  const path = location.hash.slice(1) || '/';
  console.log("Navigazione verso:", path);
  const render = routes[path];
  appDiv.innerHTML = render ? render() : `<h1>404</h1><p>Pagina non trovata</p>`;
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router); */

import homePage from './home/home';
import autentificationPage from './identification/identification';

console.log("Script caricato");

const appDiv = document.getElementById('app')!;

const routes: Record<string, () => string> = {
  '/': homePage,
  '/register': autentificationPage,
};

function router() {
  const path = location.hash.slice(1) || '/';
  console.log("Navigazione verso:", path);
  const render = routes[path];
  appDiv.innerHTML = render ? render() : `<h1>404</h1><p>Pagina non trovata</p>`;
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);