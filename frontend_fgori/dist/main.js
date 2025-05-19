"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const home_1 = require("./routes/home");
const about_1 = require("./routes/about");
const routes = {
    '/': home_1.Home,
    '/about': about_1.About,
};
function router() {
    const app = document.getElementById('app');
    const path = location.hash.slice(1) || '/';
    const route = routes[path];
    if (app && route) {
        app.innerHTML = route();
    }
    else if (app) {
        app.innerHTML = '<h1>404 - Pagina non trovata</h1>';
    }
}
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
