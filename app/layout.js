import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollTop from "@/components/common/ScrollTop";

export const metadata = {
  metadataBase: new URL("https://techyatri.com"),
  title: {
    default: "TechYatri | Programming & Tech Tutorials",
    template: "%s | TechYatri"
  },
  description:
    "Cutting-edge programming tutorials on Python, JavaScript, React, AI and more. Learn coding fast with 60-second shorts and practical project builds!",
  keywords: [
    "TechYatri",
    "Programming Tutorials",
    "Python Code",
    "Coding Shorts",
    "React Tutorials",
    "AI Tools",
    "Developer Projects"
  ],
  authors: [{ name: "Mohit Kumar (TechYatri)" }],
  openGraph: {
    title: "TechYatri | Programming & Tech Tutorials",
    description:
      "Transform your career with bite-sized coding tutorials, real-world projects, and tech insights.",
    url: "https://techyatri.com",
    siteName: "TechYatri",
    images: [
      {
        url: "/images/password_manager.jpeg",
        width: 1200,
        height: 630,
        alt: "TechYatri Banner"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  icons: {
    icon: "/icons/favicon.ico"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/favicon.ico" sizes="any" />
      </head>
      <body>
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
        <ScrollTop />
      </body>
    </html>
  );
}
