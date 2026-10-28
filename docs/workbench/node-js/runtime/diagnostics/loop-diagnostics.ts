// loop-diagnostics.ts
import { monitorEventLoopDelay, performance } from 'node:perf_hooks';
export type LoopSample = { meanMs: number | null; p99Ms: number | null;
  maxMs: number | null; utilization: number };
export function startLoopDiagnostics(observe: (sample: LoopSample) => undefined,
  intervalMs = 10_000) {
  if (!Number.isInteger(intervalMs) || intervalMs < 10 || intervalMs > 60_000)
    throw new RangeError('Invalid reporting interval');
  const delay = monitorEventLoopDelay({ resolution: 20 });
  let previous = performance.eventLoopUtilization();
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true; clearInterval(timer); delay.disable();
  };
  delay.enable();
  const timer = setInterval(() => {
    const current = performance.eventLoopUtilization();
    const utilization = performance.eventLoopUtilization(current, previous).utilization;
    previous = current;
    const samples = delay.count > 0;
    const sample = { meanMs: samples ? delay.mean / 1_000_000 : null,
      p99Ms: samples ? delay.percentile(99) / 1_000_000 : null,
      maxMs: samples ? delay.max / 1_000_000 : null, utilization };
    delay.reset();
    try { observe(sample); } catch { stop(); }
  }, intervalMs);
  timer.unref();
  return { stop, get stopped() { return stopped; } };
}
