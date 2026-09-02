import { NextResponse } from "next/server";
import { getTicker24h, getRecentCloses } from "../../../services/binance/market-data";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

const RANGES: Record<string, { interval: string; limit: number }> = {
  "24h": { interval: "1h", limit: 24 },
  "7d": { interval: "6h", limit: 28 },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") ?? "24h";
  const { interval, limit } = RANGES[range] ?? RANGES["24h"]!;

  try {
    const tickers = await Promise.all(
      SYMBOLS.map(async (symbol) => {
        const [ticker, closes] = await Promise.all([
          getTicker24h(symbol),
          getRecentCloses(symbol, interval, limit),
        ]);
        return { ...ticker, closes };
      })
    );
    return NextResponse.json({ tickers, error: null });
  } catch (err) {
    return NextResponse.json(
      { tickers: [], error: (err as Error).message },
      { status: 200 }
    );
  }
}
