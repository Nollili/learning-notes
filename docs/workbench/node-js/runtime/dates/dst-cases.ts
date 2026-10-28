// dst-cases.ts — import helpers from the preceding modules
import { parseUtcInstant, addElapsedMilliseconds } from './date-boundaries.js';
import { makeDateDisplay } from './zoned-display.js';
const budapest = makeDateDisplay('hu-HU', 'Europe/Budapest');
export const springBefore = budapest.parts(parseUtcInstant('2026-03-29T00:30:00.000Z'));
export const springAfter = budapest.parts(parseUtcInstant('2026-03-29T01:30:00.000Z'));
export const autumnFirst = budapest.parts(parseUtcInstant('2026-10-25T00:30:00.000Z'));
export const autumnSecond = budapest.parts(parseUtcInstant('2026-10-25T01:30:00.000Z'));
const noonBeforeSpring = parseUtcInstant('2026-03-28T11:00:00.000Z');
export const after24Hours = budapest.parts(addElapsedMilliseconds(noonBeforeSpring, 86400000));
