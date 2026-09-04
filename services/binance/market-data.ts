export interface TickerSnapshot {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  fetchedAt: string;
}

let bannedUntil = 0;
const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 120000;

function checkBan() {
  if (Date.now() < bannedUntil) {
    const secondsLeft = Math.ceil((bannedUntil - Date.now()) / 1000);
    throw new Error(
      `Binance temporarily rate limited this server. Retrying in ${secondsLeft}s.`
    );
  }
}

async function fetchJson(url: string) {
  checkBan();

  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const res = await fetch(url);

  if (res.status === 429 || res.status === 418) {
    const retryAfter = Number(res.headers.get("Retry-After")) || 60;
    bannedUntil = Date.now() + retryAfter * 1000;
    throw new Error(
      `Binance rate limit hit. Backing off for ${retryAfter}s.`
    );
  }

  if (!res.ok) {
    throw new Error(`Binance request failed: ${res.status}`);
  }

  const data = await res.json();
  cache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

export async function getTicker24h(symbol: string): Promise<TickerSnapshot> {
  const base = process.env.BINANCE_API_BASE_URL ?? "https://api.binance.com";
  const data = (await fetchJson(
    `${base}/api/v3/ticker/24hr?symbol=${symbol}`
  )) as { symbol: string; lastPrice: string; priceChangePercent: string };

  return {
    symbol: data.symbol,
    lastPrice: Number(data.lastPrice),
    priceChangePercent: Number(data.priceChangePercent),
    fetchedAt: new Date().toISOString(),
  };
}

export async function getRecentCloses(
  symbol: string,
  interval: string = "1h",
  limit: number = 24
): Promise<number[]> {
  const base = process.env.BINANCE_API_BASE_URL ?? "https://api.binance.com";
  const rows = (await fetchJson(
    `${base}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  )) as unknown[][];

  return rows.map((row) => Number(row[4]));
}
