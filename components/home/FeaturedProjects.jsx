"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProjectCard from "@/components/projects/ProjectCard";
import { subscribeCollection } from "@/lib/firebase";
import { defaultProjects } from "@/lib/data";

export default function FeaturedProjects() {
  const [projects, setProjects] = useState(defaultProjects.slice(0, 3));

  useEffect(() => {
    const unsub = subscribeCollection(
      "projects",
      (data) => {
        if (data && data.length > 0) {
          setProjects(data.slice(0, 3));
        }
      },
      (err) => console.warn("Using default projects:", err)
    );
    return () => unsub();
  }, []);

  return (
    <section className="projects">
      <div className="container">
        <div className="section-header">
          <h2>
            Code <span className="gradient-text">Projects</span>
          </h2>
          <p>Real-world applications and projects from our YouTube tutorials</p>
        </div>

        <div className="project-grid">
          {projects.map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>

        <div className="center">
          <Link href="/projects" className="btn primary">
            View All Projects <i className="fas fa-arrow-right" style={{ marginLeft: "6px" }}></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
