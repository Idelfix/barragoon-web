'use strict';
const play = document.querySelector('#play');
const canvas = document.querySelector('#unity-canvas');
const cover = document.querySelector('#cover');
const loading = document.querySelector('#loading');
const errorPanel = document.querySelector('#error');
const fullscreen = document.querySelector('#fullscreen');
let instance;
let starting = false;
function fail(message) {
  starting = false;
  loading.hidden = true;
  errorPanel.hidden = false;
  document.querySelector('#error-message').textContent = message;
}
play.addEventListener('click', async () => {
  if (starting || instance) return;
  starting = true;
  cover.hidden = true;
  loading.hidden = false;
  errorPanel.hidden = true;
  if (!window.BARRAGOON_BUILD) return fail('Die Spieldateien sind derzeit nicht erreichbar. Bitte lade die Seite erneut.');
  const testCanvas = document.createElement('canvas');
  if (!testCanvas.getContext('webgl2')) return fail('Für dieses Spiel brauchst du einen Browser mit WebGL 2. Aktiviere die Hardwarebeschleunigung oder verwende einen aktuellen Browser.');
  try {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = window.BARRAGOON_BUILD.loaderUrl;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Der Spiele-Loader konnte nicht geladen werden. Prüfe deine Internetverbindung.'));
      document.body.appendChild(script);
    });
    instance = await createUnityInstance(canvas, {
      ...window.BARRAGOON_BUILD.config,
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
      showBanner: (message, type) => { if (type === 'error') fail(String(message)); }
    }, value => {
      document.querySelector('#progress').value = value;
      document.querySelector('#percent').textContent = `${Math.round(value * 100)} %`;
    });
    loading.hidden = true;
    canvas.classList.add('ready');
    fullscreen.disabled = false;
    canvas.focus();
  } catch (error) {
    fail('Das Spiel konnte nicht geladen werden. Bitte prüfe deine Verbindung und versuche es erneut. ' + (error.message || String(error)));
  }
});
fullscreen.addEventListener('click', () => { if (instance) instance.SetFullscreen(1); });
document.querySelector('#retry').addEventListener('click', () => window.location.reload());
