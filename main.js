// main.js - TechYatri Public Website Logic
// Powered by Firebase Realtime Database (configured via firebase-config.js)
var db = window.db;
console.log("✅ TechYatri Firebase Realtime Database connected");

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Theme Switcher
   const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'light') {
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', function () {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
} else {
    console.warn("⚠️ Theme toggle switch not found in the DOM.");
}

    
    // Header Scroll Effect
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', debounce(function() {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }));
    
    // Initialize Typed.js
    if (typeof Typed !== 'undefined' && document.querySelector('.typed')) {
        const typed = new Typed('.typed', {
            strings: ['With TechYatri', 'With Python', 'With React', 'With AI'],
            typeSpeed: 50,
            backSpeed: 30,
            loop: true
        });
    }
    
    // Load content from Firebase
    loadContent();
    
    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Initialize animations
    animateOnScroll();
    
    // Initialize newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            try {
                await db.collection('subscribers').add({
                    email: email,
                    date: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert('Thank you for subscribing to our newsletter!');
                newsletterForm.reset();
            } catch (error) {
                console.error('Error subscribing to newsletter:', error);
                alert('There was an error subscribing. Please try again.');
            }
        });
    }
    
    // Initialize scroll to top button
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopBtn.className = 'scroll-top-btn';
    document.body.appendChild(scrollTopBtn);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// Debounce function for performance
function debounce(func, wait = 10, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Load all dynamic content from Firebase
async function loadContent() {
    try {
        console.log("📦 Starting to load content from Firebase...");

        // Load videos (real-time listener)
        console.log("🔄 Fetching videos...");
        db.collection('videos')
            .onSnapshot(snapshot => {
                const videos = [];
                snapshot.forEach(doc => {
                    videos.push({ id: doc.id, ...doc.data() });
                });
                console.log(`✅ Videos loaded: ${videos.length}`);
                if (videos.length > 0) {
                    renderVideoCarousel(videos);
                }
            }, error => {
                console.error("❌ Error loading videos:", error);
            });

        // Load projects (real-time listener)
        console.log("🔄 Fetching projects...");
        db.collection('projects')
            .onSnapshot(snapshot => {
                const projects = [];
                snapshot.forEach(doc => {
                    projects.push({ id: doc.id, ...doc.data() });
                });
                console.log(`✅ Projects loaded: ${projects.length}`);
                if (projects.length > 0) {
                    renderProjects(projects);
                }
            }, error => {
                console.error("❌ Error loading projects:", error);
            });

        // Load tech stack data (real-time listener)
        console.log("🔄 Fetching tech stack...");
        db.collection('techStack')
            .onSnapshot(snapshot => {
                const techStack = [];
                snapshot.forEach(doc => {
                    techStack.push({ id: doc.id, ...doc.data() });
                });
                console.log(`✅ Tech stack loaded: ${techStack.length}`);
                if (techStack.length > 0) {
                    renderTechStack(techStack);
                }
            }, error => {
                console.error("❌ Error loading tech stack:", error);
            });

        // Load testimonials
        console.log("🔄 Fetching testimonials...");
        const testimonialsSnapshot = await db.collection('testimonials').get();
        const testimonials = testimonialsSnapshot.docs.map(doc => doc.data());
        console.log(`✅ Testimonials loaded: ${testimonials.length}`);
        if (testimonials.length > 0) {
            renderTestimonials(testimonials);
        }

        console.log("✅ All content listeners setup successfully");
    } catch (error) {
        console.error("❌ Error in loadContent():", error);
    }
}


// Render video carousel
function renderVideoCarousel(videos) {
    console.log("🎞 Rendering video carousel with videos:", videos);
 
    const carouselContainer = document.querySelector('.video-carousel .glide__slides');
    
    if (carouselContainer) {
        carouselContainer.innerHTML = videos.map(video => `
            <div class="glide__slide">
                <div class="video-card glass-card">
                    ${video.isNew ? '<div class="video-badge">New</div>' : ''}
                    <div class="video-thumbnail">
                        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                        <a href="${video.url}" target="_blank" class="play-button">
                            <i class="fas fa-play"></i>
                        </a>
                        <div class="duration">${video.duration}</div>
                    </div>
                    <div class="video-info">
                        <div class="category-tag ${video.category.toLowerCase()}">${video.category}</div>
                        <h3>${video.title}</h3>
                        <div class="stats">
                            <span><i class="fas fa-eye"></i> ${formatNumber(video.views)} views</span>
                            <span><i class="far fa-calendar-alt"></i> ${formatDate(video.date)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Initialize or update carousel
        if (!window.videoCarousel) {
            window.videoCarousel = new Glide('.video-carousel', {
                type: 'carousel',
                perView: 3,
                gap: 30,
                autoplay: 3000,
                breakpoints: {
                    992: { perView: 2 },
                    768: { perView: 1 }
                }
            }).mount();
        } else {
            window.videoCarousel.update();
        }
        
        // Setup video modals
        setupVideoModals();
    }
}

// Render projects grid
function renderProjects(projects) {
    const projectsContainer = document.querySelector('.project-grid');
    
    if (projectsContainer) {
        projectsContainer.innerHTML = projects.map(project => {
            let tags = [];
            if (Array.isArray(project.techStack)) {
                tags = project.techStack;
            } else if (typeof project.techStack === 'string') {
                tags = project.techStack.split(',').map(s => s.trim()).filter(Boolean);
            }
            const imgUrl = project.image || 'images/password_manager.jpeg';
            return `
            <div class="project-card glass-card">
                <div class="project-image">
                    <img src="${imgUrl}" alt="${project.title || 'Project'}" loading="lazy">
                    <div class="tech-stack">
                        ${tags.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p>${project.description || ''}</p>
                    <div class="project-links">
                        ${project.tutorialLink ? `
                        <a href="${project.tutorialLink}" target="_blank" rel="noopener" class="link-button">
                            <i class="fas fa-video"></i> Tutorial
                        </a>` : ''}
                        ${project.codeLink ? `
                        <a href="${project.codeLink}" target="_blank" rel="noopener" class="link-button">
                            <i class="fab fa-github"></i> Code
                        </a>` : ''}
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }
}

// Render testimonials
function renderTestimonials(testimonials) {
    const testimonialsContainer = document.querySelector('.testimonial-carousel .glide__slides');
    
    if (testimonialsContainer) {
        testimonialsContainer.innerHTML = testimonials.map(testimonial => `
            <div class="glide__slide">
                <div class="testimonial-card glass-card">
                    <div class="testimonial-content">
                        <div class="quote-icon">
                            <i class="fas fa-quote-left"></i>
                        </div>
                        <p>${testimonial.quote}</p>
                        <div class="author-info">
                            <img src="${testimonial.authorImage || 'images/default-avatar.jpg'}" 
                                 alt="${testimonial.author}" 
                                 class="author-avatar"
                                 loading="lazy">
                            <div>
                                <h4>${testimonial.author}</h4>
                                <p class="author-role">${testimonial.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Initialize testimonial carousel
        if (!window.testimonialCarousel) {
            window.testimonialCarousel = new Glide('.testimonial-carousel', {
                type: 'carousel',
                perView: 2,
                gap: 30,
                autoplay: 4000,
                breakpoints: {
                    768: { perView: 1 }
                }
            }).mount();
        } else {
            window.testimonialCarousel.update();
        }
    }
}

// Render tech stack
function renderTechStack(techStack) {
    const radarGrid = document.querySelector('.radar-grid');
    
    if (radarGrid) {
        radarGrid.innerHTML = techStack.map((tech, index) => `
            <div class="radar-item" style="--i:${index + 1}">
                <div class="tech-icon">
                    <img src="${tech.icon}" alt="${tech.name}" loading="lazy">
                </div>
                <div class="tech-info">
                    <h3>${tech.name}</h3>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${tech.progress}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Video modal functionality
function setupVideoModals() {
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                const videoUrl = this.querySelector('a').getAttribute('href');
                openVideoModal(videoUrl);
            }
        });
    });
}

function openVideoModal(url) {
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        window.open(url, '_blank');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <iframe src="${url.replace('watch?v=', 'embed/')}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}

// Helper functions
function formatNumber(num) {
    return num >= 1000 ? (num/1000).toFixed(1) + 'K' : num;
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays/7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Animate elements on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.tech-radar, .section-header, .video-card, .project-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
            element.classList.add('animate');
        }
    });
}

window.addEventListener('scroll', debounce(animateOnScroll));

// Initialize particles.js if available
if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#6366F1" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#6366F1", opacity: 0.3, width: 1 },
            move: { enable: true, speed: 3, direction: "none", random: true, straight: false, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" }
            }
        }
    });
}
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}
