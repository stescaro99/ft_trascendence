import homeHtml from './home.html?raw';
import '../../style.css';
import { User } from '../../model/user.model';
import { UserService } from '../../service/user.service';
import './home.css';

export class HomePage {
	user: User | null;
	userService: UserService = new UserService();

	constructor() {
		this.user = this.userService.getUser();
		this.render();
		this.setTheme('blue');
		this.initializeBall();
        this.addEventListeners();
		
		const logoutButton = document.getElementById('logoutButton');
		if (logoutButton) {
			logoutButton.addEventListener('click', () => {
				localStorage.removeItem('user');
				window.location.hash = '/identification'; // o dove vuoi reindirizzare
			});
		}
	}

    private addEventListeners() {
         const playBtn = document.getElementById('playButton');
       if (!playBtn) return;

        let extensionDiv: HTMLDivElement | null = null;

        playBtn.addEventListener('click', function handler() {
            if (extensionDiv) {
                extensionDiv.remove();
                extensionDiv = null;
                playBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                return;
            }

           extensionDiv = document.createElement('div');
            extensionDiv.className = "flex flex-col gap-2 mt-2 w-full items-center";

            // Contenitore riga per i due bottoni
            const rowDiv = document.createElement('div');
            rowDiv.className = "flex flex-row gap-2 w-full justify-center";

            // Bottone 2 Giocatori
            const btn2 = document.createElement('button');
            btn2.className = "text-white w-1/2 bg-c-400 text-center identification block rounded-lg py-2";
            btn2.textContent = "2 Giocatori";
            btn2.onclick = (e) => {
                e.stopPropagation();
                console.log("2 Giocatori premuto!");
                window.location.hash = '#/game';
            };

            // Bottone 4 Giocatori
            const btn4 = document.createElement('button');
            btn4.className = "text-white w-1/2 bg-c-400 text-center identification block rounded-lg py-2";
            btn4.textContent = "4 Giocatori";
            btn4.onclick = (e) => {
                e.stopPropagation();
                alert("4 Giocatori premuto!");
            };

            rowDiv.appendChild(btn2);
            rowDiv.appendChild(btn4);
            extensionDiv.appendChild(rowDiv);

            playBtn.parentElement?.insertBefore(extensionDiv, playBtn.nextSibling);

            // Cambia solo lo stile, NON disabilitare il bottone!
            playBtn.classList.add('opacity-50');
        });
    }

	private render() {
		const appDiv = document.getElementById('app');
		if (appDiv) {
			appDiv.innerHTML = homeHtml;
		}
	}

	private setTheme(theme: string) {
		const element = document.querySelector('[data-theme]') as HTMLElement;

		element.dataset.theme = theme;
	}

	/* Animazione pallina pong per background */
	private initializeBall() {
		
        class BouncingBall {
            ball: HTMLElement | null;
            container: HTMLElement | null;
            x: number;
            y: number;
            vx: number;
            vy: number;
            ballSize: number;
            isRunning: boolean;
            animationId: number | null;
            colors: string[];
            currentColorIndex: number;

            constructor() {
                this.ball = document.getElementById('ball');
                this.container = document.getElementById('animation_container');
                
                if (!this.ball || !this.container) {
                    console.error('Ball or container element not found');
                    return;
                }

                this.colors = [
                    'rgb(37, 99, 235)',   // blue
                    'rgb(239, 68, 68)',   // red
                    'rgb(34, 197, 94)',   // green
                    'rgb(168, 85, 247)',  // purple
                    'rgb(245, 158, 11)',  // amber
                    'rgb(236, 72, 153)',  // pink
                    'rgb(20, 184, 166)',  // teal
                    'rgb(251, 146, 60)'   // orange
                ];
                this.currentColorIndex = 0;
                
                this.x = 50;
                this.y = 50;
                this.vx = 3;
                this.vy = 2;
                this.ballSize = 40;
                this.isRunning = false;
                this.animationId = null;
                
                this.updatePosition();
            }
            
            updatePosition() {
                if (this.ball) {
                    this.ball.style.left = this.x + 'px';
                    this.ball.style.top = this.y + 'px';
                }
            }

            changeColor() {
                this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
                const newColor = this.colors[this.currentColorIndex];
                
                if (this.ball) {
                    this.ball.style.background = newColor;
                    this.ball.style.boxShadow = `0 0 10px ${newColor}, 0 0 20px ${newColor}, 0 0 30px ${newColor}`;
                }
            }
            
            checkCollisions() {
                if (!this.container) return;
                let collisionOccurred = false;
                
                const containerWidth = this.container.clientWidth;
                const containerHeight = this.container.clientHeight;
                
                if (this.x <= 0 || this.x >= containerWidth - this.ballSize) {
                    this.vx = -this.vx;
                    collisionOccurred = true;
                    if (this.x <= 0) this.x = 0;
                    if (this.x >= containerWidth - this.ballSize) {
                        this.x = containerWidth - this.ballSize;
                    }
                }
                
                if (this.y <= 0 || this.y >= containerHeight - this.ballSize) {
                    this.vy = -this.vy;
                    collisionOccurred = true;
                    if (this.y <= 0) this.y = 0;
                    if (this.y >= containerHeight - this.ballSize) {
                        this.y = containerHeight - this.ballSize;
                    }
                }

                if (collisionOccurred) {
                    this.changeColor();
                }
            }
            
            animate() {
                if (!this.isRunning) return;
                
                this.x += this.vx;
                this.y += this.vy;
                this.checkCollisions();
                this.updatePosition();
                
                this.animationId = requestAnimationFrame(() => this.animate());
            }
            
            start() {
                if (!this.isRunning) {
                    this.isRunning = true;
                    this.animate();
                    console.log('Ball animation started');
                }
            }
            
            stop() {
                this.isRunning = false;
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
            }
        }

        setTimeout(() => {
            const ballElement = document.getElementById('ball');
            const containerElement = document.getElementById('animation_container');
            
            if (ballElement && containerElement) {
                this.bouncingBall = new BouncingBall();
                this.bouncingBall.start();
            } else {
                console.error("Ball or container element not found");
            }
        }, 100);
    }
}
