const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve files from Root & Public
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect("mongodb+srv://a1drycleaners:VaHfDU0CNVTMdyFR@cluster0.2vgwdtz.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("MongoDB Connected");
    initAdmin(); // Create default admin on startup
  })
  .catch(err => console.log(err));

// --- SCHEMAS ---
const AdminSchema = new mongoose.Schema({ username: String, pass: String });
const Admin = mongoose.model("Admin", AdminSchema);

const CustomerSchema = new mongoose.Schema({ marathi: String, english: String, mobile: String });
const Customer = mongoose.model("Customer", CustomerSchema);

const BillSchema = new mongoose.Schema({
  customerName: String, customerMobile: String, total: Number,
  paid: Number, due: Number, weight: String, serviceType: String, date: String
});
const Bill = mongoose.model("Bill", BillSchema);

// --- 1. LOGIN LOGIC ---
async function initAdmin() {
  const exist = await Admin.findOne({ username: "admin" });
  if (!exist) {
    const defaultAdmin = new Admin({ username: "admin", pass: "admin123" });
    await defaultAdmin.save();
    console.log("Default Admin Created: admin / admin123");
  }
}

app.post("/login", async (req, res) => {
  const { username, pass } = req.body;
  const user = await Admin.findOne({ username, pass });
  if (user) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// --- 2. APP ROUTES ---
app.get("/customers", async (req, res) => {
  try { const c = await Customer.find().sort({_id: -1}); res.json(c); } 
  catch (err) { res.status(500).json({error: err.message}); }
});

app.post("/customers", async (req, res) => {
  try { const c = new Customer(req.body); await c.save(); res.json(c); } 
  catch (err) { res.status(500).json({error: err.message}); }
});

app.put("/customers/:id", async (req, res) => {
  try { await Customer.findByIdAndUpdate(req.params.id, req.body); res.json({success: true}); } 
  catch (err) { res.status(500).json({error: err.message}); }
});

app.delete("/customers/:id", async (req, res) => {
  try { await Customer.findByIdAndDelete(req.params.id); res.json({success: true}); } 
  catch (err) { res.status(500).json({error: err.message}); }
});

app.get("/bills", async (req, res) => {
  try {
    const filter = req.query.mobile ? { customerMobile: req.query.mobile } : {};
    const bills = await Bill.find(filter).sort({_id: -1}).limit(100); 
    res.json(bills);
  } catch (err) { res.status(500).json({error: err.message}); }
});

app.post("/bills", async (req, res) => {
  try { const b = new Bill(req.body); await b.save(); res.json(b); } 
  catch (err) { res.status(500).json({error: err.message}); }
});

app.put("/bills/:id", async (req, res) => {
  try { await Bill.findByIdAndUpdate(req.params.id, req.body); res.json({success: true}); } 
  catch (err) { res.status(500).json({error: err.message}); }
});

// Catch All
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if(err) res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
