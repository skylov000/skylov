// === HEADPHONES OVERLAY ===
function enterSite() {
  const overlay = document.getElementById('headphones-overlay');
  // Uruchomienie muzyki natychmiast po interakcji użytkownika
  if (audio) {
    audio.play().catch(err => console.log("Autoplay blocked or failed:", err));
  }
  overlay.style.transition = 'opacity 1s';
  overlay.style.opacity = '0';
  setTimeout(() => overlay.style.display = 'none', 1000);
}



// === AUDIO CONTROLS STATE ===
let isPlaying = false;

// === LOSOWANIE NUTY ===


  const songs = [
  { src: "pierwsza.mp3", title: "🎵 SKYLOV – Equador (Hardstyle Remix)" },
  { src: "druga.mp3", title: "🎵 SKYLOV – Firefly" },
  { src: "trzecia.mp3", title: "🎵 SKYLOV – Mr. Saxobeat (Remix)" },
  { src: "czwarta.mp3", title: "🎵 SKYLOV – Right Time" },
  { src: "piata.mp3", title: "🎵 SKYLOV – We are young (Remix)" }
];

// losowanie piosenki
const randomSong = songs[Math.floor(Math.random() * songs.length)];

const audio = document.getElementById("bg-audio");
const titleDiv = document.getElementById("track-title");
const shouldAutoplay = localStorage.getItem('skylovShouldAutoplay') === 'true';

// ustawienie audio i tytułu
if (audio) {
  audio.src = randomSong.src;
  audio.preload = "none";
  audio.volume = 0.2;
  if (shouldAutoplay) {
    audio.play().then(() => {
      isPlaying = true;
      localStorage.removeItem('skylovShouldAutoplay');
    }).catch(() => {
      // Nie usuwamy flagi, żeby spróbować ponownie po odświeżeniu.
    });
  }
}
if (titleDiv) {
  titleDiv.textContent = randomSong.title;
}

// === PLAYLIST GENERATION ===
const playlistDropdown = document.getElementById('playlist-dropdown');
if (playlistDropdown) {
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.className = 'playlist-item';
    if (song.src === randomSong.src) li.classList.add('active');
    li.textContent = song.title;
    li.addEventListener('click', () => {
      audio.src = song.src;
      titleDiv.textContent = song.title;
      audio.play();
      isPlaying = true;
      document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
      });
    });
    playlistDropdown.appendChild(li);
  });
}


// === CUSTOM CURSOR ===
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursor-trail');
let mx = 0, my = 0;
if (cursor && trail) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx - 9 + 'px';
    cursor.style.top = my - 9 + 'px';
    setTimeout(() => {
      trail.style.left = mx - 3 + 'px';
      trail.style.top = my - 3 + 'px';
    }, 80);
  });
  document.addEventListener('mousedown', () => cursor.style.transform = 'scale(1.5)');
  document.addEventListener('mouseup', () => cursor.style.transform = 'scale(1)');
}

// === AUDIO CONTROLS ===

// Animacja vis-bars
const visBars = document.querySelectorAll('.vis-bars span');
const animationTimings = [0, 0.15, 0.3, 0.1, 0.25, 0.2, 0.35, 0.05]; // animation-delay values for all 8 bars
const animationDuration = 0.8; // in seconds
let animationFrameId = null;
let startTime = null;
let pausedTime = 0; // Track time when paused

const animateVisBars = (currentTime) => {
  if (startTime === null) startTime = currentTime;
  const elapsed = (currentTime - startTime) / 1000 + pausedTime; // convert to seconds and add paused time
  
  visBars.forEach((bar, index) => {
    const delay = animationTimings[index] || 0;
    const cycleTime = (elapsed + delay) % animationDuration;
    const progress = cycleTime / animationDuration;
    
    // Calculate height using sine wave: from 4px to 24px and back
    const height = 4 + (Math.sin(progress * Math.PI) * 20);
    bar.style.height = height + 'px';
  });
  
  if (!audio.paused) {
    animationFrameId = requestAnimationFrame(animateVisBars);
  }
};

// Inicjalizacja przycisku play/pause
const playBtn = document.getElementById('play-btn');
if (playBtn && audio) {
  // Aktualizacja przycisku na podstawie stanu audio
  const updateButton = () => {
    playBtn.innerHTML = audio.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    isPlaying = !audio.paused;
  };
  
  updateButton(); // Initial state
  playBtn.addEventListener('click', togglePlay);
  
  // Update button and animation when audio starts/stops playing
  audio.addEventListener('play', () => {
    updateButton();
    startTime = null; // Reset timer to continue from where we left off
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(animateVisBars);
    }
  });
  audio.addEventListener('pause', () => {
    updateButton();
    if (animationFrameId) {
      // Save the elapsed time before canceling animation
      if (startTime !== null) {
        pausedTime += (performance.now() - startTime) / 1000;
        startTime = null;
      }
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });
}

function togglePlay() {
  const audio = document.getElementById('bg-audio');
  const btn = document.getElementById('play-btn');
  if (isPlaying) {
    audio.pause();
    btn.innerHTML = '<i class="fas fa-play"></i>';
    isPlaying = false;
  } else {
    audio.play().catch(() => {});
    btn.innerHTML = '<i class="fas fa-pause"></i>';
    isPlaying = true;
  }
}
function setVolume(v) {
  document.getElementById('bg-audio').volume = v;
}

// === BACKGROUND CANVAS ===
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Grid lines
const gridLines = [];
for (let i = 0; i < 20; i++) {
  gridLines.push({
    x: Math.random() * 1500 - 200,
    y: Math.random() * 900,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.15,
    alpha: Math.random() * 0.15 + 0.03,
    length: Math.random() * 200 + 80
  });
}

// Orbs
const orbs = [
  { x: 0.2, y: 0.3, r: 300, color: '179,71,255', phase: 0, speed: 0.008 },
  { x: 0.8, y: 0.7, r: 250, color: '255,45,247', phase: 2, speed: 0.006 },
  { x: 0.5, y: 0.5, r: 200, color: '45,159,255', phase: 1, speed: 0.01 },
];

function drawBg(t) {
  ctx.clearRect(0, 0, W, H);

  // Dark base
  ctx.fillStyle = '#05000d';
  ctx.fillRect(0, 0, W, H);

  // Glowing orbs
  orbs.forEach(o => {
    const x = (o.x + Math.sin(t * o.speed + o.phase) * 0.1) * W;
    const y = (o.y + Math.cos(t * o.speed * 0.7 + o.phase) * 0.1) * H;
    const g = ctx.createRadialGradient(x, y, 0, x, y, o.r);
    g.addColorStop(0, `rgba(${o.color},0.07)`);
    g.addColorStop(1, `rgba(${o.color},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, o.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Grid
  ctx.strokeStyle = 'rgba(179,71,255,0.06)';
  ctx.lineWidth = 1;
  const gSize = 60;
  for (let x = 0; x < W; x += gSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += gSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Moving lines
  gridLines.forEach(l => {
    l.x += l.vx; l.y += l.vy;
    if (l.x > W + 200) l.x = -200;
    if (l.x < -200) l.x = W + 200;
    if (l.y > H + 100) l.y = -100;
    if (l.y < -100) l.y = H + 100;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(l.x + l.length, l.y + 40);
    ctx.strokeStyle = `rgba(179,71,255,${l.alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

let frame = 0;
function animate() {
  frame++;
  drawBg(frame);
  requestAnimationFrame(animate);
}
animate();

// === FLOATING PARTICLES ===
function spawnParticle() {
  const p = document.createElement('div');
  p.className = 'particle';
  const colors = ['#b347ff', '#ff2df7', '#2d9fff'];
  p.style.left = Math.random() * 100 + 'vw';
  p.style.bottom = '-5px';
  p.style.background = colors[Math.floor(Math.random() * colors.length)];
  p.style.animationDuration = (Math.random() * 6 + 4) + 's';
  p.style.animationDelay = Math.random() * 2 + 's';
  p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 10000);
}
setInterval(spawnParticle, 400);

// === SCROLL REVEAL ===
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(r => observer.observe(r));

// === ARTIST TAGS STAGGER ===
document.querySelectorAll('.artist-tag').forEach((tag, i) => {
  tag.style.animationDelay = i * 0.1 + 's';
  tag.style.opacity = '0';
  tag.style.animation = `fadeInUp 0.5s ${i * 0.1}s both`;
});

// === HAMBURGER MENU ===
const hamburgerBtn = document.getElementById('hamburger-menu');
const navLinks = document.getElementById('nav-links');

if (hamburgerBtn && navLinks) {
  hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close menu when clicking on a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburgerBtn.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('nav')) {
      hamburgerBtn.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });
}