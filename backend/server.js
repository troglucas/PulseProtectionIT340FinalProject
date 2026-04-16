const express = require("express");
const mongoose = require("mongoose"); /*MangoDB server*/

const app = express();

app.use(express.json()); /* To read what is sent from FRONTEND */

/* For the MangoDB server*/

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  dob: { type: String, required: true },
  password: { type: String, required: true }, // Hashed from frontend
});

function LOGIN(req, res) {}

function REGISTER(req, res) {}
