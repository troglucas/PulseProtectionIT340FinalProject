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

// actually enters here
app.post("/auth", async (req, res) => {
  //unpacks it from the frontend
  const { action, username, password, email, dob } = req.body;

  try {
    // these call the functions above for login or registeration
    if (action === "register") {
      const result = await registerUser({ username, email, dob, password });
      return res.status(201).json(result); //any error in the function will be sent to the FRONTEND
    }

    if (action === "login") {
      const result = await loginUser(username, password);
      return res.status(200).json(result); //any error in the function will be sent to the FRONTEND
    }

    res.status(400).json({ error: "Action must be 'login' or 'register'" });
  } catch (error) {
    // Sends the "throw new Error" message back to your frontend
    res.status(400).json({ error: error.message });
  }
});
