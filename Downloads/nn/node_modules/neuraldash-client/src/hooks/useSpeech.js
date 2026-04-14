import { useEffect, useMemo, useRef, useState } from 'react';

const PERSONA_MAP = {
  'calm-senior-interviewer': { rate: 0.92, pitch: 0.96, keywords: ['Google UK English Female', 'Microsoft Heera', 'Samantha', 'Female'] },
  'friendly-recruiter':     { rate: 1.02, pitch: 1.08, keywords: ['Google US English', 'Samantha', 'Female'] },
  'strict-panelist':         { rate: 0.88, pitch: 0.88, keywords: ['Daniel', 'David', 'Male', 'UK English Male'] },
  'startup-founder':         { rate: 1.05, pitch: 1.0,  keywords: ['Google US English', 'Alex', 'Male'] }
};

export function useSpeech(persona = 'calm-senior-interviewer') {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening]   = useState(false);
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [voices,       setVoices]       = useState([]);
  const recognitionRef  = useRef(null);
  const manualStopRef   = useRef(false);
  const utteranceRef    = useRef(null);

  // Load available voices
  useEffect(() => {
    const populate = () => setVoices(window.speechSynthesis?.getVoices?.() || []);
    populate();
    window.speechSynthesis?.addEventListener?.('voiceschanged', populate);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', populate);
  }, []);

  const selectedVoice = useMemo(() => {
    const config = PERSONA_MAP[persona] || PERSONA_MAP['calm-senior-interviewer'];
    return (
      voices.find(v => config.keywords.some(kw => v.name.includes(kw))) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0] ||
      null
    );
  }, [voices, persona]);

  function speak(text) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const config = PERSONA_MAP[persona] || PERSONA_MAP['calm-senior-interviewer'];
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate  = config.rate;
    utter.pitch = config.pitch;
    utter.voice = selectedVoice;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend   = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel?.();
    setIsSpeaking(false);
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Speech recognition requires Chrome or Edge. You can still type your answer.');
      return;
    }
    manualStopRef.current = false;
    const rec = new SR();
    rec.continuous  = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onstart  = () => setIsListening(true);
    rec.onerror  = () => setIsListening(false);
    rec.onend    = () => {
      if (!manualStopRef.current) {
        try { rec.start(); } catch { setIsListening(false); }
      } else {
        setIsListening(false);
      }
    };
    rec.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ');
      setTranscript(text);
    };
    recognitionRef.current = rec;
    rec.start();
  }

  function stopListening() {
    manualStopRef.current = true;
    recognitionRef.current?.stop?.();
    setIsListening(false);
  }

  function resetTranscript() { setTranscript(''); }

  return {
    transcript, setTranscript,
    isListening, isSpeaking,
    speak, stopSpeaking,
    startListening, stopListening,
    resetTranscript,
    availableVoices: voices.map(v => v.name)
  };
}
