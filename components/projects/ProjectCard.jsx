"use client";

export default function ProjectCard({ project }) {
  let tags = [];
  if (Array.isArray(project.techStack)) {
    tags = project.techStack;
  } else if (typeof project.techStack === "string") {
    tags = project.techStack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const imgSrc = project.image || "/images/password_manager.jpeg";

  return (
    <div className="project-card glass-card">
      <div className="project-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={project.title || "TechYatri Project"}
          loading="lazy"
          onError={(e) => {
            e.target.src = "/images/password_manager.jpeg";
          }}
        />
        {tags.length > 0 && (
          <div className="tech-stack">
            {tags.map((tag, idx) => (
              <span key={idx} className="tech-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="project-content">
        <h3>{project.title}</h3>
        <p>{project.description || "Practical real-world coding implementation."}</p>
        <div className="project-links">
          {project.tutorialLink && (
            <a
              href={project.tutorialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="link-button"
            >
              <i className="fas fa-video"></i> Tutorial
            </a>
          )}
          {project.codeLink && (
            <a
              href={project.codeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="link-button"
            >
              <i className="fab fa-github"></i> Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
