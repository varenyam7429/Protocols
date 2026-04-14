import { useState } from 'react';

function ScoreBar({ label, value, max = 10 }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--white)' : 'var(--danger)';
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="score-bar-num">{value}/{max}</span>
    </div>
  );
}

export default function AnalysisPanel({ analysis }) {
  const [showIdeal, setShowIdeal] = useState(false);

  if (!analysis) {
    return (
      <div className="panel panel-sm">
        <div className="panel-header">
          <span className="panel-title">Live Evaluation</span>
        </div>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
            Answer a question to unlock AI-powered scorecards, feedback, and coaching.
          </p>
        </div>
      </div>
    );
  }

  const { metrics, confidenceScore, toneScore, eyeContactScore, strengths, weaknesses, improvements, evidence, idealAnswer, rewrite } = analysis;
  const overall = metrics?.overall ?? 0;
  const overallColor = overall >= 7.5 ? 'var(--success)' : overall >= 6 ? 'var(--info)' : overall >= 5 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="panel panel-sm" style={{ overflow: 'hidden' }}>
      <div className="panel-header">
        <span className="panel-title">Live Evaluation</span>
        <span style={{
          fontSize: '1.3rem', fontWeight: 800, color: overallColor,
          fontVariantNumeric: 'tabular-nums'
        }}>
          {overall}/10
        </span>
      </div>

      {/* Score bars */}
      <div className="score-bar-wrap mt-2">
        <ScoreBar label="Relevance"  value={metrics?.relevance  ?? 0} />
        <ScoreBar label="Clarity"    value={metrics?.clarity    ?? 0} />
        <ScoreBar label="Structure"  value={metrics?.structure  ?? 0} />
        <ScoreBar label="Specificity" value={metrics?.specificity ?? 0} />
        <ScoreBar label="Confidence" value={metrics?.confidence ?? 0} />
        <ScoreBar label="Role Fit"   value={metrics?.roleFit    ?? 0} />
      </div>

      {/* Presence scores */}
      {(confidenceScore !== undefined) && (
        <div className="score-bar-wrap mt-3">
          <div className="feedback-title">Presence signals</div>
          <ScoreBar label="Confidence" value={confidenceScore ?? 0} max={100} />
          <ScoreBar label="Tone"       value={toneScore ?? 0}       max={100} />
          <ScoreBar label="Eye Contact" value={eyeContactScore ?? 0} max={100} />
        </div>
      )}

      <div className="divider" />

      {/* Strengths */}
      {strengths?.length > 0 && (
        <div className="feedback-section">
          <div className="feedback-title">Strengths</div>
          <div className="feedback-list">
            {strengths.map((s, i) => (
              <div key={i} className="feedback-item">
                <span className="feedback-dot success" />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses?.length > 0 && (
        <div className="feedback-section">
          <div className="feedback-title">Focus Areas</div>
          <div className="feedback-list">
            {weaknesses.map((w, i) => (
              <div key={i} className="feedback-item">
                <span className="feedback-dot danger" />
                {w}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {improvements?.length > 0 && (
        <div className="feedback-section">
          <div className="feedback-title">Coaching Tips</div>
          <div className="feedback-list">
            {improvements.slice(0, 3).map((imp, i) => (
              <div key={i} className="feedback-item">
                <span className="feedback-dot info" />
                {imp}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ideal answer toggle */}
      {idealAnswer && (
        <div style={{ marginTop: '10px' }}>
          <button
            className="btn btn-ghost btn-sm w-full"
            onClick={() => setShowIdeal(v => !v)}
            style={{ justifyContent: 'space-between', width: '100%' }}
          >
            <span>Model Answer</span>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: showIdeal ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showIdeal && (
            <div className="ideal-answer-block mt-2" style={{ fontStyle: 'normal' }}>
              {idealAnswer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
