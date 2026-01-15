const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const seconds = document.getElementById("seconds");
const avoidedObjects = document.getElementById("avoidedObjects");

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.7;

const dayTimeSkyColor = "rgba(255, 255, 255, 0.43)";
const dayTimeCloudsColor = "rgba(255, 255, 255, 0.56)";
const sunColor = " rgb(255, 239, 97)";
const nightTimeSkyColor = " rgba(0, 0, 0, 0.25)";
const moonColor = " rgb(195, 244, 254)";
const nightTimeCloudsColor = "rgba(0, 0, 0, 0.41)";
const grassColor = "rgb(21, 104, 25)";
const stonesColor = "rgba(90, 90, 90, 1)";
const landColor = "rgb(73, 45, 19)";
const landLineColor = "rgb(47, 42, 37)";

let player,
  keepJumping,
  stayDown,
  gameSpeed,
  obstacles,
  secondsAliveInterval,
  avoidedObjectsCounter,
  secondsAlive,
  difficulty,
  stones = [],
  clouds = [],
  grass = [],
  gameOver,
  skyColor = dayTimeSkyColor,
  cloudsColor = dayTimeCloudsColor,
  sun = {
    x: canvas.width + 100,
    y: canvas.height / 4,
    radius: 50,
    color: sunColor,
    speed: 1,
  };

const difficultyLevels = [
  { limit: 2300, decrease: 50 },
  { limit: 2100, decrease: 40 },
  { limit: 1800, decrease: 30 },
  { limit: 1300, decrease: 20 },
  { limit: 1000, decrease: 10 },
];

const playerPositionX = 55;
const playerPositionY = canvas.height - 200;
const playerSize = 100;
const maxJumpHeight = canvas.height - 500;
const groundLevel = canvas.height - 100;
const stayDownLevel = canvas.height - 150;

const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function newGame(time) {
  setTimeout(() => {
    secondsAliveInterval = setInterval(() => {
      ++secondsAlive;
      seconds.textContent = "Seconds: " + secondsAlive;
    }, 1000);

    secondsAlive = 0;
    avoidedObjectsCounter = 0;
    difficulty = 2500;
    keepJumping = true;
    stayDown = false;
    gameSpeed = 3;
    obstacles = [];
    seconds.textContent = "Seconds: 0";
    avoidedObjects.textContent = "Avoided objects: 0";
    gameOver = false;

    setInitialPlayerPosition();
    spawnerObstacles();
    spawnerStones();
    spawnerClouds();
    spawnerGrass();
    update();
  }, time);
}

function setInitialPlayerPosition() {
  player = {
    x: playerPositionX,
    y: playerPositionY,
    width: playerSize,
    height: playerSize,
    jumpSpeed: 8,
    gravity: 4,
    color: "rgba(30, 76, 228, 1)",
  };
}

function spawnerObstacles() {
  setTimeout(() => {
    spawnObsticle();

    for (let i = difficultyLevels.length - 1; i >= 0; --i) {
      if (difficulty > difficultyLevels[i].limit) {
        difficulty -= difficultyLevels[i].decrease;
        break;
      }
    }

    if (!gameOver) spawnerObstacles();
  }, difficulty);
}

function spawnObsticle() {
  const height = random(50, 80);

  const colors = ["red", "green", "blue", "yellow", "pink", "white"];
  const color = colors[Math.floor(random(0, colors.length))];

  let ground = 100;

  //bird
  if (color === "pink") ground = random(160, 220);

  obstacles.push({
    x: canvas.width,
    y: canvas.height - ground - height,
    width: random(20, 70),
    height: height,
    color: color,
  });
}

function spawnerStones() {
  setTimeout(() => {
    spawnStone();
    if (!gameOver) spawnerStones();
  }, 150);
}

function spawnStone() {
  const height = random(3, 15);
  const verticalPosition = random(groundLevel + height, canvas.height);

  stones.push({
    x: canvas.width,
    y: verticalPosition,
    width: random(3, 15),
    height: height,
  });
}

function spawnerClouds() {
  setTimeout(() => {
    spawnCloud();
    if (!gameOver) spawnerClouds();
  }, 700);
}

function spawnCloud() {
  clouds.push({
    x: canvas.width,
    y: random(0, canvas.height / 2),
    width: random(250, 400),
    height: random(120, 240),
    speed: 2,
  });
}

function spawnerGrass() {
  const maxHeight = canvas.height - 117;
  const topPoint = random(maxHeight, groundLevel);

  setTimeout(() => {
    if (groundLevel - topPoint >= 4) {
      spawnGrass(topPoint);
    }
    if (!gameOver) spawnerGrass();
  }, 10);
}

function spawnGrass(topPoint) {
  grass.push({
    x: canvas.width,
    y: topPoint,
    width: 5,
    height: groundLevel - topPoint,
  });
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function update() {
  if (gameOver) {
    return;
  }

  stayLow();
  jump();
  draw();

  requestAnimationFrame(update);
}

function jump() {
  if (keys[" "] && keepJumping && player.y > maxJumpHeight && !stayDown) {
    player.y -= player.jumpSpeed;
  } else if (player.y + player.height < groundLevel) {
    player.y += player.gravity;
    keepJumping = false;
  }

  if (player.y + player.height >= groundLevel) keepJumping = true;
}

function stayLow() {
  if (keys.ArrowDown) {
    player.y = stayDownLevel;
    player.height = playerSize / 2;
    stayDown = true;
    player.gravity = 8;
  } else if (stayDown) {
    player.y = playerPositionY;
    player.height = playerSize;
    player.gravity = 4;
    stayDown = false;
  }
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  //draw sky
  context.fillStyle = skyColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawSun();
  drawClouds();

  //draw player
  context.fillStyle = player.color;
  context.fillRect(player.x, player.y, player.width, player.height);

  //draw land
  context.fillStyle = landColor;
  context.fillRect(0, groundLevel, canvas.width, canvas.height);

  //draw land line
  context.fillStyle = landLineColor;
  context.fillRect(0, groundLevel, canvas.width, 8);

  drawObstacles();
  drawStones();
  drawGrass();
}

function drawClouds() {
  for (let i = clouds.length - 1; i >= 0; --i) {
    clouds[i].x -= clouds[i].speed;

    context.fillStyle = cloudsColor;
    context.fillRect(
      clouds[i].x,
      clouds[i].y,
      clouds[i].width,
      clouds[i].height
    );

    if (clouds[i].x + clouds[i].width < 0) {
      clouds.splice(i, 1);
    }
  }
}

function drawObstacles() {
  for (let i = obstacles.length - 1; i >= 0; --i) {
    obstacles[i].x -= gameSpeed;

    context.fillStyle = obstacles[i].color;
    context.fillRect(
      obstacles[i].x,
      obstacles[i].y,
      obstacles[i].width,
      obstacles[i].height
    );

    if (checkCollision(player, obstacles[i])) {
      clearInterval(secondsAliveInterval);
      gameOver = true;
      newGame(3000);
      return;
    }

    if (obstacles[i].x + obstacles[i].width < 0) {
      avoidedObjects.textContent = "Avoided Objects " + ++avoidedObjectsCounter;
      obstacles.splice(i, 1);
      gameSpeed += 0.05;
    }
  }
}

function drawStones() {
  for (let i = stones.length - 1; i >= 0; --i) {
    stones[i].x -= gameSpeed;

    context.fillStyle = stonesColor;
    context.fillRect(
      stones[i].x,
      stones[i].y,
      stones[i].width,
      stones[i].height
    );

    if (stones[i].x + stones[i].width < 0) {
      stones.splice(i, 1);
    }
  }
}

function drawGrass() {
  for (let i = grass.length - 1; i >= 0; --i) {
    grass[i].x -= gameSpeed;

    context.fillStyle = grassColor;
    context.fillRect(grass[i].x, grass[i].y, grass[i].width, grass[i].height);

    if (grass[i].x + grass[i].width < 0) {
      grass.splice(i, 1);
    }
  }
}

function drawSun() {
  if (sun.x + sun.radius > 0) sun.x -= sun.speed;
  else {
    sun.x = canvas.width + sun.radius * 2;
    if (skyColor === dayTimeSkyColor) {
      skyColor = nightTimeSkyColor;
      sun.color = moonColor;
      cloudsColor = nightTimeCloudsColor;
    } else {
      skyColor = dayTimeSkyColor;
      sun.color = sunColor;
      cloudsColor = dayTimeCloudsColor;
    }
  }

  context.fillStyle = sun.color;
  context.beginPath();
  context.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
  context.fill();
}

function checkCollision(player, obstacle) {
  return (
    player.x < obstacle.x + obstacle.width &&
    player.x + player.width > obstacle.x &&
    player.y < obstacle.y + obstacle.height &&
    player.y + player.height > obstacle.y
  );
}

newGame(0);
