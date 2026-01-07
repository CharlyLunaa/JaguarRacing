// Variable global para controlar el observador entre navegaciones
let carruselObserver = null;

document.addEventListener('astro:page-load', () => {
    // 1. SELECTORES Y VALIDACIÓN
    const carrusel = document.getElementById('carruselAreas');
    if (!carrusel) return; 

    const btnPrev = document.getElementById('btn-prev'); 
    const btnNext = document.getElementById('btn-next');
    const indicadoresContainer = document.getElementById('indicadores');
    
    // Limpiamos indicadores previos por seguridad
    if (indicadoresContainer) indicadoresContainer.innerHTML = '';
    
    const tarjetas = carrusel.querySelectorAll('.area-card');
    if (tarjetas.length === 0) return; // Si no hay tarjetas, no hacemos nada

    // Mapa para relación rápida: Tarjeta DOM -> Punto DOM
    const mapaTarjetaPunto = new Map();
    let puntoActivoActual = null;

    // 2. CREACIÓN DE INDICADORES
    tarjetas.forEach((tarjeta, index) => {
        const punto = document.createElement('div');
        punto.classList.add('indicator-dot');
        
        // El primero activo por defecto
        if (index === 0) {
            punto.classList.add('indicator-dot--active');
            puntoActivoActual = punto;
        }

        // Click en el punto -> Scroll suave a la tarjeta
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

    // 3. NAVEGACIÓN POR FLECHAS
    const moverCarrusel = (direccion) => {
        // Leemos el ancho de la primera tarjeta
        const anchoTarjeta = tarjetas[0].offsetWidth;
        
        // No necesitamos calcular el gap exacto con getComputedStyle (es lento).
        // Al sumar un poco más del ancho, el "scroll-snap" del CSS se encarga del ajuste fino.
        const desplazamiento = anchoTarjeta * 1.05; 

        carrusel.scrollBy({ 
            left: direccion === 'next' ? desplazamiento : -desplazamiento, 
            behavior: 'smooth' 
        });
    };

    if (btnNext) btnNext.addEventListener('click', () => moverCarrusel('next'));
    if (btnPrev) btnPrev.addEventListener('click', () => moverCarrusel('prev'));

    // 4. OBSERVER (La magia del rendimiento)
    const observerOptions = {
        root: carrusel,
        threshold: 0.5 // Con 50% de visibilidad ya cambiamos el punto (más reactivo)
    };

    // Si ya existía un observer previo (caso raro), lo matamos
    if (carruselObserver) carruselObserver.disconnect();

    carruselObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const puntoAActivar = mapaTarjetaPunto.get(entry.target);

                if (puntoAActivar && puntoAActivar !== puntoActivoActual) {
                    // Switch de clases eficiente
                    if (puntoActivoActual) puntoActivoActual.classList.remove('indicator-dot--active');
                    puntoAActivar.classList.add('indicator-dot--active');
                    puntoActivoActual = puntoAActivar;
                }
            }
        });
    }, observerOptions);

    tarjetas.forEach(card => carruselObserver.observe(card));
});

// 5. LIMPIEZA DE MEMORIA (CRÍTICO PARA ASTRO)
document.addEventListener('astro:before-swap', () => {
    if (carruselObserver) {
        carruselObserver.disconnect();
        carruselObserver = null;
    }
});