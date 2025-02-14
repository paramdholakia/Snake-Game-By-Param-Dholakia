// Author : Param Dholakia
const gameBoard = document.querySelector("#game-board");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#score-text");
const resetButton = document.querySelector("#reset-btn");

// Game Constants
const WIDTH = gameBoard.width;
const HEIGHT = gameBoard.height;
const UNIT_SIZE = 25;

// Game State
let running = false;
let xVelocity = UNIT_SIZE;
let yVelocity = 0;
let foodX, foodY;
let score = 0;
let snake = [{ x: 0, y: 0 }];
let directionChanged = false;

// Audio Files
const BITE_SFX = new Audio("AudioFiles/BITE.mp3");
const GAME_OVER_SFX = new Audio("AudioFiles/GAME-OVER.mp3");
const MAIN_TRACK_SFX = new Audio("AudioFiles/MAIN-TRACK.mp3");

// Audio Settings
MAIN_TRACK_SFX.volume = 0.5;
BITE_SFX.volume = 1;
MAIN_TRACK_SFX.loop = true;

// Colors
const COLORS = {
    boardBg: "#0f380f",
    snakeBody: "#9bbc0f",
    snakeBorder: "#8bac0f",
    food: "red",
    text: "#9bbc0f",
    snakeGlowHead: "rgba(139, 172, 15, 0.5)",
    snakeGlowBody: "rgba(155, 188, 15, 0.5)",
    foodGlow: "rgba(255, 0, 0, 0.5)"
};

// ====================
// Event Listeners
// ====================
window.addEventListener("keydown", handleKeyPress);
resetButton.addEventListener("click", resetGame);

// Disable right-click and text selection
document.addEventListener("contextmenu", (event) => event.preventDefault());
document.onselectstart = () => false;

// ====================
// Initial Setup
// ====================
clearBoard();
displayStartScreen();

// ====================
// Core Game Functions
// ====================

// Handle Key Presses
function handleKeyPress(event) {
    if (!running) {
        // Start the game on any key press
        gameStart();
    } else {
        // Change direction during gameplay
        changeDirection(event);
    }
}

// Start the Game
function gameStart() {
    running = true;
    score = 0;
    scoreText.textContent = score;
    snake = [{ x: 0, y: 0 }];
    xVelocity = UNIT_SIZE;
    yVelocity = 0;

    // Start audio after user interaction
    MAIN_TRACK_SFX.currentTime = 0;
    MAIN_TRACK_SFX.play().catch((error) => {
        console.error("Audio playback failed:", error);
    });

    createFood();
    nextTick();
}

// Main Game Loop
function nextTick() {
    if (running) {
        setTimeout(() => {
            clearBoard();
            drawFood();
            moveSnake();
            drawSnake();
            checkGameOver();
            directionChanged = false; // Reset direction change flag
            nextTick();
        }, 120);
    }
}

// Display Start Screen
function displayStartScreen() {
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = "center";
    ctx.fillText("PRESS ANY KEY TO START", WIDTH / 2, HEIGHT / 2 - 20);
    ctx.fillText("USE ARROW KEYS TO MOVE", WIDTH / 2, HEIGHT / 2 + 30);
}

// Clear the Game Board
function clearBoard() {
    ctx.fillStyle = COLORS.boardBg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// Create Food at Random Position
function createFood() {
    const isFoodOnSnake = (x, y) => snake.some((part) => part.x === x && part.y === y);
    do {
        foodX = Math.floor(Math.random() * (WIDTH / UNIT_SIZE)) * UNIT_SIZE;
        foodY = Math.floor(Math.random() * (HEIGHT / UNIT_SIZE)) * UNIT_SIZE;
    } while (isFoodOnSnake(foodX, foodY));
}

// Draw Food with Glow Effect
function drawFood() {
    ctx.save();
    const intensity = Math.min(score * 0.5, 20); // Soft glow scaling
    ctx.shadowColor = COLORS.foodGlow;
    ctx.shadowBlur = intensity;
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(foodX, foodY, UNIT_SIZE, UNIT_SIZE);
    ctx.restore();
}

// Draw Snake with Glow Effect
function drawSnake() {
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? COLORS.snakeBorder : COLORS.snakeBody;
        ctx.save();
        const intensity = Math.min(score * 0.3, 15); // Softer glow scaling
        ctx.shadowColor = index === 0 ? COLORS.snakeGlowHead : COLORS.snakeGlowBody;
        ctx.shadowBlur = intensity;
        ctx.fillRect(part.x, part.y, UNIT_SIZE, UNIT_SIZE);
        ctx.restore();
        ctx.strokeStyle = COLORS.boardBg;
        ctx.strokeRect(part.x, part.y, UNIT_SIZE, UNIT_SIZE);
    });
}

// Move the Snake
function moveSnake() {
    const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };
    snake.unshift(head);

    if (head.x === foodX && head.y === foodY) {
        // Play bite sound and update score
        BITE_SFX.currentTime = 0;
        BITE_SFX.play();
        score += 1;
        scoreText.textContent = score;
        createFood();
    } else {
        snake.pop();
    }
}

// Change Snake Direction
function changeDirection(event) {
    if (directionChanged) return;

    const keyPressed = event.keyCode;
    const goingUp = yVelocity === -UNIT_SIZE;
    const goingDown = yVelocity === UNIT_SIZE;
    const goingRight = xVelocity === UNIT_SIZE;
    const goingLeft = xVelocity === -UNIT_SIZE;

    switch (keyPressed) {
        case 37: // Left
            if (!goingRight) {
                xVelocity = -UNIT_SIZE;
                yVelocity = 0;
                directionChanged = true;
            }
            break;
        case 38: // Up
            if (!goingDown) {
                xVelocity = 0;
                yVelocity = -UNIT_SIZE;
                directionChanged = true;
            }
            break;
        case 39: // Right
            if (!goingLeft) {
                xVelocity = UNIT_SIZE;
                yVelocity = 0;
                directionChanged = true;
            }
            break;
        case 40: // Down
            if (!goingUp) {
                xVelocity = 0;
                yVelocity = UNIT_SIZE;
                directionChanged = true;
            }
            break;
    }
}

// Check for Game Over
function checkGameOver() {
    const head = snake[0];
    const hitWall = head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT;
    const hitSelf = snake.slice(1).some((part) => part.x === head.x && part.y === head.y);

    if (hitWall || hitSelf) {
        running = false;
        displayGameOver();
    }
}

// Display Game Over Screen
function displayGameOver() {
    MAIN_TRACK_SFX.pause();
    GAME_OVER_SFX.currentTime = 0;
    GAME_OVER_SFX.play();

    ctx.font = "2rem 'Press Start 2P'";
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 20);
    ctx.fillText(`SCORE: ${score}`, WIDTH / 2, HEIGHT / 2 + 30);
    resetButton.style.display = "block";
}

// Reset the Game
function resetGame() {
    resetButton.style.display = "none";
    clearBoard();
    MAIN_TRACK_SFX.currentTime = 0;
    MAIN_TRACK_SFX.play();
    gameStart();
}