/**
 * Email Service — transport seam. The provider (Base44 today, SendGrid/etc.
 * tomorrow) is replaceable without changing application code.
 * Note: the current provider delivers to registered app users only.
 */
export function emailService(base44) {
  return {
    send: async ({ to, subject, body, from_name }) =>
      base44.integrations.Core.SendEmail({ to, subject, body, from_name }),
  };
}