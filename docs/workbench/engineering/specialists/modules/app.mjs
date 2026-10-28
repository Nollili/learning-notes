// app.mjs
import {createBus} from './eventBus.mjs';
const bus = createBus();
const unsubscribe = bus.on('userLoggedIn', async data => {
  console.log('Welcome', data.name);
});
try { await bus.emit('userLoggedIn', {name: 'Lili'}); }
finally { unsubscribe(); bus.clear(); }
