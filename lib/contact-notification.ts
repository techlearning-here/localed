/**
 * Sends a notification email to the site owner when a contact form is submitted.
 * CONTACT-01.4 — optional; no-op if no transport configured. Mock this in tests.
 */
export type ContactSubmission = {
  name: string;
  email: string;
  message: string;
  subject?: string;
  phone?: string;
  company?: string;
};

const DEFAULT_EMAIL_SUBJECT = "New message from your site";

/**
 * Sends contact form notification to the given address.
 * Returns true if sent (or queued), false if skipped (e.g. no API key).
 * @param emailSubject - Optional subject line (e.g. from contactFormSubject or form field); used in email subject when provided.
 */
export async function sendContactNotification(
  to: string,
  submission: ContactSubmission,
  siteName: string,
  emailSubject?: string
): Promise<boolean> {
  if (!to?.trim()) return false;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const subjectLine =
    emailSubject?.trim() ||
    submission.subject?.trim() ||
    (siteName ? `${DEFAULT_EMAIL_SUBJECT} (${siteName})` : DEFAULT_EMAIL_SUBJECT);

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
        subject: subjectLine,
        text: `Name: ${submission.name}\nEmail: ${submission.email}${submission.phone ? `\nPhone: ${submission.phone}` : ""}${submission.company ? `\nCompany: ${submission.company}` : ""}\n\nMessage:\n${submission.message}`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
