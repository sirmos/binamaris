"use client";

import { useEffect, useState } from "react";

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
  payload: Record<string, unknown>;
}

export default function Home() {
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

  return (
    <main>
      <h1>Binamaris</h1>
      <p>Autonomous treasury agent for a single vessel.</p>

      <div className="card">
        <h2>Treasury</h2>
        {treasury && (
          <>
            <p>Total balance: ${treasury.totalBalance.toLocaleString()}</p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Reserve</th>
                  <th style={{ textAlign: "right" }}>Allocated</th>
                  <th style={{ textAlign: "right" }}>Floor</th>
                </tr>
              </thead>
              <tbody>
                {treasury.reserves.map((r) => (
                  <tr key={r.category}>
                    <td>{r.category}</td>
                    <td style={{ textAlign: "right" }}>
                      ${r.allocated.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ${r.minimumFloor.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <button onClick={resetTreasury}>Reset treasury to defaults</button>
      </div>

      <div className="card">
        <h2>Scenarios</h2>
        {scenarios.map((s) => (
          <div key={s.id} style={{ marginBottom: 12 }}>
            <strong>{s.title}</strong>
            <p style={{ margin: "4px 0", color: "#9aa5b8" }}>{s.narrative}</p>
            <button onClick={() => runScenario(s.id)} disabled={loading === s.id}>
              {loading === s.id ? "Running..." : "Run this scenario"}
            </button>
          </div>
        ))}
      </div>

      {lastResult && (
        <div className="card">
          <h2>Last decision</h2>
          <p>
            <strong>{lastResult.scenario.title}</strong>
          </p>
          <p className={`status-${lastResult.result.status.toLowerCase()}`}>
            {lastResult.result.status}
          </p>
          <ul>
            {lastResult.result.checks.map((c) => (
              <li key={c.name} className={c.passed ? "check-pass" : "check-fail"}>
                [{c.passed ? "PASS" : "FAIL"}] {c.name}: {c.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h2>Audit log (most recent 20)</h2>
        {audit.map((entry, i) => (
          <div key={i} style={{ fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: "#9aa5b8" }}>{entry.timestamp}</span>{" "}
            {JSON.stringify(entry.payload)}
          </div>
        ))}
      </div>
    </main>
  );
}
