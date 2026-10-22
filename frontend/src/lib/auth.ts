/** UI-only boundary. Replace these methods with real API calls in the integration task.
 * Never resolve a request here without confirmation from the backend.
 */
export interface VerifyOtpRequest { email: string; otp: string }
export interface LoginOtpRequest { email: string; password: string }
export interface CompleteRegistrationRequest { name: string; email: string; password: string; confirmPassword: string }
export interface ResetPasswordRequest { email: string; otp: string; newPassword: string; confirmPassword: string }
export interface LoginResponse { id: number; name: string; email: string; role: string; token: string }

async function unavailable(_request?: unknown): Promise<never> {
  void _request;
  throw new Error("This service is currently unavailable. Please try again later.");
}

export const authService = {
  // POST /api/auth/register/request-otp?email=...
  requestRegistrationCode: (_email: string): Promise<void> => unavailable(_email),
  // POST /api/auth/register/verify-otp — JSON VerifyOtpRequest
  verifyRegistrationCode: (_request: VerifyOtpRequest): Promise<void> => unavailable(_request),
  // POST /api/auth/register/complete — JSON CompleteRegistrationRequest
  completeRegistration: (_request: CompleteRegistrationRequest): Promise<void> => unavailable(_request),
  // POST /api/auth/login/request-otp — JSON LoginOtpRequest
  requestLoginCode: (_request: LoginOtpRequest): Promise<void> => unavailable(_request),
  // POST /api/auth/login/verify-otp — JSON VerifyOtpRequest
  verifyLoginCode: (_request: VerifyOtpRequest): Promise<LoginResponse> => unavailable(_request),
  // POST /api/auth/password/request-otp?email=...
  requestPasswordCode: (_email: string): Promise<void> => unavailable(_email),
  // POST /api/auth/password/reset — JSON ResetPasswordRequest
  resetPassword: (_request: ResetPasswordRequest): Promise<void> => unavailable(_request),
};

export function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !/[\\\u0000-\u0020]/.test(value) ? value : "/";
}

export function emailError(value: string): string {
  if (!value.trim()) return "Enter your institutional email.";
  if (!/^[^\s@]+@kiet\.edu$/i.test(value.trim())) return "Use your @kiet.edu email address.";
  return "";
}
