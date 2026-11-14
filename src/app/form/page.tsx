"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, AlertCircle, Building2, User, Phone, Mail, FileText } from "lucide-react";

export default function FormPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    company: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          message: formData.notes,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to submit form.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      company: "",
      notes: "",
    });
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="virpa-container">
      <div className="virpa-card">
        {/* Virpa Brand Logo & Name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: submitted ? "24px" : "18px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "#F4F1FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #EAE5FF",
              boxShadow: "0 2px 8px rgba(118, 87, 232, 0.08)",
              marginBottom: "8px",
            }}
          >
            <Image
              src="/virpa-logo.png"
              alt="Virpa Logo"
              width={42}
              height={42}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#17191D", letterSpacing: "-0.2px" }}>
            Virpa Connect
          </span>
        </div>

        {/* Success State */}
        {submitted ? (
          <div style={{ textAlign: "center", padding: "6px 0 8px 0" }}>
            <div
              style={{
                width: "58px",
                height: "58px",
                backgroundColor: "#ECFDF5",
                color: "#159A73",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                border: "1px solid #A7F3D0",
              }}
            >
              <CheckCircle2 style={{ width: 34, height: 34 }} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#17191D", margin: "0 0 8px 0" }}>
              Thank You!
            </h2>
            <p style={{ fontSize: "13.5px", color: "#667085", lineHeight: "1.6", margin: "0 0 24px 0" }}>
              Your details have been successfully saved. Our team will get in touch with you shortly.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="virpa-btn-primary"
            >
              Submit Another Response
            </button>
          </div>
        ) : (
          /* Normal Form State */
          <>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "22px" }}>
              <h1 style={{ fontSize: "21px", fontWeight: "700", color: "#17191D", margin: "0 0 6px 0" }}>
                Connect with Us
              </h1>
              <p style={{ fontSize: "13.5px", color: "#667085", margin: 0 }}>
                Please share your contact details below to connect with us.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {error && (
                <div
                  style={{
                    backgroundColor: "#FFF1F1",
                    border: "1px solid #FECDD3",
                    color: "#C94452",
                    fontSize: "13px",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#17191D", marginBottom: "6px" }}>
                  Full Name <span style={{ color: "#C94452" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#98A2B3", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                    <User style={{ width: 16, height: 16 }} />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="virpa-input"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#17191D", marginBottom: "6px" }}>
                  Phone Number <span style={{ color: "#C94452" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#98A2B3", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                    <Phone style={{ width: 16, height: 16 }} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210 or +91 98765 43210"
                    className="virpa-input"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#17191D", marginBottom: "6px" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#98A2B3", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                    <Mail style={{ width: 16, height: 16 }} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. john@company.com"
                    className="virpa-input"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#17191D", marginBottom: "6px" }}>
                  Company / Organization
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#98A2B3", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                    <Building2 style={{ width: 16, height: 16 }} />
                  </div>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corp"
                    className="virpa-input"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#17191D", marginBottom: "6px" }}>
                  Notes <span style={{ color: "#98A2B3", fontWeight: "normal" }}>(Optional)</span>
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "12px", top: "12px", color: "#98A2B3", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                    <FileText style={{ width: 16, height: 16 }} />
                  </div>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any additional notes or requirements..."
                    className="virpa-input"
                    style={{ paddingLeft: "36px", resize: "none" }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ paddingTop: "6px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="virpa-btn-primary"
                  style={{ padding: "13px 20px" }}
                >
                  {loading ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <svg
                        className="spinner-icon"
                        style={{ width: "16px", height: "16px" }}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="31.4"
                          strokeDashoffset="10"
                          strokeLinecap="round"
                          style={{ opacity: 0.25 }}
                        />
                        <path
                          d="M12 2a10 10 0 0 1 10 10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    "Submit Details"
                  )}
                </button>
              </div>

              <div style={{ textAlign: "center", paddingTop: "6px" }}>
                <p style={{ fontSize: "11px", color: "#98A2B3", margin: 0 }}>
                  Powered by Virpa Intelligence
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
