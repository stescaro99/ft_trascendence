import aboutPage from './routes/about.js';

console.log("Script caricato");

const appDiv = document.getElementById('app')!;

const routes: Record<string, () => string> = {
  '/': () => `
    <h1>Home</h1>
    <p>Benvenuto nella pagina principale.</p>
  `,
  '/about': aboutPage,
};

function router() {
  const path = location.hash.slice(1) || '/';
  console.log("Navigazione verso:", path);
  const render = routes[path];
  appDiv.innerHTML = render ? render() : `<h1>404</h1><p>Pagina non trovata</p>`;
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);