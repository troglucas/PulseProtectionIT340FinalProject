const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const logger = require("./logger"); // Preserving your logging system
const app = express();

const allowedOrigins = [
  "http://10.0.2.6:4200",
  "http://192.168.80.130:4200",
  "http://localhost:4200",
  "http://127.0.0.1:4200",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-username", "x-role"], // Headers for RBAC identification
  }),
);

app.use(express.json());

// --- SCHEMAS ---

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  dob: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "it", "admin"], default: "user" },
  mfaSecret: { type: String }, // Preserved from your previous version
  deviceModel: { type: String },
  deviceDescription: { type: String },
});
const User = mongoose.model("User", userSchema);

const ticketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  hardwareSpecs: { type: String, required: true }, // M3 Requirement
  status: {
    type: String,
    enum: ["open", "inprogress", "resolved", "completed"],
    default: "open",
  },
  owner: { type: String, required: true },
  assignedTo: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const Ticket = mongoose.model("Ticket", ticketSchema);

// --- MIDDLEWARE ---

const isLoggedIn = (req, res, next) => {
  const username = req.headers["x-username"];
  const role = req.headers["x-role"];
  if (!username || !role) {
    logger.warn("Unauthorized access attempt detected.");
    return res.status(401).json({ error: "Login required" });
  }
  req.user = { username, role };
  next();
};

// --- ROUTES ---

// GET: Users see own tickets; IT/Admin see all
app.get("/api/tickets", isLoggedIn, async (req, res) => {
  try {
    const { username, role } = req.user;
    const query = (role === "admin" || role === "it") ? {} : { owner: username };
    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create Ticket with "One at a Time" logic
app.post("/api/tickets", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "user") return res.status(403).json({ error: "Only users create tickets" });

    const active = await Ticket.findOne({ owner: req.user.username, status: { $in: ["open", "inprogress"] } });
    if (active) return res.status(400).json({ error: "You already have an active ticket request." });

    const { subject, description, hardwareSpecs } = req.body;
    const ticket = new Ticket({ subject, description, hardwareSpecs, owner: req.user.username });

    await ticket.save();
    logger.info(`Ticket [${ticket._id}] created by ${req.user.username}`);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Claim/Update logic for IT Assistants
app.patch("/api/tickets/:id", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "it") return res.status(403).json({ error: "IT Assistant access only" });

    if (req.body.state === "inprogress") {
      const busy = await Ticket.findOne({ assignedTo: req.user.username, status: "inprogress" });
      if (busy) return res.status(400).json({ error: "Finish your current ticket first!" });
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, {
      status: req.body.state,
      assignedTo: req.body.state === "inprogress" ? req.user.username : undefined,
      updatedAt: new Date()
    }, { new: true });

    logger.info(`Ticket [${req.params.id}] updated to ${req.body.state} by ${req.user.username}`);
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Admin only for solved/completed
app.delete("/api/tickets/:id", isLoggedIn, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access only" });
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!["resolved", "completed"].includes(ticket.status)) {
      return res.status(400).json({ error: "Cannot delete unfinished tickets" });
    }
    await Ticket.findByIdAndDelete(req.params.id);
    logger.info(`Ticket [${req.params.id}] deleted by Admin: ${req.user.username}`);
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUTH (Preserved Wikidata/MFA placeholders) ---
// ... Insert your existing registerUser and loginUser functions here ...

// --- DB CONNECTION ---
const REMOTE_IP = "10.0.2.7"; 
const connectionString = `mongodb://${REMOTE_IP}:27017/pulse`;

mongoose.connect(connectionString).then(() => {
  logger.info("--- Database Connection Established ---");
  app.listen(3000, "0.0.0.0", () => logger.info("Server running on port 3000"));
}).catch(err => logger.error(`DB Connection Failed: ${err.message}`));
