const KEY = 'neuraldash_history_v2';

export function loadLocalHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveLocalHistory(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* quota exceeded — ignore */ }
}
