"use client";

import { useState, useEffect } from "react";
import { subscribeCollection } from "@/lib/firebase";
import { defaultSkills } from "@/lib/data";

export default function TechStackRadar() {
  const [skills, setSkills] = useState(defaultSkills);

  useEffect(() => {
    const unsub = subscribeCollection(
      "techStack",
      (data) => {
        if (data && data.length > 0) {
          setSkills(data);
        }
      },
      (err) => console.warn("Using default skills:", err)
    );
    return () => unsub();
  }, []);

  return (
    <section className="tech-stack-section">
      <div className="container">
        <div className="section-header">
          <h2>
            Master the <span className="gradient-text">Tech Stack</span>
          </h2>
          <p>Comprehensive learning paths for modern software engineering</p>
        </div>

        <div className="radar-grid">
          {skills.map((skill, index) => {
            const iconSrc = skill.icon || "/icons/python.svg";
            const progressVal = skill.progress || 80;

            return (
              <div key={skill.id || index} className="radar-item">
                <div className="tech-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={iconSrc}
                    alt={skill.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/icons/python.svg";
                    }}
                  />
                </div>
                <div className="tech-info">
                  <h3>{skill.name}</h3>
                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{ width: `${progressVal}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
