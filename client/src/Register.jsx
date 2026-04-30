import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react'; // Icons for professional look
import { motion } from 'framer-motion'; // For smooth animations

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const onSubmit = async e => {
        e.preventDefault();
        try {
            // Pointing to your LIVE Render backend
            await axios.post('https://warranty-asset-system.onrender.com/api/auth/register', formData);
            alert("Registration Successful! Please login.");
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.msg || "Registration Failed");
        }
    };

    return (
        <div className="animated-bg"> {/* Background defined in App.css */}
            <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                
                {/* Framer Motion Wrapper for smooth entry */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="card glass-card shadow-lg p-4" 
                    style={{ maxWidth: '400px', width: '100%' }}
                >
                    <div className="card-body">
                        {/* Title with UserPlus Icon */}
                        <div className="text-center mb-4">
                            <UserPlus size={48} className="text-info mb-2" />
                            <h2 className="fw-bold text-white">Create Account</h2>
                            <p style={{ color: '#cbd5e1' }} className="small">Join the Warranty Asset Manager</p>
                        </div>
                        
                        <form onSubmit={onSubmit}>
                            {/* Full Name Field */}
                            <div className="mb-3">
                                <label className="small fw-bold mb-2 d-flex align-items-center">
                                    <User size={16} className="me-2 text-info" /> Full Name
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Naveen" 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>

                            {/* Email Address Field */}
                            <div className="mb-3">
                                <label className="small fw-bold mb-2 d-flex align-items-center">
                                    <Mail size={16} className="me-2 text-info" /> Email Address
                                </label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    placeholder="name@example.com" 
                                    onChange={e => setFormData({...formData, email: e.target.value})} 
                                    required 
                                />
                            </div>

                            {/* Password Field */}
                            <div className="mb-4">
                                <label className="small fw-bold mb-2 d-flex align-items-center">
                                    <Lock size={16} className="me-2 text-info" /> Password
                                </label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    placeholder="••••••••" 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    required 
                                />
                            </div>

                            {/* Gradient Button */}
                            <button 
                                className="btn btn-primary w-100 fw-bold py-2 mb-3 border-0 shadow" 
                                style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}
                            >
                                Register Now
                            </button>
                        </form>
                        
                        <div className="text-center mt-3">
                            <span style={{ color: '#cbd5e1' }} className="small">Already have an account? </span>
                            <Link to="/" className="small fw-bold text-info text-decoration-none">
                                Login Here
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;