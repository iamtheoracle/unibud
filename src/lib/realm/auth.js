/**
 * Authentication Service — reusable across every My Realm application.
 * Today delegates to Base44 Auth; the seam lets us swap to a custom
 * identity provider (with refresh tokens, SSO, multi-device) later.
 */
export function authService(base44) {
  return {
    login: (email, password) => base44.auth.loginViaEmailPassword(email, password),
    loginWithProvider: (provider, fromUrl) => base44.auth.loginWithProvider(provider, fromUrl),
    register: (data) => base44.auth.register(data),
    verifyOtp: ({ email, otpCode }) => base44.auth.verifyOtp({ email, otpCode }),
    resendOtp: (email) => base44.auth.resendOtp(email),
    requestPasswordReset: (email) => base44.auth.resetPasswordRequest(email),
    resetPassword: ({ resetToken, newPassword }) => base44.auth.resetPassword({ resetToken, newPassword }),
    isAuthenticated: () => base44.auth.isAuthenticated(),
    logout: (redirectUrl) => base44.auth.logout(redirectUrl),
    me: () => base44.auth.me(),
    updateMe: (data) => base44.auth.updateMe(data),
  };
}