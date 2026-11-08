import { afterEach, describe, expect, it, vi } from 'vitest';
import { waitForSmokeCondition } from './smokeReadiness.js';

describe('UI smoke readiness', () => {
  afterEach(() => vi.useRealTimers());

  it('waits for a renderer that becomes ready after the former 2.5 second cutoff', async () => {
    vi.useFakeTimers();
    const started = Date.now();
    let ready = false;
    const result = waitForSmokeCondition(async () => Date.now() - started >= 4_000, 'renderer')
      .then(() => { ready = true; });
    await vi.advanceTimersByTimeAsync(2_500);
    expect(ready).toBe(false);
    await vi.advanceTimersByTimeAsync(1_500);
    await result;
    expect(ready).toBe(true);
  });

  it('fails with a bounded, descriptive timeout when the view never appears', async () => {
    vi.useFakeTimers();
    const result = waitForSmokeCondition(async () => false, 'playable preview', { timeoutMs: 500 });
    const assertion = expect(result).rejects.toThrow('Timed out waiting for playable preview (500ms)');
    await vi.advanceTimersByTimeAsync(500);
    await assertion;
  });

  it('preserves renderer errors instead of treating them as successful readiness', async () => {
    await expect(waitForSmokeCondition(async () => {
      throw new Error('Renderer reported a loading error');
    }, 'renderer')).rejects.toThrow('Renderer reported a loading error');
  });

  it('times out even when a renderer probe never resolves', async () => {
    vi.useFakeTimers();
    const result = waitForSmokeCondition(() => new Promise(() => {}), 'unresponsive renderer', { timeoutMs: 500 });
    const assertion = expect(result).rejects.toThrow('Timed out waiting for unresponsive renderer (500ms)');
    await vi.advanceTimersByTimeAsync(500);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
});
