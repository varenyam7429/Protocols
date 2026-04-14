import { useEffect, useMemo, useState } from 'react';
import InterviewerStage from '../components/InterviewerStage.jsx';
import AnswerComposer from '../components/AnswerComposer.jsx';
import AnalysisPanel from '../components/AnalysisPanel.jsx';
import TranscriptPanel from '../components/TranscriptPanel.jsx';
import { useSpeech } from '../hooks/useSpeech.js';
import { usePresence } from '../hooks/usePresence.js';

const TOTAL_SECONDS = 90;

export default function InterviewPage({
  draft,
  session,
  currentQuestion,
  latestAnalysis,
  transcript,
  onSubmitAnswer,
  onEndSession,
  busy,
  videoUrl // 🔥 ADDED
}) {
  const {
    transcript: speechText,
    isListening,
    isSpeaking,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeech(draft.persona);

  const { videoRef, metrics, cameraReady, presenceSnapshot } = usePresence();

  const [followUpText, setFollowUpText] = useState('');
  const [mood, setMood] = useState('neutral');
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_SECONDS);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [questionCount, setQuestionCount] = useState(0);

  // Speak question
  useEffect(() => {
    if (currentQuestion) {
      setFollowUpText('');
      setMood('neutral');
      setRemainingSeconds(TOTAL_SECONDS);
      setStartedAt(Date.now());
      setQuestionCount(c => c + 1);

      const intro =
        questionCount === 0
          ? `${session?.interviewer?.intro || `Hello ${draft.candidateName}.`} `
          : '';

      speak(`${intro}${currentQuestion}`);
    }
  }, [currentQuestion]);
function speakText(text) {
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;

  speechSynthesis.cancel(); // stop previous
  speechSynthesis.speak(utterance);
}
  // Timer
  useEffect(() => {
    const id = setInterval(() => {
      setRemainingSeconds(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Mood
  useEffect(() => {
    if (isListening) setMood('listening');
    else if (!isSpeaking && mood === 'listening') setMood('neutral');
  }, [isListening, isSpeaking]);

  async function handleSubmit(answer) {
    const responseSeconds = Math.max(
      5,
      Math.round((Date.now() - startedAt) / 1000)
    );

    const result = await onSubmitAnswer(
      answer,
      responseSeconds,
      presenceSnapshot
    );

    if (result) {
      setMood(result.interviewerMood || 'neutral');

      if (result.followUp) {
        setFollowUpText(result.followUp);
        speak(result.followUp);
      }
    }
  }

  const pressureScore = useMemo(
    () => session?.pressureScore || 50,
    [session]
  );

  return (
    <div className="anim-fade-in">

      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div>
          <span className="badge badge-live">Interview in progress</span>
          <span className="badge">Q{transcript.length + 1}</span>
        </div>

        <button
          className="btn btn-danger btn-sm"
          onClick={onEndSession}
          disabled={busy}
        >
          End & View Results
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="interview-layout">

        {/* LEFT */}
        <div className="col-stack">
          <InterviewerStage
            interviewer={session?.interviewer}
            persona={draft.persona}
            currentQuestion={currentQuestion}
            followUpText={followUpText}
            pressureScore={pressureScore}
            mood={mood}
            isSpeaking={isSpeaking}
          />

          <AnswerComposer
            transcript={speechText}
            isListening={isListening}
            onStartListening={startListening}
            onStopListening={stopListening}
            onSubmit={handleSubmit}
            onClear={resetTranscript}
            busy={busy}
            remainingSeconds={remainingSeconds}
            totalSeconds={TOTAL_SECONDS}
          />

          <TranscriptPanel transcript={transcript} />
        </div>

        {/* RIGHT */}
        <div className="col-stack">

          {/* 🔥 INTERVIEW VIEW (AI + USER) */}
          <div className="panel">
            <div style={{ marginBottom: "8px" }}>
              Interview View
            </div>

            <div style={{ display: "flex", gap: "10px" }}>

              {/* AI INTERVIEWER */}
              <div style={{
                flex: 1,
                height: "220px",
                background: "#020617",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid #1e293b"
              }}>
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    autoPlay
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <div style={{
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%"
                  }}>
                    AI Interviewer (waiting...)
                  </div>
                )}
              </div>

              {/* USER CAMERA */}
              <div style={{
                flex: 1,
                height: "220px",
                background: "black",
                borderRadius: "10px",
                overflow: "hidden"
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              </div>

            </div>
          </div>

          {/* ANALYSIS */}
          <AnalysisPanel analysis={latestAnalysis} />

          {/* CONTROLS */}
          <div className="panel panel-sm">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() =>
                isSpeaking
                  ? stopSpeaking()
                  : speak(followUpText || currentQuestion)
              }
            >
              {isSpeaking ? 'Stop Audio' : 'Replay Question'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}