"use client";

import { useEffect } from "react";
import { extractYouTubeId } from "@/lib/utils";

export default function VideoModal({ url, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!url) return null;

  const ytId = extractYouTubeId(url);
  const embedUrl = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`
    : url;

  return (
    <div
      className="video-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <button
          className="close-modal"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="TechYatri Video Player"
        />
      </div>
    </div>
  );
}
