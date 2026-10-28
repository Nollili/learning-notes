// cookie-profile.mjs
export async function updateDisplayName({ displayName, csrfToken, signal }, send = fetch) {
  if (typeof displayName !== 'string' || displayName.trim().length < 1 || displayName.length > 80
    || typeof csrfToken !== 'string' || csrfToken.length < 1 || csrfToken.length > 512) {
    throw new TypeError('Invalid profile command');
  }
  const response = await send('/api/profile', {
    method: 'PATCH', credentials: 'same-origin', redirect: 'error', cache: 'no-store', signal,
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
    body: JSON.stringify({ displayName }),
  });
  await response.body?.cancel(); // This endpoint contract returns204, no representation.
  if (response.status !== 204) throw new Error('Profile update failed');
}
