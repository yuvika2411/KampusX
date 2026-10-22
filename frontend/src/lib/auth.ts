const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://kampusx-backend.onrender.com").replace(/\/$/, "");
const SESSION_KEY = "kampusx-session";
const OTP_COOLDOWN_MS = 60_000;

export interface VerifyOtpRequest { email: string; otp: string }
export interface LoginOtpRequest { email: string; password: string }
export interface CompleteRegistrationRequest { name: string; email: string; password: string; confirmPassword: string }
export interface ResetPasswordRequest { email: string; otp: string; newPassword: string; confirmPassword: string }
export interface LoginResponse { id: number; name: string; email: string; role: string; token: string }
export type AuthSession = LoginResponse;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new Error("Unable to reach KampusX. Check your connection and try again.");
  }

  const text = await response.text();
  let body: unknown;
  try { body = text ? JSON.parse(text) : undefined; } catch { body = text; }
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
      ? body.error
      : typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
        ? body.message
        : "Request failed. Please try again.";
    throw new Error(message);
  }
  return body as T;
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export const authService = {
  requestRegistrationCode: (email: string): Promise<void> =>
    post(`/api/auth/register/request-otp?email=${encodeURIComponent(email)}`).then(() => undefined),
  verifyRegistrationCode: (request: VerifyOtpRequest): Promise<void> =>
    post("/api/auth/register/verify-otp", request).then(() => undefined),
  completeRegistration: (request: CompleteRegistrationRequest): Promise<void> =>
    post("/api/auth/register/complete", request).then(() => undefined),
  requestLoginCode: (request: LoginOtpRequest): Promise<void> =>
    post("/api/auth/login/request-otp", request).then(() => undefined),
  verifyLoginCode: (request: VerifyOtpRequest): Promise<LoginResponse> =>
    post<LoginResponse>("/api/auth/login/verify-otp", request),
  requestPasswordCode: (email: string): Promise<void> =>
    post(`/api/auth/password/request-otp?email=${encodeURIComponent(email)}`).then(() => undefined),
  resetPassword: (request: ResetPasswordRequest): Promise<void> =>
    post("/api/auth/password/reset", request).then(() => undefined),
};

export function saveSession(session: LoginResponse): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Partial<AuthSession>;
    if (typeof session.token !== "string" || typeof session.email !== "string" || typeof session.role !== "string") return null;
    return session as AuthSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function authHeaders(): HeadersInit {
  const session = getSession();
  return session ? { Authorization: `Bearer ${session.token}` } : {};
}

export function postLoginPath(session: AuthSession, next: string): string {
  if (next === "/issues/new" && session.role !== "STUDENT") return "/";
  return next;
}

export function otpCooldownUntil(purpose: string, email: string): number {
  if (typeof window === "undefined") return 0;
  const value = Number(sessionStorage.getItem(`kampusx-otp:${purpose}:${email}`));
  return Number.isFinite(value) ? value : 0;
}

export function startOtpCooldown(purpose: string, email: string): number {
  const until = Date.now() + OTP_COOLDOWN_MS;
  sessionStorage.setItem(`kampusx-otp:${purpose}:${email}`, String(until));
  return until;
}

export function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !/[\\\u0000-\u0020]/.test(value) ? value : "/";
}

export function emailError(value: string): string {
  if (!value.trim()) return "Enter your institutional email.";
  if (!/^[^\s@]+@kiet\.edu$/i.test(value.trim())) return "Use your @kiet.edu email address.";
  return "";
}
