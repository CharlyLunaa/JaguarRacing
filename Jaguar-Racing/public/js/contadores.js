// Variable global persistente entre navegaciones de Astro
let intervalosActivos = [];

// Función de limpieza separada para mayor orden
const limpiarIntervalos = () => {
    intervalosActivos.forEach(id => clearInterval(id));
    intervalosActivos = [];
};

document.addEventListener('astro:page-load', () => {
    // 1. LIMPIEZA: Matamos contadores previos
    limpiarIntervalos();

    // 2. CONFIGURACIÓN DE FECHAS (2026)
    // Nota: Usamos Date.UTC o timestamps directos si es posible para evitar líos de zona horaria,
    // pero tu método actual funciona bien para local.
    const fechaIPN = new Date(2026, 1, 3, 7, 0, 0).getTime();
    const fechaAnoNuevo = new Date(2026, 0, 1, 0, 0, 0).getTime();

    // 3. INICIALIZAR
    iniciarContador('timer-usa', fechaIPN);      
    iniciarContador('timer-mexico', fechaAnoNuevo); 
});

// Limpieza extra por seguridad antes de cambiar de página (Astro View Transitions)
document.addEventListener('astro:before-swap', limpiarIntervalos);

function iniciarContador(idElemento, fechaLimite) {
    const elemento = document.getElementById(idElemento);
    if (!elemento) return; 

    // Función de actualización extraída para poder llamarla inmediatamente
    // y no esperar 1 segundo al primer render
    const actualizar = () => {
        // OPTIMIZACIÓN: Date.now() es más rápido que new Date().getTime()
        const ahora = Date.now(); 
        const distancia = fechaLimite - ahora;

        if (distancia < 0) {
            // Buscamos el intervalo en el array para limpiarlo específicamente
            // (aunque la limpieza global se encarga, esto es buena práctica)
            elemento.innerHTML = "¡FINALIZADO!";
            elemento.style.color = "var(--jaguar-gold)";
            return false; // Indicamos que terminó
        }

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        // Formateo simple
        const d = dias < 10 ? "0" + dias : dias;
        const h = horas < 10 ? "0" + horas : horas;
        const m = minutos < 10 ? "0" + minutos : minutos;
        const s = segundos < 10 ? "0" + segundos : segundos;

        // OPTIMIZACIÓN: textContent es ligeramente más rápido que innerHTML si no hay tags HTML dentro
        elemento.textContent = `${d}d ${h}h ${m}m ${s}s`;
        return true;
    };

    // Ejecutar una vez al inicio para evitar que se vea vacío por 1 segundo
    if (actualizar()) {
        const intervalo = setInterval(() => {
            const continua = actualizar();
            if (!continua) clearInterval(intervalo);
        }, 1000);
        
        intervalosActivos.push(intervalo);
    }
}