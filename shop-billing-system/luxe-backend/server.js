const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// 🛡️ System Middleware Configuration
app.use(cors()); // Cleans up duplicate rules and handles browser CORS securely
app.use(express.json()); // Parses incoming JSON data so req.body is no longer undefined!
app.use(express.urlencoded({ extended: true }));

// 🔌 Classic Local MongoDB Connection
const MONGO_URI = 'mongodb://127.0.0.1:27017/luxe_boutique_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('🛡️ Permanent MongoDB Connection Secured.'))
  .catch(err => console.error('❌ Database Connection Error:', err));

// 📦 1. Inventory Schema
const inventorySchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  currentStock: { type: Number, required: true },
  minThreshold: { type: Number, required: true }, 
  maxCapacity: { type: Number, required: true },  
  totalUnitsSold: { type: Number, default: 0 }    
});
const Inventory = mongoose.model('Inventory', inventorySchema);

// 🧾 2. Permanent Customer Sales Log Schema (UPDATED FOR PERMANENT RETENTION)
const saleSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  paymentMode: { type: String, required: true },
  products: [{
    productId: String,
    productName: String,
    quantity: Number,
    totalPricePaid: Number
  }],
  grandTotal: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', saleSchema);

// ==========================================
// 🚀 CORE BUSINESS API ROUTES
// ==========================================

// ROUTE A: Fetch Complete Inventory with Alerts
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await Inventory.find({});
    const notifications = [];
    items.forEach(item => {
      if (item.currentStock <= item.minThreshold) {
        notifications.push({
          productId: item.productId,
          name: item.name,
          type: 'CRITICAL_LOW_STOCK',
          message: `⚠️ Low limit hit on "${item.name}" (${item.currentStock} left).`,
          suggestedOrderQuantity: item.maxCapacity - item.currentStock
        });
      }
    });
    res.json({ inventory: items, alerts: notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ROUTE B: Checkout Transaction (Auto-Fixes Fields & Sanitizes Data)
app.post('/api/checkout', async (req, res) => {
  try {
    const { customerName, customerPhone, paymentMode, cartItems } = req.body;
    
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart items are missing or empty." });
    }

    const transactionProducts = [];
    let grandTotal = 0;

    for (const cartItem of cartItems) {
      const product = await Inventory.findOne({ productId: cartItem.productId });
      
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${cartItem.productId}` });
      }

      // Check stock availability safely
      const requestedQty = Number(cartItem.quantity) || 1;
      if (product.currentStock < requestedQty) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}.` });
      }

      // Safely update stock
      product.currentStock -= requestedQty;
      product.totalUnitsSold += requestedQty;
      await product.save();

      const netUnitPrice = product.price - product.discount;
      const totalCost = netUnitPrice * requestedQty;
      grandTotal += totalCost;

      transactionProducts.push({
        productId: product.productId,
        productName: product.name,
        quantity: requestedQty,
        totalPricePaid: totalCost
      });
    }

    // 🛡️ CRASH BUG FIX: Use fallback values if frontend inputs are empty or misaligned
    const finalName = String(customerName || "Premium Guest").trim();
    const finalPhone = String(customerPhone || "+910000000000").trim();
    const finalPaymentMode = String(paymentMode || "Cash").trim();

    // Save permanently to the database
    await Sale.create({
      customerName: finalName,
      customerPhone: finalPhone,
      paymentMode: finalPaymentMode,
      products: transactionProducts,
      grandTotal: grandTotal
    });

    // Send back a clean success response to clear the frontend cart
    return res.json({ 
      success: true, 
      message: "Transaction processed successfully!" 
    });

  } catch (err) {
    // 🚨 THIS WILL FORCE THE SERVER TO PRINT THE EXACT TRACE IN THE TERMINAL
    console.log("==================================================");
    console.error("💥 CRASH REPORT FOR CHECKOUT:", err);
    console.log("==================================================");
    return res.status(500).json({ error: "Internal Database processing failed.", details: err.message });
  }
});
// ROUTE C: Analytics Dashboard Engine
app.get('/api/analytics', async (req, res) => {
  try {
    const bestSeller = await Inventory.findOne({}).sort({ totalUnitsSold: -1 });
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    
    const sales = await Sale.find({ date: { $gte: startOfMonth } });
    const monthlyRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);

    const storeInventory = await Inventory.find({});
    const totalInventoryValue = storeInventory.reduce((sum, item) => sum + (item.currentStock * item.price), 0);

    res.json({
      bestSellingProduct: bestSeller ? { name: bestSeller.name, sold: bestSeller.totalUnitsSold } : "None yet",
      currentMonthRevenue: monthlyRevenue,
      storeInventoryAssetValue: totalInventoryValue,
      salesHistory: sales // Sends permanent logs back up to display on the screen
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🛰️ Cloud Engine Active On Communication Port: ${PORT}`));