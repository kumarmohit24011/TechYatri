import { teamMembers } from "@/lib/data";

export const metadata = {
  title: "About Us | TechYatri",
  description:
    "Learn about TechYatri - our mission, our team, and how we empower developers worldwide with cutting-edge tech tutorials."
};

const values = [
  {
    icon: "fas fa-lightbulb",
    title: "Innovation",
    description:
      "We constantly explore new technologies, AI workflows, and modern stacks to provide the most relevant content."
  },
  {
    icon: "fas fa-users",
    title: "Community First",
    description:
      "Our content is crafted to help everyone grow together. We listen directly to learner requests and feedback."
  },
  {
    icon: "fas fa-laptop-code",
    title: "Practical Focus",
    description:
      "No fluff. Every video and tutorial delivers real code you can immediately test, run, and integrate into projects."
  },
  {
    icon: "fab fa-github",
    title: "Open Source",
    description:
      "All project codebases and cheat sheets are published openly for developers to explore, fork, and learn from."
  }
];

export default function AboutPage() {
  return (
    <>
      {/* About Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="section-header">
            <h2>
              About <span className="gradient-text">TechYatri</span>
            </h2>
            <p>Your journey through the exciting world of technology and code</p>
          </div>

          <div className="about-content glass-card">
            <div className="about-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/made with insmind-chatgpt image may 17, 2025, 02_01_53 pm.png"
                alt="TechYatri Vision"
              />
            </div>
            <div className="about-text">
              <h3>Our Mission</h3>
              <p>
                TechYatri was founded to make coding education accessible, engaging,
                and actionable. We bridge the gap between dry academic theory and
                real-world application development.
              </p>

              <h3>What We Do</h3>
              <p>
                We publish high-impact 60-second coding shorts, in-depth YouTube
                tutorials, and full-stack project guides covering Python, React, Next.js,
                Firebase, and artificial intelligence.
              </p>

              <h3>Our Philosophy</h3>
              <p>
                Building real projects is the fastest way to master programming. Every
                TechYatri tutorial is accompanied by working code, GitHub repos, and clear
                step-by-step guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2>
              Meet The <span className="gradient-text">Team</span>
            </h2>
            <p>The minds and instructors driving TechYatri forward</p>
          </div>

          <div className="team-grid">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="team-card glass-card">
                <div className="team-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                  />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <p className="role">{member.role}</p>
                  <p>{member.bio}</p>
                  <div className="social-links">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                    >
                      <i className="fab fa-github"></i>
                    </a>
                    <a
                      href="https://youtube.com/@thetechyatri"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                    >
                      <i className="fab fa-youtube"></i>
                    </a>
                    <a href="#" aria-label="Twitter">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2>
              Our <span className="gradient-text">Core Values</span>
            </h2>
            <p>The principles behind every tutorial and video we create</p>
          </div>

          <div className="values-grid">
            {values.map((val, idx) => (
              <div key={idx} className="value-card glass-card">
                <div className="value-icon">
                  <i className={val.icon}></i>
                </div>
                <h3>{val.title}</h3>
                <p>{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
