import Link from "next/link";

export default function Landing() {
  return (
    <main>
      <nav className="site-nav">
        <div className="brand">
          Bina<span>maris</span>
        </div>
        <Link href="/console" className="nav-link">
          The bridge
        </Link>
      </nav>

      <div className="landing-hero">
        <p className="kicker">autonomous vessel treasury</p>
        <h1>Runs the ship's treasury. Calls you when it can't decide.</h1>
        <p className="lede">
          Binamaris manages a vessel's operating funds against fixed
          reserve floors and spending limits. It executes routine decisions
          on its own through Binance Agent OS, and stops to ask a human the
          moment a request falls outside policy.
        </p>
        <Link href="/console" className="cta-primary">
          Open the bridge
        </Link>
          <a
          href="https://github.com/sirmos/binamaris"
          className="cta-secondary"
          target="_blank"
          rel="noreferrer"
        >
          View source
        </a>
      </div>

      <div className="pillars">
        <div className="pillar">
          <p className="tag">the agent</p>
          <h3>Policy before reasoning</h3>
          <p>
            Every spending request is checked against hard, deterministic
            rules first: reserve floors, transaction limits, negative balance
            protection. The agent interprets the situation; it does not
            interpret the rules.
          </p>
        </div>
        <div className="pillar">
          <p className="tag">binance agent os</p>
          <h3>Real execution, real receipts</h3>
          <p>
            Approved actions are carried out through a live Binance Agentic
            sub-account. Every order is confirmed and every result is written
            to an append-only audit log, not simulated after the fact.
          </p>
        </div>
        <div className="pillar">
          <p className="tag">the vessel</p>
          <h3>One ship, tracked live</h3>
          <p>
            Position and voyage state come from live AIS tracking, not a
            fixture. The treasury the agent manages belongs to a vessel that
            is actually moving.
          </p>
        </div>
      </div>

      <section>
        <h2>Milestones</h2>
        <p className="plans-intro">
          This build runs one vessel end to end. A fleet operator would need
          more than one ship on the books at once, which is what the next
          two tiers add.
        </p>
        <div className="plans">
          <div className="plan">
            <p className="plan-name">Free</p>
            <p className="plan-status">running now</p>
            <ul>
              <li>Policy engine and audit log</li>
              <li>Live AIS tracking, 1 vessel</li>
              <li>Manual scenario triggers</li>
            </ul>
          </div>
          <div className="plan featured">
            <p className="plan-name">Fleet</p>
            <p className="plan-status">next</p>
            <ul>
              <li>Unlimited vessels per operator</li>
              <li>Per-vessel reserve policy</li>
              <li>Live event triggers, not manual</li>
              <li>Multi-approver escalation</li>
            </ul>
          </div>
          <div className="plan">
            <p className="plan-name">Enterprise</p>
            <p className="plan-status">later</p>
            <ul>
              <li>Custom policy rules per operator</li>
              <li>Audit export and compliance reporting</li>
              <li>Dedicated Agent OS sub-accounts</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
