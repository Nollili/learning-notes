function bindingFixture() {
  'use strict';
  const beforeVar = value;
  var value = 3;
  let beforeLet;
  try { beforeLet = typeof later; } catch (error) { beforeLet = error.name; }
  let later = 4;
  const beforeFunction = declared();
  function declared() { return 5; }
  const owner = { value: 7, read() { return this?.value; }, makeArrow() { return () => this.value; } };
  const detached = owner.read;
  const lexical = owner.makeArrow();
  return { beforeVar, beforeLet, beforeFunction, later,
    method: owner.read(), detached: detached(), rebound: detached.call({ value: 9 }),
    arrow: lexical.call({ value: 99 }) };
}
function makeCounter(start) {
  let value = start;
  return () => ++value;
}

export { bindingFixture, makeCounter };
