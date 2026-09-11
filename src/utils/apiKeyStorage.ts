const STORAGE_KEY = 'toan_lop3_gemini_api_key';

/**
 * Retrieve the Gemini API key stored in browser localStorage.
 * Handles private browsing mode and storage exceptions gracefully.
 */
export function getStoredApiKey(): string {
  try {
    const key = localStorage.getItem(STORAGE_KEY);
    return key ? key.trim() : '';
  } catch (e) {
    console.warn('Không thể truy cập localStorage:', e);
    return '';
  }
}

/**
 * Save or update the Gemini API key in browser localStorage.
 * Trims extraneous whitespace and validates non-emptiness.
 */
export function setStoredApiKey(apiKey: string): void {
  try {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Không thể lưu API key vào localStorage:', e);
  }
}

/**
 * Remove the stored Gemini API key from browser localStorage.
 */
export function removeStoredApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Không thể xóa API key khỏi localStorage:', e);
  }
}

/**
 * Check whether a valid non-empty API key is currently saved.
 */
export function hasStoredApiKey(): boolean {
  return getStoredApiKey().length > 0;
}

/**
 * Helper to mask an API key for safe visual feedback (e.g. AIzaSy...7X9a).
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey) return '';
  if (apiKey.length <= 10) return '••••••••';
  return `${apiKey.slice(0, 6)}••••${apiKey.slice(-4)}`;
}
