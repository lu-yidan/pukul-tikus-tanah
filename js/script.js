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
const BATAS_SKOR_TINGGI = 8;

// 音效系统：使用Web Audio API创建厚重的音效
let audioContext = null;
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// 播放爽快有力的正确音效（打中Zhang）
function playGoodSound() {
  initAudioContext();
  const now = audioContext.currentTime;

  // 1. 打击的"啪"声 - 短促的噪音burst
  const bufferSize = audioContext.sampleRate * 0.05; // 50ms
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    // 生成白噪音，并快速衰减
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
  }

  const noiseSource = audioContext.createBufferSource();
  const noiseGain = audioContext.createGain();
  noiseSource.buffer = buffer;
  noiseSource.connect(noiseGain);
  noiseGain.connect(audioContext.destination);

  noiseGain.gain.setValueAtTime(0.25, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

  noiseSource.start(now);

  // 2. 厚重的低频冲击
  const bassOsc = audioContext.createOscillator();
  const bassGain = audioContext.createGain();

  bassOsc.connect(bassGain);
  bassGain.connect(audioContext.destination);

  bassOsc.frequency.setValueAtTime(150, now);
  bassOsc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
  bassOsc.type = 'triangle';

  // 瞬间打击感 - 快速attack，快速decay
  bassGain.gain.setValueAtTime(0, now);
  bassGain.gain.linearRampToValueAtTime(0.3, now + 0.005); // 5ms极速attack
  bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  bassOsc.start(now);
  bassOsc.stop(now + 0.15);

  // 3. 中高频的"铛"声 - 增加明亮度
  const midOsc = audioContext.createOscillator();
  const midGain = audioContext.createGain();

  midOsc.connect(midGain);
  midGain.connect(audioContext.destination);

  midOsc.frequency.value = 520;
  midOsc.type = 'sine';

  midGain.gain.setValueAtTime(0, now);
  midGain.gain.linearRampToValueAtTime(0.12, now + 0.003);
  midGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

  midOsc.start(now);
  midOsc.stop(now + 0.12);
}

// 播放厚重的错误音效（打中Xi）
function playBadSound() {
  initAudioContext();
  const now = audioContext.currentTime;

  // 低沉的双音效果
  for (let i = 0; i < 2; i++) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 更低的频率，产生警示感但不刺耳
    oscillator.frequency.value = 120 + (i * 10);
    oscillator.type = 'triangle'; // 使用三角波替代刺耳的锯齿波

    // 更长的音量包络，更有重量感
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }
}

const karakter = {
  xi: { img: 'img/person/Trump.png', delta: -2 },  // 打错了惩罚更严重
  zhang: { img: 'img/person/Pelosi.png', delta: +1 },
};

// 更具震撼力的文案
const kataSaatKenaZhang = [
  '除恶务尽！',
  '铁拳出击！',
  '绝不姑息！',
  '严惩不贷！',
  '打虎拍蝇！',
  '反腐到底！',
  '刮骨疗毒！',
  '零容忍！',
  '坚决查处！',
  '从严治党！',
  '正风肃纪！',
  '铁面无私！',
  '除恶扬善！',
  '惩治腐败！',
  '雷霆手段！',
  '一查到底！',
  '绝不手软！',
  '依法严惩！',
  '天网恢恢！',
  '自取灭亡！'
];
const kataSaatKenaXi = [
  '妄议中央！',
  '政治站位不正！',
  '违反纪律！',
  '严重错误！',
  '大逆不道！',
  '该当何罪！',
  '两面人！',
  '阳奉阴违！',
  '目无法纪！',
  '肆意妄为！',
  '胆大妄为！',
  '违背初心！',
  '背离宗旨！',
  '严重违纪！',
  '思想滑坡！',
  '纪律松弛！',
  '立场动摇！',
  '态度恶劣！',
  '性质恶劣！',
  '影响极坏！'
];

let combo = 0;
let maxCombo = 0;

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

function showHitText(tanahElem, text, isGood = true) {
  const el = document.createElement('div');
  el.className = isGood ? 'hit-text hit-good' : 'hit-text hit-bad';
  el.textContent = text;
  tanahElem.appendChild(el);

  // 添加震动效果
  if (!isGood) {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);
  }

  setTimeout(() => el.remove(), 800);
}

// 显示连击效果
function showCombo(comboCount) {
  const existing = document.querySelector('.combo-display');
  if (existing) existing.remove();

  if (comboCount < 3) return;

  const el = document.createElement('div');
  el.className = 'combo-display';
  el.innerHTML = `<div class="combo-number">${comboCount}连击！</div><div class="combo-text">威武！势不可挡！</div>`;
  document.body.appendChild(el);

  setTimeout(() => el.remove(), 1500);
}

// 屏幕闪烁效果
function screenFlash(color = 'red') {
  const flash = document.createElement('div');
  flash.className = 'screen-flash';
  flash.style.background = color === 'red' ? 'rgba(139, 26, 26, 0.35)' : 'rgba(251, 191, 36, 0.45)';
  document.body.appendChild(flash);

  setTimeout(() => flash.remove(), 300);
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

  // 初始化音频上下文（需要用户交互）
  initAudioContext();

  // start new game instance
  sedangMain = true;
  gameId++;
  selesai = false;
  skor = 0;
  combo = 0;
  maxCombo = 0;
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

    const isHigh = skor >= BATAS_SKOR_TINGGI;

    let msgHigh, msgLow;
    if (skor >= 15) {
      msgHigh = '🔥 雷霆万钧！铁腕反腐！🔥\n腐败分子无处遁形，党纪国法不容挑战！';
    } else if (skor >= BATAS_SKOR_TINGGI) {
      msgHigh = '✊ 正风肃纪，刮骨疗毒！\n反腐败斗争取得压倒性胜利！';
    } else if (skor >= 0) {
      msgLow = '⚠️ 警惕！立场不稳！\n必须旗帜鲜明讲政治，坚决维护核心！';
    } else {
      msgLow = '🚨 严重政治错误！🚨\n妄议中央，该当何罪！必须深刻反省！';
    }

    const comboText = maxCombo >= 5 ? `\n最高连击：${maxCombo} 连击！` : '';

    if (gameOverText) gameOverText.textContent = isHigh ? msgHigh : msgLow;
    if (gameOverScore) gameOverScore.textContent = `最终分数：${skor}${comboText}`;
    if (gameOverDialog && typeof gameOverDialog.showModal === 'function') {
      gameOverDialog.showModal();
    } else {
      // fallback
      alert(`${isHigh ? msgHigh : msgLow}\n最终分数：${skor}${comboText}`);
    }
  }, DURASI_MAIN_MS);
}

function pukul() {
  if (!sedangMain || selesai) return;
  if (!this.parentNode.classList.contains('muncul')) return;
  if (this.classList.contains('pukul')) return;

  this.classList.add('pukul');

  const who = this.dataset.character || 'zhang';
  const scoreDelta = karakter[who]?.delta ?? 0;
  skor += scoreDelta;

  this.parentNode.classList.remove('muncul');

  // 连击系统
  if (who === 'zhang') {
    combo++;
    if (combo > maxCombo) maxCombo = combo;

    // 播放Pop.mp3音效
    if (pop) {
      pop.currentTime = 0;
      pop.volume = 0.7;
      pop.play().catch(() => {});
    }

    // 连击加成
    if (combo >= 3) {
      const bonusScore = Math.floor(combo / 3);
      skor += bonusScore;
      showCombo(combo);
    }

    screenFlash('gold');
  } else {
    // 打错了，连击归零
    combo = 0;

    // 播放错误音效（低频警报）
    playBadSound();

    screenFlash('red');
  }

  papanSkor.textContent = skor;

  // 添加分数变化动画
  const scoreChange = document.createElement('div');
  scoreChange.className = 'score-change';
  scoreChange.textContent = scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`;
  scoreChange.style.color = scoreDelta > 0 ? '#fbbf24' : '#ef4444';
  const statsEl = document.querySelector('.stat-value');
  if (statsEl) {
    statsEl.parentElement.appendChild(scoreChange);
    setTimeout(() => scoreChange.remove(), 1000);
  }

  if (who === 'zhang' && kataSaatKenaZhang.length) {
    const kata = kataSaatKenaZhang[Math.floor(Math.random() * kataSaatKenaZhang.length)];
    showHitText(this.parentNode, kata, true);
  }

  if (who === 'xi' && kataSaatKenaXi.length) {
    const kata = kataSaatKenaXi[Math.floor(Math.random() * kataSaatKenaXi.length)];
    showHitText(this.parentNode, kata, false);
  }
}

tikus.forEach(t => {
  t.addEventListener('click', pukul);
  // 添加触摸事件支持，移动端体验更好
  t.addEventListener('touchstart', function(e) {
    e.preventDefault(); // 防止触发click事件
    pukul.call(this);
  }, { passive: false });
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