"use client";

import { useState, useEffect, useMemo } from "react";
import VideoCard from "@/components/videos/VideoCard";
import VideoModal from "@/components/videos/VideoModal";
import { subscribeCollection } from "@/lib/firebase";
import { defaultVideos } from "@/lib/data";

const categories = [
  { id: "all", label: "All Videos" },
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "react", label: "React" },
  { id: "ai", label: "AI Tools" },
  { id: "shorts", label: "Shorts" }
];

export default function VideosPage() {
  const [videos, setVideos] = useState(defaultVideos);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  useEffect(() => {
    const unsub = subscribeCollection(
      "videos",
      (data) => {
        if (data && data.length > 0) {
          setVideos(data);
        }
      },
      (err) => console.warn("Using default videos array:", err)
    );
    return () => unsub();
  }, []);

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesCategory =
        activeCategory === "all" ||
        (video.category || "").toLowerCase() === activeCategory.toLowerCase();

      const matchesSearch =
        !searchQuery.trim() ||
        (video.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.category || "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [videos, activeCategory, searchQuery]);

  return (
    <section className="video-categories">
      <div className="container">
        <div className="section-header">
          <h2>
            Coding <span className="gradient-text">Shorts & Tutorials</span>
          </h2>
          <p>Quick programming tutorials and bite-sized tips to watch in 60 seconds</p>
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: "500px", margin: "0 auto 30px" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search tutorials by keyword (e.g. Python, QR Code, Firebase)..."
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

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`tab-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div
            className="glass-card center"
            style={{ padding: "50px 20px", maxWidth: "600px", margin: "40px auto" }}
          >
            <i
              className="fas fa-video-slash"
              style={{ fontSize: "2.5rem", color: "var(--gray)", marginBottom: "15px" }}
            />
            <h3>No Videos Found</h3>
            <p style={{ color: "var(--gray)", marginTop: "8px" }}>
              No videos matched your filter criteria. Try searching for something else or reset your filter.
            </p>
            <button
              className="btn small primary"
              style={{ marginTop: "20px" }}
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="video-grid">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={(url) => setActiveVideoUrl(url)}
              />
            ))}
          </div>
        )}
      </div>

      {activeVideoUrl && (
        <VideoModal
          url={activeVideoUrl}
          onClose={() => setActiveVideoUrl(null)}
        />
      )}
    </section>
  );
}
