// =========================
// Utilities: Date & Greeting (ID locale) - REAL TIME
// =========================
const hariID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const bulanID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function pad(n){return n.toString().padStart(2,'0')}

function getGreetingByHour(h){
  if (h >= 5 && h < 11) return 'Selamat Pagi 🌞';
  if (h >= 11 && h < 15) return 'Selamat Siang 🌤️';
  if (h >= 15 && h < 18) return 'Selamat Sore 🌅';
  return 'Selamat Malam 🌙';
}

function updateDateTime(){
  const now = new Date();
  const tText = `${hariID[now.getDay()]}, ${now.getDate()} ${bulanID[now.getMonth()]} ${now.getFullYear()}`;
  const cText = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const gText = getGreetingByHour(now.getHours());
  document.getElementById('todayText').textContent = tText;
  document.getElementById('clockText').textContent = cText;
  document.getElementById('greetText').textContent = gText;
}
updateDateTime();
setInterval(updateDateTime, 1000);

// =========================
// Particles (blue dots floating)
// =========================
const bgParticles = document.getElementById('bgParticles');
function spawnParticle(){
  const el = document.createElement('span');
  el.className = 'particle';
  el.style.left = Math.random()*100 + 'vw';
  el.style.animationDuration = (3 + Math.random()*3) + 's';
  el.style.width = el.style.height = (4 + Math.random()*6) + 'px';
  bgParticles.appendChild(el);
  setTimeout(()=> el.remove(), 7000);
}
const particleTimer = setInterval(spawnParticle, 420);

// =========================
// Music controls - AUTOPLAY ON BUTTON CLICK
// =========================
const bgm = document.getElementById('bgm');
let musicPlaying = false;

function playMusic() {
  if (!musicPlaying) {
    bgm.play().then(() => {
      musicPlaying = true;
      console.log('Music started playing!');
    }).catch((e) => {
      console.log('Could not play music:', e);
    });
  }
}

// =========================
// Opening -> Slider Transition
// =========================
const opening = document.getElementById('opening');
const btnStart = document.getElementById('btnStart');
const slider = document.getElementById('slider');

btnStart.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  playMusic();
  opening.classList.add('hide');
  
  setTimeout(() => {
    opening.style.display = 'none';
    slider.classList.add('show');
  }, 820);
});

// =========================
// Slider Logic (stacked)
// =========================
const cards = Array.from(document.querySelectorAll('.card'));
const indicators = document.getElementById('indicators');
let current = 0;

function buildIndicators(){
  indicators.innerHTML = '';
  cards.forEach((_,i)=>{
    const d = document.createElement('span');
    d.className = 'dot' + (i===current ? ' active' : '');
    indicators.appendChild(d);
  })
}

function updateCards(){
  cards.forEach((card, i) => {
    card.classList.remove('active','left','right');
    if (i === current) {
      card.classList.add('active');
    } else if (i === (current - 1 + cards.length) % cards.length) {
      card.classList.add('left');
    } else if (i === (current + 1) % cards.length) {
      card.classList.add('right');
    }
  });
  const dots = indicators.querySelectorAll('.dot');
  dots.forEach((dot, i)=>{
    dot.classList.toggle('active', i===current);
  })
}

function move(dir){
  current = (current + dir + cards.length) % cards.length;
  updateCards();
  preloadAround(current);
}

document.getElementById('btnPrev').addEventListener('click', ()=> move(-1));
document.getElementById('btnNext').addEventListener('click', ()=> move(1));

window.addEventListener('keydown', (e)=>{
  if (!opening.classList.contains('hide')){
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btnStart.click();
    }
  } else {
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
  }
})

let startX = 0, startY = 0, dragging = false;
slider.addEventListener('touchstart', (e)=>{
  if (opening.classList.contains('hide')){
    dragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }
}, {passive:true});

slider.addEventListener('touchmove', (e)=>{
  if(!dragging) return;
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;
  if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();
}, {passive:false});

slider.addEventListener('touchend', (e)=>{
  if(!dragging) return; dragging=false;
  const dx = (e.changedTouches[0].clientX - startX);
  if (Math.abs(dx) > 40){
    if (dx < 0) move(1); else move(-1);
  }
});

let mouseDown = false, mStart = 0;
slider.addEventListener('mousedown', (e)=>{ 
  if (!opening.classList.contains('hide')){
    mouseDown=true; mStart=e.clientX; 
  }
});
window.addEventListener('mouseup', (e)=>{
  if(!mouseDown) return; mouseDown=false;
  const dx = e.clientX - mStart;
  if (Math.abs(dx) > 50){ if (dx < 0) move(1); else move(-1); }
});

function preloadAround(index){
  const around = [index, (index+1)%cards.length, (index-1+cards.length)%cards.length];
  around.forEach(i=>{
    const img = cards[i].querySelector('img');
    if (img && img.dataset && !img.dataset.preloaded){
      const src = img.getAttribute('src');
      const tmp = new Image(); tmp.src = src; img.dataset.preloaded = '1';
    }
  });
}

function setCardBackgrounds() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    const img = card.querySelector('.media img');
    const mediaContainer = card.querySelector('.media');
    if (img && mediaContainer) {
      mediaContainer.style.backgroundImage = `url("${img.src}")`;
      mediaContainer.style.backgroundSize = 'cover';
      mediaContainer.style.backgroundPosition = 'center center';
      mediaContainer.style.backgroundRepeat = 'no-repeat';
    }
  });
}

function waitForImagesAndSetBg() {
  const images = document.querySelectorAll('.card .media img');
  let loadedCount = 0;
  
  if (images.length === 0) {
    setCardBackgrounds();
    return;
  }
  
  images.forEach(img => {
    if (img.complete) {
      loadedCount++;
    } else {
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setCardBackgrounds();
        }
      };
    }
  });
  
  if (loadedCount === images.length) {
    setCardBackgrounds();
  }
  setTimeout(setCardBackgrounds, 2000);
}

buildIndicators();
updateCards();
preloadAround(current);
waitForImagesAndSetBg();

window.addEventListener('error', (e)=>{
  if (e.target.tagName === 'IMG'){
    e.target.style.background = '#123a4f';
  }
}, true);
