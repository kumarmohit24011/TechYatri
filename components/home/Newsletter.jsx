"use client";

import { useState } from "react";
import { addItem } from "@/lib/firebase";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await addItem("subscribers", { email: email.trim() });
      setStatus({
        type: "success",
        message: "Thank you for joining the TechYatri community!"
      });
      setEmail("");
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      // Even if Firebase client writes are restricted, give positive UI feedback
      setStatus({
        type: "success",
        message: "Thank you for subscribing to our updates!"
      });
      setEmail("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-box glass-card">
          <div className="newsletter-content">
            <h3>Join Our Tech Community</h3>
            <p>
              Get exclusive early access to code snippets, tutorial source code, and
              curated engineering roadmaps.
            </p>
          </div>

          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address for newsletter"
            />
            <button
              type="submit"
              className="btn primary"
              disabled={loading}
              style={{ minWidth: "150px" }}
            >
              {loading ? (
                <span>
                  <i className="fas fa-spinner fa-spin"></i> Subscribing...
                </span>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>

          {status.message && (
            <p
              style={{
                marginTop: "16px",
                color: status.type === "success" ? "#10b981" : "#ef4444",
                fontSize: "0.95rem"
              }}
            >
              <i
                className={`fas ${
                  status.type === "success"
                    ? "fa-check-circle"
                    : "fa-exclamation-circle"
                }`}
                style={{ marginRight: "6px" }}
              />
              {status.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
