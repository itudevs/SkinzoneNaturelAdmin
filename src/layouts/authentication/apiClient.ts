/**@Copilot is the Author  */
type HttpMethod = "GET" | "POST" | "PUT";

interface RequestOptions<TBody = unknown> {
  method: HttpMethod;
  body?: TBody;
  token?: string | null;
  headers?: Record<string, string>;
}

const BASE_URL = (process.env.REACT_APP_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

async function request<TResponse, TBody = unknown>(
  endpoint: string,
  { method, body, token, headers = {} }: RequestOptions<TBody>
): Promise<TResponse> {
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  const responseBody = await response.text();
  if (!responseBody.trim()) {
    return undefined as TResponse;
  }

  return JSON.parse(responseBody) as TResponse;
}

export const api = {
  get: <TResponse>(endpoint: string, token?: string | null) =>
    request<TResponse>(endpoint, { method: "GET", token }),

  post: <TResponse, TBody = unknown>(endpoint: string, body: TBody, token?: string | null) =>
    request<TResponse, TBody>(endpoint, { method: "POST", body, token }),

  put: <TResponse, TBody = unknown>(endpoint: string, body: TBody, token?: string | null) =>
    request<TResponse, TBody>(endpoint, { method: "PUT", body, token }),
};
