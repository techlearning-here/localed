"use client";

import { useState } from "react";

type Props = { siteSlug: string; successMessage?: string };

const DEFAULT_SUCCESS_MESSAGE = "Message sent. We'll get back to you soon.";

export function ContactForm({ siteSlug, successMessage }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
    const subjectEl = form.elements.namedItem("subject") as HTMLInputElement | null;
    const subject = subjectEl?.value?.trim() || undefined;
    const phoneEl = form.elements.namedItem("phone") as HTMLInputElement | null;
    const phone = phoneEl?.value?.trim() || undefined;
    const companyEl = form.elements.namedItem("company") as HTMLInputElement | null;
    const company = companyEl?.value?.trim() || undefined;
    const websiteEl = form.elements.namedItem("website") as HTMLInputElement | null;
    const website = websiteEl?.value?.trim() || undefined;
    setStatus("sending");
    setErrorMessage("");
    try {
      const res = await fetch(`/api/sites/${siteSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, subject, phone, company, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(data.error ?? "Something went wrong");
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setErrorMessage("Network error");
      setStatus("error");
    }
  }

  return (
    <section className="mt-6">
      <h2 className="text-lg font-medium">Contact us</h2>
      {status === "success" && (
        <p className="mt-2 text-green-600">{successMessage?.trim() || DEFAULT_SUCCESS_MESSAGE}</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-red-600">{errorMessage}</p>
      )}
      <form onSubmit={handleSubmit} className="mt-2 space-y-3 max-w-md">
        <div>
          <label htmlFor="contact-name" className="block text-sm text-gray-600">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm text-gray-600">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="block text-sm text-gray-600">
            Phone <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>
        <div className="absolute -left-[9999px] w-px h-px" aria-hidden="true">
          <label htmlFor="contact-website">Leave blank</label>
          <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="contact-company" className="block text-sm text-gray-600">
            Company <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="contact-company"
            name="company"
            type="text"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="block text-sm text-gray-600">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={4}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send"}
        </button>
      </form>
    </section>
  );
}
