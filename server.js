const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// UPDATE THIS WITH YOUR OWN MONGO URL IF NEEDED
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

// NEW: Edit Customer
app.put("/customers/:id", async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. BILLS
app.get("/bills", async (req, res) => {
  // Optional: Filter by mobile if query param provided
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

// NEW: Edit Bill (e.g. update paid amount)
app.put("/bills/:id", async (req, res) => {
  try {
    await Bill.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
