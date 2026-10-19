export default function Loading() {
  return (
    <main className="loading-shell" role="status" aria-live="polite" aria-label="Loading Secure App Lab">
      <section className="loading-card">
        <div className="loading-brand"><span className="loading-mark">S<span>.</span></span><span>SECURE<span className="loading-muted"> / LAB</span></span></div>
        <div className="loading-orbit" aria-hidden="true"><span /><span /><span /></div>
        <p className="loading-eyebrow">SECURITY ENGINEERING WORKSPACE</p>
        <h1>Preparing your <span>workspace.</span></h1>
        <p className="loading-copy">Starting the dashboard and preparing your security checks.</p>
        <div className="loading-progress" aria-hidden="true"><span /></div>
        <div className="loading-status"><span className="loading-live-dot" /> INITIALIZING SECURE APP LAB</div>
        <div className="skeleton-grid" aria-hidden="true"><span /><span /><span /></div>
      </section>
    </main>
  );
}
