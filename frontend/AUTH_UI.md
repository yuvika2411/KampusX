# Authentication UI

All six routes are UI-only: `/login`, `/register`, `/verify-otp`, `/login/verify-otp`, `/forgot-password`, `/reset-password`.

`src/lib/auth.ts` is the typed integration boundary, based on the existing Spring Boot controllers and DTOs. Its methods deliberately reject requests until the separate API integration task. No request sends an email, verifies an OTP, creates an account, resets a password, or establishes a session. Valid form submissions show an unavailable state. No mock success responses or new dependencies were added.

Registration completion fields are rendered only after `verifyRegistrationCode` resolves successfully. There is no URL parameter, local storage flag or preview switch that marks an email verified. The completion form is implemented but cannot be reached through successful verification in this UI-only task.

Login code requests require email and password; verifying requires email and OTP. Login resends return to the login form to re-enter credentials rather than retaining passwords across routes. Registration and password recovery resends start a 60-second UI cooldown only after a successful response. Server-side rate limits remain authoritative.

Password recovery follows `PasswordResetController`: request an OTP with an email query parameter, then submit email, OTP, newPassword and confirmPassword together to `/api/auth/password/reset`. There is no separate password OTP verification endpoint.

Next integration work: connect the seven service methods, normalize backend errors, establish a session from LoginResponse, honor the validated `next` destination after login, and protect `/issues/new`. Do not navigate or show authenticated state merely because a form passes client validation. No credentials or tokens are persisted by these screens.

Manual verification: check every route in light/dark mode at 320px, 390px and desktop sizes; submit empty/invalid forms; toggle password visibility; paste a six-digit code; edit with arrow keys and Backspace; verify failed requests preserve inputs and display an error; check mobile menu Login/Get Started and the landing report link. Success-dependent states require real API integration.
