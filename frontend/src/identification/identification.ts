import autentificationHtml from './identification.html?raw';
import '../style.css';

export class IdentificationPage {
     constructor() {
    this.render();
    this.addEventListeners();
  }

  private render() {
    document.body.innerHTML = autentificationHtml;
  }

  private handleSubmit(event: Event) {
    event.preventDefault();
    // Logica di autenticazione qui
    alert('Form inviato!');
  }

  private addEventListeners() {
    const form = document.querySelector('#login-form');
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }
}