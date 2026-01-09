const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve files from Root & Public (Fixes Not Found errors)
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect("mongodb+srv://a1drycleaners:VaHfDU0CNVTMdyFR@cluster0.2vgwdtz.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("MongoDB Connected");
    initAdmin();
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

// --- 1. LOGIN SYSTEM ---
async function initAdmin() {
  const exist = await Admin.findOne({ username: "admin" });
  if (!exist) {
    const defaultAdmin = new Admin({ username: "admin", pass: "admin123" });
    await defaultAdmin.save();
    console.log("Default Admin Created");
  }
}

app.post("/login", async (req, res) => {
  const { username, pass } = req.body;
  const user = await Admin.findOne({ username, pass });
  res.json({ success: !!user });
});

// --- 2. APP ROUTES ---
app.get("/customers", async (req, res) => {
  try { const c = await Customer.find().sort({_id: -1}); res.json(c); } catch(e){ res.json([]) }
});
app.post("/customers", async (req, res) => {
  try { const c = new Customer(req.body); await c.save(); res.json(c); } catch(e){ res.status(500).json(e) }
});
app.put("/customers/:id", async (req, res) => {
  await Customer.findByIdAndUpdate(req.params.id, req.body); res.json({success: true});
});
app.delete("/customers/:id", async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id); res.json({success: true});
});

app.get("/bills", async (req, res) => {
  try {
    const filter = req.query.mobile ? { customerMobile: req.query.mobile } : {};
    const bills = await Bill.find(filter).sort({_id: -1}).limit(100);
    res.json(bills);
  } catch(e){ res.json([]) }
});
app.post("/bills", async (req, res) => {
  const bill = new Bill(req.body); await bill.save(); res.json(bill);
});

// Catch All
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if(err) res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
