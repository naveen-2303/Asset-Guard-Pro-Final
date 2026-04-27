const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/authMiddleware');

// IMPORT ALL CONTROLLER FUNCTIONS IN ONE LINE
const { 
    addProduct, 
    getProducts, 
    deleteProduct, 
    addMaintenance 
} = require('../controllers/productController');
// ... existing addProduct, getProducts, deleteProduct ...

exports.addMaintenance = async (req, res) => {
    try {
        const { productId, description } = req.body;
        // Logic to save maintenance record (as per Step 3)
        // For now, even a simple console log and success message will fix the crash
        res.status(201).json({ msg: "Maintenance record received" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
};
// 1. Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 2. Route Definitions
router.post('/add', auth, upload.single('invoice'), addProduct);
router.get('/', auth, getProducts);
router.delete('/:id', auth, deleteProduct);

// NEW: Maintenance Route for Step 4
router.post('/maintenance', auth, addMaintenance);

module.exports = router;