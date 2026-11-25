/* ===== LÓGICA DE LA VELA CONSUMIÉNDOSE ===== */

const DEBUG_CELERAR = false;

let anoActual = new Date().getFullYear();
let inicioAno = new Date(`${anoActual}-01-01T00:00:00`).getTime();
let finAno    = new Date(`${anoActual + 1}-01-01T00:00:00`).getTime();

document.getElementById('anioTexto').textContent = anoActual;

const alturaMaxima = window.innerWidth <= 500 ? 300 : 400;

const vela = document.getElementById('vela');
const diasEl = document.getElementById('dias');
const horasEl = document.getElementById('horas');
const minutosEl = document.getElementById('minutos');
const segundosEl = document.getElementById('segundos');
const llamaContainer = document.getElementById('llamaContainer');
const anioTexto = document.getElementById('anioTexto');
const yearReveal = document.getElementById('yearReveal');

function actualizar() {
  const ahora = new Date().getTime();

  const nuevoAnio = new Date().getFullYear();
  if (nuevoAnio !== anoActual) {
    anoActual = nuevoAnio;
    inicioAno = new Date(`${anoActual}-01-01T00:00:00`).getTime();
    finAno    = new Date(`${anoActual + 1}-01-01T00:00:00`).getTime();
    anioTexto.textContent = anoActual;
    dispararCelebracion(anoActual);
  }

  let transcurrido = ahora - inicioAno;
  let restante = finAno - ahora;
  if (transcurrido < 0) transcurrido = 0;
  if (restante < 0) restante = 0;

  const porcentajeConsumido = transcurrido / (finAno - inicioAno);
  const nuevaAltura = alturaMaxima * (1 - porcentajeConsumido);
  vela.style.height = Math.max(0, nuevaAltura) + 'px';

  const segundosTotales = Math.floor(restante / 1000);
  const d = Math.floor(segundosTotales / 86400);
  const h = Math.floor((segundosTotales % 86400) / 3600);
  const m = Math.floor((segundosTotales % 3600) / 60);
  const s = segundosTotales % 60;

  diasEl.textContent    = String(d).padStart(2, '0');
  horasEl.textContent   = String(h).padStart(2, '0');
  minutosEl.textContent = String(m).padStart(2, '0');
  segundosEl.textContent = String(s).padStart(2, '0');
}

function crearChispa() {
  const chispa = document.createElement('div');
  chispa.classList.add('chispa');
  const colores = ['#70ff70', '#ffd700', '#ffffff', '#90ff90'];
  const color = colores[Math.floor(Math.random() * colores.length)];
  chispa.style.background = color;
  chispa.style.boxShadow = `0 0 8px ${color}, 0 0 15px ${color}`;
  const offsetX = (Math.random() - 0.5) * 15;
  chispa.style.left = `calc(50% + ${offsetX}px)`;
  chispa.style.top = '55px';
  const dx = (Math.random() - 0.5) * 60;
  const dy = -(Math.random() * 80 + 60);
  chispa.style.setProperty('--dx', `${dx}px`);
  chispa.style.setProperty('--dy', `${dy}px`);
  const duracion = Math.random() * 1 + 0.8;
  chispa.style.animation = `chispa-subir ${duracion}s ease-out forwards`;
  llamaContainer.appendChild(chispa);
  setTimeout(() => { if (chispa.parentNode) chispa.parentNode.removeChild(chispa); }, duracion * 1000);
}

function lanzarChispaEsporadica() {
  if (Math.random() < 0.3) crearChispa();
  const siguiente = Math.random() * 7000 + 5000;
  setTimeout(lanzarChispaEsporadica, siguiente);
}

const canvas = document.getElementById('fuegosCanvas');
const ctx = canvas.getContext('2d');
let particulas = [];

function redimensionar() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', redimensionar);
redimensionar();

const paletaFuegos = ['#ff4d4d','#ffd700','#70ff70','#4dd2ff','#ff8ae0','#ffffff','#2ecc2e'];

function explosion(x, y) {
  const color = paletaFuegos[Math.floor(Math.random() * paletaFuegos.length)];
  const total = 40 + Math.floor(Math.random() * 30);
  for (let i = 0; i < total; i++) {
    const ang = (Math.PI * 2 * i) / total;
    const vel = 2 + Math.random() * 3;
    particulas.push({
      x: x, y: y,
      vx: Math.cos(ang) * vel,
      vy: Math.sin(ang) * vel,
      vida: 1,
      color: color,
      tam: 2 + Math.random() * 2
    });
  }
}

function animarFuegos() {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'lighter';

  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.vx *= 0.98;
    p.vida -= 0.012;
    if (p.vida <= 0) { particulas.splice(i, 1); continue; }
    ctx.globalAlpha = p.vida;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.tam, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(animarFuegos);
}
animarFuegos();

function enVentanaCelebracion() {
  if (DEBUG_CELERAR) return true;
  const now = new Date();
  const m = now.getMonth();
  const d = now.getDate();
  const h = now.getHours();
  const mi = now.getMinutes();
  const s = now.getSeconds();
  const pre  = (m === 11 && d === 31 && h === 23 && mi === 59 && s >= 50);
  const post = (m === 0  && d === 1  && h === 0  && mi === 0);
  return pre || post;
}

let lanzando = false;
function cicloFuegos() {
  if (enVentanaCelebracion()) {
    if (!lanzando) {
      lanzando = true;
      const intervalo = setInterval(() => {
        if (!enVentanaCelebracion()) {
          clearInterval(intervalo);
          lanzando = false;
          return;
        }
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.6;
        explosion(x, y);
      }, 450);
    }
  }
  setTimeout(cicloFuegos, 1000);
}
cicloFuegos();

function dispararCelebracion(anio) {
  yearReveal.textContent = anio;
  yearReveal.classList.remove('show');
  void yearReveal.offsetWidth;
  yearReveal.classList.add('show');
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      explosion(Math.random() * canvas.width, Math.random() * canvas.height * 0.5);
    }, i * 200);
  }
}

/* ===== LÓGICA DEL PANEL DE DONACIÓN Y MODAL DE BINANCE ===== */
const donateBtn = document.getElementById('donateBtn');
const donatePanel = document.getElementById('donatePanel');
const kofiBtn = document.getElementById('kofiBtn');
const binanceBtn = document.getElementById('binanceBtn');
const qrModal = document.getElementById('qrModal');
const qrClose = document.getElementById('qrClose');

const KOFI_URL = 'https://ko-fi.com/mar_gus';

// Abrir/cerrar el panel de opciones al tocar el botón Donate
donateBtn.addEventListener('click', () => {
  donatePanel.classList.toggle('open');
});

// Cerrar el panel si se toca fuera de él
document.addEventListener('click', (e) => {
  if (!donatePanel.contains(e.target) && !donateBtn.contains(e.target)) {
    donatePanel.classList.remove('open');
  }
});

// Abrir Ko-fi en nueva pestaña
kofiBtn.addEventListener('click', () => {
  window.open(KOFI_URL, '_blank');
  donatePanel.classList.remove('open');
});

// Abrir el modal del QR de Binance
binanceBtn.addEventListener('click', () => {
  qrModal.classList.add('open');
  donatePanel.classList.remove('open');
});

// Cerrar el modal del QR
qrClose.addEventListener('click', () => {
  qrModal.classList.remove('open');
});

// Cerrar el modal al tocar fuera del contenido
qrModal.addEventListener('click', (e) => {
  if (e.target === qrModal) {
    qrModal.classList.remove('open');
  }
});

/* ===== ARRANQUE ===== */
actualizar();
setInterval(actualizar, 1000);
lanzarChispaEsporadica();
