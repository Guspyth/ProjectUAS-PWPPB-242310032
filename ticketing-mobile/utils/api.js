import { API_URL } from "../constants/Api";

const DEFAULT_TIMEOUT_MS = 10000;

// Simple API helper using native fetch
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const { timeout = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  // Set JSON headers by default
  const headers = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Batalkan request jika server tidak menjawab (mis. alamat backend salah)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const config = {
    ...fetchOptions,
    headers,
    credentials: "include", // Ensure session cookies are sent across origins
    signal: controller.signal,
  };

  if (fetchOptions.body && typeof fetchOptions.body === "object") {
    config.body = JSON.stringify(fetchOptions.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    const finalError =
      error.name === "AbortError"
        ? new Error("Network request failed: server tidak merespons (timeout).")
        : error;
    console.error(`API Error on ${endpoint}:`, finalError.message);
    throw finalError;
  } finally {
    clearTimeout(timeoutId);
  }
}
