"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const words = [
  "With TechYatri",
  "With Python",
  "With React",
  "With AI & ML",
  "With JavaScript"
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 1200);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 40 : 80);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse]);

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>
            <span className="gradient-text">Code</span> Your Future{" "}
            <span style={{ color: "#818cf8" }}>
              {words[index].substring(0, subIndex)}
            </span>
            <span style={{ animation: "pulseEffect 1s infinite" }}>|</span>
          </h1>
          <p className="subtitle">
            Cutting-edge programming tutorials, practical projects, and 60-second coding
            shorts that accelerate your developer journey.
          </p>

          <div className="cta-container">
            <Link href="/videos" className="cta-button pulse">
              <i className="fas fa-play"></i> Explore Videos
            </Link>
            <a
              href="https://youtube.com/@thetechyatri"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button secondary"
            >
              <i className="fab fa-youtube"></i> Subscribe Now
            </a>
          </div>
        </div>

        <div className="hero-image">
          <div className="code-window">
            <div className="window-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span style={{ marginLeft: "12px", fontSize: "0.78rem", color: "#8b949e" }}>
                techyatri_journey.py
              </span>
            </div>
            <div className="window-content">
              <pre>
                <code>{`# Welcome to TechYatri!
def transform_career():
    tutorials = load_playlists()
    skills = ["Python", "React", "AI", "DevOps"]
    
    for skill in skills:
        mastery = tutorials[skill].complete()
        yield mastery

# Run your future
for step in transform_career():
    print(f"Mastered: {step}")`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
