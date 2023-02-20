const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

let snakeSegmentCoords = [];
let appleCoords = [];
let headX = 320;
let headY = 280;
let direction = null;
let snakeLength = 3;
let startGame = false;
let score = 0;

// ~~ KEYBOARD INPUT ~~
document.addEventListener("keydown", (event) => {
    console.log(`${event.key}, ${event.code} pressed.`);

    switch (event.code) {
        case "KeyD":
            if (direction != "-x") {
                direction = "+x";
            }
            break;
        case "KeyA":
            if (direction != "+x") {
                direction = "-x";
            }
            break;
        case "KeyS":
            if (direction != "-y") {
                direction = "+y";
            }
            break;
        case "KeyW":
            if (direction != "+y") {
                direction = "-y";
            }
            break;
        case "Backquote":
            console.log(snakeSegmentCoords);
            break;
        default:
            break;
    }
});

function initGame() {
    startGame = true;
    drawSnakeSegment(headX, headY);
    generateApple();
}

function areArraysEqual(a, b) {
    return a.join() == b.join();
}

function isSpotEmpty(coords) {
    for (const segmentCoords of snakeSegmentCoords) {
        if (areArraysEqual(segmentCoords, coords)) {
            return false;
        }
    }
    return true;
}

function drawSnakeSegment(x, y) {
    ctx.fillStyle = "#4545FF";
    ctx.fillRect(x + 5, y + 5, 30, 30);
    snakeSegmentCoords.push([x, y]);
}

function drawApple(x, y) {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(x + 5, y + 5, 30, 30);
    appleCoords = [x, y];
    console.log(`%c drew apple.`, "color: #00ff00");
}

function generateApple() {
    const xPositions = [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640];
    const yPositions = [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560];

    let appleCoords = [
        xPositions[Math.floor(Math.random() * xPositions.length)],
        yPositions[Math.floor(Math.random() * yPositions.length)],
    ];

    let tries = 0;
    while (!isSpotEmpty(appleCoords) && tries < 1000) {
        console.log(`%c failed to draw apple, trying again.`, "color: #ff0000");
        tries++;
        appleCoords = [
            xPositions[Math.floor(Math.random() * xPositions.length)],
            yPositions[Math.floor(Math.random() * yPositions.length)],
        ];
    }

    drawApple(appleCoords[0], appleCoords[1]);
}

function isAppleEaten() {
    if (areArraysEqual(snakeSegmentCoords[snakeSegmentCoords.length - 1], appleCoords)) {
        console.log(`%c ate apple.`, "color: #00ff00");
        snakeLength++;
        document.getElementById("scoreboard").innerHTML = `SCORE: ${++score}`;
        generateApple();
    }
}

function checkForSnakeCollisions() {
    let collision = false;

    // wall collision
    if (
        (headX == 640 && direction == "+x") ||
        (headX == 0 && direction == "-x") ||
        (headY == 560 && direction == "+y") ||
        (headY == 0 && direction == "-y")
    ) {
        console.log(`%c collided with wall.`, "color: #ff0000");
        collision = true;
    }

    // self collision
    switch (direction) {
        case "+x":
            for (const segmentCoords of snakeSegmentCoords) {
                if (areArraysEqual(segmentCoords, [headX + 40, headY])) {
                    console.log(`%c +x collision ahead..`, "color: #ff0000");
                    collision = true;
                }
            }
            break;

        case "-x":
            for (const segmentCoords of snakeSegmentCoords) {
                if (areArraysEqual(segmentCoords, [headX - 40, headY])) {
                    console.log(`%c -x collision ahead..`, "color: #ff0000");
                    collision = true;
                }
            }
            break;

        case "+y":
            for (const segmentCoords of snakeSegmentCoords) {
                if (areArraysEqual(segmentCoords, [headX, headY + 40])) {
                    console.log(`%c +y collision ahead..`, "color: #ff0000");
                    collision = true;
                }
            }
            break;

        case "-y":
            for (const segmentCoords of snakeSegmentCoords) {
                if (areArraysEqual(segmentCoords, [headX, headY - 40])) {
                    console.log(`%c -y collision ahead..`, "color: #ff0000");
                    collision = true;
                }
            }
            break;
        default:
            break;
    }

    if (collision) {
        startGame = false;
    }

    return collision;
}

function moveSnake() {
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

    drawSnakeSegment(headX, headY);
    isAppleEaten();

    if (snakeSegmentCoords.length > snakeLength) {
        let snakeEnd = snakeSegmentCoords.shift();
        ctx.clearRect(snakeEnd[0], snakeEnd[1], 40, 40);
    }
}

function reset() {
    snakeSegmentCoords = [];
    appleCoords = [];
    headX = 320;
    headY = 280;
    direction = null;
    snakeLength = 3;
    startGame = false;
    score = 0;
    document.getElementById("scoreboard").innerHTML = `SCORE: ${score}`;
}

// ~~ PLAY AGAIN ~~
document.getElementById("play").onclick = () => {
    document.getElementById("menuScreen").style.zIndex = -1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    reset();
    initGame();
    animationLoop();
};

function animationLoop() {
    const fpsThrottle = setTimeout(() => {
        requestAnimationFrame(animationLoop);
        // console.log("requested anim frame");
    }, 1000 / 8);

    if (startGame) {
        if (direction !== null && !checkForSnakeCollisions()) {
            moveSnake();
            // console.log(`(${headX}, ${headY})`);
        }
    } else {
        document.getElementById("menuScreen").style.zIndex = 0;
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        clearTimeout(fpsThrottle);
        return;
    }
}

initGame();
animationLoop();

// function drawGrid() {
//     let cHeight = canvas.clientHeight;
//     let cWidth = canvas.clientWidth;
//     ctx.strokeStyle = "white";

//     // vertical lines
//     for (let i = 1; i < 17; i++) {
//         ctx.moveTo((cWidth / 17) * i, 0);
//         ctx.lineTo((cWidth / 17) * i, cHeight);
//     }

//     // horizontal lines
//     for (let i = 1; i < 15; i++) {
//         ctx.moveTo(0, (cHeight / 15) * i);
//         ctx.lineTo(cWidth, (cHeight / 15) * i);
//     }
//     ctx.stroke();
// }
