const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

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
  date: String
});
const Bill = mongoose.model("Bill", BillSchema);

// --- ROUTES ---

app.post("/customers", async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.json(customer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/customers", async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

app.post("/bills", async (req, res) => {
  try {
    const bill = new Bill(req.body);
    await bill.save();
    res.json(bill);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/bills", async (req, res) => {
  const bills = await Bill.find().sort({_id: -1}).limit(50); 
  res.json(bills);
});

// --- SERVE HTML ---

// Fix: Serve index.html from the main folder (removed 'public' folder reference)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
