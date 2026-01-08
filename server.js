const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. SERVE FILES (Updated to work for both Public & Root folders) ---
// Try serving from 'public' folder first, then current folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// MongoDB Connection
mongoose.connect("mongodb+srv://a1drycleaners:VaHfDU0CNVTMdyFR@cluster0.2vgwdtz.mongodb.net/?appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// --- SCHEMAS ---
const CustomerSchema = new mongoose.Schema({
  marathi: String,
  english: String,
  mobile: String
});
const Customer = mongoose.model("Customer", CustomerSchema);

const BillSchema = new mongoose.Schema({
  customerName: String,
  customerMobile: String,
  total: Number,
  paid: Number,
  due: Number,
  weight: String,
  serviceType: String,
  date: String
});
const Bill = mongoose.model("Bill", BillSchema);

// --- ROUTES ---

// 1. CUSTOMERS
app.get("/customers", async (req, res) => {
  const customers = await Customer.find().sort({_id: -1});
  res.json(customers);
});

app.post("/customers", async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.json(customer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ✅ UPDATE Customer (Fixes the 404 Error)
app.put("/customers/:id", async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ✅ DELETE Customer
app.delete("/customers/:id", async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. BILLS
app.get("/bills", async (req, res) => {
  const filter = req.query.mobile ? { customerMobile: req.query.mobile } : {};
  const bills = await Bill.find(filter).sort({_id: -1}).limit(100); 
  res.json(bills);
});

app.post("/bills", async (req, res) => {
  try {
    const bill = new Bill(req.body);
    await bill.save();
    res.json(bill);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ✅ UPDATE Bill
app.put("/bills/:id", async (req, res) => {
  try {
    await Bill.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CATCH ALL (Serves index.html for any unknown route) ---
app.get("*", (req, res) => {
  // Try to find index.html in public, if not found, try root
  const publicPath = path.join(__dirname, 'public', 'index.html');
  const rootPath = path.join(__dirname, 'index.html');
  
  res.sendFile(publicPath, (err) => {
    if (err) res.sendFile(rootPath);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
