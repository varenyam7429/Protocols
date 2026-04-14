export default function PresencePanel({ videoRef, metrics, cameraReady }) {
  const bars = [
    { key: 'eyeContact', label: 'Eye Contact', value: metrics.eyeContact },
    { key: 'posture',    label: 'Posture',      value: metrics.posture },
    { key: 'attention',  label: 'Attention',    value: metrics.attention },
    { key: 'confidence', label: 'Confidence',   value: metrics.confidence }
  ];

  const expressionColor = {
    'Focused': 'var(--success)',
    'Engaged': 'var(--info)',
    'Calm':    'var(--text-secondary)',
    'Attentive': 'var(--info)',
    'Neutral': 'var(--text-muted)',
    'Distracted': 'var(--warning)'
  }[metrics.expression] || 'var(--text-muted)';

  return (
    <div className="panel panel-sm">
      <div className="panel-header">
        <span className="panel-title">Your Presence</span>
        <span className="badge badge-default">
          {cameraReady ? (
            <><span className="live-dot" /> Camera live</>
          ) : 'Camera off'}
        </span>
      </div>

      {/* Camera frame */}
      <div className="camera-frame" style={{ marginBottom: '12px', aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          className="camera-video"
          muted
          playsInline
          style={{ display: cameraReady ? 'block' : 'none' }}
        />
        {!cameraReady && (
          <div className="camera-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Allow camera access</span>
          </div>
        )}
        {/* Corner frame overlay */}
        {cameraReady && (
          <div className="camera-overlay">
            <div className="camera-corner tl" />
            <div className="camera-corner tr" />
            <div className="camera-corner bl" />
            <div className="camera-corner br" />
            <div className="camera-status">
              <span className="badge badge-live">
                <span className="live-dot" />
                REC
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Expression label */}
      {cameraReady && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <span style={{
            fontSize: '0.8rem', fontWeight: 600, color: expressionColor,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)', borderRadius: '999px',
            padding: '4px 12px'
          }}>
            ◈ {metrics.expression}
          </span>
        </div>
      )}

      {/* Metric bars */}
      <div className="score-bar-wrap" style={{ gap: '6px' }}>
        {bars.map(({ key, label, value }) => (
          <div key={key} className="score-bar-row">
            <span className="score-bar-label" style={{ width: '72px', fontSize: '0.72rem' }}>{label}</span>
            <div className="score-bar-track" style={{ height: '3px' }}>
              <div
                className="score-bar-fill"
                style={{
                  width: `${value}%`,
                  background: value >= 75 ? 'var(--success)' : value >= 55 ? 'var(--white)' : 'var(--warning)'
                }}
              />
            </div>
            <span className="score-bar-num">{value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
