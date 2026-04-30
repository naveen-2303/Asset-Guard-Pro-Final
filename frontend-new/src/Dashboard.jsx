import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    PlusCircle, Search, LogOut, Trash2,
    Wrench, FileText, LayoutDashboard, Package, Clock, ShieldCheck, AlertTriangle, ScanLine
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ✅ SINGLE SOURCE OF TRUTH: One function calculates everything
const getDaysRemaining = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    // Strip time from BOTH dates so comparison is purely date-based
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const getDetailedExpiry = (expiryDate) => {
    const totalDays = getDaysRemaining(expiryDate);

    if (totalDays <= 0) {
        return { months: 0, days: 0, totalDays: 0, message: "Expired" };
    }

    // Show ONLY days if less than or equal to 30 days remaining
    
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;

    return {
        months,
        days,
        totalDays,
        message: `${months} Month${months === 1 ? '' : 's'} ${days} Day${days === 1 ? '' : 's'}`
    };
};

// ✅ Uses SAME getDaysRemaining so no mismatch possible
const isExpiringSoon = (expiryDate) => {
    const days = getDaysRemaining(expiryDate);
    return days >= 0 && days <= 30;
};

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [displayTerm, setDisplayTerm] = useState('');
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [formData, setFormData] = useState({
        productName: '', purchaseDate: '', expiryDate: ''
    });
    const navigate = useNavigate();

    const API_BASE_URL = 'https://warranty-asset-system.onrender.com';

    const fetchProducts = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/products`, {
                headers: { 'x-auth-token': token }
            });
            setProducts(res.data);
            return res.data;
        } catch (err) {
            if (err.response?.status === 401) navigate('/');
        }
    }, [API_BASE_URL, navigate]);

    // MOCK OCR ANALYSIS: Auto-detect dates from invoice upload
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setIsAnalyzing(true);
            toast.loading("Analyzing Invoice AI...", { id: 'analyze' });

            setTimeout(() => {
                const mockDetectedPurchase = new Date().toISOString().split('T')[0];
                const mockDetectedExpiry = new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0];

                setFormData(prev => ({
                    ...prev,
                    purchaseDate: mockDetectedPurchase,
                    expiryDate: mockDetectedExpiry
                }));

                setIsAnalyzing(false);
                toast.success("Dates extracted from invoice!", { id: 'analyze' });
            }, 2000);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const getFilteredList = () => {
        let list = products;
        if (filterStatus === 'protected') list = products.filter(p => !isExpiringSoon(p.expiryDate));
        if (filterStatus === 'vulnerable') list = products.filter(p => isExpiringSoon(p.expiryDate));
        return list.filter(p => p.productName.toLowerCase().includes(displayTerm.toLowerCase()));
    };

    const onSubmit = async e => {
        e.preventDefault();
        const loadToast = toast.loading("Securing Asset...");

        const data = new FormData();
        data.append('productName', formData.productName);
        data.append('purchaseDate', formData.purchaseDate);
        data.append('expiryDate', formData.expiryDate);

        if (file) data.append('invoice', file);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/products/add`, data, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Asset Vaulted!", { id: loadToast });
            setFormData({ productName: '', purchaseDate: '', expiryDate: '' });
            setFile(null);
            fetchProducts();
        } catch (err) {
            console.error(err);
            toast.error("Vaulting Error: Check Backend Connection", { id: loadToast });
        }
    };

    const addMaintenanceLog = async (id) => {
        const desc = prompt("Enter Maintenance Details:");
        if (!desc) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/products/maintenance`,
                { productId: id, description: desc },
                { headers: { 'x-auth-token': token } }
            );
            toast.success("Log Saved");
        } catch (err) { toast.error("Error saving log"); }
    };

    const vulnerableProducts = products.filter(p => isExpiringSoon(p.expiryDate));

    return (
        <div className="animated-bg">
            <div className="container-fluid px-md-5 py-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <h2 className="fw-bold text-white m-0">
                        <ShieldCheck className="text-info me-2" />Asset Guard Pro
                    </h2>
                    <button
                        className="btn btn-outline-danger px-4"
                        onClick={() => { localStorage.clear(); navigate('/'); }}
                    >
                        <LogOut size={18} className="me-2" /> Logout
                    </button>
                </div>

                {/* ✅ ALERT: WARRANTY EXPIRING SOON — with exact days per product */}
                <AnimatePresence>
                    {vulnerableProducts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-card border-warning mb-5 p-4 shadow"
                            style={{ borderLeft: '4px solid #f59e0b' }}
                        >
                            <h5 className="text-warning fw-bold mb-4 d-flex align-items-center gap-2">
                                <AlertTriangle size={20} />
                                ⚠️ Alert: Warranty Expiring Soon
                            </h5>
                            <div className="d-flex flex-wrap gap-3">
                                {vulnerableProducts
                                    .sort((a, b) => getDaysRemaining(a.expiryDate) - getDaysRemaining(b.expiryDate))
                                    .map(p => {
                                        const remaining = getDaysRemaining(p.expiryDate);
                                        const isUrgent = remaining <= 7;
                                        const isCritical = remaining <= 0;

                                        return (
                                            <div
                                                key={p._id}
                                                className="p-3 rounded-4"
                                                style={{
                                                    minWidth: '220px',
                                                    background: isCritical
                                                        ? 'rgba(239,68,68,0.15)'
                                                        : isUrgent
                                                            ? 'rgba(245,158,11,0.2)'
                                                            : 'rgba(245,158,11,0.1)',
                                                    border: `1px solid ${isCritical ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.3)'}`,
                                                }}
                                            >
                                                <h6 className="fw-bold mb-1" style={{
                                                    color: isCritical ? '#ef4444' : '#f59e0b',
                                                    fontSize: '1rem'
                                                }}>
                                                    {p.productName}
                                                </h6>
                                                <div className="fw-bold" style={{
                                                    color: isCritical ? '#ef4444' : '#ffffff',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {isCritical
                                                        ? '🔴 Expired'
                                                        : remaining === 0
                                                            ? '🔴 Expires Today!'
                                                            : `⏳ ${remaining} Day${remaining === 1 ? '' : 's'} Left`
                                                    }
                                                </div>
                                                <div className="small mt-1" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                                    Expires: {new Date(p.expiryDate).toLocaleDateString('en-GB')}
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* STAT CARDS */}
                <div className="row g-4 mb-5">
                    {[
                        { id: 'all', title: 'TOTAL ASSETS', count: products.length, color: '#3b82f6' },
                        { id: 'protected', title: 'FULLY PROTECTED', count: products.filter(p => !isExpiringSoon(p.expiryDate)).length, color: '#10b981' },
                        { id: 'vulnerable', title: 'VULNERABLE', count: vulnerableProducts.length, color: '#f59e0b' }
                    ].map((s) => (
                        <div key={s.id} className="col-md-4" onClick={() => setFilterStatus(s.id)} style={{ cursor: 'pointer' }}>
                            <div className={`card stat-card p-4 shadow-lg border-0 ${filterStatus === s.id ? 'ring-active' : ''}`} style={{ background: s.color }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="small fw-bold opacity-75 mb-1">{s.title}</p>
                                        <h1 className="fw-bold mb-0 text-white">{s.count}</h1>
                                    </div>
                                    <div className="progress-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20 rounded-circle" style={{ width: '60px', height: '60px' }}>
                                        <span className="fw-bold small">{products.length ? Math.round((s.count / products.length) * 100) : 0}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-4">
                    {/* FORM */}
                    <div className="col-lg-4">
                        <div className="glass-card p-4 shadow border-0 h-100">
                            <h5 className="text-white fw-bold mb-4">SECURE NEW ASSET</h5>
                            <form onSubmit={onSubmit}>
                                <div className="mb-3">
                                    <label className="small opacity-50 text-white fw-bold">INVOICE UPLOAD (AUTO-SCAN)</label>
                                    <input type="file" className="form-control mt-1 custom-file-input" onChange={handleFileUpload} />
                                </div>
                                <div className="mb-3">
                                    <label className="small opacity-50 text-white fw-bold">PRODUCT NAME</label>
                                    <input type="text" className="form-control mt-1" value={formData.productName} onChange={e => setFormData({ ...formData, productName: e.target.value })} required />
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <label className="small opacity-50 text-white fw-bold">PURCHASE DATE</label>
                                        <input type="date" className={`form-control mt-1 ${isAnalyzing ? 'blink-border' : ''}`} value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} required />
                                    </div>
                                    <div className="col-6">
                                        <label className="small opacity-50 text-white fw-bold">EXPIRY DATE</label>
                                        <input type="date" className={`form-control mt-1 ${isAnalyzing ? 'blink-border' : ''}`} value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} required />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary-gradient w-100 py-3 fw-bold mt-2">
                                    <ShieldCheck className="me-2" /> VAULT ASSET
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="col-lg-8">
                        <div className="input-group glass-card mb-4 p-0 border-0 shadow">
                            <input
                                type="text"
                                className="form-control bg-transparent text-white border-0 ps-4 py-3"
                                placeholder={`Searching in ${filterStatus.toUpperCase()} assets...`}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-primary-gradient px-4 border-0" onClick={() => setDisplayTerm(searchTerm)}>
                                <Search size={20} />
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-glass align-middle">
                                <thead>
                                    <tr>
                                        <th>ASSET DETAILS</th>
                                        <th>PURCHASE INFO</th>
                                        <th>EXPIRY ANALYSIS</th>
                                        <th className="text-center">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredList().map((p) => {
                                        const analysis = getDetailedExpiry(p.expiryDate);
                                        const isVulnerable = isExpiringSoon(p.expiryDate);

                                        return (
                                            <tr key={p._id}>
                                                <td>
                                                    <div className="fw-bold text-white fs-5">{p.productName}</div>
                                                    <div className="small opacity-50 text-info">UID: {p._id.slice(-6).toUpperCase()}</div>
                                                </td>
                                                <td>
                                                    <div className="text-white small fw-bold">
                                                        Bought: {new Date(p.purchaseDate).toLocaleDateString('en-GB')}
                                                    </div>
                                                    <div className="text-white small opacity-50">
                                                        Expires: {new Date(p.expiryDate).toLocaleDateString('en-GB')}
                                                    </div>
                                                </td>
                                                <td>
                                                    {analysis.totalDays <= 0 ? (
                                                        <h4 className="fw-bold mb-0" style={{ color: '#ef4444' }}>EXPIRED</h4>
                                                    ) : analysis.months === 0 ? (
                                                        // ✅ Under 30 days: show ONLY days, large and colored by urgency
                                                        <>
                                                            <h2 className="fw-bold mb-0" style={{
                                                                color: analysis.days <= 7 ? '#ef4444' : '#f59e0b',
                                                                letterSpacing: '-1px'
                                                            }}>
                                                                {analysis.days} Days Left
                                                            </h2>
                                                            <span className="small fw-bold" style={{ color: '#f59e0b' }}>
                                                                ALERT: WARRANTY IS EXPIRING
                                                            </span>
                                                        </>
                                                    ) : (
                                                        // Over 30 days: show months and days in cyan
                                                        <>
                                                            <h2 className="fw-bold text-info mb-0" style={{ letterSpacing: '-1px' }}>
                                                                {analysis.months}M {analysis.days}D
                                                            </h2>
                                                            <span className="small opacity-50 fw-bold">UNTIL EXHAUSTION</span>
                                                        </>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        {p.invoicePath && (
                                                            <a href={`${API_BASE_URL}/${p.invoicePath}`} target="_blank" rel="noreferrer" className="action-btn">
                                                                <FileText size={18} />
                                                            </a>
                                                        )}
                                                        <button onClick={() => addMaintenanceLog(p._id)} className="action-btn text-info">
                                                            <Wrench size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm("Purge Asset?"))
                                                                    axios.delete(`${API_BASE_URL}/api/products/${p._id}`, {
                                                                        headers: { 'x-auth-token': localStorage.getItem('token') }
                                                                    }).then(fetchProducts);
                                                            }}
                                                            className="action-btn text-danger"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {getFilteredList().length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 opacity-50">
                                                No assets found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;