import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    PlusCircle, Search, LogOut, Trash2, 
    Wrench, FileText, LayoutDashboard, Package, Clock, ShieldCheck 
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayTerm, setDisplayTerm] = useState('');
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({ 
        productName: '', purchaseDate: '', warrantyPeriod: '' 
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
    }, [API_BASE_URL, navigate]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const filteredProducts = products.filter(p => 
        p.productName.toLowerCase().includes(displayTerm.toLowerCase())
    );

    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const diffInDays = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        return diffInDays >= 0 && diffInDays <= 30;
    };

    const onSubmit = async e => {
        e.preventDefault();
        const loadToast = toast.loading("Encrypting and vaulting asset...");
        const data = new FormData();
        data.append('productName', formData.productName);
        data.append('purchaseDate', formData.purchaseDate);
        data.append('warrantyPeriod', formData.warrantyPeriod);
        if (file) data.append('invoice', file);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/products/add`, data, { 
                headers: { 
                    'x-auth-token': token, 
                    'Content-Type': 'multipart/form-data' 
                } 
            });
            toast.success("Asset coverage secured!", { id: loadToast });
            setFormData({ productName: '', purchaseDate: '', warrantyPeriod: '' });
            setFile(null);
            fetchProducts();
        } catch (err) { 
            toast.error("Failed to secure asset.", { id: loadToast }); 
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm("Remove this asset and its coverage data?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/api/products/${id}`, { 
                    headers: { 'x-auth-token': token } 
                });
                toast.success("Asset purged from vault");
                fetchProducts();
            } catch (err) { toast.error("Removal failed"); }
        }
    };

    return (
        <div className="animated-bg" style={{ minHeight: '100vh', padding: '20px' }}>
            <div className="container">
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-5 mt-2">
                    <div className="d-flex align-items-center text-white">
                        <ShieldCheck size={32} className="text-info me-2" />
                        <h2 className="fw-bold m-0">Asset Guard <span className="text-info">Pro</span></h2>
                    </div>
                    <button className="btn btn-outline-danger d-flex align-items-center shadow-sm" onClick={() => { localStorage.clear(); navigate('/'); }}>
                        <LogOut size={18} className="me-2" /> Logout
                    </button>
                </div>

                {/* STATISTICS CARDS */}
                <div className="row mb-5">
                    {[
                        { title: 'Vaulted Assets', val: products.length, icon: <Package />, color: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
                        { title: 'Fully Protected', val: products.filter(p => !isExpiringSoon(p.expiryDate)).length, icon: <LayoutDashboard />, color: 'linear-gradient(135deg, #10b981, #059669)' },
                        { title: 'Vulnerable', val: products.filter(p => isExpiringSoon(p.expiryDate)).length, icon: <Clock />, color: 'linear-gradient(135deg, #f59e0b, #d97706)' }
                    ].map((item, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="col-md-4 mb-3">
                            <div className="card stat-card text-white p-4 h-100 border-0 shadow" style={{ background: item.color }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="small mb-1 opacity-75 uppercase tracking-wider">{item.title}</p>
                                        <h2 className="fw-bold mb-0">{item.val}</h2>
                                    </div>
                                    <div className="p-2 bg-white bg-opacity-25 rounded-circle">{item.icon}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="row">
                    {/* ADD ASSET FORM */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="col-lg-4 mb-4">
                        <div className="card glass-card p-4 shadow-lg h-100 border-0">
                            <h5 className="mb-4 fw-bold text-white d-flex align-items-center">
                                <PlusCircle size={20} className="text-info me-2" /> Secure New Asset
                            </h5>
                            <form onSubmit={onSubmit}>
                                <div className="mb-3">
                                    <label className="small fw-bold opacity-50 text-white uppercase tracking-wider">Product Name</label>
                                    <input type="text" className="form-control mt-2" placeholder="MacBook Pro M3" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} required />
                                </div>
                                <div className="mb-3">
                                    <label className="small fw-bold opacity-50 text-white uppercase tracking-wider">Purchase Date</label>
                                    <input type="date" className="form-control mt-2" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} required />
                                </div>
                                <div className="mb-3">
                                    <label className="small fw-bold opacity-50 text-white uppercase tracking-wider">Coverage (Months)</label>
                                    <input type="number" className="form-control mt-2" placeholder="24" value={formData.warrantyPeriod} onChange={e => setFormData({...formData, warrantyPeriod: e.target.value})} required />
                                </div>
                                <div className="mb-4">
                                    <label className="small fw-bold opacity-50 text-white uppercase tracking-wider">Evidence (Invoice)</label>
                                    <input type="file" className="form-control mt-2 custom-file-input" onChange={e => setFile(e.target.files[0])} />
                                </div>
                                <button type="submit" className="btn btn-primary-gradient w-100 py-3 d-flex align-items-center justify-content-center shadow">
                                    <PlusCircle size={18} className="me-2" /> Encrypt & Save Asset
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* TABLE SECTION */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="col-lg-8">
                        <div className="mb-4">
                            {/* Merged Style Search Bar */}
                            <div className="input-group glass-card p-0 border-0">
                                <input 
                                    type="text" 
                                    className="form-control border-0 bg-transparent text-white px-3" 
                                    placeholder="Search through your vault..." 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                                <button 
                                    className="btn btn-primary-gradient px-4 border-0" 
                                    onClick={() => setDisplayTerm(searchTerm)}
                                    style={{ borderRadius: '0 12px 12px 0' }}
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-glass align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Asset Specification</th>
                                        <th>Warranty Expiry</th>
                                        <th>Integrity</th>
                                        <th className="text-center">Docs</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product, index) => (
                                        <motion.tr 
                                            key={product._id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td className="fw-bold">
                                                <div className="d-flex flex-column">
                                                    <span className="text-white">{product.productName}</span>
                                                    <span className="small opacity-50 fw-normal">ID: {product._id.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </td>
                                            
                                            {/* Primary Date Visibility */}
                                            <td className="text-info fw-bold">
                                                {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                }) : 'N/A'}
                                            </td>

                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className={`me-2`} 
                                                         style={{ 
                                                             width: '8px', height: '8px', borderRadius: '50%', 
                                                             backgroundColor: isExpiringSoon(product.expiryDate) ? '#ef4444' : '#10b981',
                                                             boxShadow: isExpiringSoon(product.expiryDate) ? '0 0 10px #ef4444' : '0 0 10px #10b981'
                                                         }}>
                                                    </div>
                                                    <span className={isExpiringSoon(product.expiryDate) ? 'text-danger small fw-bold' : 'text-success small fw-bold'}>
                                                        {isExpiringSoon(product.expiryDate) ? 'VULNERABLE' : 'SECURED'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                {product.invoicePath ? (
                                                    <a href={`${API_BASE_URL}/${product.invoicePath}`} target="_blank" rel="noreferrer" className="action-btn">
                                                        <FileText size={18} />
                                                    </a>
                                                ) : <span className="opacity-25">-</span>}
                                            </td>
                                            <td className="text-center">
                                                <button className="action-btn me-2" onClick={() => {
                                                    const desc = prompt("Log maintenance record:");
                                                    if (desc) {
                                                        const token = localStorage.getItem('token');
                                                        axios.post(`${API_BASE_URL}/api/products/maintenance`, { productId: product._id, description: desc }, { headers: { 'x-auth-token': token } })
                                                        .then(() => toast.success("Record saved"))
                                                        .catch(() => toast.error("Write error"));
                                                    }
                                                }}>
                                                    <Wrench size={18} />
                                                </button>
                                                <button onClick={() => deleteProduct(product._id)} className="action-btn text-danger">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;