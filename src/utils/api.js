import { APP_CONFIG } from '../config';

export async function apiRequest(path, options = {}) {
  if (!APP_CONFIG.apiBaseUrl) {
    throw new Error('API base URL is not configured. Set REACT_APP_API_BASE_URL.');
  }

  const response = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}