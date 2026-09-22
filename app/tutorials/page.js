"use client";

import { useState } from "react";
import CodeSnippet from "@/components/tutorials/CodeSnippet";

export default function TutorialsPage() {
  const [activeTab, setActiveTab] = useState("snippets");

  const sampleSnippets = [
    {
      title: "Python • Data Cleaning with Pandas",
      language: "python",
      code: `import pandas as pd

def clean_dataset(df):
    """Clean dataframe by removing nulls and formatting dates"""
    df = df.dropna(how='all')
    df['date'] = pd.to_datetime(df['date'])
    df['normalized_price'] = (df['price'] - df['price'].mean()) / df['price'].std()
    return df

# Example usage
data = clean_dataset(raw_df)
print("Cleaned records count:", len(data))`
    },
    {
      title: "Python • Generate QR Code in 3 Lines",
      language: "python",
      code: `import qrcode

img = qrcode.make("https://youtube.com/@thetechyatri")
img.save("techyatri_qr.png")
print("QR Code generated successfully!")`
    },
    {
      title: "JavaScript • Realtime Firebase DB Listener",
      language: "javascript",
      code: `import { getDatabase, ref, onValue } from "firebase/database";

const db = getDatabase();
const videosRef = ref(db, "videos");

onValue(videosRef, (snapshot) => {
  const data = snapshot.val();
  console.log("Realtime TechYatri Videos:", data);
});`
    }
  ];

  return (
    <section className="tutorials-section">
      <div className="container">
        <div className="section-header">
          <h2>
            Learning <span className="gradient-text">Resources</span>
          </h2>
          <p>Guides, reusable code snippets, and curated tutorial playlists</p>
        </div>

        {/* Tab Headers */}
        <div className="tutorial-tabs-header">
          <button
            className={`tab-btn ${activeTab === "guides" ? "active" : ""}`}
            onClick={() => setActiveTab("guides")}
          >
            <i className="fas fa-book-open" style={{ marginRight: "6px" }}></i> Guides
          </button>
          <button
            className={`tab-btn ${activeTab === "snippets" ? "active" : ""}`}
            onClick={() => setActiveTab("snippets")}
          >
            <i className="fas fa-code" style={{ marginRight: "6px" }}></i> Snippets
          </button>
          <button
            className={`tab-btn ${activeTab === "playlist" ? "active" : ""}`}
            onClick={() => setActiveTab("playlist")}
          >
            <i className="fab fa-youtube" style={{ marginRight: "6px" }}></i> Playlist
          </button>
        </div>

        {/* Tab Content */}
        <div className="tutorial-tabs">
          {activeTab === "guides" && (
            <div className="glass-card" style={{ padding: "40px" }}>
              <h3 style={{ marginBottom: "15px", color: "var(--primary-light)" }}>
                Written Guides & Roadmaps
              </h3>
              <p style={{ color: "var(--gray)", marginBottom: "25px", lineHeight: "1.7" }}>
                Comprehensive roadmaps and written walkthroughs accompany our YouTube
                channel. We are currently publishing new guides on Modern Next.js, Python
                Automation, and Android Kotlin development.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px"
                }}
              >
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--glass-border)"
                  }}
                >
                  <h4 style={{ marginBottom: "8px" }}>🐍 Python Roadmap 2026</h4>
                  <p style={{ fontSize: "0.88rem", color: "var(--gray)" }}>
                    From basics to web scraping with Selenium, data processing with Pandas,
                    and API deployment.
                  </p>
                </div>
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--glass-border)"
                  }}
                >
                  <h4 style={{ marginBottom: "8px" }}>⚛️ React & Next.js Guide</h4>
                  <p style={{ fontSize: "0.88rem", color: "var(--gray)" }}>
                    Building production-ready applications using the App Router, server
                    components, and real-time databases.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "snippets" && (
            <div>
              {sampleSnippets.map((snippet, idx) => (
                <CodeSnippet
                  key={idx}
                  title={snippet.title}
                  language={snippet.language}
                  code={snippet.code}
                />
              ))}
            </div>
          )}

          {activeTab === "playlist" && (
            <div className="glass-card" style={{ padding: "30px" }}>
              <h3 style={{ marginBottom: "15px" }}>
                100 Days of Coding Journey #100daysofcode
              </h3>
              <div className="video-playlist">
                <iframe
                  src="https://www.youtube.com/embed/videoseries?list=PL2EqcLZN_L4TqFWQvv1GiE3Yz16o_HTfJ"
                  title="100Days of Coding Journey"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="center" style={{ marginTop: "25px" }}>
                <a
                  href="https://www.youtube.com/playlist?list=PL2EqcLZN_L4TqFWQvv1GiE3Yz16o_HTfJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn primary"
                >
                  <i className="fab fa-youtube" style={{ marginRight: "6px" }}></i> Open Full Playlist on YouTube
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
