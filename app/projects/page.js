"use client";

import { useState, useEffect, useMemo } from "react";
import ProjectCard from "@/components/projects/ProjectCard";
import { subscribeCollection } from "@/lib/firebase";
import { defaultProjects } from "@/lib/data";

export default function ProjectsPage() {
  const [projects, setProjects] = useState(defaultProjects);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsub = subscribeCollection(
      "projects",
      (data) => {
        if (data && data.length > 0) {
          setProjects(data);
        }
      },
      (err) => console.warn("Using default projects:", err)
    );
    return () => unsub();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter((p) => {
      const matchTitle = (p.title || "").toLowerCase().includes(query);
      const matchDesc = (p.description || "").toLowerCase().includes(query);
      const matchTech = (
        Array.isArray(p.techStack)
          ? p.techStack.join(" ")
          : p.techStack || ""
      )
        .toLowerCase()
        .includes(query);
      return matchTitle || matchDesc || matchTech;
    });
  }, [projects, searchQuery]);

  return (
    <section className="projects">
      <div className="container">
        <div className="section-header">
          <h2>
            Code <span className="gradient-text">Projects</span>
          </h2>
          <p>
            Real-world applications and open-source projects built in our tutorials.
            Complete with source code and video walkthroughs!
          </p>
        </div>

        {/* Search Input */}
        <div style={{ maxWidth: "480px", margin: "0 auto 40px" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search projects (e.g. Python, Selenium, Firebase)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{
                borderRadius: "30px",
                padding: "12px 20px 12px 42px",
                fontSize: "0.95rem"
              }}
            />
            <i
              className="fas fa-search"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--gray)",
                fontSize: "0.9rem"
              }}
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div
            className="glass-card center"
            style={{ padding: "50px 20px", maxWidth: "600px", margin: "0 auto" }}
          >
            <i
              className="fas fa-folder-open"
              style={{ fontSize: "2.5rem", color: "var(--gray)", marginBottom: "15px" }}
            />
            <h3>No Projects Found</h3>
            <p style={{ color: "var(--gray)", marginTop: "8px" }}>
              No projects matched &ldquo;{searchQuery}&rdquo;. Try another tech keyword.
            </p>
            <button
              className="btn small primary"
              style={{ marginTop: "20px" }}
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="project-grid">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
