export interface TickerSnapshot {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  fetchedAt: string;
}

export async function getTicker24h(symbol: string): Promise<TickerSnapshot> {
  const base = process.env.BINANCE_API_BASE_URL ?? "https://api.binance.com";
  const res = await fetch(`${base}/api/v3/ticker/24hr?symbol=${symbol}`);

  if (!res.ok) {
    throw new Error(`Binance ticker request failed: ${res.status}`);
  }

  const data = await res.json();

  return {
    symbol: data.symbol,
    lastPrice: Number(data.lastPrice),
    priceChangePercent: Number(data.priceChangePercent),
    fetchedAt: new Date().toISOString(),
  };
}
