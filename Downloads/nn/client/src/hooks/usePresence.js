import { useEffect, useRef, useState } from 'react';

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function randomDelta(range = 8) { return Math.round((Math.random() - 0.5) * range); }

export function usePresence() {
  const videoRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [metrics, setMetrics] = useState({
    eyeContact: 72,
    posture: 74,
    attention: 78,
    expression: 'Neutral',
    confidence: 70
  });

  useEffect(() => {
    let stream = null;
    let intervalId = null;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);

        // Simulated but realistic metrics drift
        intervalId = window.setInterval(() => {
          setMetrics(prev => {
            const eye = clamp(prev.eyeContact + randomDelta(6), 50, 95);
            const pos = clamp(prev.posture + randomDelta(5), 45, 95);
            const att = clamp(prev.attention + randomDelta(5), 55, 97);
            const conf = clamp(Math.round((eye * 0.4 + pos * 0.3 + att * 0.3)), 40, 96);
            const EXPRS = ['Focused', 'Engaged', 'Neutral', 'Calm', 'Attentive'];
            const expression = eye > 77 && att > 77
              ? 'Focused'
              : att < 60
              ? 'Distracted'
              : EXPRS[Math.floor(Math.random() * EXPRS.length)];
            return { eyeContact: eye, posture: pos, attention: att, confidence: conf, expression };
          });
        }, 2000);
      } catch {
        setCameraReady(false);
      }
    }

    start();

    return () => {
      if (intervalId) clearInterval(intervalId);
      stream?.getTracks?.().forEach(t => t.stop());
    };
  }, []);

  // Build a simple presence snapshot for the backend
  const presenceSnapshot = {
    eyeContact: metrics.eyeContact,
    posture: metrics.posture,
    attention: metrics.attention,
    confidence: metrics.confidence,
    expression: metrics.expression
  };

  return { videoRef, metrics, cameraReady, presenceSnapshot };
}
