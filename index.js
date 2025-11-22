// --- Elementos da UI ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const scoreDisplay = document.getElementById('score-display');

// Telas
const menuScreen = document.getElementById('menu-screen');
const hardcoreMenuScreen = document.getElementById('hardcore-menu-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const manualScreen = document.getElementById('manual-screen');
const hardcoreManualScreen = document.getElementById('hardcore-manual-screen');

// Botões
const startBtn = document.getElementById('start-btn');
const hardcoreBtn = document.getElementById('hardcore-btn');
const startHardcoreBtn = document.getElementById('start-hardcore-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverToMenuBtn = document.getElementById('game-over-to-menu-btn');
const manualBtn = document.getElementById('manual-btn');
const hardcoreManualBtn = document.getElementById('hardcore-manual-btn');
const manualToMenuBtn = document.getElementById('manual-to-menu-btn');
const hardcoreManualToMenuBtn = document.getElementById('hardcore-manual-to-menu-btn');

// --- Áudio ---
const menuMusic = new Audio('assets/music/menu_snake.mp3');
menuMusic.loop = true;
const hardcoreMusic = new Audio('assets/music/hardcore_menu.mp3');
hardcoreMusic.loop = true;

// --- Configurações do Jogo ---
const gridSize = 20;
const canvasSize = canvas.width / gridSize;

// --- Estado do Jogo ---
let gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAME_OVER
let snake, food, score, direction, changingDirection, gameSpeed;
let lastGameWasHardcore = false;

// --- Funções de Gerenciamento de Estado ---

function stopAllMusic() {
    menuMusic.pause();
    menuMusic.currentTime = 0;
    hardcoreMusic.pause();
    hardcoreMusic.currentTime = 0;
}

function showScreen(screenName) {
    // Esconde todas as telas e o canvas
    menuScreen.style.display = 'none';
    hardcoreMenuScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    manualScreen.style.display = 'none';
    hardcoreManualScreen.style.display = 'none';
    canvas.style.display = 'none';
    scoreDisplay.style.display = 'none';

    // Para todas as músicas antes de decidir qual tocar
    stopAllMusic();

    // Mostra a tela/elementos desejados e toca a música correspondente
    if (screenName === 'MENU') {
        menuScreen.style.display = 'flex';
        menuMusic.play().catch(e => console.log("A interação do usuário é necessária para tocar a música."));
    } else if (screenName === 'HARDCORE_MENU') {
        hardcoreMenuScreen.style.display = 'flex';
        hardcoreMusic.play().catch(e => console.log("A interação do usuário é necessária para tocar a música."));
    } else if (screenName === 'MANUAL') {
        manualScreen.style.display = 'flex';
        menuMusic.play().catch(e => console.log("A interação do usuário é necessária para tocar a música."));
    } else if (screenName === 'HARDCORE_MANUAL') {
        hardcoreManualScreen.style.display = 'flex';
        hardcoreMusic.play().catch(e => console.log("A interação do usuário é necessária para tocar a música."));
    } else if (screenName === 'GAME') {
        canvas.style.display = 'block';
        scoreDisplay.style.display = 'block';
    } else if (screenName === 'GAME_OVER') {
        finalScoreElement.textContent = score;
        gameOverScreen.style.display = 'flex';
        canvas.style.display = 'block'; // Mostra o canvas por baixo
    }
}

function resetGameVariables() {
    snake = [{ x: 10, y: 10 }];
    food = {};
    score = 0;
    scoreElement.textContent = score;
    direction = 'right';
    changingDirection = false;
    gameSpeed = 150; // Velocidade normal
}

function startGame(isHardcore = false) {
    resetGameVariables();
    lastGameWasHardcore = isHardcore;
    if (isHardcore) {
        gameSpeed = 70; // Velocidade hardcore
    }
    gameState = 'PLAYING';
    showScreen('GAME');
    generateFood();
    main(); // Inicia o loop do jogo
}

// --- Loop Principal do Jogo ---

function main() {
    if (gameState === 'GAME_OVER') {
        showScreen('GAME_OVER');
        return; // Para o loop
    }

    if (gameState === 'PAUSED') {
        // Para o loop se o jogo estiver pausado
        return;
    }

    if (gameState === 'PLAYING') {
        changingDirection = false;
        setTimeout(function onTick() {
            clearCanvas();
            drawFood();
            moveSnake();
            drawSnake();
            main();
        }, gameSpeed);
    }
}

// --- Funções de Desenho ---

function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#4CAF50';
    snake.forEach(part => {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
    });
}

function drawFood() {
    ctx.fillStyle = '#FF4136';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '50px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('Pausado', canvas.width / 2, canvas.height / 2);
}


// --- Lógica do Jogo ---

function moveSnake() {
    if (gameState !== 'PLAYING') return;

    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        if (gameSpeed > 50 && score % 50 === 0) {
            gameSpeed -= 10;
        }
    } else {
        snake.pop();
    }

    checkCollision();
}

function generateFood() {
    food.x = Math.floor(Math.random() * canvasSize);
    food.y = Math.floor(Math.random() * canvasSize);

    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) {
            generateFood();
        }
    });
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        gameState = 'GAME_OVER';
    }

    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameState = 'GAME_OVER';
        }
    }
}

// --- Controles ---

function handleKeyPress(event) {
    const keyPressed = event.key.toLowerCase();

    // Lógica de Pause
    if (keyPressed === 'p') {
        if (gameState === 'PLAYING') {
            gameState = 'PAUSED';
            drawPauseScreen(); // Desenha a tela de pausa imediatamente
        } else if (gameState === 'PAUSED') {
            gameState = 'PLAYING';
            main(); // Reinicia o loop do jogo
        }
        return; // Evita que outras teclas sejam processadas no mesmo evento
    }

    // Lógica de Movimento (só funciona se estiver jogando)
    if (gameState === 'PLAYING' && !changingDirection) {
        const goingUp = direction === 'up';
        const goingDown = direction === 'down';
        const goingLeft = direction === 'left';
        const goingRight = direction === 'right';

        if ((event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') && !goingDown) {
            direction = 'up';
            changingDirection = true;
        }
        if ((event.key === 'ArrowDown' || event.key.toLowerCase() === 's') && !goingUp) {
            direction = 'down';
            changingDirection = true;
        }
        if ((event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') && !goingRight) {
            direction = 'left';
            changingDirection = true;
        }
        if ((event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') && !goingLeft) {
            direction = 'right';
            changingDirection = true;
        }
    }
}

// --- Event Listeners ---

startBtn.addEventListener('click', () => startGame(false));
hardcoreBtn.addEventListener('click', () => showScreen('HARDCORE_MENU'));
startHardcoreBtn.addEventListener('click', () => startGame(true));
backToMenuBtn.addEventListener('click', () => showScreen('MENU'));
restartBtn.addEventListener('click', () => startGame(lastGameWasHardcore));
gameOverToMenuBtn.addEventListener('click', () => showScreen('MENU'));
manualBtn.addEventListener('click', () => showScreen('MANUAL'));
hardcoreManualBtn.addEventListener('click', () => showScreen('HARDCORE_MANUAL'));
manualToMenuBtn.addEventListener('click', () => showScreen('MENU'));
hardcoreManualToMenuBtn.addEventListener('click', () => showScreen('HARDCORE_MENU'));


document.addEventListener('keydown', handleKeyPress);

// --- Início ---
showScreen('MENU');

