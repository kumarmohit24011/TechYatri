"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link href="/" className="logo">
              <span className="gradient-text">Tech</span>Yatri
            </Link>
            <p>
              Empowering developers through high-quality programming tutorials,
              coding shorts, and modern tech education.
            </p>
            <div className="social-links">
              <a
                href="https://youtube.com/@thetechyatri"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube"></i>
              </a>
              <a
                href="https://github.com/kumarmohit24011"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
              >
                <i className="fab fa-discord"></i>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Content</h4>
            <ul>
              <li><Link href="/videos">Coding Shorts & Videos</Link></li>
              <li><Link href="/projects">Code Projects</Link></li>
              <li><Link href="/tutorials">Learning Guides</Link></li>
              <li><Link href="/tutorials">Code Snippets</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="https://github.com/kumarmohit24011" target="_blank" rel="noopener noreferrer">GitHub Repos</a></li>
              <li><Link href="/tutorials">Roadmaps</Link></li>
              <li><Link href="/projects">Starter Templates</Link></li>
              <li><Link href="/contact">Tutorial Requests</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact Support</Link></li>
              <li><Link href="/admin">Admin Portal</Link></li>
              <li><Link href="/about">Meet the Team</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} TechYatri. All rights reserved.</p>
          <div className="footer-links">
            <Link href="/about">Privacy</Link>
            <Link href="/about">Terms</Link>
            <Link href="/about">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
