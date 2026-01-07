// Variable global para rastrear los intervalos y poder limpiarlos
let intervalosActivos = [];

document.addEventListener('astro:page-load', () => {
    // 1. LIMPIEZA: Antes de iniciar, matamos cualquier contador previo
    intervalosActivos.forEach(id => clearInterval(id));
    intervalosActivos = [];

    // 2. CONFIGURACIÓN DE FECHAS (2026)
    // 3 de Febrero
    const fechaIPN = new Date(2026, 1, 3, 7, 0, 0).getTime();
    // 1 de Enero
    const fechaAnoNuevo = new Date(2026, 0, 1, 0, 0, 0).getTime();

    // 3. INICIALIZAR
    iniciarContador('timer-usa', fechaIPN);      
    iniciarContador('timer-mexico', fechaAnoNuevo); 
});

function iniciarContador(idElemento, fechaLimite) {
    const elemento = document.getElementById(idElemento);
    if (!elemento) return; 

    const intervalo = setInterval(() => {
        const ahora = new Date().getTime();
        const distancia = fechaLimite - ahora;

        if (distancia < 0) {
            clearInterval(intervalo);
            elemento.innerHTML = "¡FINALIZADO!";
            elemento.style.color = "var(--jaguar-gold)"; 
            return;
        }

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        const d = dias < 10 ? "0" + dias : dias;
        const h = horas < 10 ? "0" + horas : horas;
        const m = minutos < 10 ? "0" + minutos : minutos;
        const s = segundos < 10 ? "0" + segundos : segundos;

        elemento.innerHTML = `${d}d ${h}h ${m}m ${s}s`;
    }, 1000);

    // Guardamos el ID para poder limpiarlo al cambiar de página
    intervalosActivos.push(intervalo);
}