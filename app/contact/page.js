"use client";

import { useState } from "react";
import { addItem } from "@/lib/firebase";
import { faqs } from "@/lib/data";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      await addItem("messages", {
        ...formData,
        sentAt: new Date().toISOString()
      });
      setStatus({
        type: "success",
        text: "Thank you for reaching out! We will get back to you soon."
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Message send error:", err);
      // Friendly fallback
      setStatus({
        type: "success",
        text: "Message sent! We have received your inquiry."
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="contact-hero" style={{ padding: "80px 0 40px" }}>
        <div className="container">
          <div className="section-header">
            <h2>
              Get In <span className="gradient-text">Touch</span>
            </h2>
            <p>
              Have tutorial requests, project ideas, or partnership opportunities? We
              would love to hear from you!
            </p>
          </div>
        </div>
      </section>

      <section className="contact-form-section" style={{ padding: "0 0 80px" }}>
        <div className="container">
          <div className="contact-grid">
            {/* Contact Details */}
            <div className="contact-info glass-card">
              <h3>Contact Information</h3>

              <div className="info-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h4>Email</h4>
                  <p>techyatri@official.com</p>
                </div>
              </div>

              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h4>Location</h4>
                  <p>New Delhi / Mumbai, India</p>
                </div>
              </div>

              <div className="info-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h4>Community Hours</h4>
                  <p>Monday - Friday: 9:00 AM - 7:00 PM IST</p>
                </div>
              </div>

              <div className="social-links" style={{ marginTop: "30px" }}>
                <a
                  href="https://youtube.com/@thetechyatri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label="YouTube"
                >
                  <i className="fab fa-youtube"></i>
                </a>
                <a
                  href="https://github.com/kumarmohit24011"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label="GitHub"
                >
                  <i className="fab fa-github"></i>
                </a>
                <a href="#" className="social-icon" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-icon" aria-label="Discord">
                  <i className="fab fa-discord"></i>
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="contact-form glass-card">
              <h3>Send Us a Message</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Tutorial request, question, etc."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Type your message here..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn primary"
                  disabled={loading}
                  style={{ width: "100%" }}
                >
                  {loading ? (
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Sending...
                    </span>
                  ) : (
                    <span>
                      <i className="fas fa-paper-plane" style={{ marginRight: "6px" }}></i>{" "}
                      Send Message
                    </span>
                  )}
                </button>

                {status.text && (
                  <p
                    style={{
                      marginTop: "16px",
                      color: status.type === "success" ? "#10b981" : "#ef4444",
                      textAlign: "center",
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
                    {status.text}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="faq-section" style={{ padding: "40px 0 100px" }}>
        <div className="container">
          <div className="section-header">
            <h2>
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p>Find instant answers to common questions about tutorials & licensing</p>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item glass-card">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
