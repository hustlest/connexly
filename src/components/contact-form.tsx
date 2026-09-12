"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField, SelectField, TextAreaField } from "@/components/ui/form-field";

const REASONS = ["Buy IPv4 space", "Sell IPv4 space", "Lease IPv4 space", "General question"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORMSPREE_ENDPOINT = "https://formspree.io/f/moeqbzwo";

interface FormState {
  [key: string]: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [values, setValues] = useState<FormState>({});
  const [errors, setErrors] = useState<FormState>({});
  const [status, setStatus] = useState<Status>("idle");

  function setField(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: FormState = {};
    ["name", "email", "reason", "message"].forEach((field) => {
      if (!values[field]?.trim()) nextErrors[field] = "Required";
    });
    if (values.email && !EMAIL_RE.test(values.email)) {
      nextErrors.email = "Enter a valid email";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(values),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[3px] bg-paper p-9 text-center md:p-12">
        <div className="mb-2 text-[22px] font-bold text-navy">Message sent</div>
        <p className="text-sm text-navy/65">
          Thanks for reaching out — a Connexly broker will reply within one
          business day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-5 rounded-[3px] bg-paper p-6 sm:grid-cols-2 md:p-9"
    >
      <TextField
        label="Name"
        htmlFor="contact-name"
        placeholder="Jordan Smith"
        value={values.name ?? ""}
        onChange={(e) => setField("name", e.target.value)}
        error={errors.name}
      />
      <TextField
        label="Email"
        htmlFor="contact-email"
        type="email"
        placeholder="you@company.com"
        value={values.email ?? ""}
        onChange={(e) => setField("email", e.target.value)}
        error={errors.email}
      />
      <TextField
        label="Company (optional)"
        htmlFor="contact-company"
        placeholder="Company Inc."
        className="sm:col-span-2"
        value={values.company ?? ""}
        onChange={(e) => setField("company", e.target.value)}
      />
      <SelectField
        label="Reason for contact"
        htmlFor="contact-reason"
        className="sm:col-span-2"
        value={values.reason ?? ""}
        onChange={(e) => setField("reason", e.target.value)}
        error={errors.reason}
      >
        <option value="">Select a reason</option>
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </SelectField>
      <TextAreaField
        label="Message"
        htmlFor="contact-message"
        rows={5}
        className="sm:col-span-2"
        placeholder="Tell us what you're working on..."
        value={values.message ?? ""}
        onChange={(e) => setField("message", e.target.value)}
        error={errors.message}
      />
      {status === "error" ? (
        <p className="text-sm text-[#C0442A] sm:col-span-2">
          Something went wrong sending your message — please try again, or
          email us directly at sales@connexly.com.
        </p>
      ) : null}
      <Button type="submit" disabled={status === "submitting"} className="sm:col-span-2">
        {status === "submitting" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
