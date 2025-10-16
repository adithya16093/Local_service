import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Calendar,
  Star,
  Search,
  Users,
  Zap,
  Wrench,
  Paintbrush,
  Home as HomeIcon,
  Hammer,
  Utensils,
  Briefcase,
} from "lucide-react";
import "./Home.css"; // ✅ Keep existing CSS path

const features = [
  {
    icon: <Search size={28} />,
    title: "Find Local Services",
    description:
      "Discover trusted service providers in your area with our smart filters.",
  },
  {
    icon: <Calendar size={28} />,
    title: "Easy Booking",
    description:
      "Schedule appointments instantly with real-time availability checking.",
  },
  {
    icon: <Star size={28} />,
    title: "Verified Reviews",
    description:
      "Read authentic reviews from verified customers to make informed decisions.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Secure & Reliable",
    description:
      "All providers are vetted and payments are securely processed.",
  },
];

const serviceCategories = [
  { name: "Plumbing", icon: "🪠" },
  { name: "House Cleaning", icon: "🧼" },
  { name: "Electrical", icon: "⚡" },
  { name: "Tutoring", icon: "🎓" },
  { name: "Appliance Repair", icon: "🔧" },
  { name: "Gardening", icon: "🌸" },
  { name: "Painting", icon: "🎨" },
  { name: "Pest Control", icon: "🪳" },
];

const testimonials = [
  {
    name: "Sarah J.",
    role: "Homeowner",
    content:
      "Found an amazing plumber through ServiceHub. The booking process was seamless and the service was top-notch!",
    rating: 5,
  },
  {
    name: "Mike C.",
    role: "Service Provider",
    content:
      "As an electrician, ServiceHub has helped me grow my business significantly. The platform is easy to use and brings quality customers.",
    rating: 5,
  },
  {
    name: "Emily D.",
    role: "Busy Parent",
    content:
      "ServiceHub saved me so much time finding reliable tutoring for my kids. Highly recommended!",
    rating: 5,
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* ---------------- HEADER ---------------- */}
      <header className="main-header light-mode-header">
        <nav className="main-nav container">
          <Link to="/" className="logo" aria-label="ServiceHub Home">
            <Zap size={26} />
            <span>ServiceHub</span>
          </Link>
          <div className="nav-auth-links">
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
            <Link to="/signup" className="btn btn-filled">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* ---------------- HERO ---------------- */}
      <section className="hero-section light-hero">
        <div className="hero-content container">
          <div className="hero-text">
            <h1 className="hero-heading">
              Find & Book{" "}
              <span className="highlight-text">Trusted Local Services</span> In
              Minutes
            </h1>
            <p className="hero-subtext">
              From plumbing to tutoring, connect with verified professionals for
              all your needs.
            </p>

            <div className="hero-search" role="search">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="What service are you looking for?"
                className="search-input"
                onFocus={() => navigate("/customer")}
                aria-label="Search services"
              />
              <button
                className="btn btn-search"
                onClick={() => navigate("/customer")}
                aria-label="Find services"
              >
                Find
              </button>
            </div>
          </div>

          <div className="hero-image-pane" aria-hidden="true">
            <div className="hero-graphic">
              <div className="hero-graphic-core">
                <Zap size={64} />
              </div>
              <div className="graphic-icon" style={{ "--i": 1 }}>
                <Wrench size={22} />
              </div>
              <div className="graphic-icon" style={{ "--i": 2 }}>
                <Paintbrush size={22} />
              </div>
              <div className="graphic-icon" style={{ "--i": 3 }}>
                <Hammer size={22} />
              </div>
              <div className="graphic-icon" style={{ "--i": 4 }}>
                <HomeIcon size={22} />
              </div>
              <div className="graphic-icon" style={{ "--i": 5 }}>
                <Utensils size={22} />
              </div>
              <div className="graphic-icon" style={{ "--i": 6 }}>
                <Briefcase size={22} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORIES MARQUEE ---------------- */}
      <section className="categories-section">
        <div className="marquee">
          <div className="marquee-track">
            {[...serviceCategories, ...serviceCategories].map(
              (category, index) => (
                <div key={index} className="category-item">
                  <span className="category-icon">{category.icon}</span>
                  {category.name}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <h2>
              Why Choose <span className="highlight-text">ServiceHub?</span>
            </h2>
            <p>
              We make finding and booking local services simple, safe, and
              reliable.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card fade-in"
                style={{ "--delay": `${index * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>
              Thousands of happy customers and successful service providers
              trust us.
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, index) => (
              <div key={index} className="testimonial-card">
                <p className="testimonial-content">"{t.content}"</p>
                <div className="testimonial-author">
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                  <div className="testimonial-rating" aria-label={`${t.rating} star rating`}>
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={16} className="star-icon" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Get Started?</h2>
            <p>
              Are you a customer looking for help or a provider looking to grow
              your business? Join us today!
            </p>
            <div className="cta-buttons">
              <button
                onClick={() => navigate("/customer")}
                className="btn btn-cta-primary"
              >
                <Search size={18} /> Find Services
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="btn btn-cta-secondary"
              >
                <Users size={18} /> Become a Provider
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="main-footer light-footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <Zap size={22} />
              <span>ServiceHub</span>
            </Link>
            <p>Connecting communities with trusted local services.</p>
          </div>

          <div className="footer-links">
            <h4>Explore</h4>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <Link to="/customer">Find a Service</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Join Us</h4>
            <ul>
              <li>
                <Link to="/signup">Sign up as Customer</Link>
              </li>
              <li>
                <Link to="/signup">Join as Provider</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} ServiceHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
