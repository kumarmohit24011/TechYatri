"use client";

import { formatNumber, formatDate } from "@/lib/utils";

export default function VideoCard({ video, onPlay }) {
  const categoryClass = (video.category || "shorts").toLowerCase();
  const thumbnailSrc =
    video.thumbnail || "https://picsum.photos/seed/vid/400/225";

  return (
    <div
      className="video-card glass-card"
      onClick={() => onPlay(video.url)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay(video.url);
        }
      }}
    >
      {video.isNew && <div className="video-badge">New</div>}

      <div className="video-thumbnail">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailSrc}
          alt={video.title || "Video thumbnail"}
          loading="lazy"
          onError={(e) => {
            e.target.src = "/images/password_manager.jpeg";
          }}
        />
        <div className="play-button" aria-hidden="true">
          <i className="fas fa-play"></i>
        </div>
        {video.duration && <div className="duration">{video.duration}</div>}
      </div>

      <div className="video-info">
        <span className={`category-tag ${categoryClass}`}>
          {video.category || "Shorts"}
        </span>
        <h3 title={video.title}>{video.title}</h3>
        <div className="stats">
          <span>
            <i className="fas fa-eye" style={{ marginRight: "4px" }}></i>{" "}
            {formatNumber(video.views || "1K")} views
          </span>
          <span>
            <i className="far fa-calendar-alt" style={{ marginRight: "4px" }}></i>{" "}
            {formatDate(video.date)}
          </span>
        </div>
      </div>
    </div>
  );
}
