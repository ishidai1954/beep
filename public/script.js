const ws = new WebSocket(
  (location.protocol === "https:" ? "wss://" : "ws://") + location.host
);

let audioCtx;
let oscillator;
let locked = false;

const buttons = document.querySelectorAll("button");

ws.onmessage = event => {
  const data = JSON.parse(event.data);

  if (data.type === "lock") {
    locked = data.locked;
    updateButtons();
  }

  if (data.type === "start") {
    startBeep(data.pitch);
  }

  if (data.type === "stop") {
    stopBeep();
  }
};

function startBeep(pitch) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  oscillator = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = pitch;

  // ★ 音量をここで固定（0.0〜1.0）
  gainNode.gain.value = 0.05;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
}


function stopBeep() {
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
}

function updateButtons() {
  buttons.forEach(btn => {
    btn.disabled = locked;
  });
}

buttons.forEach(btn => {
  const pitch = Number(btn.dataset.pitch);

  btn.addEventListener("mousedown", () => {
    if (locked) return;
    ws.send(JSON.stringify({ type: "start", pitch }));
  });

  btn.addEventListener("mouseup", () => {
    ws.send(JSON.stringify({ type: "stop" }));
  });

  btn.addEventListener("mouseleave", () => {
    ws.send(JSON.stringify({ type: "stop" }));
  });

  // スマホ対応
  btn.addEventListener("touchstart", e => {
    e.preventDefault();
    if (locked) return;
    ws.send(JSON.stringify({ type: "start", pitch }));
  });

  btn.addEventListener("touchend", () => {
    ws.send(JSON.stringify({ type: "stop" }));
  });
});
