
interface HomeScreenOptions {
    duration?: number;
    fadeOutDuration?: number;
    welcomeText?: string;
}

export class HomeScreen {
    private element: HTMLElement | null;
    private duration: number;
    private fadeOutDuration: number;
    private isVisible: boolean;
    private welcomeText: string;

    constructor(options: HomeScreenOptions = {}) {
        this.element = document.getElementById('homeScreen');
        this.duration = options.duration || 3000;
        this.fadeOutDuration = options.fadeOutDuration || 1000;
        this.welcomeText = options.welcomeText || '';
        this.isVisible = true;
    }
    
    show() {
        if (!this.element) return;

        const homeScreen_h3 = document.getElementById('homeScreen_h3');
        if (homeScreen_h3) {
            homeScreen_h3.innerText = this.welcomeText;
        }
        
        this.element.classList.remove('fade-out');
        this.element.style.display = 'flex';
        this.isVisible = true;
        
        setTimeout(() => {
            this.hide();
        }, this.duration);
    }
    
    hide() {
        if (!this.element || !this.isVisible) return;
        
        this.element.classList.add('fade-out');
        this.isVisible = false;
        
        setTimeout(() => {
            if (this.element) {
                this.element.style.display = 'none';
            }
        }, this.fadeOutDuration);
    }
}
