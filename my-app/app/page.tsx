import MNALeadForm from "./components/MNALeadForm";

const BENEFITS = [
  "No hidden fees or long-term contracts",
  "Clover, SpotOn, Dejavoo & PAX support",
  "Dedicated local support team",
  "Cloud-based & mobile solutions",
  "Terminal options for qualifying businesses",
  "Fast setup for most businesses",
] as const;

export default function Home() {
  return (
    <div className="page-grain min-h-dvh flex flex-col">
      <div className="page-shell">
        <header className="header-editorial">
          <div className="header-editorial-inner">
            <div className="logo-row">
              <div className="logo-mark">MNA</div>
              <div>
                <div className="logo-text-title">
                  Merchant Nations Association
                </div>
                <div className="logo-text-sub">
                  Payment solutions for your business
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="layout-split">
          <div className="reveal-editorial">
            <h1 className="mna-headline font-display">
              Save money on{" "}
              <span className="text-accent">payment processing</span>
            </h1>
            <p className="mna-lead">
              Join small businesses that rely on MNA for affordable, dependable
              payment solutions — from POS systems to cloud-based gateways.
            </p>

            <ul className="benefits-list">
              {BENEFITS.map((text) => (
                <li key={text} className="benefit-row">
                  <span className="benefit-check" aria-hidden>
                    ✓
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="trust-band">
              <div className="trust-stat">
                <span className="trust-stat-num">15+</span>
                <span className="trust-stat-label">Years experience</span>
              </div>
              <div className="trust-divider" aria-hidden />
              <div className="trust-stat">
                <span className="trust-stat-num">1000+</span>
                <span className="trust-stat-label">Businesses served</span>
              </div>
              <div className="trust-divider" aria-hidden />
              <div className="trust-stat">
                <span className="trust-stat-num">24/7</span>
                <span className="trust-stat-label">Agent support</span>
              </div>
            </div>
          </div>

          <MNALeadForm />
        </div>
      </div>
    </div>
  );
}
