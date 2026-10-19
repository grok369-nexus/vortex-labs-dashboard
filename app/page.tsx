"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type CheckStatus = "pass" | "fail" | "warn";
type Check = { id: string; title: string; category: string; status: CheckStatus; detail: string; fix: string };
type ScanState = "idle" | "running" | "complete" | "error";

const navItems = [
  { id: "overview", label: "Overview", icon: "◫" },
  { id: "checks", label: "Security checks", icon: "⌁" },
  { id: "findings", label: "Findings", icon: "⚑" },
  { id: "learn", label: "Learning lab", icon: "⌘" }
];

function evaluateHeaders(response: Response): Check[] {
  const headers = response.headers;
  const csp = headers.get("content-security-policy") ?? "";
  const lowerCsp = csp.toLowerCase();
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  const checks: Check[] = [
    {
      id: "https",
      title: "HTTPS transport",
      category: "Transport",
      status: window.location.protocol === "https:" || isLocal ? "pass" : "fail",
      detail: window.location.protocol === "https:" ? "This page was loaded over HTTPS." : isLocal ? "Local development is exempt from HTTPS enforcement." : "The page is not using HTTPS.",
      fix: "Deploy behind HTTPS and redirect HTTP requests to HTTPS at the hosting layer."
    },
    {
      id: "csp",
      title: "Content Security Policy",
      category: "Browser protection",
      status: csp ? "pass" : "fail",
      detail: csp ? "A Content-Security-Policy response header is present." : "No Content-Security-Policy response header was found.",
      fix: "Set a restrictive CSP, then test it against the actual app before tightening it further."
    },
    {
      id: "csp-directives",
      title: "CSP baseline directives",
      category: "Browser protection",
      status: ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'"].every((directive) => lowerCsp.includes(directive)) ? "pass" : "fail",
      detail: ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'"].every((directive) => lowerCsp.includes(directive)) ? "CSP includes default-src, object-src, base-uri and frame-ancestors restrictions." : "One or more recommended baseline CSP directives are missing or weaker than expected.",
      fix: "Add default-src 'self', object-src 'none', base-uri 'self', and frame-ancestors 'none'; verify app functionality after each change."
    },
    {
      id: "nosniff",
      title: "MIME sniffing protection",
      category: "HTTP headers",
      status: headers.get("x-content-type-options")?.toLowerCase() === "nosniff" ? "pass" : "fail",
      detail: headers.get("x-content-type-options") ?? "X-Content-Type-Options header is missing.",
      fix: "Send X-Content-Type-Options: nosniff on application responses."
    },
    {
      id: "frame",
      title: "Clickjacking protection",
      category: "HTTP headers",
      status: headers.get("x-frame-options")?.toUpperCase() === "DENY" || lowerCsp.includes("frame-ancestors 'none'") ? "pass" : "fail",
      detail: headers.get("x-frame-options") || (lowerCsp.includes("frame-ancestors 'none'") ? "CSP frame-ancestors 'none' is present." : "No strong frame restriction was detected."),
      fix: "Use CSP frame-ancestors 'none' or an appropriate X-Frame-Options policy."
    },
    {
      id: "referrer",
      title: "Referrer policy",
      category: "Privacy",
      status: ["strict-origin-when-cross-origin", "no-referrer"].includes((headers.get("referrer-policy") ?? "").toLowerCase()) ? "pass" : "warn",
      detail: headers.get("referrer-policy") ?? "Referrer-Policy header is missing.",
      fix: "Set Referrer-Policy: strict-origin-when-cross-origin or no-referrer, based on product requirements."
    },
    {
      id: "permissions",
      title: "Browser permissions policy",
      category: "Privacy",
      status: headers.get("permissions-policy") ? "pass" : "warn",
      detail: headers.get("permissions-policy") ?? "Permissions-Policy header is missing.",
      fix: "Disable browser capabilities the app does not need, and explicitly allow only required features."
    },
    {
      id: "powered-by",
      title: "Framework fingerprinting",
      category: "Information exposure",
      status: headers.has("x-powered-by") ? "warn" : "pass",
      detail: headers.has("x-powered-by") ? `Server identifies its framework: ${headers.get("x-powered-by")}.` : "X-Powered-By is not exposed in the inspected response.",
      fix: "Disable framework-identifying response headers where practical."
    },
    {
      id: "status",
      title: "Application response",
      category: "Availability",
      status: response.ok ? "pass" : "fail",
      detail: `The home page returned HTTP ${response.status}.`,
      fix: "Resolve application errors and verify the route returns a successful response."
    }
  ];
  return checks;
}

export default function Home() {
  const [active, setActive] = useState("overview");
  const [checks, setChecks] = useState<Check[]>([]);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [scanError, setScanError] = useState("");

  const runScan = useCallback(async () => {
    setScanState("running");
    setScanError("");
    try {
      const response = await fetch("/", { method: "GET", cache: "no-store", credentials: "same-origin" });
      const results = evaluateHeaders(response);
      setChecks(results);
      setLastRun(new Date().toLocaleString());
      setScanState("complete");
    } catch {
      setScanError("The browser could not inspect this app's response. Check your connection and try again.");
      setScanState("error");
    }
  }, []);

  useEffect(() => {
    void runScan();
  }, [runScan]);

  const summary = useMemo(() => ({
    passed: checks.filter((item) => item.status === "pass").length,
    failed: checks.filter((item) => item.status === "fail").length,
    warnings: checks.filter((item) => item.status === "warn").length
  }), [checks]);
  const findings = checks.filter((item) => item.status !== "pass");
  const score = checks.length ? Math.round((summary.passed / checks.length) * 100) : 0;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Secure App Lab home">
          <span className="brand-mark">S<span>.</span></span>
          <span>SECURE<span className="brand-muted"> / LAB</span></span>
        </Link>
        <div className="workspace-label">WORKSPACE <span>LOCAL INSTANCE</span></div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => setActive(item.id)}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
              {item.id === "findings" && findings.length > 0 && <span className="nav-count">{findings.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="scope-card"><span className="scope-dot" /><div><strong>Safe scan scope</strong><p>Current app only</p></div></div>
          <p className="sidebar-foot">SECURE BY DESIGN<br />VERIFY WITH EVIDENCE</p>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">SECURE APP LAB <span>/</span> <strong>{navItems.find((item) => item.id === active)?.label.toUpperCase()}</strong></div>
          <div className="topbar-right"><span className={`run-indicator ${scanState === "running" ? "is-running" : ""}`} />{scanState === "running" ? "CHECKS RUNNING" : scanState === "complete" ? "SCAN COMPLETE" : scanState === "error" ? "SCAN ERROR" : "READY"}<span className="version-pill">CORE / 01</span></div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> SECURITY ENGINEERING WORKSPACE</div>
              <h1>{active === "overview" ? <>Your security.<br /><span>Measured, not assumed.</span></> : active === "checks" ? <>Response checks.<br /><span>Inspect the evidence.</span></> : active === "findings" ? <>Every gap is a task.<br /><span>Fix, then verify.</span></> : <>Learn the control.<br /><span>Understand the why.</span></>}</h1>
              <p className="page-description">A live, same-origin inspection of Secure App Lab’s HTTP response protections. No external targets are contacted.</p>
            </div>
            <button className="run-button" onClick={() => void runScan()} disabled={scanState === "running"}><span>↻</span>{scanState === "running" ? "Running checks…" : "Run checks"}</button>
          </div>

          {scanError && <div className="error-banner" role="alert">{scanError}</div>}

          {active === "overview" && <>
            <div className="metric-grid">
              <article className="metric-card score-card"><div className="metric-label">SECURITY CHECK SCORE <span>ⓘ</span></div><div className="score-row"><strong>{checks.length ? score : "—"}<small>{checks.length ? "/100" : ""}</small></strong><div className="score-ring" style={{ background: `conic-gradient(var(--cyan) ${score * 3.6}deg, #202b3a 0deg)` }}><div>{checks.length ? `${score}%` : "—"}</div></div></div><div className="metric-foot">{checks.length ? "Based on current response checks" : "Run checks to calculate score"}</div></article>
              <article className="metric-card"><div className="metric-label">CHECKS PASSED</div><div className="metric-number pass-text">{summary.passed.toString().padStart(2, "0")}<span> / {checks.length.toString().padStart(2, "0")}</span></div><div className="metric-foot"><span className="tiny-dot pass-dot" />Verified in this browser session</div></article>
              <article className="metric-card"><div className="metric-label">FAILED CHECKS</div><div className="metric-number fail-text">{summary.failed.toString().padStart(2, "0")}</div><div className="metric-foot"><span className="tiny-dot fail-dot" />Require attention</div></article>
              <article className="metric-card"><div className="metric-label">WARNINGS</div><div className="metric-number warn-text">{summary.warnings.toString().padStart(2, "0")}</div><div className="metric-foot"><span className="tiny-dot warn-dot" />Review recommended</div></article>
            </div>

            <div className="section-title-row"><div><div className="section-kicker">01 / LIVE RESULTS</div><h2>Security posture</h2></div><button className="subtle-button" onClick={() => setActive("checks")}>View all checks <span>→</span></button></div>
            <div className="results-panel">
              <div className="panel-heading"><div><span className="panel-indicator" /> HTTP RESPONSE INSPECTION</div><span>{lastRun ? `LAST RUN · ${lastRun}` : "WAITING FOR FIRST RUN"}</span></div>
              {checks.length === 0 ? <div className="empty-state">{scanState === "running" ? "Inspecting response headers…" : "Run the checks to inspect this app."}</div> : checks.slice(0, 5).map((check) => <CheckRow key={check.id} check={check} compact />)}
            </div>
            <div className="note-strip"><span className="note-icon">i</span><p><strong>Scope note</strong> This is a focused baseline, not a penetration test or security certification. It checks visible response behavior only; it cannot prove authentication, authorization, or data-layer security.</p></div>
          </>}

          {active === "checks" && <div className="results-panel full-panel"><div className="panel-heading"><div><span className="panel-indicator" /> ALL RESPONSE CHECKS</div><span>{checks.length} CHECKS</span></div>{checks.length === 0 ? <div className="empty-state">Run checks to collect evidence.</div> : checks.map((check) => <CheckRow key={check.id} check={check} />)}</div>}

          {active === "findings" && <div className="results-panel full-panel"><div className="panel-heading"><div><span className="panel-indicator" /> OPEN FINDINGS</div><span>{findings.length} ITEMS</span></div>{findings.length === 0 && checks.length > 0 ? <div className="empty-state">No failed checks or warnings in this run. Keep testing beyond headers.</div> : findings.length === 0 ? <div className="empty-state">Run checks to identify findings.</div> : findings.map((check) => <div className="finding-row" key={check.id}><div className={`status-symbol ${check.status}`}>{check.status === "fail" ? "!" : "△"}</div><div className="finding-body"><div className="finding-meta">{check.category} <span>·</span> {check.status === "fail" ? "Needs remediation" : "Review recommended"}</div><h3>{check.title}</h3><p>{check.detail}</p><div className="fix-note"><strong>Suggested fix</strong><span>{check.fix}</span></div></div></div>)}</div>}

          {active === "learn" && <div className="learning-grid">
            <article className="learning-card"><span className="learning-number">01</span><div className="section-kicker">BROWSER DEFENSE</div><h2>Security headers</h2><p>Headers tell browsers how to handle content: CSP limits allowed resources, frame restrictions reduce clickjacking, and nosniff prevents MIME-type guessing.</p><div className="learning-tag">CHECKED IN THIS BUILD</div></article>
            <article className="learning-card"><span className="learning-number">02</span><div className="section-kicker">IDENTITY & ACCESS</div><h2>Server-side authorization</h2><p>Hiding a button is not access control. Every protected server operation must verify who is calling and whether that identity can perform the action.</p><div className="learning-tag planned">NEXT PHASE</div></article>
            <article className="learning-card"><span className="learning-number">03</span><div className="section-kicker">INPUT & DATA</div><h2>Validate at boundaries</h2><p>Treat incoming data as untrusted. Validate type, shape, length and allowed values on the server, and use parameterized database queries.</p><div className="learning-tag planned">NEXT PHASE</div></article>
            <article className="learning-card"><span className="learning-number">04</span><div className="section-kicker">PROVE THE FIX</div><h2>Retest automatically</h2><p>A finding is not closed because code changed. Add a repeatable test, run it after the fix, and keep the evidence with the change.</p><div className="learning-tag planned">NEXT PHASE</div></article>
          </div>}

          <footer className="app-footer"><span>SECURE APP LAB <span className="footer-divider">/</span> CORE SECURITY DASHBOARD</span><span>BUILD CAREFULLY. TEST RESPONSIBLY.</span></footer>
        </div>
      </section>
    </main>
  );
}

function CheckRow({ check, compact = false }: { check: Check; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const label = check.status === "pass" ? "PASS" : check.status === "fail" ? "FAIL" : "WARN";
  return <div className={`check-row ${expanded ? "expanded" : ""}`}>
    <button className="check-main" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
      <span className={`status-symbol ${check.status}`}>{check.status === "pass" ? "✓" : check.status === "fail" ? "!" : "△"}</span>
      <span className="check-info"><strong>{check.title}</strong><small>{check.category}</small></span>
      <span className={`status-pill ${check.status}`}>{label}</span><span className="expand-icon">{expanded ? "−" : "+"}</span>
    </button>
    {(!compact || expanded) && <div className="check-detail"><p>{check.detail}</p><div className="fix-note"><strong>Remediation</strong><span>{check.fix}</span></div></div>}
  </div>;
}
