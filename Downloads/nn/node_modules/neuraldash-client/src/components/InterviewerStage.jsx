import WaveformVisualizer from './WaveformVisualizer.jsx';

const MOOD_LABELS = {
  neutral:   { label: 'Neutral',   emoji: '◉' },
  listening: { label: 'Listening', emoji: '◌' },
  speaking:  { label: 'Speaking',  emoji: '▶' },
  impressed: { label: 'Impressed', emoji: '✦' },
  skeptical: { label: 'Skeptical', emoji: '△' }
};

const PERSONA_EMOJI = {
  'calm-senior-interviewer': '👩‍💼',
  'friendly-recruiter':      '😊',
  'strict-panelist':          '🎯',
  'startup-founder':          '🚀'
};

export default function InterviewerStage({
  interviewer, persona, mood = 'neutral',
  currentQuestion, followUpText, pressureScore = 50, isSpeaking
}) {
  const state = isSpeaking ? 'speaking' : mood;
  const moodMeta = MOOD_LABELS[state] || MOOD_LABELS.neutral;
  const emoji = PERSONA_EMOJI[persona] || '🤖';
  const urgency = pressureScore > 75 ? 'high' : pressureScore > 55 ? 'medium' : 'low';

  return (
    <div className="interviewer-stage panel">
      <div className="stage-room">
        {/* Top bar */}
        <div className="stage-topbar">
          <div className="flex items-center gap-2">
            <span className="badge badge-live">
              <span className="live-dot" />
              LIVE
            </span>
            <span className="badge badge-default">
              Pressure {pressureScore}/100
            </span>
          </div>
          <span className={`badge ${urgency === 'high' ? 'badge-danger' : urgency === 'medium' ? 'badge-warning' : 'badge-default'}`}>
            {urgency === 'high' ? '⚡ High' : urgency === 'medium' ? '◈ Medium' : '◎ Low'} pressure
          </span>
        </div>

        {/* Persona display */}
        <div className="ai-persona-display">
          <div className="ai-avatar-container">
            <div className={`ai-avatar-ring ${isSpeaking ? 'speaking' : ''}`} />
            <div className="ai-avatar">
              <div className="ai-avatar-inner">{emoji}</div>
            </div>
          </div>

          <div className="ai-info">
            <div className="ai-name">{interviewer?.name || 'AI Interviewer'}</div>
            <div className="ai-title">{interviewer?.title || 'Virtual Interviewer'}</div>
            <div className="ai-mood-row">
              <div className="mood-indicator">
                <span>{moodMeta.emoji}</span>
                <span>{moodMeta.label}</span>
              </div>
              <span className="badge badge-default" style={{ fontSize: '0.7rem' }}>
                {persona?.replaceAll('-', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Waveform when speaking */}
        <div style={{ padding: '8px 0 4px' }}>
          <WaveformVisualizer active={isSpeaking} bars={24} />
        </div>

        {/* Current question / follow-up */}
        <div className="question-box">
          <div className="question-label">
            {followUpText ? '↳ Follow-up' : 'Current question'}
          </div>
          <p className="question-text">{followUpText || currentQuestion || 'Waiting for interview to begin...'}</p>
        </div>

        {/* Style hint */}
        {interviewer?.style && (
          <p style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', fontStyle: 'italic', lineHeight: 1.5 }}>
            {interviewer.style}
          </p>
        )}
      </div>
    </div>
  );
}
