const Product = require('../models/Product');

exports.addProduct = async (req, res) => {
    try {
        // With multer, text fields are in req.body, file is in req.file
        const { productName, purchaseDate, warrantyPeriod } = req.body;

        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + parseInt(warrantyPeriod));

        const newProduct = new Product({
            userId: req.user.id,
            productName,
            purchaseDate,
            warrantyPeriod,
            expiryDate: expiryDate,
            // Store the path to the uploaded file if it exists
            invoicePath: req.file ? req.file.path : null 
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error("Add Product Error:", err.message);
        res.status(500).send("Server Error");
    }
};
// ... existing addProduct code ...

// CHECK THIS PART:
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({ userId: req.user.id });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        if (product.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });

        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Product removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
const Maintenance = require('../models/Maintenance');

exports.addMaintenance = async (req, res) => {
    try {
        const { productId, description, serviceDate } = req.body;
        const record = new Maintenance({ productId, description, serviceDate });
        await record.save();
        res.status(201).json(record);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};