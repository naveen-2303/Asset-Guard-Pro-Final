const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    serviceDate: { type: Date, default: Date.now },
    description: { type: String, required: true },
    cost: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);