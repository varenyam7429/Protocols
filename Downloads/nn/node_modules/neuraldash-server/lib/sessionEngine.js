import { nanoid } from 'nanoid';
import { questionBank, personaProfiles } from './questionBank.js';
import { analyzeAnswer, summarizeSession } from './scoring.js';
import { readDb, writeDb } from './fileDb.js';
import axios from "axios";

import {
  hasAI,
  generateAnalysisWithAI,
  generateFollowUpWithAI,
  generateDynamicQuestion,
  generateSessionSummaryWithAI
} from './aiProvider.js';


// ─── Question Picker ─────────────────────────────────────
function scoreQuestion(q, session) {
  const profileText = `${session.resumeText || ''} ${session.jdText || ''}`.toLowerCase();
  const keywordScore = (q.keywords || []).reduce((s, kw) => s + (profileText.includes(kw) ? 2 : 0), 0);
  const diffBoost = session.difficulty === q.difficulty ? 2 : 0;
  const modeBoost = session.interviewMode?.toLowerCase().includes(q.category) ? 1.5 : 0;
  return keywordScore + diffBoost + modeBoost;
}

function pickBankQuestion(session) {
  const role = session.role;
  const candidates = questionBank
    .filter(q => q.role === role && !session.askedQuestions.includes(q.question))
    .sort((a, b) => scoreQuestion(b, session) - scoreQuestion(a, session));
  return candidates[0] || questionBank.find(q => q.role === role) || questionBank[0];
}

async function getNextQuestion(session) {
  if (hasAI() && session.transcript.length < 10) {
    const aiQuestion = await generateDynamicQuestion({
      role: session.role,
      difficulty: session.difficulty,
      resumeText: session.resumeText,
      jdText: session.jdText,
      askedQuestions: session.askedQuestions,
      persona: session.persona
    });
    if (aiQuestion) return { question: aiQuestion, meta: null };
  }

  const q = pickBankQuestion(session);
  return { question: q.question, meta: q };
}


// ─── Create Session ─────────────────────────────────────
export async function createSession(payload) {
  const db = readDb();
  const personaMeta = personaProfiles[payload.persona] || personaProfiles['calm-senior-interviewer'];

  const session = {
    id: nanoid(10),
    createdAt: new Date().toISOString(),
    role: payload.role,
    candidateName: payload.candidateName,
    interviewMode: payload.interviewMode || 'mixed',
    difficulty: payload.difficulty || 'medium',
    persona: payload.persona || 'calm-senior-interviewer',
    pressureMode: payload.pressureMode || 'balanced',
    resumeText: payload.resumeText || '',
    jdText: payload.jdText || '',
    askedQuestions: [],
    currentQuestion: null,
    currentMeta: null,
    transcript: [],
    pressureScore: payload.pressureMode === 'high-pressure' ? 72 : 48,
    interviewer: personaMeta,
    endedAt: null,
    summary: null
  };

  const { question, meta } = await getNextQuestion(session);
  session.currentQuestion = question;
  session.currentMeta = meta;
  session.askedQuestions.push(question);

  db.sessions.unshift(session);
  writeDb(db);

  return {
    session,
    firstQuestion: question,
    interviewerIntro: `${personaMeta.intro} Here is your first question: ${question}`
  };
}

// ─── Get Session ─────────────────────────────────────
export function getSession(sessionId) {
  const db = readDb();

  const session = db.sessions.find(s => s.id === sessionId);

  if (!session) {
    throw new Error('Session not found');
  }

  return session;
}
// ─── Submit Answer ─────────────────────────────────────
export async function answerQuestion(sessionId, answer, meta = {}) {
  const db = readDb();
  const session = db.sessions.find(s => s.id === sessionId);
  if (!session) throw new Error('Session not found');

  const questionText = session.currentQuestion;
  const rubric = session.currentMeta;
  const presenceSnapshot = meta.presenceSnapshot || null;

  let analysis;
  let modelAnswer = null;
  let aiFollowUp = null;

  // 🔥 Python AI (Gemini backend)
  try {
    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/analyze",
      { text: answer }
    );

    const {
      score,
      feedback,
      confidence,
      clarity,
      structure,
      specificity,
      fillerCount,
      modelAnswer: aiModelAnswer,
      followUp
    } = aiResponse.data;

    modelAnswer = aiModelAnswer || null;
    aiFollowUp = followUp || null;

   analysis = {
  score: clamp(d.score ?? 5),
  metrics: {
    overall: clamp(d.score ?? 5),
    confidence: clamp(d.confidence ?? 5),
    clarity: clamp(d.clarity ?? 5),
    structure: clamp(d.structure ?? 5),
    specificity: clamp(d.specificity ?? 5)
  },
  eyeContactScore: meta?.presenceSnapshot?.eyeContact ?? 5
};

  } catch (err) {
    console.log("Python AI failed:", err.message);
  }

  // 🔁 Fallback
  if (!analysis && hasAI()) {
    const aiResult = await generateAnalysisWithAI({
      answer,
      question: questionText,
      role: session.role,
      rubric,
      presenceSnapshot
    });

    if (aiResult) {
      analysis = { ...aiResult, responseSeconds: meta.responseSeconds || 0 };
    }
  }

  // 🧠 Final fallback
  if (!analysis) {
    analysis = analyzeAnswer({
      answer,
      question: questionText,
      role: session.role,
      transcriptSoFar: session.transcript,
      rubric,
      pressureScore: session.pressureScore,
      responseSeconds: meta.responseSeconds || 0
    });
  }

  // ─── Follow-up
  let followUp = aiFollowUp ||
    (analysis.missingPoints?.[0]
      ? `Can you elaborate on: ${analysis.missingPoints[0]}?`
      : 'What would you do differently?');

  // ─── Save transcript
  session.transcript.push({
    question: questionText,
    answer,
    analysis,
    followUp,
    modelAnswer,
    createdAt: new Date().toISOString()
  });

  // ─── Pressure logic
  const delta = ((analysis.metrics?.overall || 5) < 6 ? 7 : -3);
  session.pressureScore = Math.max(20, Math.min(95, (session.pressureScore || 50) + delta));

  // ─── Next question
  const { question: nextQ, meta: nextMeta } = await getNextQuestion(session);
  session.currentQuestion = nextQ;
  session.currentMeta = nextMeta;
  if (nextQ) session.askedQuestions.push(nextQ);

  writeDb(db);

  return {
    analysis,
    followUp,
    nextQuestion: nextQ,
    pressureScore: session.pressureScore,
    modelAnswer
  };
}
// ─── End Session ─────────────────────────────────────
export async function endSession(sessionId) {
  const db = readDb();
  const session = db.sessions.find(s => s.id === sessionId);

  if (!session) throw new Error("Session not found");

  const t = session.transcript || [];

  if (!t.length) {
    const empty = {
      overall: 0,
      confidence: 0,
      clarity: 0,
      structure: 0,
      specificity: 0,
      confidenceScore: 0,
      toneScore: 0,
      eyeContactScore: 0,
      strengths: [],
      focusAreas: []
    };

    session.summary = empty;
    writeDb(db);
    return empty;
  }

  // ✅ SAFE ACCESS
  const get = (key) =>
    t.map(x => x?.analysis?.metrics?.[key] ?? 5);

  const overallArr = get("overall");
  const confidenceArr = get("confidence");
  const clarityArr = get("clarity");
  const structureArr = get("structure");
  const specificityArr = get("specificity");

  const avg = (arr) =>
    arr.reduce((a, b) => a + b, 0) / arr.length;

  const summary = {
    overall: avg(overallArr).toFixed(1),
    confidence: avg(confidenceArr).toFixed(1),
    clarity: avg(clarityArr).toFixed(1),
    structure: avg(structureArr).toFixed(1),
    specificity: avg(specificityArr).toFixed(1),

    confidenceScore: Math.round(avg(confidenceArr) * 10),
    toneScore: Math.round(avg(overallArr) * 10),
    eyeContactScore: Math.round(
  avg(t.map(x => x.analysis?.eyeContactScore ?? 50))
),
    strengths: ["Clear effort shown", "Answered consistently"],
    focusAreas: ["Add examples", "Improve structure"],

    trend: t.map((x, i) => ({
      round: `Q${i + 1}`,
      overall: x?.analysis?.metrics?.overall ?? 5
    }))
  };

  session.summary = summary;
  session.endedAt = new Date().toISOString();

  writeDb(db);

  return summary;
}
// ─── List Sessions ─────────────────────────────────────
export function listSessions() {
  const db = readDb();

  return db.sessions.map(s => ({
    id: s.id,
    createdAt: s.createdAt,
    endedAt: s.endedAt,
    role: s.role,
    candidateName: s.candidateName,
    difficulty: s.difficulty,
    summary: s.summary
  }));
}