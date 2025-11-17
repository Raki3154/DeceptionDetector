// static/script.js
let recorder, audioChunks = [];
let audioContext, analyser, bufferLength, dataArray, source, drawId;
const recordBtn = document.getElementById('recordBtn');
const player = document.getElementById('player');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas ? canvas.getContext('2d') : null;

const audioInput = document.getElementById('audio');
const videoInput = document.getElementById('video');
const audioPreview = document.getElementById('audioPreview');
const videoPreview = document.getElementById('videoPreview');

if (audioInput) {
  audioInput.addEventListener('change', (e) => {
    audioPreview.innerHTML = "";
    const f = e.target.files[0];
    if (!f) return;
    const a = document.createElement('audio');
    a.controls = true; a.src = URL.createObjectURL(f);
    audioPreview.appendChild(a);
  });
}

if (videoInput) {
  videoInput.addEventListener('change', (e) => {
    videoPreview.innerHTML = "";
    const f = e.target.files[0];
    if (!f) return;
    const v = document.createElement('video');
    v.controls = true; v.width = 220;
    v.src = URL.createObjectURL(f);
    videoPreview.appendChild(v);
  });
}

async function startVis(stream){
  audioContext = new (window.AudioContext||window.webkitAudioContext)();
  source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  source.connect(analyser);
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  draw();
}

function draw(){
  drawId = requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);
  canvasCtx.clearRect(0,0,canvas.width,canvas.height);
  const barWidth = (canvas.width / bufferLength) * 1.6;
  let x = 0;
  for(let i=0;i<bufferLength;i++){
    const v = dataArray[i] / 255;
    const h = v * canvas.height;
    canvasCtx.fillStyle = `rgba(${Math.round(60 + v*120)}, ${Math.round(120 - v*60)}, ${200 - Math.round(v*100)}, 0.9)`;
    canvasCtx.fillRect(x, canvas.height - h, barWidth, h);
    x += barWidth + 1;
  }
}

if (recordBtn){
  recordBtn.addEventListener('click', async () => {
    if (recordBtn.innerText.includes('Start')) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new MediaRecorder(stream);
      audioChunks = [];
      recorder.ondataavailable = e => audioChunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const file = new File([blob], 'recorded_audio.webm', { type: 'audio/webm' });
        const dt = new DataTransfer();
        dt.items.add(file);
        audioInput.files = dt.files;

        player.src = URL.createObjectURL(blob);
        player.style.display = 'block';
        audioPreview.innerHTML = "";
        const a = document.createElement('audio'); a.controls = true; a.src = player.src;
        audioPreview.appendChild(a);
      };
      recorder.start();
      startVis(stream);
      recordBtn.innerText = '⏹ Stop Recording';
    } else {
      recorder.stop();
      if (drawId) cancelAnimationFrame(drawId);
      if (audioContext) audioContext.close();
      recordBtn.innerText = '🎤 Start Recording';
    }
  });
}

// Form submit guard: require at least one input
const form = document.getElementById('analysisForm');
form.addEventListener('submit', (e) => {
  const text = (document.getElementById('text').value || '').trim();
  const audioFiles = audioInput.files.length;
  const videoFiles = videoInput.files.length;
  if (!text && audioFiles === 0 && videoFiles === 0) {
    e.preventDefault();
    alert('Please provide text or an audio/video file for analysis.');
    return;
  }
});