/** Poll real renderer state instead of assuming a fixed startup duration. */
export async function waitForSmokeCondition(
  probe: () => Promise<boolean>,
  description: string,
  { timeoutMs = 15_000, intervalMs = 100 } = {},
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  const timeoutError = () => new Error(`Timed out waiting for ${description} (${timeoutMs}ms)`);
  while (true) {
    const probeBudget = deadline - Date.now();
    if (probeBudget <= 0) throw timeoutError();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (await Promise.race([
        Promise.resolve().then(probe),
        new Promise<boolean>((_resolve, reject) => {
          timer = setTimeout(() => reject(timeoutError()), probeBudget);
        }),
      ])) return;
    } finally {
      clearTimeout(timer);
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw timeoutError();
    await new Promise((resolve) => setTimeout(resolve, Math.min(intervalMs, remaining)));
  }
}
