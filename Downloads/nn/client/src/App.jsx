import React, { useEffect, useMemo, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import SetupPage from './pages/SetupPage.jsx';
import InterviewPage from './pages/InterviewPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import { createSession, endSession, fetchSession, submitAnswer } from './services/api.js';
import { loadLocalHistory, saveLocalHistory } from './lib/storage.js';

const initialDraft = {
  candidateName: '',
  role: 'software-engineer',
  interviewMode: 'mixed',
  difficulty: 'medium',
  persona: 'calm-senior-interviewer',
  pressureMode: 'balanced',
  resumeText: '',
  jdText: ''
};

export default function App() {
  const [phase, setPhase] = useState('landing');
  const [draft, setDraft] = useState(initialDraft);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQ] = useState('');
  const [localHistory, setLocalHistory] = useState(() => loadLocalHistory());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState(null); // ✅ safe state

  useEffect(() => {
    saveLocalHistory(localHistory);
  }, [localHistory]);

  const transcript = session?.transcript || [];
  const latestAnalysis = transcript.at(-1)?.analysis || null;

  const summaryForDashboard = useMemo(() =>
    session?.summary || localHistory.find(i => i.id === session?.id)?.summary || null,
    [session, localHistory]
  );

  // ─── Start Session ─────────────────────────────
  async function handleStartSession() {
    setBusy(true);
    setError('');
    try {
      const res = await createSession(draft);
      setSession(res.session);
      setCurrentQ(res.firstQuestion);
      setPhase('interview');
    } catch (err) {
      setError(err.message || 'Failed to start interview');
    } finally {
      setBusy(false);
    }
  }

  // ─── Submit Answer ────────────────────────────
  async function handleSubmitAnswer(answer, responseSeconds, presenceSnapshot) {
    if (!session?.id) return;

    setBusy(true);
    setError('');

    try {
      const result = await submitAnswer({
        sessionId: session.id,
        answer,
        responseSeconds,
        presenceSnapshot
      });

      console.log("API RESULT:", result); // 🔥 debug

      // ✅ Only update if valid
      if (result?.videoUrl && result.videoUrl !== videoUrl) {
        setVideoUrl(result.videoUrl);
      }

      const refreshed = await fetchSession(session.id);
      setSession(refreshed);
      setCurrentQ(result.nextQuestion || '');

      return result;

    } catch (err) {
      setError(err.message || 'Failed to submit answer');
      throw err;
    } finally {
      setBusy(false);
    }
  }

  // ─── End Session ─────────────────────────────
  async function handleEndSession() {
    if (!session?.id) return;

    setBusy(true);
    setError('');

    try {
      await endSession(session.id);
      const refreshed = await fetchSession(session.id);
      setSession(refreshed);

      const record = {
        id: refreshed.id,
        createdAt: refreshed.createdAt,
        role: refreshed.role,
        difficulty: refreshed.difficulty,
        summary: refreshed.summary
      };

      setLocalHistory(prev => [
        record,
        ...prev.filter(i => i.id !== record.id)
      ]);

      setPhase('dashboard');

    } catch (err) {
      setError(err.message || 'Failed to end interview');
    } finally {
      setBusy(false);
    }
  }

  function handleRestart() {
    setSession(null);
    setCurrentQ('');
    setDraft(initialDraft);
    setError('');
    setVideoUrl(null); // reset
    setPhase('setup');
  }

  // ─── Landing Page ─────────────────────────────
  if (phase === 'landing') {
    return <LandingPage onStart={() => setPhase('setup')} />;
  }

  // ─── Main UI ──────────────────────────────────
  return (
    <div className="app-wrapper">

      {error && (
        <div className="error-banner">
          ⚠ {error}
        </div>
      )}

      {phase === 'setup' && (
        <SetupPage
          draft={draft}
          setDraft={setDraft}
          onStart={handleStartSession}
          localHistory={localHistory}
          busy={busy}
        />
      )}

      {phase === 'interview' && session && (
        <InterviewPage
          draft={draft}
          session={session}
          currentQuestion={currentQuestion}
          latestAnalysis={latestAnalysis}
          transcript={transcript}
          busy={busy}
          onSubmitAnswer={handleSubmitAnswer}
          onEndSession={handleEndSession}
          videoUrl={videoUrl} // ✅ safe pass
        />
      )}

      {phase === 'dashboard' && (
        <DashboardPage
          session={session}
          summary={summaryForDashboard}
          history={localHistory}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}