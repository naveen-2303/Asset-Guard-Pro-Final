import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    PlusCircle, Search, LogOut, Trash2,
    Wrench, FileText, LayoutDashboard, Package, Clock, ShieldCheck, AlertTriangle, ScanLine
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ✅ FIX 1: Accurate day calculation (timezone + no over-rounding)
const getDaysRemaining = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate + "T00:00:00");

    today.setHours(0, 0, 0, 0);

    return Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
};

// ✅ SINGLE SOURCE OF TRUTH
// ✅ Keep only ONE version of this function
const getDaysRemaining = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    // Normalize both to midnight to ensure accurate day-based math
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    // Use Math.floor to avoid rounding up 'partial' days incorrectly
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const getDetailedExpiry = (expiryDate) => {
    const totalDays = getDaysRemaining(expiryDate);

    if (totalDays < 0) {
        return { months: 0, days: 0, totalDays, message: "Expired" };
    }

    // FIX: If 30 days or less, display ONLY days
    if (totalDays <= 30) {
        return { 
            months: 0, 
            days: totalDays, 
            totalDays, 
            message: `${totalDays} Day${totalDays === 1 ? '' : 's'} remaining` 
        };
    }

    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;

    return {
        months,
        days,
        totalDays,
        message: `${months} Month${months === 1 ? '' : 's'} ${days} Day${days === 1 ? '' : 's'}`
    };
};

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
        } catch (err) {
            if (err.response?.status === 401) navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // ✅ FIX 3: OCR should NOT override manual input
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        if (selectedFile) {
            setIsAnalyzing(true);
            toast.loading("Analyzing Invoice AI...", { id: 'analyze' });

            setTimeout(() => {
                const mockDetectedPurchase = new Date().toISOString().split('T')[0];
                const mockDetectedExpiry = new Date(
                    new Date().setFullYear(new Date().getFullYear() + 2)
                ).toISOString().split('T')[0];

                setFormData(prev => ({
                    ...prev,
                    purchaseDate: prev.purchaseDate || mockDetectedPurchase,
                    expiryDate: prev.expiryDate || mockDetectedExpiry
                }));

                setIsAnalyzing(false);
                toast.success("Dates extracted!", { id: 'analyze' });
            }, 2000);
        }
    };

    const getFilteredList = () => {
        let list = products;

        if (filterStatus === 'protected') {
            list = products.filter(p => !isExpiringSoon(p.expiryDate));
        }

        if (filterStatus === 'vulnerable') {
            list = products.filter(p => isExpiringSoon(p.expiryDate));
        }

        return list.filter(p =>
            p.productName.toLowerCase().includes(displayTerm.toLowerCase())
        );
    };

    const onSubmit = async e => {
        e.preventDefault();
        const loadToast = toast.loading("Saving Asset...");

        console.log("Submitting:", formData); // ✅ Debug

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

            toast.success("Asset Added!", { id: loadToast });

            setFormData({ productName: '', purchaseDate: '', expiryDate: '' });
            setFile(null);
            fetchProducts();

        } catch (err) {
            console.error(err);
            toast.error("Error saving asset", { id: loadToast });
        }
    };

    const vulnerableProducts = products.filter(p => isExpiringSoon(p.expiryDate));

    return (
        <div className="container">
            <h2>Dashboard</h2>

            {/* ALERT */}
            {vulnerableProducts.map(p => {
                const days = getDaysRemaining(p.expiryDate);
                return (
                    <div key={p._id}>
                        {p.productName} - {days} days left
                    </div>
                );
            })}

            {/* FORM */}
            <form onSubmit={onSubmit}>
                <input type="file" onChange={handleFileUpload} />

                <input
                    type="text"
                    placeholder="Product Name"
                    value={formData.productName}
                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                    required
                />

                <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                    required
                />

                <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    required
                />

                <button type="submit">Add Product</button>
            </form>
        </div>
    );
};

export default Dashboard;