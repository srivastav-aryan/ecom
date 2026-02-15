
export interface FetchOptions extends RequestInit {
  timeOut?: number;
  _retry?: boolean;
}

let failedReqQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

let isRefreshing = false;
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

function processFailedReqQueue(error: any, newToken: string | null) {
  failedReqQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(newToken);
    }
  });

  failedReqQueue = [];
}

export async function fetchClient(
  input: string,
  options: FetchOptions = {}
) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const url = `${baseUrl}${input}`;

  const controller = new AbortController();
  const timeOut = options.timeOut ?? 7000;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeOut);

  const isRetry = options._retry ?? false;

  // ─────────────────────────────
  // Build headers safely
  // ─────────────────────────────
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    (headers as any)["Authorization"] = `Bearer ${accessToken}`;
  }

  // ─────────────────────────────
  // Build fetch config
  // ─────────────────────────────
  const fetchConfig: RequestInit = {
    method: options.method || (options.body ? "POST" : "GET"),
    headers,
    credentials: "include",
    signal: controller.signal,
  };

  if (options.body) {
    fetchConfig.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, fetchConfig);

    // ─────────────────────────────
    // Handle 401 (only once)
    // ─────────────────────────────
    if (response.status === 401 && !isRetry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedReqQueue.push({
            resolve: () => {
              resolve(fetchClient(input, { ...options, _retry: true }));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const refResponse = await fetch(`${baseUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refResponse.ok) {
          throw new Error("Refresh failed");
        }

        const data = await refResponse.json();
        const newToken = data?.data?.accessToken;

        if (!newToken) {
          throw new Error("Invalid refresh response");
        }

        accessToken = newToken;

        processFailedReqQueue(null, newToken);

        return fetchClient(input, { ...options, _retry: true });

      } catch (err) {
        processFailedReqQueue(err, null);
        accessToken = null;
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();

  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

