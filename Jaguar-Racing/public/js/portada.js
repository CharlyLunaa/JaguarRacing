class HeroSlider extends HTMLElement {
    constructor() {
        super();
        this.interval = null;
        this.slides = [];
        this.currentIndex = 0;
    }

    connectedCallback() {
        this.slides = this.querySelectorAll('.bg-slide');
        if (this.slides.length <= 1) return;
        this.startSlider(4000);
    }

    disconnectedCallback() {
        this.stopSlider();
    }

    startSlider(time) {
        this.stopSlider();
        this.interval = setInterval(() => this.nextSlide(), time);
    }

    stopSlider() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    nextSlide() {
        this.slides[this.currentIndex].classList.remove('active');
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.slides[this.currentIndex].classList.add('active');
    }
}

if (!customElements.get('hero-slider')) {
    customElements.define('hero-slider', HeroSlider);
}