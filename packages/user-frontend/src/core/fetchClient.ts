export interface fetchOptions extends RequestInit {
  timeOut?: number;
}

// minimal for now
export async function fetchClient(
  input: RequestInfo,
  options: fetchOptions = {},
) {
  const timeOut = options.timeOut || 5000;
  const controller = new AbortController();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

  const url = `${baseUrl}${input}`;
  const id = setTimeout(() => {
    controller.abort();
  }, timeOut);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP error: ${response}`);
    return response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  } finally {
    clearTimeout(id);
  }
}
