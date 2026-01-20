const ws = new WebSocket(
  location.protocol === "https:"
    ? "wss://" + location.host
    : "ws://" + location.host
);

const freqMap = {
  low: 220,
  mid: 440,
  high: 880
};

let audioCtx = null;
let osc = null;

function startBeep(pitch) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  if (osc) return;

  osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freqMap[pitch];
  osc.connect(audioCtx.destination);
  osc.start();
}

function stopBeep() {
  if (osc) {
    osc.stop();
    osc.disconnect();
    osc = null;
  }
}

document.querySelectorAll("button").forEach(button => {
  const pitch = button.dataset.pitch;

  button.addEventListener("mousedown", () => {
    ws.send(JSON.stringify({
      type: "start",
      pitch: pitch
    }));
  });

  button.addEventListener("mouseup", () => {
    ws.send(JSON.stringify({ type: "stop" }));
  });

  button.addEventListener("mouseleave", () => {
    ws.send(JSON.stringify({ type: "stop" }));
  });

  // スマホ対応
  button.addEventListener("touchstart", e => {
    e.preventDefault();
    ws.send(JSON.stringify({
      type: "start",
      pitch: pitch
    }));
  });

  button.addEventListener("touchend", () => {
    ws.send(JSON.stringify({ type: "stop" }));
  });
});

ws.onmessage = event => {
  const data = JSON.parse(event.data);

  if (data.type === "start") {
    startBeep(data.pitch);
  }

  if (data.type === "stop") {
    stopBeep();
  }
};
