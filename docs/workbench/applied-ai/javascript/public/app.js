const form = document.querySelector('#chat');
const input = document.querySelector('#question');
const messages = document.querySelector('#messages');
const status = document.querySelector('#status');
const send = document.querySelector('#send');
const stop = document.querySelector('#stop');
const reset = document.querySelector('#reset');
let history = [];
let active;

function append(label, text) {
  const line = document.createElement('p');
  line.textContent = `${label}: ${text}`;
  messages.append(line);
  while (messages.children.length > 12) messages.firstElementChild.remove();
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (active || !input.value.trim()) return;
  const question = input.value.trim();
  const controller = new AbortController();
  active = controller;
  send.disabled = true;
  stop.disabled = false;
  reset.disabled = true;
  status.textContent = 'Waiting for the server…';
  try {
    const response = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history }), signal: controller.signal
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed.');
    append('You', question);
    append('Assistant', data.answer);
    history = data.history;
    input.value = '';
    status.textContent = data.mode === 'mock' ? 'Complete · offline simulation; no model called.' : 'Complete · live model response.';
  } catch (error) {
    status.textContent = error.name === 'AbortError' ? 'Stopped. This turn was not added to history.' : error.message;
  } finally {
    active = undefined;
    send.disabled = false;
    stop.disabled = true;
    reset.disabled = false;
    input.focus();
  }
});
stop.addEventListener('click', () => active?.abort());
reset.addEventListener('click', () => { history = []; messages.replaceChildren(); status.textContent = 'Conversation reset.'; });
