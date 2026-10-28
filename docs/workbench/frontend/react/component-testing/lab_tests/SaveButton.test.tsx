// lab_tests/SaveButton.test.tsx
import { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { SaveButton } from '../SaveButton.js';

test('pending disables duplicate requests, then reports confirmed completion', async () => {
  let complete: () => void = () => { throw new Error('Save not started'); };
  const save = vi.fn(() => new Promise<void>(resolve => { complete = resolve; }));
  const user = userEvent.setup();
  render(<StrictMode><SaveButton save={save} /></StrictMode>);
  await user.click(screen.getByRole('button', { name: 'Save' }));
  const pending = screen.getByRole<HTMLButtonElement>('button', { name: 'Saving…' });
  expect(pending.disabled).toBe(true);
  await user.click(pending);
  expect(save).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('status')).toBeNull();
  await act(async () => { complete(); });
  expect((await screen.findByRole('status')).textContent).toBe('Saved successfully.');
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Save again' }).disabled).toBe(false);
});

test('failure is visible and retry is an explicit new attempt', async () => {
  const save = vi.fn<() => Promise<void>>()
    .mockRejectedValueOnce(new Error('PRIVATE_SERVER_DIAGNOSTIC')).mockResolvedValueOnce(undefined);
  const user = userEvent.setup();
  render(<SaveButton save={save} />);
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect((await screen.findByRole('alert')).textContent).toBe('Save failed. Retry when ready.');
  expect(document.body.textContent).not.toContain('PRIVATE_SERVER_DIAGNOSTIC');
  await user.click(screen.getByRole('button', { name: 'Retry save' }));
  expect((await screen.findByRole('status')).textContent).toBe('Saved successfully.');
  expect(save).toHaveBeenCalledTimes(2);
});

test('serialized markup does not measure an external stylesheet change', () => {
  const { container } = render(<SaveButton save={async () => {}} />);
  const before = container.innerHTML;
  const style = document.createElement('style');
  style.textContent = 'button { color: rgb(255, 0, 0); font-size: 40px; }';
  document.head.append(style);
  try { expect(container.innerHTML).toBe(before); }
  finally { style.remove(); }
});
