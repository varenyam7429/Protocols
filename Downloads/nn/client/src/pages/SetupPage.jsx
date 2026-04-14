import { useRef, useState } from 'react';
import { uploadResume } from '../services/api.js';

const DOMAINS = [
  { value: 'software-engineer', label: 'Software Engineering',  emoji: '💻' },
  { value: 'data-scientist',    label: 'Data Science',          emoji: '📊' },
  { value: 'product-manager',   label: 'Product Manager',       emoji: '🎯' },
  { value: 'hr-general',        label: 'HR & General',          emoji: '🤝' },
  { value: 'finance',           label: 'Finance',               emoji: '💰' },
  { value: 'devops',            label: 'DevOps & Cloud',        emoji: '☁️' },
  { value: 'machine-learning',  label: 'Machine Learning',      emoji: '🤖' },
  { value: 'marketing',         label: 'Marketing',             emoji: '📣' },
  { value: 'cybersecurity',     label: 'Cybersecurity',         emoji: '🔐' },
  { value: 'design',            label: 'Design & UX',           emoji: '🎨' }
];

const PERSONAS = [
  { value: 'calm-senior-interviewer', label: 'Calm Senior',    emoji: '👩‍💼', desc: 'Methodical & thorough' },
  { value: 'friendly-recruiter',      label: 'Friendly',       emoji: '😊', desc: 'Warm & conversational' },
  { value: 'strict-panelist',          label: 'Strict Panel',   emoji: '🎯', desc: 'Direct & demanding' },
  { value: 'startup-founder',          label: 'Startup CTO',   emoji: '🚀', desc: 'Fast-paced builder' }
];

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy',   desc: 'Entry level' },
  { value: 'medium', label: 'Medium', desc: 'Mid-level' },
  { value: 'hard',   label: 'Hard',   desc: 'Senior+' }
];

export default function SetupPage({ draft, setDraft, onStart, localHistory, busy }) {
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFilename, setResumeFilename]   = useState('');
  const [dragover, setDragover]               = useState(false);
  const fileRef = useRef(null);

  function patch(key, val) { setDraft(prev => ({ ...prev, [key]: val })); }

  async function handleResumeFile(file) {
    if (!file) return;
    setUploadingResume(true);
    try {
      const result = await uploadResume(file);
      patch('resumeText', result.text);
      setResumeFilename(file.name);
    } catch {
      // fallback — read as text
      const text = await file.text().catch(() => '');
      patch('resumeText', text);
      setResumeFilename(file.name);
    } finally {
      setUploadingResume(false);
    }
  }

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleResumeFile(file);
  };

  return (
    <div className="anim-fade-up" style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ marginBottom: '6px' }}>Configure your interview</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Customize your mock session. The AI will adapt questions to your selections.
        </p>
      </div>

      <div className="grid-2" style={{ gap: '20px', alignItems: 'start' }}>
        {/* ── Left column ── */}
        <div className="col-stack">
          {/* Candidate name */}
          <div className="panel panel-sm">
            <div className="form-field">
              <label className="form-label">Your Name</label>
              <input
                className="form-input"
                value={draft.candidateName}
                onChange={e => patch('candidateName', e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Domain selection */}
          <div className="panel panel-sm">
            <div className="panel-header">
              <span className="panel-title">Select Domain</span>
              <span className="panel-badge">{DOMAINS.length} available</span>
            </div>
            <div className="domain-grid">
              {DOMAINS.map(d => (
                <button
                  key={d.value}
                  className={`domain-card ${draft.role === d.value ? 'selected' : ''}`}
                  onClick={() => patch('role', d.value)}
                >
                  <span className="domain-icon">{d.emoji}</span>
                  <span className="domain-name">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="panel panel-sm">
            <div className="panel-header">
              <span className="panel-title">Difficulty</span>
            </div>
            <div className="difficulty-selector">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  className={`diff-btn ${draft.difficulty === d.value ? 'selected' : ''}`}
                  onClick={() => patch('difficulty', d.value)}
                >
                  <div>{d.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginTop: '2px' }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Persona */}
          <div className="panel panel-sm">
            <div className="panel-header">
              <span className="panel-title">Interviewer Persona</span>
            </div>
            <div className="grid-2" style={{ gap: '8px' }}>
              {PERSONAS.map(p => (
                <button
                  key={p.value}
                  className={`domain-card ${draft.persona === p.value ? 'selected' : ''}`}
                  onClick={() => patch('persona', p.value)}
                  style={{ padding: '14px', textAlign: 'left', alignItems: 'flex-start', gap: '6px' }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{p.emoji}</span>
                  <div>
                    <div className="domain-name" style={{ textAlign: 'left', color: draft.persona === p.value ? 'var(--white)' : 'var(--text-secondary)' }}>{p.label}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', lineHeight: 1.3 }}>{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pressure mode */}
          <div className="panel panel-sm">
            <div className="panel-header">
              <span className="panel-title">Pressure Mode</span>
            </div>
            <div className="difficulty-selector">
              {[
                { value: 'balanced', label: 'Balanced', desc: 'Normal pacing' },
                { value: 'high-pressure', label: 'High Pressure', desc: 'Intense follow-ups' }
              ].map(p => (
                <button
                  key={p.value}
                  className={`diff-btn ${draft.pressureMode === p.value ? 'selected' : ''}`}
                  onClick={() => patch('pressureMode', p.value)}
                >
                  <div>{p.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginTop: '2px' }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="col-stack">
          {/* Resume upload */}
          <div className="panel panel-sm">
            <div className="panel-header">
              <span className="panel-title">Resume (Optional)</span>
              <span className="panel-badge">Personalizes questions</span>
            </div>
            <div
              className={`resume-dropzone ${dragover ? 'dragover' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragover(true); }}
              onDragLeave={() => setDragover(false)}
              onDrop={handleDrop}
            >
              {uploadingResume ? (
                <div className="flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <span className="spinner" /> Parsing resume…
                </div>
              ) : resumeFilename ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  ✓ {resumeFilename}
                  <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginTop: '4px' }}>
                    Click to replace
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Drop PDF or TXT here
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    or click to browse
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => handleResumeFile(e.target.files?.[0])}
              />
            </div>

            {/* Or paste resume text */}
            <details style={{ marginTop: '12px' }}>
              <summary style={{ fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                Or paste text instead
              </summary>
              <textarea
                className="form-textarea"
                style={{ marginTop: '8px', minHeight: '80px', fontSize: '0.8rem' }}
                value={draft.resumeText}
                onChange={e => patch('resumeText', e.target.value)}
                placeholder="Paste your resume content here…"
                rows={4}
              />
            </details>

            {/* Job description */}
            <div style={{ marginTop: '14px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>
                Job Description (Optional)
              </label>
              <textarea
                className="form-textarea"
                style={{ fontSize: '0.8rem', minHeight: '80px' }}
                value={draft.jdText}
                onChange={e => patch('jdText', e.target.value)}
                placeholder="Paste the job description to align questions with the role…"
                rows={4}
              />
            </div>
          </div>

          {/* Recent history */}
          {localHistory.length > 0 && (
            <div className="panel panel-sm">
              <div className="panel-header">
                <span className="panel-title">Recent Sessions</span>
                <span className="panel-badge">{localHistory.length}</span>
              </div>
              <div className="history-list">
                {localHistory.slice(0, 4).map(item => (
                  <div key={item.id} className="history-card">
                    <div style={{ flex: 1 }}>
                      <div className="history-card-role">{item.role?.replaceAll('-', ' ')}</div>
                      <div className="history-card-date">
                        {new Date(item.createdAt).toLocaleDateString()} · {item.difficulty}
                      </div>
                    </div>
                    <div className="history-card-score">
                      {item.summary?.averageMetrics?.overall ?? '--'}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <button
            className="btn btn-primary btn-xl w-full"
            onClick={onStart}
            disabled={busy || !draft.candidateName.trim()}
            style={{ justifyContent: 'center' }}
          >
            {busy ? (
              <><span className="spinner" /> Setting up interview…</>
            ) : (
              <>Begin Interview →</>
            )}
          </button>

          {!draft.candidateName.trim() && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center' }}>
              Enter your name to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
