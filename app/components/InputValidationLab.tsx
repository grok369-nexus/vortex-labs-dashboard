"use client";

import { useState } from "react";

type TestResult = {
  name: string;
  expected: number;
  actual: number | null;
  passed: boolean;
  detail: string;
};

const validPayload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Please send me more information."
};

const scenarios = [
  {
    name: "Valid contact payload",
    expected: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload)
  },
  {
    name: "Missing required email",
    expected: 422,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Ada Lovelace", message: validPayload.message })
  },
  {
    name: "Malformed email address",
    expected: 422,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, email: "not-an-email" })
  },
  {
    name: "Unexpected privilege field",
    expected: 422,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, role: "admin" })
  },
  {
    name: "Oversized request body",
    expected: 413,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, message: "x".repeat(5000) })
  },
  {
    name: "Unsupported content type",
    expected: 415,
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(validPayload)
  },
  {
    name: "Malformed JSON",
    expected: 400,
    headers: { "Content-Type": "application/json" },
    body: "{"
  }
];

export default function InputValidationLab() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState("");

  async function runSuite() {
    setRunning(true);
    setRunError("");
    setResults([]);

    const nextResults: TestResult[] = [];
    for (const scenario of scenarios) {
      try {
        const response = await fetch("/api/security/input-check", {
          method: "POST",
          headers: scenario.headers,
          body: scenario.body,
          cache: "no-store",
          credentials: "same-origin"
        });
        const data = await response.json().catch(() => null);
        const passed = response.status === scenario.expected;
        nextResults.push({
          name: scenario.name,
          expected: scenario.expected,
          actual: response.status,
          passed,
          detail: data?.error ?? (data?.persisted === false ? "Accepted for validation only; nothing was stored." : "Response received.")
        });
      } catch {
        nextResults.push({
          name: scenario.name,
          expected: scenario.expected,
          actual: null,
          passed: false,
          detail: "The request could not reach the local validation endpoint."
        });
      }
      setResults([...nextResults]);
    }

    setRunning(false);
    if (nextResults.some((result) => !result.passed)) {
      setRunError("One or more checks did not return the expected status. Inspect the results before changing the rules.");
    }
  }

  const passed = results.filter((result) => result.passed).length;

  return (
    <section className="validation-lab">
      <div className="validation-intro">
        <div>
          <div className="section-kicker">SERVER-SIDE TEST SUITE</div>
          <h2>Test the input boundary</h2>
          <p>These requests target only this application’s own validation endpoint. The server checks content type, body size, JSON shape, allowed fields, and field limits.</p>
        </div>
        <button className="run-button" onClick={() => void runSuite()} disabled={running}>
          <span>↻</span>{running ? "Running tests…" : "Run validation suite"}
        </button>
      </div>

      <div className="validation-summary">
        <div><strong>{results.length ? passed.toString().padStart(2, "0") : "—"}</strong><span> PASSED</span></div>
        <div><strong>{results.length ? (results.length - passed).toString().padStart(2, "0") : "—"}</strong><span> FAILED</span></div>
        <div><strong>{scenarios.length.toString().padStart(2, "0")}</strong><span> TEST CASES</span></div>
      </div>

      {runError && <div className="error-banner" role="alert">{runError}</div>}

      <div className="results-panel">
        <div className="panel-heading"><div><span className="panel-indicator" /> OWN-APP VALIDATION TESTS</div><span>{results.length} / {scenarios.length} COMPLETED</span></div>
        {results.length === 0 && !running ? (
          <div className="empty-state">Run the suite to send safe test inputs to this app’s own server endpoint.</div>
        ) : (
          scenarios.map((scenario, index) => {
            const result = results[index];
            return (
              <div className="check-row" key={scenario.name}>
                <div className="check-main validation-result">
                  <span className={`status-symbol ${!result ? "warn" : result.passed ? "pass" : "fail"}`}>{!result ? "·" : result.passed ? "✓" : "!"}</span>
                  <span className="check-info"><strong>{scenario.name}</strong><small>Expected HTTP {scenario.expected}{result?.actual !== null && result?.actual !== undefined ? ` · Received HTTP ${result.actual}` : ""}</small></span>
                  <span className={`status-pill ${!result ? "warn" : result.passed ? "pass" : "fail"}`}>{!result ? (running ? "WAITING" : "NOT RUN") : result.passed ? "PASS" : "FAIL"}</span>
                </div>
                {result && <div className="validation-detail">{result.detail}</div>}
              </div>
            );
          })
        )}
      </div>

      <div className="note-strip"><span className="note-icon">i</span><p><strong>Test scope</strong> The endpoint is a validation exercise. It does not send email, store contact details, authenticate users, or prove authorization. Add persistence only after a separate data-protection and access-control design.</p></div>
    </section>
  );
}
