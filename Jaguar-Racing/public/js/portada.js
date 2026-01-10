let slideInterval; // Variable global para controlar el timer

// Función que inicia todo
const startHeroSlider = () => {
    // 1. Limpieza preventiva: Si ya había un timer corriendo, mátalo.
    if (slideInterval) clearInterval(slideInterval);

    const slides = document.querySelectorAll('.bg-slide');
    const intervalTime = 4000;
    let currentSlide = 0;

    // Si no hay slides o solo hay 1, no hacemos nada
    if (slides.length <= 1) return;

    const nextSlide = () => {
        // Verificamos que el elemento siga existiendo en el DOM antes de tocarlo
        if (!slides[currentSlide]) return;

        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    };

    // Guardamos el ID del intervalo para poder limpiarlo después
    slideInterval = setInterval(nextSlide, intervalTime);
};

// ESCUCHAMOS EL EVENTO DE ASTRO, NO EL DEL NAVEGADOR
document.addEventListener('astro:page-load', startHeroSlider);

// (Opcional) Si por alguna razón astro:page-load falla en tu versión,
// este respaldo asegura que funcione en la primera carga:
if (!window.astroSliderInitialized) {
    startHeroSlider();
    window.astroSliderInitialized = true;
}