export const API_BASE = '/api/interview';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const createSession = (payload) =>
  request('/start', { method: 'POST', body: JSON.stringify(payload) });

export const submitAnswer = (payload) =>
  request('/answer', { method: 'POST', body: JSON.stringify(payload) });

export const endSession = (sessionId) =>
  request('/end', { method: 'POST', body: JSON.stringify({ sessionId }) });

export const fetchSession = (id) => request(`/sessions/${id}`);

export const fetchQuestionBank = (role) =>
  request(`/question-bank${role ? `?role=${role}` : ''}`);

export const fetchSessions = () => request('/sessions');

export const uploadResume = async (file) => {
  const fd = new FormData();
  fd.append('resume', file);
  const res = await fetch(`${API_BASE}/upload-resume`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
};
