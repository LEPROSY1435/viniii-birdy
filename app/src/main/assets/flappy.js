const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const messageEl = document.getElementById('message');

const width = canvas.width;
const height = canvas.height;
const gravity = 0.42;
const jumpStrength = -9.2;
const pipeSpeed = 2.5;
const pipeGap = 165;
const pipeWidth = 90;
const pipeFrequency = 130;

const birdImage = new Image();
let processedBirdImage = null;
let birdLoaded = false;
const localBirdSrc = 'bird.png';

function makeImageTransparent(image) {
  const tmp = document.createElement('canvas');
  tmp.width = image.naturalWidth;
  tmp.height = image.naturalHeight;
  const tctx = tmp.getContext('2d');
  tctx.drawImage(image, 0, 0);
  const data = tctx.getImageData(0, 0, tmp.width, tmp.height);
  const pixels = data.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a > 0 && r < 70 && g < 70 && b < 70) {
      pixels[i + 3] = 0;
    }
  }

  try {
    tctx.putImageData(data, 0, 0);
    processedBirdImage = new Image();
    processedBirdImage.onload = () => {
      console.log('processedBirdImage loaded');
      birdLoaded = true;
    };
    processedBirdImage.src = tmp.toDataURL('image/png');
  } catch (error) {
    console.warn('makeImageTransparent failed, using original image', error);
    processedBirdImage = image;
    birdLoaded = true;
  }
}

birdImage.onload = () => {
  console.log('birdImage loaded:', birdImage.naturalWidth, 'x', birdImage.naturalHeight);
  birdLoaded = true;
  try {
    makeImageTransparent(birdImage);
  } catch (e) {
    console.warn('makeImageTransparent threw', e);
    processedBirdImage = birdImage;
    birdLoaded = true;
  }
};

birdImage.onerror = () => {
  console.warn('Could not load local bird.png. The game will use the default bird placeholder.');
};

birdImage.src = localBirdSrc;

const bgImg = new Image();
let bgLoaded = false;
bgImg.onload = () => { bgLoaded = true; };
bgImg.onerror = () => { console.warn('background image failed to load'); };
bgImg.src = 'background.jpeg';

const pillarImg = new Image();
let pillarLoaded = false;
pillarImg.onload = () => { pillarLoaded = true; };
pillarImg.onerror = () => { console.warn('pillar image failed to load'); };
pillarImg.src = 'pillar.png';

const state = {
  running: false,
  gameOver: false,
  score: 0,
  bestScore: Number(localStorage.getItem('flappyBest') || 0),
  frame: 0,
  bird: {
    x: 90,
    y: height / 2,
    vy: 0,
    width: 46,
    height: 36,
    rotation: 0,
  },
  pipes: [],
};

function resetGame() {
  state.running = true;
  state.gameOver = false;
  state.score = 0;
  state.frame = 0;
  state.bird = {
    x: 90,
    y: height / 2,
    vy: 0,
    width: 46,
    height: 36,
    rotation: 0,
  };
  state.pipes = [];
  messageEl.textContent = 'Tap to fly';
  updateHud();
}

function updateHud() {
  scoreEl.textContent = state.score;
  bestEl.textContent = state.bestScore;
}

function spawnPipe() {
  const minY = 120;
  const maxY = height - 220;
  const top = minY + Math.random() * (maxY - minY);

  state.pipes.push({
    x: width,
    top: top,
    bottom: top + pipeGap,
    passed: false,
  });
}

function handleInput() {
  if (!state.running || state.gameOver) {
    resetGame();
  }
  state.bird.vy = jumpStrength;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function update() {
  if (!state.running) return;

  state.frame += 1;
  state.bird.vy += gravity;
  state.bird.y += state.bird.vy;
  state.bird.rotation = clamp(state.bird.vy / 12, -0.8, 1.2);

  if (state.frame % pipeFrequency === 0) {
    spawnPipe();
  }

  state.pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;

    if (!pipe.passed && pipe.x + pipeWidth < state.bird.x) {
      pipe.passed = true;
      state.score += 1;
      if (state.score > state.bestScore) {
        state.bestScore = state.score;
        localStorage.setItem('flappyBest', String(state.bestScore));
      }
      updateHud();
    }

    const birdBox = {
      left: state.bird.x - state.bird.width / 2,
      right: state.bird.x + state.bird.width / 2,
      top: state.bird.y - state.bird.height / 2,
      bottom: state.bird.y + state.bird.height / 2,
    };

    const topPipeBox = {
      left: pipe.x,
      right: pipe.x + pipeWidth,
      top: 0,
      bottom: pipe.top,
    };

    const bottomPipeBox = {
      left: pipe.x,
      right: pipe.x + pipeWidth,
      top: pipe.bottom,
      bottom: height,
    };

    if (collision(birdBox, topPipeBox) || collision(birdBox, bottomPipeBox)) {
      endGame();
    }
  });

  state.pipes = state.pipes.filter(pipe => pipe.x + pipeWidth > -20);

  if (state.bird.y + state.bird.height / 2 >= height || state.bird.y - state.bird.height / 2 <= 0) {
    endGame();
  }
}

function collision(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function endGame() {
  state.gameOver = true;
  state.running = false;
  messageEl.textContent = 'Game Over — tap to restart';
  updateHud();
}

function drawBackground() {
  if (bgLoaded) {
    try {
      ctx.drawImage(bgImg, 0, 0, width, height);
    } catch (e) {
      console.warn('Error drawing background image', e);
    }
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#74cbff');
    gradient.addColorStop(0.5, '#4ca7ff');
    gradient.addColorStop(1, '#154c90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.arc(70 + i * 120, 120 + ((i % 2) * 80), 48, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawPipes() {
  state.pipes.forEach((pipe) => {
    if (pillarLoaded) {
      try {
        ctx.drawImage(pillarImg, pipe.x, 0, pipeWidth, pipe.top);
        ctx.drawImage(pillarImg, pipe.x, pipe.bottom, pipeWidth, height - pipe.bottom);
      } catch (e) {
        ctx.fillStyle = '#106b20';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, height - pipe.bottom);
      }
    } else {
      ctx.fillStyle = '#106b20';
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
      ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, height - pipe.bottom);
    }

    ctx.fillStyle = '#0b4f17';
    ctx.fillRect(pipe.x - 10, pipe.top - 18, pipeWidth + 20, 18);
    ctx.fillRect(pipe.x - 10, pipe.bottom, pipeWidth + 20, 18);
  });
}

function drawBird() {
  const { x, y, width: bw, height: bh, rotation } = state.bird;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  if (birdLoaded && processedBirdImage) {
    ctx.drawImage(processedBirdImage, -bw / 2, -bh / 2, bw, bh);
  } else {
    if (birdImage && birdImage.complete && birdImage.naturalWidth > 0) {
      try {
        ctx.drawImage(birdImage, -bw / 2, -bh / 2, bw, bh);
        ctx.restore();
        return;
      } catch (e) {
        console.warn('Failed to draw raw birdImage', e);
      }
    }
    ctx.fillStyle = '#ffdd57';
    ctx.beginPath();
    ctx.ellipse(0, 0, bw / 2, bh / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(8, -4, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawGround() {
  const groundHeight = 48;
  ctx.fillStyle = '#0a1d2f';
  ctx.fillRect(0, height - groundHeight, width, groundHeight);
  ctx.fillStyle = '#17354f';
  for (let i = 0; i < width; i += 24) {
    ctx.fillRect(i + 8, height - groundHeight, 18, 12);
  }
}

function render() {
  drawBackground();
  drawPipes();
  drawBird();
  drawGround();

  if (!state.running && !state.gameOver && state.frame === 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(40, height / 2 - 92, width - 80, 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tap to start', width / 2, height / 2 - 40);
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault();
    handleInput();
  }
});

canvas.addEventListener('pointerdown', handleInput);
canvas.addEventListener('touchstart', (event) => {
  event.preventDefault();
  handleInput();
}, { passive: false });

messageEl.textContent = 'Tap to start';
updateHud();
loop();
