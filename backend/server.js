const express = require("express");
const mongoose = require("mongoose"); /*MangoDB server*/

const app = express();

app.use(express.json()); /* To read what is sent from FRONTEND */

/* For the MangoDB server*/
// The format for the fields for user in database for registration and login
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  dob: { type: String, required: true },
  password: { type: String, required: true }, // Hashed from frontend
});

const User = mongoose.model("User", userSchema);

async function registerUser(userData) {
  //Unpacking what we received from the frontend
  const { username, email, dob, password } = userData;

  // Check if username or email exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new Error("User or Email already exists");
  }

  const newUser = new User({ username, email, dob, password });
  await newUser.save();
  return { message: "Success! User registered." };
}

async function loginUser(username, password) {
  const user = await User.findOne({ username });

  // if user is not in the database
  if (!user) {
    throw new Error("User not found");
  }

  // the passwords don't match
  if (user.password !== password) {
    throw new Error("Invalid credentials");
  }

  return { message: "Login successful", user: user.username };
}
