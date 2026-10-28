import { spawn } from 'node:child_process';

export async function runChild(
  command: string,
  args: string[],
  signal: AbortSignal,
): Promise<void> {
  signal.throwIfAborted();
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'inherit', 'inherit'],
      signal,
      killSignal: 'SIGKILL',
      shell: false,
    });
    let failure: Error | undefined;
    const onError = (error: Error): void => { failure ??= error; };
    child.on('error', onError);
    child.once('close', (code, childSignal) => {
      child.removeListener('error', onError);
      if (failure) reject(failure);
      else if (code === 0) resolve();
      else reject(new Error(`Child failed: code=${code}, signal=${childSignal}`));
    });
  });
}
