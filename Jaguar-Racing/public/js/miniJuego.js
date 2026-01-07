// Variable global para limpiar timeouts si cambias de página
let gameTimeouts = [];

document.addEventListener('astro:page-load', () => {
    const btn = document.getElementById('reaction-btn');
    if (!btn) return;

    // --- DOM ---
    const lights = document.querySelectorAll('.light');
    const resultDisplay = document.getElementById('reaction-result');
    const btnText = btn.querySelector('.btn-text');
    const bestTimeDisplay = document.getElementById('best-time-display');
    const rankDisplay = document.getElementById('player-rank');

    // --- ESTADO ---
    let gameState = 'idle'; // idle, waiting, green, result, fault
    let startTime = 0;
    
    // --- LIMPIEZA INICIAL ---
    resetAllTimeouts();

    // --- CARGAR RÉCORD ---
    let personalBest = localStorage.getItem('jaguarReactionRecord');
    updateBestDisplay(personalBest);

    // --- FUNCIONES ---

    function resetAllTimeouts() {
        gameTimeouts.forEach(id => clearTimeout(id));
        gameTimeouts = [];
    }

    function updateBestDisplay(time) {
        if (time) {
            personalBest = parseFloat(time);
            bestTimeDisplay.textContent = `${personalBest} ms`;
            bestTimeDisplay.style.color = "#A67C00";
        } else {
            personalBest = 9999;
            bestTimeDisplay.textContent = "--";
        }
    }

    function resetVisuals() {
        lights.forEach(l => l.classList.remove('red', 'green'));
        btn.classList.remove('penalty');
        btn.style.backgroundColor = '#A67C00'; 
        btn.style.transform = 'scale(1)';
        resultDisplay.style.color = '#A67C00';
    }

    function fullReset() {
        resetAllTimeouts();
        resetVisuals();
        gameState = 'idle';
        resultDisplay.textContent = '0.000 ms';
        rankDisplay.textContent = "---";
        rankDisplay.className = "rank-badge";
        btnText.textContent = "INICIAR MOTOR";
    }

    function triggerFault() {
        gameState = 'fault';
        resetAllTimeouts(); // Cancelamos la luz verde pendiente
        resetVisuals();
        
        resultDisplay.textContent = "¡SALIDA EN FALSO!";
        resultDisplay.style.color = "#ff4444";
        
        btn.classList.add('penalty');
        btnText.textContent = "REINTENTAR";
        
        rankDisplay.textContent = "DESCALIFICADO 🚫";
        rankDisplay.className = "rank-badge rank-slow";
    }

    function startGameSequence() {
        gameState = 'waiting';
        resetVisuals();
        btnText.textContent = "ESPERA...";
        resultDisplay.textContent = "PREPARADO...";

        let cumulativeDelay = 0;

        // Secuencia de luces rojas (una cada 800ms)
        lights.forEach((light, index) => {
            cumulativeDelay += 800;
            const id = setTimeout(() => {
                // Verificamos que sigamos esperando (por si hubo click anticipado)
                if (gameState === 'waiting') light.classList.add('red');
            }, cumulativeDelay);
            gameTimeouts.push(id);
        });

        // Tiempo aleatorio extra (1s a 4s) antes del verde
        const randomTime = Math.floor(Math.random() * 3000) + 1000;
        const totalWait = cumulativeDelay + randomTime;

        const greenId = setTimeout(() => {
            if (gameState === 'waiting') goGreen();
        }, totalWait);
        gameTimeouts.push(greenId);
    }

    function goGreen() {
        gameState = 'green';
        // PERFORMANCE.NOW() ES CLAVE PARA PRECISIÓN
        startTime = performance.now();
        
        lights.forEach(l => {
            l.classList.remove('red');
            l.classList.add('green');
        });
        
        btnText.textContent = "¡AHORA!";
        btn.style.backgroundColor = "#00ff00";
    }

    function handleInteraction(e) {
        // Prevenir zoom o scroll accidental en móviles al tocar rápido
        if(e.type === 'touchstart') e.preventDefault(); 

        if (gameState === 'idle' || gameState === 'result' || gameState === 'fault') {
            startGameSequence();
        } else if (gameState === 'waiting') {
            triggerFault();
        } else if (gameState === 'green') {
            finishGame();
        }
    }

    function finishGame() {
        gameState = 'result';
        const endTime = performance.now();
        const reactionTime = Math.floor(endTime - startTime); // Entero para limpieza

        resultDisplay.textContent = `${reactionTime} ms`;
        
        // --- LÓGICA DE RANGO ---
        let rankTitle, rankClass, color;

        if (reactionTime < 250) { // Ajustado para ser realista sin lag táctil
            rankTitle = "JAGUAR LEGEND 🐆";
            rankClass = "rank-legend";
            color = "#FFD700";
        } else if (reactionTime < 350) {
            rankTitle = "PILOTO F1 🏎️";
            rankClass = "rank-pro";
            color = "#00ff00";
        } else if (reactionTime < 500) {
            rankTitle = "CONDUCTOR PROMEDIO 🚗";
            rankClass = "rank-avg";
            color = "#fff";
        } else {
            rankTitle = "ABUELITA AL VOLANTE 🐢";
            rankClass = "rank-slow";
            color = "#ff4444";
        }

        rankDisplay.textContent = rankTitle;
        rankDisplay.className = `rank-badge ${rankClass}`;
        resultDisplay.style.color = color;

        // Récord
        if (reactionTime < personalBest) {
            personalBest = reactionTime;
            localStorage.setItem('jaguarReactionRecord', personalBest);
            bestTimeDisplay.textContent = `${personalBest} ms (¡RÉCORD!)`;
            bestTimeDisplay.style.color = "#FFD700";
        }

        btnText.textContent = "JUGAR OTRA VEZ";
        btn.style.backgroundColor = "#A67C00";
    }

    // --- EVENT LISTENERS OPTIMIZADOS ---
    // Removemos onclick para usar pointerdown (respuesta inmediata)
    btn.onclick = null; 
    
    // Soporte híbrido: Pointer Events cubre mouse y touch modernos
    if (window.PointerEvent) {
        btn.onpointerdown = handleInteraction;
    } else {
        // Fallback para navegadores viejos
        btn.ontouchstart = handleInteraction;
        btn.onmousedown = handleInteraction;
    }
});

// LIMPIEZA DE SEGURIDAD AL SALIR DE LA PÁGINA
document.addEventListener('astro:before-swap', () => {
    gameTimeouts.forEach(id => clearTimeout(id));
    gameTimeouts = [];
});