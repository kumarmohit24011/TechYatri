"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import {
  subscribeCollection,
  addItem,
  updateItem,
  deleteItem,
  rtdb
} from "@/lib/firebase";
import { defaultSkills, defaultProjects, defaultVideos } from "@/lib/data";
import { extractYouTubeId } from "@/lib/utils";

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState(false);

  // Tab state: 'overview' | 'skills' | 'projects' | 'videos'
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Connection status
  const [isConnected, setIsConnected] = useState(true);

  // Real-time data lists
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [videos, setVideos] = useState([]);

  // Search queries
  const [skillsSearch, setSkillsSearch] = useState("");
  const [projectsSearch, setProjectsSearch] = useState("");
  const [videosSearch, setVideosSearch] = useState("");

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'skill' | 'project' | 'video' | null
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [skillForm, setSkillForm] = useState({ name: "", icon: "/icons/python.svg", progress: 85 });
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    image: "/images/password_manager.jpeg",
    techStack: "",
    tutorialLink: "",
    codeLink: ""
  });
  const [videoForm, setVideoForm] = useState({
    url: "",
    title: "",
    category: "shorts",
    duration: "0:59",
    views: "1K",
    thumbnail: "",
    isNew: false
  });

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Check auth session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("techyatri_admin_auth");
      if (stored === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const unsubSkills = subscribeCollection(
      "techStack",
      (data) => setSkills(data),
      (err) => console.warn("Skills sync warning:", err)
    );
    const unsubProjects = subscribeCollection(
      "projects",
      (data) => setProjects(data),
      (err) => console.warn("Projects sync warning:", err)
    );
    const unsubVideos = subscribeCollection(
      "videos",
      (data) => setVideos(data),
      (err) => console.warn("Videos sync warning:", err)
    );

    return () => {
      unsubSkills();
      unsubProjects();
      unsubVideos();
    };
  }, []);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    const clean = passcode.trim().toLowerCase();
    if (clean === "admin123" || clean === "admin" || passcode === "TechYatri2026") {
      sessionStorage.setItem("techyatri_admin_auth", "true");
      setIsAuthenticated(true);
      setAuthError(false);
      setPasscode("");
      showToast("Welcome to TechYatri Admin Portal!", "success");
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem("techyatri_admin_auth");
    setIsAuthenticated(false);
    showToast("Logged out of admin portal.", "info");
  };

  // YouTube auto detect
  const handleVideoUrlChange = (url) => {
    const ytId = extractYouTubeId(url);
    const updated = { ...videoForm, url };
    if (ytId) {
      if (!videoForm.thumbnail) {
        updated.thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }
      if (url.includes("/shorts/")) {
        updated.category = "shorts";
        updated.duration = "0:59";
      }
    }
    setVideoForm(updated);
  };

  // Seed default data
  const handleSeedData = async () => {
    if (
      !confirm(
        "Would you like to seed default website skills, projects, and videos to your Firebase Realtime Database? This will populate the initial items."
      )
    )
      return;

    try {
      if (skills.length === 0) {
        for (const s of defaultSkills) {
          await addItem("techStack", s);
        }
      }
      if (projects.length === 0) {
        for (const p of defaultProjects) {
          await addItem("projects", p);
        }
      }
      if (videos.length === 0) {
        for (const v of defaultVideos) {
          await addItem("videos", v);
        }
      }
      showToast("Default data seeded successfully!", "success");
    } catch (err) {
      console.error("Error seeding data:", err);
      showToast("Error seeding: " + err.message, "error");
    }
  };

  // Modal Openers
  const openSkillModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setSkillForm({
        name: item.name || "",
        icon: item.icon || "/icons/python.svg",
        progress: item.progress || 85
      });
    } else {
      setEditingItem(null);
      setSkillForm({ name: "", icon: "/icons/python.svg", progress: 85 });
    }
    setActiveModal("skill");
  };

  const openProjectModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      const tags = Array.isArray(item.techStack)
        ? item.techStack.join(", ")
        : item.techStack || "";
      setProjectForm({
        title: item.title || "",
        description: item.description || "",
        image: item.image || "/images/password_manager.jpeg",
        techStack: tags,
        tutorialLink: item.tutorialLink || "",
        codeLink: item.codeLink || ""
      });
    } else {
      setEditingItem(null);
      setProjectForm({
        title: "",
        description: "",
        image: "/images/password_manager.jpeg",
        techStack: "Python, Selenium, Pandas",
        tutorialLink: "",
        codeLink: ""
      });
    }
    setActiveModal("project");
  };

  const openVideoModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setVideoForm({
        url: item.url || "",
        title: item.title || "",
        category: item.category || "shorts",
        duration: item.duration || "0:59",
        views: item.views || "1K",
        thumbnail: item.thumbnail || "",
        isNew: !!item.isNew
      });
    } else {
      setEditingItem(null);
      setVideoForm({
        url: "",
        title: "",
        category: "shorts",
        duration: "0:59",
        views: "1K",
        thumbnail: "",
        isNew: false
      });
    }
    setActiveModal("video");
  };

  // Form submit handlers
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateItem("techStack", editingItem.id, skillForm);
        showToast(`Skill "${skillForm.name}" updated successfully!`);
      } else {
        await addItem("techStack", skillForm);
        showToast(`Skill "${skillForm.name}" added successfully!`);
      }
      setActiveModal(null);
    } catch (err) {
      showToast("Error saving skill: " + err.message, "error");
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const tags = projectForm.techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = { ...projectForm, techStack: tags };

      if (editingItem) {
        await updateItem("projects", editingItem.id, payload);
        showToast(`Project "${projectForm.title}" updated successfully!`);
      } else {
        await addItem("projects", payload);
        showToast(`Project "${projectForm.title}" added successfully!`);
      }
      setActiveModal(null);
    } catch (err) {
      showToast("Error saving project: " + err.message, "error");
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    try {
      let thumb = videoForm.thumbnail.trim();
      if (!thumb) {
        const ytId = extractYouTubeId(videoForm.url);
        thumb = ytId
          ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
          : "/images/password_manager.jpeg";
      }
      const payload = { ...videoForm, thumbnail: thumb };

      if (editingItem) {
        await updateItem("videos", editingItem.id, payload);
        showToast(`Video "${videoForm.title}" updated successfully!`);
      } else {
        await addItem("videos", payload);
        showToast(`Video "${videoForm.title}" added successfully!`);
      }
      setActiveModal(null);
    } catch (err) {
      showToast("Error saving video: " + err.message, "error");
    }
  };

  // Filtered queries
  const filteredSkills = useMemo(() => {
    if (!skillsSearch.trim()) return skills;
    return skills.filter((s) =>
      (s.name || "").toLowerCase().includes(skillsSearch.toLowerCase())
    );
  }, [skills, skillsSearch]);

  const filteredProjects = useMemo(() => {
    if (!projectsSearch.trim()) return projects;
    return projects.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(projectsSearch.toLowerCase()) ||
        (Array.isArray(p.techStack) ? p.techStack.join(" ") : p.techStack || "")
          .toLowerCase()
          .includes(projectsSearch.toLowerCase())
    );
  }, [projects, projectsSearch]);

  const filteredVideos = useMemo(() => {
    if (!videosSearch.trim()) return videos;
    return videos.filter(
      (v) =>
        (v.title || "").toLowerCase().includes(videosSearch.toLowerCase()) ||
        (v.category || "").toLowerCase().includes(videosSearch.toLowerCase())
    );
  }, [videos, videosSearch]);

  const getHeading = () => {
    switch (activeTab) {
      case "skills":
        return "Skills / Tech Stack";
      case "projects":
        return "Projects Portfolio";
      case "videos":
        return "Video Links & Tutorials";
      default:
        return "Dashboard Overview";
    }
  };

  return (
    <div className="admin-page-root">
      {/* Toast Notification Container */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <i
              className={`fas ${
                toast.type === "success"
                  ? "fa-check-circle"
                  : toast.type === "error"
                  ? "fa-exclamation-triangle"
                  : "fa-info-circle"
              }`}
              style={{
                color:
                  toast.type === "success"
                    ? "#10b981"
                    : toast.type === "error"
                    ? "#ef4444"
                    : "#4f46e5"
              }}
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Admin Authentication Overlay */}
      {!isAuthenticated && (
        <div className="auth-overlay">
          <div className="auth-card">
            <div className="logo-area">
              <span>Tech</span>Yatri Admin
            </div>
            <p>Enter your administrator passcode to access the management portal.</p>
            <form onSubmit={handleLogin}>
              <div className="form-group" style={{ textAlign: "left" }}>
                <label htmlFor="adminPasscode">Admin Passcode</label>
                <input
                  type="password"
                  id="adminPasscode"
                  className="form-control"
                  placeholder="Default: admin123"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {authError && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "0.85rem",
                    marginBottom: "1rem",
                    textAlign: "left"
                  }}
                >
                  <i className="fas fa-exclamation-circle" style={{ marginRight: "4px" }}></i>{" "}
                  Invalid passcode. Try default: <b>admin123</b>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <i className="fas fa-lock-open" style={{ marginRight: "6px" }}></i> Unlock Dashboard
              </button>
            </form>
            <div style={{ marginTop: "1.25rem" }}>
              <Link
                href="/"
                style={{
                  color: "var(--admin-gray-500)",
                  fontSize: "0.85rem",
                  textDecoration: "none"
                }}
              >
                <i className="fas fa-arrow-left" style={{ marginRight: "4px" }}></i> Return to Website
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Dashboard Container */}
      <div className="admin-container">
        {/* Sidebar Navigation */}
        <aside className={`sidebar ${sidebarOpen ? "mobile-open" : ""}`} id="sidebar">
          <div className="sidebar-header">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <i className="fas fa-terminal" style={{ color: "white", fontSize: "1.1rem" }}></i>
            </div>
            <div>
              <h1 style={{ fontSize: "1.1rem", lineHeight: "1.2" }}>TechYatri</h1>
              <span style={{ fontSize: "0.75rem", color: "var(--admin-gray-400)" }}>
                Admin Portal
              </span>
            </div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <button
              className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("overview");
                setSidebarOpen(false);
              }}
            >
              <i className="fas fa-chart-pie"></i>
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-item ${activeTab === "skills" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("skills");
                setSidebarOpen(false);
              }}
            >
              <i className="fas fa-laptop-code"></i>
              <span>Skills / Tech Stack</span>
            </button>
            <button
              className={`nav-item ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("projects");
                setSidebarOpen(false);
              }}
            >
              <i className="fas fa-folder-open"></i>
              <span>Projects</span>
            </button>
            <button
              className={`nav-item ${activeTab === "videos" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("videos");
                setSidebarOpen(false);
              }}
            >
              <i className="fas fa-video"></i>
              <span>Videos & Tutorials</span>
            </button>
          </nav>

          <div
            style={{
              marginTop: "auto",
              borderTop: "1px solid var(--admin-gray-700)",
              paddingTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem"
            }}
          >
            <Link
              href="/"
              target="_blank"
              className="nav-item"
              style={{ padding: "0.5rem 0.75rem" }}
            >
              <i className="fas fa-external-link-alt"></i>
              <span>Live Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="nav-item"
              style={{ color: "#f87171", padding: "0.5rem 0.75rem" }}
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Lock / Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          {/* Topbar */}
          <header className="admin-topbar">
            <div className="topbar-left">
              <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Toggle Navigation"
              >
                <i className="fas fa-bars"></i>
              </button>
              <h2>{getHeading()}</h2>
            </div>
            <div className="topbar-right">
              <button
                id="quickSeedBtn"
                className="btn btn-secondary"
                onClick={handleSeedData}
                title="Import existing website items to database if empty"
              >
                <i className="fas fa-database"></i> Seed Default Data
              </button>
              <Link href="/" target="_blank" className="btn btn-primary">
                <i className="fas fa-eye"></i> View Site
              </Link>
            </div>
          </header>

          {/* SECTION 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Skills & Technologies</h3>
                  <div className="value">{skills.length}</div>
                  <p style={{ fontSize: "0.8rem", color: "var(--admin-gray-500)", marginTop: "0.5rem" }}>
                    <button
                      onClick={() => setActiveTab("skills")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--admin-primary)",
                        cursor: "pointer",
                        padding: 0,
                        fontWeight: 500
                      }}
                    >
                      Manage skills &rarr;
                    </button>
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Total Code Projects</h3>
                  <div className="value">{projects.length}</div>
                  <p style={{ fontSize: "0.8rem", color: "var(--admin-gray-500)", marginTop: "0.5rem" }}>
                    <button
                      onClick={() => setActiveTab("projects")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--admin-primary)",
                        cursor: "pointer",
                        padding: 0,
                        fontWeight: 500
                      }}
                    >
                      Manage projects &rarr;
                    </button>
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Total Video Links</h3>
                  <div className="value">{videos.length}</div>
                  <p style={{ fontSize: "0.8rem", color: "var(--admin-gray-500)", marginTop: "0.5rem" }}>
                    <button
                      onClick={() => setActiveTab("videos")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--admin-primary)",
                        cursor: "pointer",
                        padding: 0,
                        fontWeight: 500
                      }}
                    >
                      Manage videos &rarr;
                    </button>
                  </p>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={() => openSkillModal()}>
                    <i className="fas fa-plus"></i> Add New Skill
                  </button>
                  <button className="btn btn-success" onClick={() => openProjectModal()}>
                    <i className="fas fa-folder-plus"></i> Add New Project
                  </button>
                  <button className="btn btn-danger" onClick={() => openVideoModal()}>
                    <i className="fab fa-youtube"></i> Add New Video Link
                  </button>
                </div>
              </div>

              {/* Live Sync Status Card */}
              <div className="card">
                <div
                  className="card-header"
                  style={{ display: "flex", justifyContent: "space-between", alignContent: "center" }}
                >
                  <h3 className="card-title">Live Sync Status</h3>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#10b981" }}>
                    ● Online (Connected)
                  </span>
                </div>
                <p style={{ color: "var(--admin-gray-600)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                  Database: <strong>Firebase Realtime Database</strong> | Project:{" "}
                  <code>techhyatri</code>
                </p>
                <p style={{ color: "var(--admin-gray-600)", fontSize: "0.85rem" }}>
                  All changes made in this panel sync automatically in real-time across the
                  TechYatri website.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 2: SKILLS / TECH STACK */}
          {activeTab === "skills" && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Skills & Tech Radar</h3>
                <button className="btn btn-primary" onClick={() => openSkillModal()}>
                  <i className="fas fa-plus"></i> Add Skill
                </button>
              </div>
              <div className="search-container">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search skills by name..."
                  value={skillsSearch}
                  onChange={(e) => setSkillsSearch(e.target.value)}
                />
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "70px" }}>Icon</th>
                      <th>Skill / Technology</th>
                      <th>Proficiency</th>
                      <th style={{ width: "130px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSkills.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="empty-state">
                          <i className="fas fa-laptop-code"></i>
                          <p>No skills found. Click &ldquo;Add Skill&rdquo; or &ldquo;Seed Default Data&rdquo; above.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredSkills.map((skill) => (
                        <tr key={skill.id}>
                          <td>
                            <div className="icon-preview-box">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={skill.icon || "/icons/python.svg"}
                                alt={skill.name}
                                onError={(e) => {
                                  e.target.src = "/icons/python.svg";
                                }}
                              />
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: "var(--admin-gray-900)" }}>
                              {skill.name || "Untitled"}
                            </strong>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <div
                                style={{
                                  flex: 1,
                                  height: "8px",
                                  background: "var(--admin-gray-200)",
                                  borderRadius: "999px",
                                  overflow: "hidden"
                                }}
                              >
                                <div
                                  style={{
                                    width: `${skill.progress || 80}%`,
                                    height: "100%",
                                    background: "var(--admin-primary)"
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: "38px" }}>
                                {skill.progress || 80}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <button
                              className="action-btn action-edit"
                              onClick={() => openSkillModal(skill)}
                              title="Edit"
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                            <button
                              className="action-btn action-delete"
                              onClick={async () => {
                                if (confirm(`Delete "${skill.name}"?`)) {
                                  await deleteItem("techStack", skill.id);
                                  showToast(`Skill deleted.`, "info");
                                }
                              }}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: PROJECTS */}
          {activeTab === "projects" && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Projects Portfolio</h3>
                <button className="btn btn-primary" onClick={() => openProjectModal()}>
                  <i className="fas fa-plus"></i> Add Project
                </button>
              </div>
              <div className="search-container">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search projects by title or tech stack..."
                  value={projectsSearch}
                  onChange={(e) => setProjectsSearch(e.target.value)}
                />
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "70px" }}>Preview</th>
                      <th>Title & Description</th>
                      <th>Tech Stack</th>
                      <th>Links</th>
                      <th style={{ width: "130px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-state">
                          <i className="fas fa-folder-open"></i>
                          <p>No projects found. Click &ldquo;Add Project&rdquo; or &ldquo;Seed Default Data&rdquo; above.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((project) => {
                        const tags = Array.isArray(project.techStack)
                          ? project.techStack
                          : (project.techStack || "")
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean);

                        return (
                          <tr key={project.id}>
                            <td>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={project.image || "/images/password_manager.jpeg"}
                                alt={project.title}
                                className="table-img"
                                onError={(e) => {
                                  e.target.src = "/images/password_manager.jpeg";
                                }}
                              />
                            </td>
                            <td>
                              <strong style={{ color: "var(--admin-gray-900)", display: "block" }}>
                                {project.title || "Untitled Project"}
                              </strong>
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  color: "var(--admin-gray-500)",
                                  display: "block",
                                  maxWidth: "280px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                {project.description}
                              </span>
                            </td>
                            <td>
                              <div>
                                {tags.map((t, idx) => (
                                  <span key={idx} className="tech-tag-chip">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                {project.tutorialLink && (
                                  <a
                                    href={project.tutorialLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="action-btn"
                                    style={{ background: "#fee2e2", color: "#dc2626" }}
                                    title="Tutorial"
                                  >
                                    <i className="fas fa-video"></i>
                                  </a>
                                )}
                                {project.codeLink && (
                                  <a
                                    href={project.codeLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="action-btn"
                                    style={{ background: "var(--admin-gray-200)", color: "var(--admin-gray-800)" }}
                                    title="GitHub Code"
                                  >
                                    <i className="fab fa-github"></i>
                                  </a>
                                )}
                              </div>
                            </td>
                            <td>
                              <button
                                className="action-btn action-edit"
                                onClick={() => openProjectModal(project)}
                                title="Edit"
                              >
                                <i className="fas fa-pencil-alt"></i>
                              </button>
                              <button
                                className="action-btn action-delete"
                                onClick={async () => {
                                  if (confirm(`Delete "${project.title}"?`)) {
                                    await deleteItem("projects", project.id);
                                    showToast(`Project deleted.`, "info");
                                  }
                                }}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: VIDEOS */}
          {activeTab === "videos" && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Video Links & Tutorials</h3>
                <button className="btn btn-primary" onClick={() => openVideoModal()}>
                  <i className="fab fa-youtube"></i> Add Video Link
                </button>
              </div>
              <div className="search-container">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search videos by title or category..."
                  value={videosSearch}
                  onChange={(e) => setVideosSearch(e.target.value)}
                />
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "90px" }}>Thumbnail</th>
                      <th>Title & Info</th>
                      <th>Category</th>
                      <th>Stats</th>
                      <th>Video Link</th>
                      <th style={{ width: "130px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVideos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-state">
                          <i className="fas fa-video"></i>
                          <p>No videos found. Click &ldquo;Add Video Link&rdquo; or &ldquo;Seed Default Data&rdquo; above.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredVideos.map((video) => (
                        <tr key={video.id}>
                          <td>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={video.thumbnail || "https://picsum.photos/seed/vid/200/120"}
                              alt={video.title}
                              className="video-table-thumb"
                              onError={(e) => {
                                e.target.src = "/images/password_manager.jpeg";
                              }}
                            />
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <strong style={{ color: "var(--admin-gray-900)" }}>
                                {video.title || "Untitled Video"}
                              </strong>
                              {video.isNew && <span className="badge badge-primary">New</span>}
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "var(--admin-gray-400)" }}>
                              Duration: {video.duration || "0:59"}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-info">{video.category || "shorts"}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.85rem", color: "var(--admin-gray-600)" }}>
                              <i className="fas fa-eye" style={{ marginRight: "4px" }}></i> {video.views || "1K"}
                            </span>
                          </td>
                          <td>
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-btn"
                              style={{ background: "#fee2e2", color: "#dc2626" }}
                              title="Open on YouTube"
                            >
                              <i className="fab fa-youtube" style={{ marginRight: "4px" }}></i> Watch
                            </a>
                          </td>
                          <td>
                            <button
                              className="action-btn action-edit"
                              onClick={() => openVideoModal(video)}
                              title="Edit"
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                            <button
                              className="action-btn action-delete"
                              onClick={async () => {
                                if (confirm(`Delete "${video.title}"?`)) {
                                  await deleteItem("videos", video.id);
                                  showToast(`Video deleted.`, "info");
                                }
                              }}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODALS ================= */}

      {/* Modal: Add / Edit Skill */}
      {activeModal === "skill" && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                {editingItem ? "Edit Skill" : "Add New Skill"}
              </h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSkillSubmit}>
              <div className="form-group">
                <label>Technology / Skill Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  required
                  placeholder="e.g. Python, React, Docker"
                />
              </div>
              <div className="form-group">
                <label>Icon Path or Image URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={skillForm.icon}
                  onChange={(e) => setSkillForm({ ...skillForm, icon: e.target.value })}
                  placeholder="e.g. /icons/python.svg or image URL"
                />
                <small style={{ color: "var(--admin-gray-500)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                  Default icons: <code>/icons/python.svg</code>, <code>/icons/javascript.svg</code>, <code>/icons/physics.png</code>
                </small>
              </div>
              <div className="form-group">
                <label>
                  Proficiency:{" "}
                  <span style={{ fontWeight: 700, color: "var(--admin-primary)" }}>
                    {skillForm.progress}
                  </span>
                  %
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  className="form-control"
                  style={{ cursor: "pointer" }}
                  value={skillForm.progress}
                  onChange={(e) =>
                    setSkillForm({ ...skillForm, progress: parseInt(e.target.value, 10) })
                  }
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Project */}
      {activeModal === "project" && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                {editingItem ? "Edit Project" : "Add New Project"}
              </h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleProjectSubmit}>
              <div className="form-group">
                <label>Project Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  required
                  placeholder="e.g. Build a Secure Password Manager in Python"
                />
              </div>
              <div className="form-group">
                <label>Project Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Short description of the project..."
                />
              </div>
              <div className="form-group">
                <label>Project Image Path or URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={projectForm.image}
                  onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                  placeholder="e.g. /images/password_manager.jpeg"
                />
              </div>
              <div className="form-group">
                <label>Tech Stack (Comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  value={projectForm.techStack}
                  onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                  placeholder="Python, Selenium, Pandas"
                />
              </div>
              <div className="form-group">
                <label>YouTube Tutorial Link</label>
                <input
                  type="url"
                  className="form-control"
                  value={projectForm.tutorialLink}
                  onChange={(e) => setProjectForm({ ...projectForm, tutorialLink: e.target.value })}
                  placeholder="https://youtube.com/shorts/..."
                />
              </div>
              <div className="form-group">
                <label>GitHub Source Code Link</label>
                <input
                  type="url"
                  className="form-control"
                  value={projectForm.codeLink}
                  onChange={(e) => setProjectForm({ ...projectForm, codeLink: e.target.value })}
                  placeholder="https://github.com/kumarmohit24011/..."
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Video */}
      {activeModal === "video" && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                {editingItem ? "Edit Video" : "Add Video Link"}
              </h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleVideoSubmit}>
              <div className="form-group">
                <label>YouTube URL *</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="url"
                    className="form-control"
                    value={videoForm.url}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    required
                    placeholder="https://youtube.com/shorts/..."
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => {
                      handleVideoUrlChange(videoForm.url);
                      showToast("YouTube ID detected!", "info");
                    }}
                  >
                    Auto Fetch
                  </button>
                </div>
              </div>

              {/* Video preview if valid youtube link */}
              {extractYouTubeId(videoForm.url) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.75rem",
                    background: "var(--admin-gray-100)",
                    borderRadius: "0.375rem",
                    marginBottom: "1rem"
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${extractYouTubeId(videoForm.url)}/hqdefault.jpg`}
                    alt="Detected Thumbnail"
                    style={{ width: "90px", height: "54px", objectFit: "cover", borderRadius: "0.25rem" }}
                  />
                  <div style={{ fontSize: "0.8rem", color: "var(--admin-gray-600)" }}>
                    <strong>Detected YouTube ID:</strong> {extractYouTubeId(videoForm.url)}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Video Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  required
                  placeholder="Video Title or YouTube Shorts Title..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={videoForm.category}
                    onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                  >
                    <option value="shorts">Shorts</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="react">React</option>
                    <option value="ai">AI Tools</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    className="form-control"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    placeholder="0:59"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Views Count</label>
                  <input
                    type="text"
                    className="form-control"
                    value={videoForm.views}
                    onChange={(e) => setVideoForm({ ...videoForm, views: e.target.value })}
                    placeholder="1.2K"
                  />
                </div>
                <div className="form-group">
                  <label>Thumbnail Image URL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={videoForm.thumbnail}
                    onChange={(e) => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                    placeholder="Auto-detected if left blank"
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="isNew"
                  checked={videoForm.isNew}
                  onChange={(e) => setVideoForm({ ...videoForm, isNew: e.target.checked })}
                  style={{ width: "auto" }}
                />
                <label htmlFor="isNew" style={{ marginBottom: 0, cursor: "pointer" }}>
                  Mark as &ldquo;New&rdquo; Badge
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
