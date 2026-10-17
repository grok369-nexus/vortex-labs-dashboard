const pillars = [
  { number: "01", title: "Identity & sessions", text: "Authentication, session lifecycle, and safe recovery flows.", status: "Planned" },
  { number: "02", title: "Access control", text: "Server-side authorization on every protected operation.", status: "Planned" },
  { number: "03", title: "Data protection", text: "Least privilege, validated input, and database policies.", status: "Planned" },
  { number: "04", title: "Verification", text: "Automated checks, controlled testing, fixes, and retesting.", status: "Planned" }
];

const principles = [
  "Deny by default",
  "Validate on the server",
  "Never trust client roles",
  "Keep secrets out of source",
  "Test only authorized targets"
];

export default function Home() {
  return (
    <main className="shell">
      <nav className="nav">
        <a className="brand" href="/" aria-label="Secure App Lab home">
          <span className="brand-mark">S<span>.</span></span>
          <span>SECURE<span className="brand-muted"> / LAB</span></span>
        </a>
        <span className="nav-label"><span className="pulse" /> SECURITY-FIRST BUILD</span>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-line" /> ENGINEER · VERIFY · IMPROVE</div>
        <h1>Security isn’t a feature.<br /><span>It’s the foundation.</span></h1>
        <p className="hero-copy">A real application, built with secure defaults. We’ll test the protections we implement, fix what we find, and verify the fixes with repeatable checks.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#roadmap">Explore the build <span aria-hidden="true">↘</span></a>
          <a className="text-link" href="https://owasp.org/www-project-application-security-verification-standard/" target="_blank" rel="noreferrer">OWASP ASVS <span aria-hidden="true">↗</span></a>
        </div>
        <div className="hero-foot">
          <div><span className="foot-label">PROJECT</span><strong>SECURE APP LAB</strong></div>
          <div><span className="foot-label">APPROACH</span><strong>SECURE BY DEFAULT</strong></div>
          <div><span className="foot-label">CURRENT STAGE</span><strong className="stage"><i /> FOUNDATION</strong></div>
        </div>
      </section>

      <section className="section" id="roadmap">
        <div className="section-heading">
          <div><div className="section-kicker">01 / BUILD ROADMAP</div><h2>Four layers. One standard.</h2></div>
          <p>Security is designed into each layer—not added after launch.</p>
        </div>
        <div className="pillar-grid">
          {pillars.map((pillar) => (
            <article className="pillar" key={pillar.number}>
              <div className="pillar-top"><span>{pillar.number}</span><span className="status">{pillar.status}</span></div>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
              <div className="pillar-line"><span /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="principles-section">
        <div className="principles-copy">
          <div className="section-kicker">02 / NON-NEGOTIABLES</div>
          <h2>Trust is earned<br />by verification.</h2>
          <p>These rules guide every implementation and security review.</p>
        </div>
        <ul className="principles-list">
          {principles.map((principle, index) => (
            <li key={principle}><span className="check">✓</span><span>{principle}</span><span className="principle-index">0{index + 1}</span></li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="/"><span className="brand-mark">S<span>.</span></span><span>SECURE<span className="brand-muted"> / LAB</span></span></a>
        <span>Build carefully. Test responsibly.</span>
        <span className="footer-note">NO SECURITY CLAIMS WITHOUT EVIDENCE</span>
      </footer>
    </main>
  );
}
