"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const closeMenu = () => setMenuOpen(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/videos", label: "Videos" },
    { href: "/projects", label: "Projects" },
    { href: "/tutorials", label: "Tutorials" },
    { href: "/about", label: "About" },
    { href: "/admin", label: "Admin", icon: "fas fa-cog", style: { color: "#818cf8" } },
    { href: "/contact", label: "Contact", isBtn: true },
  ];

  return (
    <header className="main-header">
      <div className="container">
        <nav className="navbar">
          <Link href="/" className="logo" onClick={closeMenu}>
            <span className="gradient-text">Tech</span>Yatri
          </Link>

          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            {links.map((link) => {
              const isActive = pathname === link.href;
              if (link.isBtn) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`btn small ${isActive ? "primary" : "secondary"}`}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive ? "active" : ""}
                  style={link.style || {}}
                  onClick={closeMenu}
                >
                  {link.icon && <i className={`${link.icon}`} style={{ marginRight: "6px" }}></i>}
                  {link.label}
                </Link>
              );
            })}
          </div>

          <button
            className="hamburger"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </div>
    </header>
  );
}
