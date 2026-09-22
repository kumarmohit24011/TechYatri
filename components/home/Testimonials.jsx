import { defaultTestimonials } from "@/lib/data";

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-header">
          <h2>
            What Our <span className="gradient-text">Viewers</span> Say
          </h2>
          <p>Real developer success stories from the TechYatri YouTube community</p>
        </div>

        <div className="testimonials-grid">
          {defaultTestimonials.map((item, idx) => (
            <div key={idx} className="testimonial-card glass-card">
              <div className="quote-icon">
                <i className="fas fa-quote-left"></i>
              </div>
              <div className="testimonial-content">
                <p>&ldquo;{item.quote}&rdquo;</p>
                <div className="author-info">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.authorImage}
                    alt={item.author}
                    className="author-avatar"
                    loading="lazy"
                  />
                  <div>
                    <h4>{item.author}</h4>
                    <p className="author-role">{item.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
