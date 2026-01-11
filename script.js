const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const seconds = document.getElementById("seconds");
const avoidedObjects = document.getElementById("avoidedObjects");

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.7;

let player,
  isGrounded,
  getUp,
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
  skyColor = " rgba(255, 255, 255, 0.43)",
  cloudsColor = "rgba(255, 255, 255, 0.56)",
  sun = {
    x: canvas.width + 100,
    y: canvas.height / 4,
    radius: 50,
    color: " rgb(255, 239, 97)",
    speed: 1,
  };

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
    isGrounded = true;
    getUp = true;
    gameSpeed = 3;
    obstacles = [];
    seconds.textContent = "Seconds: 0";
    avoidedObjects.textContent = "Avoided objects: 0";
    gameOver = false;

    playerInitialPosition();
    spawnerObstacles();
    spawnerStones();
    spawnerClouds();
    spawnerGrass();
    update();
  }, time);
}

function playerInitialPosition() {
  player = {
    x: 50,
    y: canvas.height - 200,
    width: 100,
    height: 100,
    jumpSpeed: 8,
    gravity: 4,
    color: "rgba(30, 76, 228, 1)",
  };
}

function spawnerObstacles() {
  const width = Math.random() * (70 - 20) + 20;
  const height = Math.random() * (80 - 50) + 50;

  const colors = ["red", "green", "blue", "yellow", "pink", "white"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  let ground = 100;

  setTimeout(() => {
    if (randomColor === "pink") ground = Math.random() * (240 - 160) + 160;

    spawnObsticle(width, height, ground, randomColor);

    if (difficulty > 2500) difficulty -= 50;
    else if (difficulty > 2300) difficulty -= 50;
    else if (difficulty > 2100) difficulty -= 40;
    else if (difficulty > 1800) difficulty -= 30;
    else if (difficulty > 1300) difficulty -= 20;
    else if (difficulty > 1000) difficulty -= 10;

    if (!gameOver) spawnerObstacles();
  }, difficulty);
}

function spawnObsticle(width, height, ground, color) {
  obstacles.push({
    x: canvas.width,
    y: canvas.height - ground - height,
    width: width,
    height: height,
    color: color,
  });
}

function spawnerStones() {
  const width = Math.random() * (15 - 3) + 3;
  const height = Math.random() * (15 - 3) + 3;
  const position =
    Math.random() * (canvas.height - (canvas.height - 100 + height)) +
    canvas.height -
    100 +
    height;

  setTimeout(() => {
    spawnStone(width, height, position);
    if (!gameOver) spawnerStones();
  }, 150);
}

function spawnStone(width, height, position) {
  stones.push({
    x: canvas.width,
    y: position,
    width: width,
    height: height,
  });
}

function spawnerClouds() {
  const width = Math.random() * (400 - 250) + 250;
  const height = Math.random() * (240 - 120) + 120;
  const position = Math.random() * (canvas.height / 2);
  setTimeout(() => {
    spawnCloud(width, height, position);
    if (!gameOver) spawnerClouds();
  }, 700);
}

function spawnCloud(width, height, position) {
  clouds.push({
    x: canvas.width,
    y: position,
    width: width,
    height: height,
    speed: 2,
  });
}

function spawnerGrass() {
  const topPoint =
    Math.random() * (canvas.height - 100 - (canvas.height - 117)) +
    (canvas.height - 117);

  setTimeout(() => {
    if (canvas.height - 100 - topPoint >= 4) {
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
    height: canvas.height - 100 - topPoint,
  });
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
  if (keys[" "] && isGrounded && player.y > canvas.height - 500 && getUp) {
    player.y -= player.jumpSpeed;
  } else if (player.y + player.height < canvas.height - 100) {
    player.y += player.gravity;
    isGrounded = false;
  }

  if (player.y + player.height >= canvas.height - 100) isGrounded = true;
}

function stayLow() {
  if (keys.ArrowDown) {
    if (isGrounded) {
      player.y = canvas.height - 150;
      player.height = 50;
      getUp = false;
    } else player.gravity = 12;
  } else if (!getUp) {
    player.y = canvas.height - 200;
    player.height = 100;
    player.gravity = 4;
    getUp = true;
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
  context.fillStyle = "rgb(73, 45, 19)";
  context.fillRect(0, canvas.height - 100, canvas.width, canvas.height);

  //draw land line
  context.fillStyle = "rgb(47, 42, 37)";
  context.fillRect(0, canvas.height - 100, canvas.width, 8);

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

    if (checkCollider(player, obstacles[i])) {
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

    context.fillStyle = "rgba(90, 90, 90, 1)";
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

    context.fillStyle = "rgb(21, 104, 25)";
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
    if (skyColor === " rgba(255, 255, 255, 0.43)") {
      skyColor = " rgba(0, 0, 0, 0.25)";
      sun.color = " rgb(195, 244, 254)";
      cloudsColor = "rgba(0, 0, 0, 0.41)";
    } else {
      skyColor = " rgba(255, 255, 255, 0.43)";
      (sun.color = " rgb(255, 239, 97)"),
        (cloudsColor = "rgba(255, 255, 255, 0.56)");
    }
  }

  context.fillStyle = sun.color;
  context.beginPath();
  context.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
  context.fill();
}

function checkCollider(player, obstacle) {
  return (
    player.x < obstacle.x + obstacle.width &&
    player.x + player.width > obstacle.x &&
    player.y < obstacle.y + obstacle.height &&
    player.y + player.height > obstacle.y
  );
}

newGame(0);
