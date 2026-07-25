/**
 * Serializes Riot API calls and enforces a set of sliding-window rate limits
 * (Riot's dev keys default to 20 req/1s and 100 req/2min; production keys
 * differ per method, hence this being configurable via env vars).
 *
 * The "check window + reserve a slot" step runs as a critical section
 * (chained promise acting as a mutex) so concurrent callers can't all pass
 * the check before any of them records its request.
 */

type Window = { limit: number; windowMs: number; timestamps: number[] };

function parseWindows(envValue: string | undefined, fallback: string): Window[] {
  const raw = envValue ?? fallback;
  return raw.split(",").map((part) => {
    const [limit, seconds] = part.split(":").map(Number);
    return { limit, windowMs: seconds * 1000, timestamps: [] };
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class RiotRateLimiter {
  private windows: Window[];
  private mutex: Promise<void> = Promise.resolve();

  constructor() {
    // Format: "requests:seconds,requests:seconds" — defaults match a Riot dev key.
    this.windows = parseWindows(process.env.RIOT_RATE_LIMITS, "20:1,100:120");
  }

  private msUntilSlotFree(): number {
    const now = Date.now();
    let wait = 0;
    for (const w of this.windows) {
      w.timestamps = w.timestamps.filter((t) => now - t < w.windowMs);
      if (w.timestamps.length >= w.limit) {
        const oldest = w.timestamps[0];
        wait = Math.max(wait, w.windowMs - (now - oldest) + 5);
      }
    }
    return wait;
  }

  private reserveSlot() {
    const now = Date.now();
    for (const w of this.windows) w.timestamps.push(now);
  }

  /** Blocks until a slot is available under every configured window, then reserves it. */
  private async acquire(): Promise<void> {
    const release = this.mutex;
    let resolveNext!: () => void;
    this.mutex = new Promise((resolve) => (resolveNext = resolve));
    await release;
    try {
      let wait = this.msUntilSlotFree();
      while (wait > 0) {
        await sleep(wait);
        wait = this.msUntilSlotFree();
      }
      this.reserveSlot();
    } finally {
      resolveNext();
    }
  }

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    return fn();
  }
}

export const riotRateLimiter = new RiotRateLimiter();
