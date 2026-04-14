import { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis
} from 'recharts';
import ScoreRing from '../components/ScoreRing.jsx';
import '../styles/global.css';

function AccordionItem({ q, a, ideal, score }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`accordion-item ${open ? 'open' : ''}`}>
      <button className="accordion-trigger" onClick={() => setOpen(v => !v)}>
        <span style={{ flex: 1 }}>
          {q?.slice(0, 90)}{q?.length > 90 ? '…' : ''}
        </span>
        <span>{score ? `${score}/10` : ''}</span>
      </button>

      {open && (
        <div className="accordion-body">
          <div className="compare-block">
            <b>Your Answer:</b> {a}
          </div>
          <div className="compare-block">
            <b>Model Answer:</b> {ideal || "Not available"}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage({ session, summary }) {
  if (!summary) return <div>No data</div>;

  const metrics = {
    overall: Number(summary?.overall ?? 0),
    confidence: Number(summary?.confidence ?? 0),
    clarity: Number(summary?.clarity ?? 0),
    structure: Number(summary?.structure ?? 0),
    specificity: Number(summary?.specificity ?? 0)
  };

  const confidenceScore = summary?.confidenceScore ?? 50;
  const toneScore = summary?.toneScore ?? 50;
  const eyeContactScore = summary?.eyeContactScore ?? 50;

  const strengths = summary?.strengths?.length
    ? summary.strengths
    : ["Consistent effort across responses."];

  const focusAreas = summary?.focusAreas?.length
    ? summary.focusAreas
    : ["No major weaknesses detected."];

  const radarData = [
    { metric: "confidence", score: metrics.confidence },
    { metric: "clarity", score: metrics.clarity },
    { metric: "structure", score: metrics.structure },
    { metric: "specificity", score: metrics.specificity }
  ];

  const trendData = (session?.transcript || []).map((entry, i) => ({
    round: `Q${i + 1}`,
    overall: entry.analysis?.metrics?.overall ?? 5,
    confidence: entry.analysis?.metrics?.confidence ?? 5,
    specificity: entry.analysis?.metrics?.specificity ?? 5
  }));

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-hero">
        <div>
          <div className="dashboard-hero-eyebrow">Interview Complete</div>
          <h2>Performance Report</h2>
        </div>
        <div className="hiring-badge no-hire">No Hire</div>
      </div>

      {/* SCORE RINGS */}
      <div className="score-ring-grid">
        {[
          { label: "Overall", value: metrics.overall },
          { label: "Confidence", value: metrics.confidence },
          { label: "Clarity", value: metrics.clarity },
          { label: "Structure", value: metrics.structure },
          { label: "Specificity", value: metrics.specificity }
        ].map(m => (
          <div className="score-ring-card" key={m.label}>
            <ScoreRing score={m.value} max={10} />
            <div className="score-ring-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* METRICS */}
      <div className="grid-3">
        {[
          { label: "Confidence Score", value: confidenceScore },
          { label: "Eye Contact", value: eyeContactScore },
          { label: "Tone Score", value: toneScore }
        ].map(m => (
          <div className="metric-card" key={m.label}>
            <div className="metric-card-label">{m.label}</div>

            <div className="metric-card-value">
              {m.value}
              <span>/100</span>
            </div>

            <div className="progress-bar">
              <div
                className={`progress-fill ${
                  m.value > 70 ? "success" :
                  m.value > 40 ? "warning" :
                  "danger"
                }`}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="panel-title">Performance Radar</div>

          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <Radar dataKey="score" stroke="#fff" fill="#fff" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="panel-title">Round-by-Round Trend</div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <XAxis dataKey="round" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line dataKey="overall" stroke="#fff" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FEEDBACK */}
      <div className="feedback-grid">
        <div className="feedback-card">
          <div className="feedback-card-title">Top Strengths</div>
          <ul>
            {strengths.map((s, i) => (
              <li key={i}>
                <span className="list-bullet green"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="feedback-card">
          <div className="feedback-card-title">Focus Areas</div>
          <ul>
            {focusAreas.map((f, i) => (
              <li key={i}>
                <span className="list-bullet orange"></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ANSWERS */}
      <div className="panel">
        <div className="panel-title">Answer Comparison</div>

        {session?.transcript?.map((entry, i) => (
          <AccordionItem
            key={i}
            q={entry.question}
            a={entry.answer}
            ideal={entry.modelAnswer}
            score={entry.analysis?.metrics?.overall}
          />
        ))}
      </div>
    </div>
  );
}