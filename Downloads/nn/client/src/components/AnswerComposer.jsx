import { useEffect, useState } from 'react';
import TimerRing from './TimerRing.jsx';
import WaveformVisualizer from './WaveformVisualizer.jsx';

export default function AnswerComposer({
  transcript, isListening, onStartListening, onStopListening,
  onSubmit, onClear, busy, remainingSeconds, totalSeconds = 90
}) {
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (transcript) setAnswer(transcript);
  }, [transcript]);

  async function handleSubmit() {
    if (!answer.trim() || busy) return;
    await onSubmit(answer.trim());
    setAnswer('');
    onClear();
  }

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="panel panel-sm">
      <div className="answer-composer-header">
        <span className="panel-title">Your Answer</span>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {wordCount > 0 ? `${wordCount} words` : 'Type or speak'}
          </span>
          <TimerRing seconds={remainingSeconds} total={totalSeconds} size={48} strokeWidth={3} />
        </div>
      </div>

      {/* Listening waveform */}
      {isListening && (
        <div style={{
          background: 'rgba(248,113,113,0.06)',
          border: '1px solid rgba(248,113,113,0.15)',
          borderRadius: 'var(--r-md)',
          padding: '10px 14px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span className="live-dot" style={{ background: 'var(--danger)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 500 }}>Listening…</span>
          <div style={{ flex: 1 }}>
            <WaveformVisualizer active={true} bars={14} color="rgba(248,113,113,0.6)" />
          </div>
        </div>
      )}

      <textarea
        className="answer-textarea"
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Speak your answer or type it here…"
        rows={5}
        disabled={busy}
      />

      <div className="flex items-center gap-2 mt-3">
        {/* Mic button */}
        <button
          className={`mic-button ${isListening ? 'listening' : 'idle'}`}
          onClick={isListening ? onStopListening : onStartListening}
          title={isListening ? 'Stop recording' : 'Start speaking'}
        >
          {isListening ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setAnswer(''); onClear(); }}
          disabled={!answer.trim() || busy}
        >
          Clear
        </button>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!answer.trim() || busy}
          style={{ marginLeft: 'auto' }}
        >
          {busy ? (
            <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Evaluating…</>
          ) : (
            <>
              Submit Answer
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
