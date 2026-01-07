document.addEventListener('astro:page-load', () => {
    // 1. VALIDACIÓN DE SEGURIDAD
    const btn = document.getElementById('reaction-btn');
    if (!btn) return; // Si no hay botón, no ejecutamos nada (evita errores en otras páginas)

    // --- SELECTORES DOM ---
    const lights = document.querySelectorAll('.light');
    const resultDisplay = document.getElementById('reaction-result');
    const btnText = btn.querySelector('.btn-text');
    const bestTimeDisplay = document.getElementById('best-time-display');
    const rankDisplay = document.getElementById('player-rank');

    // --- ESTADO DEL JUEGO ---
    let gameState = 'idle';
    let startTime = 0;
    let timeoutIds = [];
    let randomDelayTimeout;

    // --- CARGAR RÉCORD ---
    let personalBest = localStorage.getItem('jaguarReactionRecord');
    if (personalBest) {
        personalBest = parseFloat(personalBest);
        bestTimeDisplay.textContent = `${personalBest} ms`;
    } else {
        personalBest = 9999;
        bestTimeDisplay.textContent = "--";
    }

    function resetGame() {
        lights.forEach(l => l.classList.remove('red', 'green'));
        resultDisplay.style.color = '#A67C00';
        resultDisplay.textContent = '0.000 ms';
        btn.classList.remove('penalty');
        btn.style.backgroundColor = '#A67C00';

        if (rankDisplay) {
            rankDisplay.textContent = "---";
            rankDisplay.className = "rank-badge";
        }

        timeoutIds.forEach(id => clearTimeout(id));
        clearTimeout(randomDelayTimeout);
        timeoutIds = [];
    }

    function startGame() {
        if (gameState === 'waiting') {
            gameState = 'idle';
            resultDisplay.textContent = "¡SALIDA EN FALSO!";
            resultDisplay.style.color = "red";
            btn.classList.add('penalty');
            btnText.textContent = "REINTENTAR";
            rankDisplay.textContent = "DESCALIFICADO 🚫";
            rankDisplay.className = "rank-badge rank-slow";
            resetGameVisualsOnly();
            return;
        }

        if (gameState === 'green' || gameState === 'result') {
            gameState = 'idle';
            resetGame();
            btnText.textContent = "INICIAR MOTOR";
            return;
        }

        gameState = 'waiting';
        resetGame();
        btnText.textContent = "ESPERA...";

        let delay = 0;
        lights.forEach((light, index) => {
            delay += 800;
            let id = setTimeout(() => {
                light.classList.add('red');
            }, delay);
            timeoutIds.push(id);
        });

        const randomTime = Math.floor(Math.random() * 3000) + 1000;
        randomDelayTimeout = setTimeout(() => {
            if (gameState === 'waiting') goGreen();
        }, delay + randomTime);
    }

    function goGreen() {
        gameState = 'green';
        startTime = performance.now();
        lights.forEach(l => {
            l.classList.remove('red');
            l.classList.add('green');
        });
        btnText.textContent = "¡CLICK!";
        btn.style.backgroundColor = "#00ff00";
    }

    function handleReaction() {
        if (gameState === 'green') {
            const reactionTime = parseFloat((performance.now() - startTime).toFixed(0));
            resultDisplay.textContent = `${reactionTime} ms`;

            let rankClass = '';
            let rankTitle = '';

            if (reactionTime < 360) {
                rankTitle = "JAGUAR LEGEND 🐆";
                rankClass = "rank-legend";
                resultDisplay.style.color = "#FFD700";
            } else if (reactionTime < 450) {
                rankTitle = "PILOTO F1 🏎️";
                rankClass = "rank-pro";
                resultDisplay.style.color = "#00ff00";
            } else if (reactionTime < 600) {
                rankTitle = "CONDUCTOR PROMEDIO 🚗";
                rankClass = "rank-avg";
                resultDisplay.style.color = "#fff";
            } else {
                rankTitle = "ABUELITA AL VOLANTE 🐢";
                rankClass = "rank-slow";
                resultDisplay.style.color = "#ff4444";
            }

            rankDisplay.textContent = rankTitle;
            rankDisplay.className = `rank-badge ${rankClass}`;

            if (reactionTime < personalBest) {
                personalBest = reactionTime;
                localStorage.setItem('jaguarReactionRecord', personalBest);
                bestTimeDisplay.textContent = `${personalBest} ms (¡NUEVO!)`;
                bestTimeDisplay.style.color = "#FFD700";
            } else {
                bestTimeDisplay.textContent = `${personalBest} ms`;
                bestTimeDisplay.style.color = "#A67C00";
            }

            btnText.textContent = "JUGAR OTRA VEZ";
            btn.style.backgroundColor = "#A67C00";
            gameState = 'result';
        } else {
            startGame();
        }
    }

    function resetGameVisualsOnly() {
        timeoutIds.forEach(id => clearTimeout(id));
        clearTimeout(randomDelayTimeout);
        lights.forEach(l => l.classList.remove('red', 'green'));
    }

    // Usamos onclick para asegurar que solo haya un listener activo
    // Esto evita que el juego se "vuelva loco" al navegar varias veces al inicio
    btn.onclick = handleReaction;
});