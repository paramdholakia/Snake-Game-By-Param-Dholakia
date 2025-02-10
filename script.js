// Author: Param Dholakia
const gameBoard = document.querySelector("#game-board");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#score-text");
const resetButton = document.querySelector("#reset-btn"); 
// Color constants matching Nokia theme
const COLORS = {
    boardBg: "#0f380f",
    snakeBody: "#9bbc0f",
    snakeBorder: "#8bac0f",
    food: "red",
    text: "#9bbc0f"
};
const WIDTH = gameBoard.width;
const HEIGHT = gameBoard.height;
const UNIT_SIZE = 25;
let running = false;
let xVelocity = UNIT_SIZE;
let yVelocity = 0;
let foodX, foodY;
let score = 0;
let snake = [
    { x: UNIT_SIZE * 4, y: 0 },
    { x: UNIT_SIZE * 3, y: 0 },
    { x: UNIT_SIZE * 2, y: 0 },
    { x: UNIT_SIZE, y: 0 },
    { x: 0, y: 0 }
];
let directionChanged = false; // Flag to prevent multiple direction changes in one frame

window.addEventListener("keydown", changeDirection);
resetButton.addEventListener("click", resetGame);

gameStart();

// Disable right click
document.addEventListener("contextmenu", event => event.preventDefault());
// Disable text selection
document.onselectstart = () => false;
function gameStart() {
    running = true;
    scoreText.textContent = score;
    createFood();
    nextTick();
}

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
        }, 100);
    } else {
        displayGameOver();
    }
}

function clearBoard() {
    ctx.fillStyle = COLORS.boardBg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function createFood() {
    const isFoodOnSnake = (x, y) => snake.some(part => part.x === x && part.y === y);
    
    do {
        foodX = Math.floor(Math.random() * (WIDTH / UNIT_SIZE)) * UNIT_SIZE;
        foodY = Math.floor(Math.random() * (HEIGHT / UNIT_SIZE)) * UNIT_SIZE;
    } while (isFoodOnSnake(foodX, foodY));
}

function drawFood() {
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(foodX, foodY, UNIT_SIZE, UNIT_SIZE);
}

function drawSnake() {
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? COLORS.snakeBorder : COLORS.snakeBody;
        ctx.fillRect(part.x, part.y, UNIT_SIZE, UNIT_SIZE);
        ctx.strokeStyle = COLORS.boardBg;
        ctx.strokeRect(part.x, part.y, UNIT_SIZE, UNIT_SIZE);
    });
}

function moveSnake() {
    const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };
    snake.unshift(head);
    if (head.x === foodX && head.y === foodY) {
        score += 1;
        scoreText.textContent = score;
        createFood();
    } else {
        snake.pop();
    }
}

function changeDirection(event) {
    if (directionChanged) return; // If direction has already been changed this frame, do nothing
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
                directionChanged = true; // Set direction change flag
            }
            break;
        case 38: // Up
            if (!goingDown) {
                xVelocity = 0;
                yVelocity = -UNIT_SIZE;
                directionChanged = true; // Set direction change flag
            }
            break;
        case 39: // Right
            if (!goingLeft) {
                xVelocity = UNIT_SIZE;
                yVelocity = 0;
                directionChanged = true; // Set direction change flag
            }
            break;
        case 40: // Down
            if (!goingUp) {
                xVelocity = 0;
                yVelocity = UNIT_SIZE;
                directionChanged = true; // Set direction change flag
            }
            break;
    }
}

function checkGameOver() {
    const head = snake[0];
    const hitWall = 
        head.x < 0 || 
        head.x >= WIDTH || 
        head.y < 0 || 
        head.y >= HEIGHT;
    
    const hitSelf = snake
        .slice(1)
        .some(part => part.x === head.x && part.y === head.y);
    if (hitWall || hitSelf) {
        running = false;
    }
}

function displayGameOver() {
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", WIDTH/2, HEIGHT/2 - 20);
    ctx.fillText(`SCORE: ${score}`, WIDTH/2, HEIGHT/2 + 30);
    resetButton.style.display = "block";
}

function resetGame() {
    snake = [
        { x: UNIT_SIZE * 4, y: 0 },
        { x: UNIT_SIZE * 3, y: 0 },
        { x: UNIT_SIZE * 2, y: 0 },
        { x: UNIT_SIZE, y: 0 },
        { x: 0, y: 0 }
    ];
    xVelocity = UNIT_SIZE;
    yVelocity = 0;
    score = 0;
    resetButton.style.display = "none";
    clearBoard();
    gameStart();
}