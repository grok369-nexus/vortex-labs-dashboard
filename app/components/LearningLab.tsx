export default function LearningLab() {
  return (
    <div className="learning-grid">
      <article className="learning-card"><span className="learning-number">01</span><div className="section-kicker">BROWSER DEFENSE</div><h2>Security headers</h2><p>Headers tell browsers how to handle content: CSP limits allowed resources, frame restrictions reduce clickjacking, and nosniff prevents MIME-type guessing.</p><div className="learning-tag">CHECKED IN THIS BUILD</div></article>
      <article className="learning-card"><span className="learning-number">02</span><div className="section-kicker">IDENTITY &amp; ACCESS</div><h2>Server-side authorization</h2><p>Hiding a button is not access control. Every protected server operation must verify who is calling and whether that identity can perform the action.</p><div className="learning-tag planned">NEXT PHASE</div></article>
      <article className="learning-card"><span className="learning-number">03</span><div className="section-kicker">INPUT &amp; DATA</div><h2>Validate at boundaries</h2><p>Treat incoming data as untrusted. Validate type, shape, length and allowed values on the server, and use parameterized database queries.</p><div className="learning-tag planned">NEXT PHASE</div></article>
      <article className="learning-card"><span className="learning-number">04</span><div className="section-kicker">PROVE THE FIX</div><h2>Retest automatically</h2><p>A finding is not closed because code changed. Add a repeatable test, run it after the fix, and keep the evidence with the change.</p><div className="learning-tag planned">NEXT PHASE</div></article>
    </div>
  );
}
