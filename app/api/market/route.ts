import { NextResponse } from "next/server";
import { getTicker24h } from "../../../services/binance/market-data";

const SYMBOLS = ["BTCUSDT", "ETHUSDT"];

export async function GET() {
  try {
    const tickers = await Promise.all(SYMBOLS.map((s) => getTicker24h(s)));
    return NextResponse.json({ tickers, error: null });
  } catch (err) {
    return NextResponse.json(
      { tickers: [], error: (err as Error).message },
      { status: 200 }
    );
  }
}
