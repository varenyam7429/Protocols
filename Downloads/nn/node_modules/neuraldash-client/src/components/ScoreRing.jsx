export default function ScoreRing({ score = 0, max = 10, label }) {
  const safeScore = Number(score) || 0;

  return (
    <div>
      <h2>{safeScore.toFixed(1)}</h2>
      <p>{label}</p>
    </div>
  );
}