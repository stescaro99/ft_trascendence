import homeHtml from './home.html?raw';
import '../style.css';
import { User } from '../model/user.model';
import { UserService } from '../service/user.service';

export class HomePage{
	user: User | null;
	userService: UserService = new UserService();
	constructor() {
	this.user = this.userService.getUser();
    this.render();
  }
	private render() {
    document.body.innerHTML = homeHtml;
  }
}
7