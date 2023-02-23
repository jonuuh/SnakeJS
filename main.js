// ~~ GLOBAL VARIABLES ~~
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const SNAKE_COLOR = "#ffffff";
const APPLE_COLOR = "#ffffff";
let snakeSegmentCoords = [];
let appleCoords = [];
let headX = 320;
let headY = 280;
let snakeLength = 3;
let direction = null;
let nextDirection = null;
let gameIsActive = false;
let hasVolume = true;

// ~~ GAME INITIALIZATION ~~
function initGame() {
    gameIsActive = true;
    drawSnakeSegment(headX, headY);
    generateApple();
    animationLoop();
}

// ~~ KEYBOARD INPUT ~~
document.addEventListener("keydown", (event) => {
    switch (event.code) {
        case "KeyD":
        case "ArrowRight":
            if (direction !== "-x") {
                nextDirection = "+x";
            }
            break;

        case "KeyA":
        case "ArrowLeft":
            if (direction !== "+x") {
                nextDirection = "-x";
            }
            break;

        case "KeyS":
        case "ArrowDown":
            if (direction !== "-y") {
                nextDirection = "+y";
            }
            break;

        case "KeyW":
        case "ArrowUp":
            if (direction !== "+y") {
                nextDirection = "-y";
            }
            break;

        case "Backquote":
            console.log(snakeSegmentCoords);
            break;

        default:
            break;
    }
});

// ~~ RESET GAME ~~
document.getElementById("reset").onclick = () => {
    if (!gameIsActive) {
        // Reset variables
        snakeSegmentCoords = [];
        appleCoords = [];
        headX = 320;
        headY = 280;
        snakeLength = 3;
        direction = null;
        nextDirection = null;
        gameIsActive = false;

        // Reset visuals
        document.getElementById("scoreboard").innerHTML = "SCORE: 0";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Restart game
        initGame();
    }
};

// ~~ VOLUME TOGGLE ~~
document.getElementById("volume").onclick = () => {
    hasVolume = !hasVolume;

    if (hasVolume) {
        document.getElementById("volume_off").style.visibility = "hidden";
        document.getElementById("volume_on").style.visibility = "visible";
    } else {
        document.getElementById("volume_off").style.visibility = "visible";
        document.getElementById("volume_on").style.visibility = "hidden";
    }
};

function playAudio(audio) {
    if (hasVolume) {
        audio.play();
    }
}

function areArraysEqual(a, b) {
    return a.join() == b.join();
}

function isSpotEmpty(coords) {
    // Loop through the list of snake segment coords and see if any of them match the input coords
    for (const segmentCoords of snakeSegmentCoords) {
        if (areArraysEqual(segmentCoords, coords)) {
            return false;
        }
    }
    return true;
}

// ~~ SNAKE SEGMENT DRAWING ~~
function drawSnakeSegment(x, y) {
    // Set canvas context fill style
    ctx.fillStyle = SNAKE_COLOR;
    // Draw the segment (+5 x,y offset is to center the 30x30px segment in a 40x40px spot)
    ctx.fillRect(x + 5, y + 5, 30, 30);
    // Store the coords of the snake segment in a queue
    snakeSegmentCoords.push([x, y]);

    // Small 10x30px rectangle to connect the snake segments
    switch (direction) {
        case "+x":
            ctx.fillRect(x - 5, y + 5, 10, 30);
            break;
        case "-x":
            ctx.fillRect(x + 35, y + 5, 10, 30);
            break;
        case "+y":
            ctx.fillRect(x + 5, y - 5, 30, 10);
            break;
        case "-y":
            ctx.fillRect(x + 5, y + 35, 30, 10);
            break;
    }
}

// ~~ APPLE DRAWING ~~
function drawApple(x, y) {
    // Set canvas context fill style
    ctx.fillStyle = APPLE_COLOR;
    // Draw the apple (+5 x,y offset is to center the 30x30px apple in a 40x40px spot)
    ctx.fillRect(x + 5, y + 5, 30, 30);
    // Store the coords of the apple to be able to detect when the snake runs over it
    appleCoords = [x, y];
    console.log(`%c drew apple.`, "color: #00ff00");
}

// ~~ RANDOM APPLE GENERATION ~~
function generateApple() {
    // Possible apple coordinates
    const xPositions = [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640];
    const yPositions = [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560];

    // Random apple coordinates
    let appleCoords = [
        xPositions[Math.floor(Math.random() * xPositions.length)],
        yPositions[Math.floor(Math.random() * yPositions.length)],
    ];

    // Continue randomly generating new apple coords as long as the apple is trying to generate inside the snake
    // Keeping track of tries is a failsafe for a rare bug (never reproduced) which otherwise causes an infinite loop here
    // TODO: this is a horrible solution, find a better one
    let tries = 0;
    while (!isSpotEmpty(appleCoords) && tries < 1000) {
        console.log(`%c failed to draw apple, trying again.`, "color: #ff0000");
        tries++;
        appleCoords = [
            xPositions[Math.floor(Math.random() * xPositions.length)],
            yPositions[Math.floor(Math.random() * yPositions.length)],
        ];
    }

    // Draw the apple once an empty spot is found
    drawApple(appleCoords[0], appleCoords[1]);
}

// ~~ APPLE COLLISION DETECTION ~~
function isAppleEaten() {
    if (areArraysEqual(snakeSegmentCoords[snakeSegmentCoords.length - 1], appleCoords)) {
        console.log(`%c ate apple.`, "color: #00ff00");
        playAudio(new Audio("./apple_pickup.mp3"));
        document.getElementById("scoreboard").innerHTML = `SCORE: ${++snakeLength - 3}`;
        generateApple();
    }
}

// ~~ SNAKE COLLISION DETECTION ~~
function checkForSnakeCollisions() {
    let collision = false;

    function wallCollision() {
        console.log(`%c wall collision.`, "color: #ff0000");
        return true;
    }

    function selfCollision(futureHeadCoords, dir) {
        for (const coords of snakeSegmentCoords) {
            if (areArraysEqual(coords, futureHeadCoords)) {
                console.log(`%c ${dir} self-collision.`, "color: #ff0000");
                return true;
            }
        }
        return false;
    }

    switch (direction) {
        case "+x":
            collision = headX === 640 ? wallCollision() : selfCollision([headX + 40, headY], direction);
            break;
        case "-x":
            collision = headX === 0 ? wallCollision() : selfCollision([headX - 40, headY], direction);
            break;
        case "+y":
            collision = headY === 560 ? wallCollision() : selfCollision([headX, headY + 40], direction);
            break;
        case "-y":
            collision = headY === 0 ? wallCollision() : selfCollision([headX, headY - 40], direction);
            break;
        default:
            break;
    }

    if (collision) {
        gameIsActive = false;
    }
    return collision;
}

// ~~ SNAKE MOVEMENT ~~
function moveSnake() {
    if (direction === null) {
        return;
    }
    // Update snake head coords based on current direction
    switch (direction) {
        case "+x":
            headX += 40;
            break;
        case "-x":
            headX -= 40;
            break;
        case "+y":
            headY += 40;
            break;
        case "-y":
            headY -= 40;
            break;
    }

    // Draw new snake segment at head coords
    drawSnakeSegment(headX, headY);
    // Check if apple was eaten (as a result of the snake moving)
    isAppleEaten();

    // If the number of snake segment coordinate pairs in the queue is greater than the
    // current snake length (variable which is incremented when an apple is eaten), shift
    // the queue (get the coords of the snake end) and clear the canvas at those coords
    if (snakeSegmentCoords.length > snakeLength) {
        let snakeEnd = snakeSegmentCoords.shift();
        ctx.clearRect(snakeEnd[0], snakeEnd[1], 40, 40);
    }
}

// ~~ HANDLE GAME OVER ~~
function gameOver(fpsThrottle) {
    // Play death sound
    playAudio(new Audio("./death.mp3"));
    // Place transparent gray overlay over the canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Stop the animation loop
    clearTimeout(fpsThrottle);
}

// ~~ MAIN ANIMATION LOOP ~~
function animationLoop() {
    const fpsThrottle = setTimeout(() => {
        requestAnimationFrame(animationLoop);
        // update snake direction
        if (direction !== nextDirection) {
            direction = nextDirection;
            playAudio(new Audio("./blip.mp3"));
        }
    }, 1000 / 7);

    // If the game is active and there are no collisions, move the snake, otherwise end the game
    gameIsActive && !checkForSnakeCollisions() ? moveSnake() : gameOver(fpsThrottle);
}

initGame();
