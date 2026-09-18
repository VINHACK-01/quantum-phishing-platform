const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Helper to handle fetch responses and handle JSON parsing or HTTP errors
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
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        // Fallback to text if not JSON
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (err) {
    console.error(`API Request failed for [${endpoint}]:`, err);
    throw err;
  }
}

/**
 * Analyzes a URL for phishing threats and quantum comparisons.
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} The analysis payload
 */
export async function analyzeUrl(url) {
  return await fetchJson('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

/**
 * Fetches real-time or replayed network events.
 * @returns {Promise<Object>} List of network events
 */
export async function getNetworkEvents() {
  return await fetchJson('/api/network-events', {
    method: 'GET',
  });
}

/**
 * Fetches recent scan history log.
 * @returns {Promise<Object>} History scans list
 */
export async function getHistory() {
  return await fetchJson('/api/history', {
    method: 'GET',
  });
}

/**
 * Checks backend health status.
 * @returns {Promise<boolean>} True if backend is online and healthy
 */
export async function getHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
