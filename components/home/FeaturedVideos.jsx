"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import VideoCard from "@/components/videos/VideoCard";
import VideoModal from "@/components/videos/VideoModal";
import { subscribeCollection } from "@/lib/firebase";
import { defaultVideos } from "@/lib/data";

export default function FeaturedVideos() {
  const [videos, setVideos] = useState(defaultVideos.slice(0, 3));
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  useEffect(() => {
    const unsub = subscribeCollection(
      "videos",
      (data) => {
        if (data && data.length > 0) {
          setVideos(data.slice(0, 3));
        }
      },
      (err) => console.warn("Using default videos:", err)
    );
    return () => unsub();
  }, []);

  return (
    <section className="video-showcase" id="featured">
      <div className="container">
        <div className="section-header">
          <h2>
            Featured <span className="gradient-text">Content</span>
          </h2>
          <p>Handpicked tutorials and coding shorts to boost your skills</p>
        </div>

        <div className="video-grid">
          {videos.map((vid) => (
            <VideoCard
              key={vid.id}
              video={vid}
              onPlay={(url) => setActiveVideoUrl(url)}
            />
          ))}
        </div>

        <div className="center">
          <Link href="/videos" className="btn primary">
            Explore All Videos <i className="fas fa-arrow-right" style={{ marginLeft: "6px" }}></i>
          </Link>
        </div>
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
