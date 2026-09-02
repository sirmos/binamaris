"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ReserveBucket {
  category: string;
  allocated: number;
  minimumFloor: number;
}

interface Treasury {
  totalBalance: number;
  reserves: ReserveBucket[];
}

interface Scenario {
  id: string;
  title: string;
  narrative: string;
  request: { category: string; amount: number; reason: string };
}

interface PolicyCheck {
  name: string;
  passed: boolean;
  detail: string;
}

interface DecisionResult {
  status: string;
  checks: PolicyCheck[];
  projectedTotalBalance: number;
  projectedBucketBalance: number | null;
}

interface AuditEntry {
  type: string;
  timestamp: string;
  payload: {
    request?: { category: string; amount: number; reason: string };
    status?: string;
  };
}

function ReserveGauge({
  reserve,
  scaleMax,
}: {
  reserve: ReserveBucket;
  scaleMax: number;
}) {
  const fillPct = Math.min(100, (reserve.allocated / scaleMax) * 100);
  const floorPct = Math.min(100, (reserve.minimumFloor / scaleMax) * 100);
  const isLow = reserve.allocated <= reserve.minimumFloor;

  return (
    <div className="gauge-row">
      <div className="gauge-head">
        <span className="name">{reserve.category}</span>
        <span>
          ${reserve.allocated.toLocaleString()}{" "}
          <span style={{ color: "#5a6f85" }}>
            / floor ${reserve.minimumFloor.toLocaleString()}
          </span>
        </span>
      </div>
      <div className="gauge-track">
        <div
          className={`gauge-fill${isLow ? " low" : ""}`}
          style={{ width: `${fillPct}%` }}
        />
        <div className="gauge-floor-mark" style={{ left: `${floorPct}%` }} />
      </div>
    </div>
  );
}

function AuditLine({ entry }: { entry: AuditEntry }) {
  const req = entry.payload.request;
  const status = entry.payload.status ?? "";
  const time = new Date(entry.timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="entry">
      <div className="audit-entry-line">
        <span>
          <span className="timestamp">{time}</span>
          {req ? `${req.category} · $${req.amount.toLocaleString()}` : entry.type}
        </span>
        <span
          className={`audit-entry-status status-${status.toLowerCase()}`}
        >
          {status.replace(/_/g, " ")}
        </span>
      </div>
      {req && <div style={{ color: "#5a6f85", marginTop: 2 }}>{req.reason}</div>}
    </div>
  );
}

export default function Console() {
  const [treasury, setTreasury] = useState<Treasury | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [lastResult, setLastResult] = useState<{
    scenario: Scenario;
    result: DecisionResult;
  } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/state");
    const data = await res.json();
    setTreasury(data.treasury);
    setAudit(data.audit);
  }

  useEffect(() => {
    fetch("/api/scenarios")
      .then((r) => r.json())
      .then((d) => setScenarios(d.scenarios));
    refresh();
  }, []);

  async function runScenario(id: string) {
    setLoading(id);
    const res = await fetch("/api/decide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: id }),
    });
    const data = await res.json();
    setLastResult(data);
    await refresh();
    setLoading(null);
  }

  async function resetTreasury() {
    await fetch("/api/reset", { method: "POST" });
    setLastResult(null);
    await refresh();
  }

  const scaleMax = treasury
    ? Math.max(...treasury.reserves.map((r) => r.allocated)) * 1.15
    : 1;

  return (
    <main>
      <nav className="site-nav">
        <Link href="/" className="brand" style={{ textDecoration: "none", color: "#e8eef5" }}>
          Bina<span>maris</span>
        </Link>
        <span className="nav-link">MV Ocean Star · console</span>
      </nav>

      <section>
        <h2>Treasury</h2>
        {treasury && (
          <>
            <div className="balance-row">
              <span className="figure">
                ${treasury.totalBalance.toLocaleString()}
              </span>
              <span className="label">total balance</span>
            </div>
            <p style={{ fontSize: 12.5, color: "#5a6f85", margin: "-8px 0 20px", fontFamily: "'IBM Plex Mono', monospace" }}>
              gold mark = protected floor for that reserve
            </p>
            {treasury.reserves.map((r) => (
              <ReserveGauge key={r.category} reserve={r} scaleMax={scaleMax} />
            ))}
          </>
        )}
        <button onClick={resetTreasury}>Reset treasury to defaults</button>
      </section>

      <section>
        <h2>Scenarios</h2>
        {scenarios.map((s) => (
          <div key={s.id} className="scenario">
            <h3>{s.title}</h3>
            <p>{s.narrative}</p>
            <button onClick={() => runScenario(s.id)} disabled={loading === s.id}>
              {loading === s.id ? "Running..." : "Run this scenario"}
            </button>
          </div>
        ))}
      </section>

      {lastResult && (
        <section>
          <h2>Last decision</h2>
          <div className="decision-panel">
            <h3>{lastResult.scenario.title}</h3>
            <div className={`decision-status status-${lastResult.result.status.toLowerCase()}`}>
              {lastResult.result.status.replace(/_/g, " ")}
            </div>
            <ul className="check-list">
              {lastResult.result.checks.map((c) => (
                <li key={c.name}>
                  <span className={c.passed ? "check-pass" : "check-fail"}>
                    {c.passed ? "PASS" : "FAIL"}
                  </span>
                  <span>{c.name}: {c.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section>
        <h2>Audit log</h2>
        <div className="audit-feed">
          {audit.map((entry, i) => (
            <AuditLine key={i} entry={entry} />
          ))}
        </div>
      </section>
    </main>
  );
}
