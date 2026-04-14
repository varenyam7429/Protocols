const FEATURES = [
  { icon: '🧠', title: 'AI-Powered Questions', desc: 'Dynamic questions tailored to your domain, difficulty, and resume.' },
  { icon: '🎙️', title: 'Speech Recognition', desc: 'Answer naturally using your microphone with real-time transcription.' },
  { icon: '📊', title: 'Live Evaluation', desc: 'Instant scorecards on clarity, structure, confidence, and role fit.' },
  { icon: '👁️', title: 'Presence Analysis', desc: 'Eye contact, posture, and facial expression tracked in real-time.' }
];

const DOMAINS = [
  { emoji: '💻', name: 'Software\nEngineering' },
  { emoji: '📊', name: 'Data\nScience' },
  { emoji: '🎯', name: 'Product\nManager' },
  { emoji: '🤝', name: 'HR &\nGeneral' },
  { emoji: '💰', name: 'Finance' },
  { emoji: '☁️', name: 'DevOps' },
  { emoji: '🤖', name: 'Machine\nLearning' },
  { emoji: '📣', name: 'Marketing' },
  { emoji: '🔐', name: 'Cyber-\nsecurity' },
  { emoji: '🎨', name: 'Design\n& UX' }
];

export default function LandingPage({ onStart }) {
  return (
    <div className="landing-page">
      {/* Background grid */}
      <div className="landing-bg-grid" />
      <div className="landing-bg-glow" />

      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-dot"><span /></div>
          NeuralDash
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onStart}>
          Start Interview →
        </button>
      </nav>

      {/* Hero */}
      <div className="landing-hero anim-fade-up">
        <div className="landing-pill">
          <span className="live-dot" />
          AI Interview Simulation — v2.0
        </div>

        <h1>
          Your AI<br />
          <span style={{ color: 'var(--grey-400)' }}>Interviewer.</span>
        </h1>

        <p>
          Practice real interviews across 10 domains with an AI that speaks, listens, evaluates, 
          and coaches you — just like a senior interviewer would.
        </p>

        <div className="landing-cta-row">
          <button className="btn btn-primary btn-xl" onClick={onStart}>
            Start Mock Interview
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-lg" style={{ color: 'var(--text-muted)' }}>
            10 domains · Free
          </button>
        </div>

        {/* Domain pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
          {DOMAINS.map(d => (
            <span key={d.name} className="badge badge-default" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
              {d.emoji} {d.name.replace('\n', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="features-grid anim-fade-up anim-delay-2">
        {FEATURES.map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Bottom stats */}
      <div style={{
        marginTop: '40px',
        display: 'flex', alignItems: 'center', gap: '32px',
        opacity: 0.5, fontSize: '0.8rem', color: 'var(--text-muted)'
      }}>
        <span>◈ 10 Interview Domains</span>
        <span>◈ Real-time AI Feedback</span>
        <span>◈ TTS + STT Enabled</span>
        <span>◈ PDF Export</span>
      </div>
    </div>
  );
}
