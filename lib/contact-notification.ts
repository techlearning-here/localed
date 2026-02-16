/**
 * Sends a notification email to the site owner when a contact form is submitted.
 * CONTACT-01.4 — optional; no-op if no transport configured. Mock this in tests.
 */
export type ContactSubmission = {
  name: string;
  email: string;
  message: string;
};

/**
 * Sends contact form notification to the given address.
 * Returns true if sent (or queued), false if skipped (e.g. no API key).
 */
export async function sendContactNotification(
  to: string,
  submission: ContactSubmission,
  siteName: string
): Promise<boolean> {
  if (!to?.trim()) return false;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "Localed <onboarding@resend.dev>",
        to: [to.trim()],
        subject: `New message from your site${siteName ? ` (${siteName})` : ""}`,
        text: `Name: ${submission.name}\nEmail: ${submission.email}\n\nMessage:\n${submission.message}`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
