document.addEventListener('astro:page-load', () => {
    // 1. SELECTORES Y SEGURIDAD
    // ID 'carruselAreas' se mantuvo en el HTML, así que este sigue funcionando
    const carrusel = document.getElementById('carruselAreas');
    if (!carrusel) return; 

    // Actualizamos selectores a los nuevos IDs que pusimos en el HTML
    const btnPrev = document.getElementById('btn-prev'); 
    const btnNext = document.getElementById('btn-next');
    const indicadoresContainer = document.getElementById('indicadores');
    if (indicadoresContainer) indicadoresContainer.innerHTML = '';
    
    // CAMBIO IMPORTANTE: Clase antigua .tarjeta-patrocinador -> Nueva .area-card
    const tarjetas = carrusel.querySelectorAll('.area-card');

    // Mapa para relacionar Tarjeta HTML -> Punto HTML
    const mapaTarjetaPunto = new Map();
    let puntoActivoActual = null;

    // 2. CREACIÓN DE INDICADORES (PUNTOS)
    tarjetas.forEach((tarjeta, index) => {
        const punto = document.createElement('div');
        // Clase antigua .punto -> Nueva .indicator-dot
        punto.classList.add('indicator-dot');
        
        // El primero nace activo
        if (index === 0) {
            // Clase antigua .activo -> Nueva .indicator-dot--active
            punto.classList.add('indicator-dot--active');
            puntoActivoActual = punto;
        }

        punto.addEventListener('click', () => {
            tarjeta.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest', 
                inline: 'center' 
            });
        });

        indicadoresContainer.appendChild(punto);
        mapaTarjetaPunto.set(tarjeta, punto);
    });

    // 3. FUNCIÓN DE FLECHAS
    const moverCarrusel = (direccion) => {
        const anchoTarjeta = tarjetas[0].offsetWidth;
        const estiloContainer = window.getComputedStyle(carrusel);
        const gap = parseFloat(estiloContainer.gap) || 20;
        const desplazamiento = anchoTarjeta + gap;

        carrusel.scrollBy({ 
            left: direccion === 'next' ? desplazamiento : -desplazamiento, 
            behavior: 'smooth' 
        });
    };

    if (btnNext) btnNext.addEventListener('click', () => moverCarrusel('next'));
    if (btnPrev) btnPrev.addEventListener('click', () => moverCarrusel('prev'));

    // 4. OBSERVER OPTIMIZADO
    const observerOptions = {
        root: carrusel,
        threshold: 0.6
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const puntoAActivar = mapaTarjetaPunto.get(entry.target);

                if (puntoAActivar && puntoAActivar !== puntoActivoActual) {
                    // Intercambio de clases actualizado
                    if (puntoActivoActual) puntoActivoActual.classList.remove('indicator-dot--active');
                    puntoAActivar.classList.add('indicator-dot--active');
                    
                    puntoActivoActual = puntoAActivar;
                }
            }
        });
    }, observerOptions);

    tarjetas.forEach(card => observer.observe(card));
});