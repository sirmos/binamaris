import { NextResponse } from "next/server";
import { getTicker24h, getRecentCloses } from "../../../services/binance/market-data";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

export async function GET() {
  try {
    const tickers = await Promise.all(
      SYMBOLS.map(async (symbol) => {
        const [ticker, closes] = await Promise.all([
          getTicker24h(symbol),
          getRecentCloses(symbol),
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
