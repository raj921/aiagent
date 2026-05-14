"use client";

import { useState } from "react";

const STEPS = ["Business Info", "Payment Needs", "Contact Info"] as const;

const BUSINESS_TYPES = [
  "Restaurant / Food Service",
  "Retail Store",
  "Salon / Spa",
  "Medical / Healthcare",
  "Auto / Mechanic Shop",
  "Grocery / Convenience Store",
  "E-Commerce / Online",
  "Food Truck / Mobile",
  "Bar / Nightclub",
  "Hotel / Hospitality",
  "Other",
] as const;

const YEARS_OPTIONS = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
] as const;

const LOCATION_OPTIONS = [
  "1 location",
  "2–3 locations",
  "4–10 locations",
  "10+ locations",
] as const;

const VOLUME_OPTIONS = [
  "Under $5,000",
  "$5,000 – $20,000",
  "$20,000 – $50,000",
  "$50,000 – $100,000",
  "Over $100,000",
] as const;

const POS_OPTIONS = [
  "None / Just starting",
  "Clover",
  "SpotOn",
  "Square",
  "Toast",
  "Lightspeed",
  "Dejavoo",
  "PAX",
  "Other",
] as const;

const BEST_TIME_OPTIONS = [
  "Morning (8am–12pm)",
  "Afternoon (12pm–5pm)",
  "Evening (5pm–8pm)",
  "Anytime",
] as const;

const SOLUTIONS = [
  "POS System",
  "Payment Terminal",
  "Cloud-Based Solution",
  "Online Gateway",
  "Mobile Payments",
  "Lower Processing Fees",
] as const;

type FormState = {
  businessName: string;
  businessType: string;
  yearsInBusiness: string;
  numLocations: string;
  currentProcessor: string;
  monthlyVolume: string;
  currentPOS: string;
  solutionNeeded: string[];
  contactName: string;
  phone: string;
  email: string;
  bestTime: string;
};

const initialForm: FormState = {
  businessName: "",
  businessType: "",
  yearsInBusiness: "",
  numLocations: "",
  currentProcessor: "",
  monthlyVolume: "",
  currentPOS: "",
  solutionNeeded: [],
  contactName: "",
  phone: "",
  email: "",
  bestTime: "",
};

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field-stack">
      <label className="label-editorial" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function MNALeadForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSolution = (val: string) => {
    setForm((prev) => {
      const current = prev.solutionNeeded;
      const next = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];
      return { ...prev, solutionNeeded: next };
    });
  };

  const validate = () => {
    if (step === 0 && (!form.businessName || !form.businessType)) {
      setError("Please fill in Business Name and Business Type.");
      return false;
    }
    if (step === 1 && !form.monthlyVolume) {
      setError("Please select your monthly processing volume.");
      return false;
    }
    if (step === 2 && (!form.contactName || !form.phone || !form.email)) {
      setError("Please fill in Name, Phone, and Email.");
      return false;
    }
    return true;
  };

  const submitLead = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/call-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(
          data.error ||
            "Something went wrong. Please try again or call us directly.",
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const next = async () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    await submitLead();
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  };

  const firstName =
    form.contactName.trim().split(/\s+/)[0] || "there";

  return (
    <div className="layout-sticky-form reveal-editorial reveal-editorial-delay">
      {!submitted ? (
        <div className="surface-card" style={{ padding: "2rem" }}>
          <div
            className="progress-wrap"
            role="navigation"
            aria-label="Form progress"
          >
            {STEPS.map((label, i) => (
              <div key={label} className="progress-item">
                <div
                  className="progress-dot"
                  data-active={i <= step ? "true" : undefined}
                  aria-current={i === step ? "step" : undefined}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className="progress-label"
                  data-current={i === step ? "true" : undefined}
                >
                  {label}
                </span>
              </div>
            ))}
            <div className="progress-track" aria-hidden>
              <div
                className="progress-fill"
                style={{
                  width: `${(step / (STEPS.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          <h2 className="step-title">
            {step === 0 && "Tell us about your business"}
            {step === 1 && "What payment solution do you need?"}
            {step === 2 && "How can we reach you?"}
          </h2>

          {step === 0 && (
            <div>
              <Field label="Business Name *" htmlFor="businessName">
                <input
                  id="businessName"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Joe's Pizza"
                  className="input-editorial"
                  autoComplete="organization"
                />
              </Field>
              <Field label="Business Type *" htmlFor="businessType">
                <select
                  id="businessType"
                  name="businessType"
                  value={form.businessType}
                  onChange={handleChange}
                  className="select-editorial"
                >
                  <option value="">Select your business type...</option>
                  {BUSINESS_TYPES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="field-row">
                <Field label="Years in Business" htmlFor="yearsInBusiness">
                  <select
                    id="yearsInBusiness"
                    name="yearsInBusiness"
                    value={form.yearsInBusiness}
                    onChange={handleChange}
                    className="select-editorial"
                  >
                    <option value="">Select...</option>
                    {YEARS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Number of Locations" htmlFor="numLocations">
                  <select
                    id="numLocations"
                    name="numLocations"
                    value={form.numLocations}
                    onChange={handleChange}
                    className="select-editorial"
                  >
                    <option value="">Select...</option>
                    {LOCATION_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <Field label="Monthly Processing Volume *" htmlFor="monthlyVolume">
                <select
                  id="monthlyVolume"
                  name="monthlyVolume"
                  value={form.monthlyVolume}
                  onChange={handleChange}
                  className="select-editorial"
                >
                  <option value="">Select your monthly volume...</option>
                  {VOLUME_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Current POS System (if any)" htmlFor="currentPOS">
                <select
                  id="currentPOS"
                  name="currentPOS"
                  value={form.currentPOS}
                  onChange={handleChange}
                  className="select-editorial"
                >
                  <option value="">Select current system...</option>
                  {POS_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Current Processor (if any)" htmlFor="currentProcessor">
                <input
                  id="currentProcessor"
                  name="currentProcessor"
                  value={form.currentProcessor}
                  onChange={handleChange}
                  placeholder="e.g. Square, Stripe, Bank..."
                  className="input-editorial"
                />
              </Field>
              <p className="chips-legend">
                What solution are you looking for? (select all that apply)
              </p>
              <div className="chips-wrap">
                {SOLUTIONS.map((sol) => {
                  const active = form.solutionNeeded.includes(sol);
                  return (
                    <button
                      key={sol}
                      type="button"
                      className="chip-editorial"
                      data-active={active ? "true" : undefined}
                      aria-pressed={active}
                      onClick={() => toggleSolution(sol)}
                    >
                      {sol}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <Field label="Your Full Name *" htmlFor="contactName">
                <input
                  id="contactName"
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className="input-editorial"
                  autoComplete="name"
                />
              </Field>
              <Field label="Phone Number *" htmlFor="phone">
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  type="tel"
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="input-editorial"
                  autoComplete="tel"
                />
              </Field>
              <Field label="Email Address *" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  type="email"
                  onChange={handleChange}
                  placeholder="john@mybusiness.com"
                  className="input-editorial"
                  autoComplete="email"
                />
              </Field>
              <Field label="Best Time to Call" htmlFor="bestTime">
                <select
                  id="bestTime"
                  name="bestTime"
                  value={form.bestTime}
                  onChange={handleChange}
                  className="select-editorial"
                >
                  <option value="">Select preferred time...</option>
                  {BEST_TIME_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {error ? <div className="alert-error">{error}</div> : null}

          <div className="nav-row-form">
            {step > 0 ? (
              <button
                type="button"
                className="btn-editorial-ghost"
                onClick={back}
                disabled={submitting}
              >
                ← Back
              </button>
            ) : null}
            <button
              type="button"
              className="btn-editorial-primary"
              onClick={() => void next()}
              disabled={submitting}
            >
              {submitting
                ? "Starting your call…"
                : step < STEPS.length - 1
                  ? "Next Step →"
                  : "Get my free consultation"}
            </button>
          </div>

          <p className="privacy-note">
            Your information is kept confidential and used only to respond to
            your request.
          </p>
        </div>
      ) : (
        <div className="surface-card" style={{ padding: "2rem" }}>
          <div className="success-panel">
            <div className="success-icon" aria-hidden>
              ✓
            </div>
            <h2 className="success-title">Thank you, {firstName}!</h2>
            <p className="success-sub">
              An MNA agent will reach out at <strong>{form.phone}</strong>{" "}
              shortly.
            </p>
            <div className="summary-box">
              <div className="summary-title">Your request summary</div>
              {(
                [
                  ["Business", form.businessName],
                  ["Type", form.businessType],
                  ["Monthly volume", form.monthlyVolume],
                  [
                    "Solutions needed",
                    form.solutionNeeded.join(", ") || "General inquiry",
                  ],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="summary-row">
                  <span className="summary-key">{k}</span>
                  <span className="summary-val">{v}</span>
                </div>
              ))}
            </div>
            <div className="next-steps-list">
              {[
                "We’ll call the number you provided",
                "Check your phone for a text confirmation",
                "Watch your inbox for follow-up details",
              ].map((text) => (
                <div key={text} className="next-step-item">
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
