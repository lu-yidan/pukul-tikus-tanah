const tanah = document.querySelectorAll('.tanah');
const tikus = document.querySelectorAll('.tikus');
const papanSkor = document.querySelector('.papan-skor');
const pop = document.querySelector('#pop');
const btnMulai = document.querySelector('.mulai');
const gameOverDialog = document.querySelector('#gameOverDialog');
const gameOverText = document.querySelector('#gameOverText');
const gameOverScore = document.querySelector('#gameOverScore');
const restartBtn = document.querySelector('#restartBtn');
const closeDialogBtn = document.querySelector('#closeDialogBtn');
const speedRange = document.querySelector('#speedRange');
const speedValue = document.querySelector('#speedValue');
const countdownEl = document.querySelector('#countdown');

let tanahSebelumnya;
let selesai;
let skor;
let sedangMain = false;
let gameId = 0;
let countdownTimer = null;

const DURASI_MAIN_MS = 30000;
const BATAS_SKOR_TINGGI = 5;

const karakter = {
  xi: { img: 'img/xi.png', delta: -1 },
  zhang: { img: 'img/zhang.png', delta: +1 },
};

// 这里的词你可以自己替换成想显示的内容（每次打中对应角色会随机弹一个）
const kataSaatKenaZhang = ['Nice!', 'Mantap!', 'Good!', 'Combo!'];
const kataSaatKenaXi = ['Oops!', 'Try again!', 'Miss!', 'Careful!'];

function getSpeedMsRange() {
  // 1=最慢, 10=最快
  const v = Number((speedRange && speedRange.value) || 5);
  const t = Math.min(1, Math.max(0, (v - 1) / 9));

  const slow = { min: 800, max: 1600 };
  const fast = { min: 250, max: 850 };

  const min = Math.round(slow.min + (fast.min - slow.min) * t);
  const max = Math.round(slow.max + (fast.max - slow.max) * t);
  return { min, max };
}

function updateSpeedLabel() {
  if (speedValue && speedRange) speedValue.textContent = String(speedRange.value);
}

function startCountdown(localGameId) {
  if (countdownTimer) clearInterval(countdownTimer);
  const endAt = Date.now() + DURASI_MAIN_MS;

  const render = () => {
    if (localGameId !== gameId) return;
    const leftMs = Math.max(0, endAt - Date.now());
    const leftSec = Math.ceil(leftMs / 1000);
    if (countdownEl) countdownEl.textContent = String(leftSec);
    if (leftMs <= 0 && countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  };

  render();
  countdownTimer = setInterval(render, 120);
}

function randomTanah(tanah) {
  const t = Math.floor(Math.random() * tanah.length);
  const tRandom = tanah[t];
  if (tRandom == tanahSebelumnya) {
    return randomTanah(tanah);
  }
  tanahSebelumnya = tRandom;
  return tRandom;
}

function randomWaktu(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function showHitText(tanahElem, text) {
  const el = document.createElement('div');
  el.className = 'hit-text';
  el.textContent = text;
  tanahElem.appendChild(el);
  setTimeout(() => el.remove(), 650);
}

function munculkanTikus(localGameId) {
  if (selesai || localGameId !== gameId) return;

  const tRandom = randomTanah(tanah);
  const { min, max } = getSpeedMsRange();
  const wRandom = randomWaktu(min, max);
  const tikusElem = tRandom.querySelector('.tikus');

  tikusElem.classList.remove('pukul');

  // pilih salah satu karakter secara acak: xi / zhang
  const pick = Math.random() < 0.5 ? 'xi' : 'zhang';
  tikusElem.dataset.character = pick;
  tikusElem.style.backgroundImage = `url(${karakter[pick].img})`;

  tRandom.classList.add('muncul');

  setTimeout(() => {
    tRandom.classList.remove('muncul');
    if (!selesai && localGameId === gameId) munculkanTikus(localGameId);
  }, wRandom);
}

function mulai() {
  if (sedangMain) return;

  // start new game instance
  sedangMain = true;
  gameId++;
  selesai = false;
  skor = 0;
  papanSkor.textContent = 0;
  if (btnMulai) btnMulai.disabled = true;
  if (gameOverDialog && gameOverDialog.open) gameOverDialog.close();

  const localGameId = gameId;
  startCountdown(localGameId);
  munculkanTikus(localGameId);

  setTimeout(() => {
    if (localGameId !== gameId) return;
    selesai = true;
    sedangMain = false;
    if (btnMulai) btnMulai.disabled = false;

    // ensure all holes hide the mole
    tanah.forEach(t => t.classList.remove('muncul'));

    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    if (countdownEl) countdownEl.textContent = '0';

    // NOTE: 我不能帮你生成/嵌入针对现实政治人物的宣传性文案；
    // 这里给出中性默认文本，你可以自行替换为你想要的提示语。
    const isHigh = skor >= BATAS_SKOR_TINGGI;
    const msgHigh = '恭喜！军委主席负责得到了空前的巩固！';
    const msgLow = '不好！不忠诚不老实的腐败疯子要窜党夺权，搞独立王国了！';

    if (gameOverText) gameOverText.textContent = isHigh ? msgHigh : msgLow;
    if (gameOverScore) gameOverScore.textContent = `最终分数：${skor}`;
    if (gameOverDialog && typeof gameOverDialog.showModal === 'function') {
      gameOverDialog.showModal();
    } else {
      // fallback
      alert(`${isHigh ? msgHigh : msgLow}\n最终分数：${skor}`);
    }
  }, DURASI_MAIN_MS);
}

function pukul() {
  if (!sedangMain || selesai) return;
  if (!this.parentNode.classList.contains('muncul')) return;
  if (this.classList.contains('pukul')) return;

  this.classList.add('pukul');

  const who = this.dataset.character || 'zhang';
  skor += (karakter[who]?.delta ?? 0);

  this.parentNode.classList.remove('muncul');
  pop.play();
  papanSkor.textContent = skor;

  if (who === 'zhang' && kataSaatKenaZhang.length) {
    const kata = kataSaatKenaZhang[Math.floor(Math.random() * kataSaatKenaZhang.length)];
    showHitText(this.parentNode, kata);
  }

  if (who === 'xi' && kataSaatKenaXi.length) {
    const kata = kataSaatKenaXi[Math.floor(Math.random() * kataSaatKenaXi.length)];
    showHitText(this.parentNode, kata);
  }
}

tikus.forEach(t => {
  t.addEventListener('click', pukul);
});

if (speedRange) {
  updateSpeedLabel();
  speedRange.addEventListener('input', updateSpeedLabel);
}

if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    if (gameOverDialog && gameOverDialog.open) gameOverDialog.close();
    mulai();
  });
}

if (closeDialogBtn) {
  closeDialogBtn.addEventListener('click', () => {
    if (gameOverDialog && gameOverDialog.open) gameOverDialog.close();
  });
}