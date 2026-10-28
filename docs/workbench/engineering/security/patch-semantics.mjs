// patch-semantics.mjs
export function setEmail(user, email) { return { ...user, email }; }
export function incrementVisits(user) { return { ...user, visits: user.visits + 1 }; }
const before = { email: 'old@example.test', visits: 0 };
const once = setEmail(before, 'new@example.test');
const twice = setEmail(once, 'new@example.test'); // Same intended state as once.
const addedTwice = incrementVisits(incrementVisits(before)); // visits2, not visits1.
