import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { ArrowLeft, Mail, Lock, GitMerge, Globe } from 'lucide-react';
import './Login.css'; // Import the new CSS file

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/api/login", {
                email,
                password,
            });

            toast.success(res.data.message, { position: "bottom-center" });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            // Redirect based on role after a short delay
            setTimeout(() => {
                if (res.data.user.role === "Service Provider") {
                    navigate("/provider");
                } else if (res.data.user.role === "Admin") {
                    navigate("/admin");
                } else {
                    navigate("/customer");
                }
            }, 1000);

        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed. Please check your credentials.", {
                position: "bottom-center",
            });
        }
    };

    return (
        <>
            <div className="login-container">
                
                {/* --- Form Panel (Left) --- */}
                <div className="form-panel">
                    <div className="form-content">
                        <Link to="/" className="back-to-home">
                            <ArrowLeft size={18} />
                            <span>Back to Home</span>
                        </Link>

                        <div className="form-header">
                            <h2>Welcome Back!</h2>
                            <p>Please enter your details to sign in.</p>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
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

                            <div className="form-options">
                                <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
                            </div>

                            <button type="submit" className="submit-btn">Sign In</button>
                        </form>

                        <div className="divider">OR</div>
                        
                        <div className="social-logins">
                             <button className="social-btn">
                                <Globe size={18} />
                                Continue with Google
                            </button>
                             <button className="social-btn">
                                <GitMerge size={18} />
                                Continue with GitHub
                            </button>
                        </div>
                        
                        <p className="switch-text">
                            Don’t have an account? <Link to="/signup">Sign Up</Link>
                        </p>
                    </div>
                </div>

                {/* --- Branding Panel (Right) --- */}
                <div className="branding-panel">
                    <div className="branding-content">
                        <h1>Your Next Great Hire Awaits.</h1>
                        <p>Log in to manage your services, connect with customers, and grow your business.</p>
                    </div>
                </div>
                
            </div>
            <ToastContainer theme="dark" />
        </>
    );
};

export default Login;