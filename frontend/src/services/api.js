const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with standardized error handling.
 * Ensures clean human-readable error messages and prevents raw exception leaks.
 */
async function fetchJson(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `Server error (${response.status} ${response.statusText})`;
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.detail) {
              errorMessage = typeof errorJson.detail === 'string'
                ? errorJson.detail
                : JSON.stringify(errorJson.detail);
            }
          } catch {
            errorMessage = errorText;
          }
        }
      } catch {
        // Fallback to HTTP status message
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error(`Unable to connect to backend server at ${BASE_URL}. Please ensure FastAPI is running.`);
    }
    throw err;
  }
}

/**
 * Submits a URL for phishing & threat analysis (Contract 1).
 * POST /api/analyze
 * @param {string} url - Target URL to analyze
 * @returns {Promise<Object>} Analysis response payload
 */
export async function analyzeUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Please enter a valid URL.');
  }
  return await fetchJson('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

/**
 * Fetches real-time or replayed network threat events (Contract 2).
 * GET /api/network-events
 * @returns {Promise<Object>} Network events payload containing { total_events, events }
 */
export async function getNetworkEvents() {
  return await fetchJson('/api/network-events', {
    method: 'GET',
  });
}

/**
 * Fetches the recent scan history log (Contract 3).
 * GET /api/history
 * @returns {Promise<Object>} History payload containing { scans }
 */
export async function getHistory() {
  return await fetchJson('/api/history', {
    method: 'GET',
  });
}

/**
 * Checks backend health status.
 * GET /health or GET /api/health
 * @returns {Promise<boolean>} True if backend responds with OK
 */
export async function getHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
