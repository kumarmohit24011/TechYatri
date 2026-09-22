"use client";

import { useState } from "react";

export default function CodeSnippet({ title, language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="code-snippet">
      <div className="snippet-header">
        <span>{title}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? (
            <span>
              <i className="fas fa-check" style={{ marginRight: "4px" }}></i>{" "}
              Copied!
            </span>
          ) : (
            <span>
              <i className="fas fa-copy" style={{ marginRight: "4px" }}></i> Copy
            </span>
          )}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
