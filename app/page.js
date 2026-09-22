import Hero from "@/components/home/Hero";
import FeaturedVideos from "@/components/home/FeaturedVideos";
import TechStackRadar from "@/components/home/TechStackRadar";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";

export const metadata = {
  title: "TechYatri | Code Your Future",
  description:
    "Cutting-edge programming tutorials on Python, JavaScript, React, AI and more. Learn coding fast with TechYatri!"
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedVideos />
      <TechStackRadar />
      <FeaturedProjects />
      <Testimonials />
      <Newsletter />
    </>
  );
}
