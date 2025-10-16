import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Briefcase,
  Users,
  Globe,
  GitMerge,
  Zap,
} from "lucide-react";
import "./Signup.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select your role.", { position: "bottom-center" });
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/signup", {
        name,
        email,
        password,
        role,
      });
      toast.success(res.data.message, { position: "bottom-center" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Signup failed. Please try again.",
        { position: "bottom-center" }
      );
    }
  };

  return (
    <>
      <div className="signup-container">
        {/* Form Panel */}
        <div className="form-panel">
          <div className="form-content">
            <Link to="/" className="back-to-home">
              <ArrowLeft size={18} />
              <span>Back to Home</span>
            </Link>

            <div className="brand-header">
              <div className="brand-logo">
                <Zap size={28} />
                <span>ServiceHub</span>
              </div>
            </div>

            <div className="form-header">
              <h2>Create Account</h2>
              <p>Please enter your details to sign up.</p>
            </div>

            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  value={name}
                  placeholder="Full Name"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  value={email}
                  placeholder="Email Address"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="role-selector">
                <div className="role-label">Choose your role</div>
                <div className="role-buttons">
                  <button
                    type="button"
                    className={`role-btn ${
                      role === "Service Provider" ? "active-role" : ""
                    }`}
                    onClick={() => setRole("Service Provider")}
                  >
                    <Briefcase size={16} />
                    Provider
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${
                      role === "Customer" ? "active-role" : ""
                    }`}
                    onClick={() => setRole("Customer")}
                  >
                    <Users size={16} />
                    Customer
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Create Account
              </button>
            </form>

            <div className="divider" />

            <div className="social-logins">
              <button className="social-btn google">
                <Globe size={18} />
                Continue with Google
              </button>
              <button className="social-btn github">
                <GitMerge size={18} />
                Continue with GitHub
              </button>
            </div>

            <p className="switch-text">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>

        {/* Branding Panel */}
        <div className="branding-panel">
          <div className="branding-content">
            <div className="hero-graphic">
              <div className="hero-graphic-core">
                <Zap size={48} />
              </div>
              {[1, 2, 3, 4, 5, 6].map((i) => {
                const Icon = { 1: Briefcase, 2: Users, 3: User, 4: Mail, 5: Globe, 6: Lock }[i];
                return (
                  <div key={i} className="graphic-icon" style={{ "--i": i }}>
                    <Icon size={18} />
                  </div>
                );
              })}
            </div>
            <h1>Join ServiceHub Today</h1>
            <p>
              Connect with trusted service providers, grow your business, and
              be part of a thriving community.
            </p>
          </div>
        </div>
      </div>
      <ToastContainer theme="light" />
    </>
  );
};

export default Signup;
