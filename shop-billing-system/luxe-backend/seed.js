// Run this once via terminal: node seed.js
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/luxe_boutique_db';
mongoose.connect(MONGO_URI);

const Inventory = mongoose.model('Inventory', new mongoose.Schema({
  productId: String, name: String, price: Number, discount: Number, currentStock: Number, minThreshold: Number, maxCapacity: Number
}));

const items = [
  { productId: '1001', name: 'Tempered Glass (Universal)', price: 250, discount: 50, currentStock: 20, minThreshold: 5, maxCapacity: 50 },
  { productId: '1002', name: 'Type-C Fast Charging Cable', price: 450, discount: 100, currentStock: 15, minThreshold: 4, maxCapacity: 40 },
  { productId: '1003', name: 'Apple 20W Power Adapter', price: 1900, discount: 200, currentStock: 6, minThreshold: 3, maxCapacity: 20 },
  { productId: '1004', name: 'Premium Liquid Silicone Case', price: 600, discount: 150, currentStock: 3, minThreshold: 5, maxCapacity: 30 }, // Started low to test warning trigger alert
];

Inventory.insertMany(items)
  .then(() => { console.log("Database seeded successfully."); mongoose.connection.close(); })
  .catch(err => console.error(err));