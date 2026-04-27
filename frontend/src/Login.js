import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react'; // Icons for professional look
import { motion } from 'framer-motion'; // For smooth animations

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            // Updated to point to your LIVE Render backend
            const res = await axios.post('https://warranty-asset-system.onrender.com/api/auth/login', formData);
            
            // Save token for authenticated requests
            localStorage.setItem('token', res.data.token);
            
            alert("Login Successful!");
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.msg || "Login Failed - Check if backend is awake");
        }
    };

    return (
        <div className="animated-bg"> {/* Background defined in App.css */}
            <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                
                {/* Step D: Framer Motion Wrapper for the Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="card glass-card shadow-lg p-4" 
                    style={{ maxWidth: '400px', width: '100%' }}
                >
                    <div className="card-body">
                        {/* Title with Shield Icon */}
                        <div className="text-center mb-4">
                            <ShieldCheck size={48} className="text-info mb-2" />
                            <h2 className="fw-bold text-white">Welcome Back</h2>
                            <p style={{ color: '#cbd5e1' }} className="small">Securely manage your product warranties</p>
                        </div>
                        
                        <form onSubmit={onSubmit}>
                            {/* Email Field with Mail Icon */}
                            <div className="mb-3">
                                <label className="small fw-bold mb-2 d-flex align-items-center">
                                    <Mail size={16} className="me-2 text-info" /> Email Address
                                </label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    className="form-control" 
                                    placeholder="name@example.com" 
                                    onChange={onChange} 
                                    required 
                                />
                            </div>

                            {/* Password Field with Lock Icon */}
                            <div className="mb-4">
                                <label className="small fw-bold mb-2 d-flex align-items-center">
                                    <Lock size={16} className="me-2 text-info" /> Password
                                </label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    className="form-control" 
                                    placeholder="••••••••" 
                                    onChange={onChange} 
                                    required 
                                />
                            </div>

                            {/* Gradient Button */}
                            <button 
                                className="btn btn-primary w-100 fw-bold py-2 mb-3 border-0 shadow" 
                                style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
                            >
                                Sign In
                            </button>
                        </form>
                        
                        <div className="text-center mt-3">
                            <span style={{ color: '#cbd5e1' }} className="small">New here? </span>
                            <Link to="/register" className="small fw-bold text-info text-decoration-none">
                                Create an Account
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;