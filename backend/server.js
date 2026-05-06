const express = require("express");
const mongoose = require("mongoose"); /*MangoDB server*/
const cors = require("cors"); /* To allow communication between the frontend and backend servers */

const app = express();


// checks the cors is working
const allowedOrigins = [
"http://10.0.2.6:4200",
"http://localhost:4200",
"http://127.0.0.1:4200",
];

app.use(
cors({
origin: (origin, callback) => {
if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
return callback(new Error("Not allowed by CORS"));
},
methods: ["GET", "POST", "OPTIONS"],
allowedHeaders: ["Content-Type"],
})
);


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
app.post(["/auth", "/api/auth"], async (req, res) => {
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

// connecting to MangoDB server

const REMOTE_IP = "10.0.2.7"; // insert ip of DB VM here
const DB_NAME = "pulse"; //insert db name here
const connectionString = `mongodb://${REMOTE_IP}:27017/${DB_NAME}`;

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("--- Database Connection Established ---");
    console.log(`Connected to: ${REMOTE_IP}`);

    // Start the server only after the DB is connected
    const PORT = 3000;
    const HOST = "0.0.0.0";
    app.listen(PORT, HOST, () => {
      console.log("Server is running on http://10.0.2.5:" + PORT);
    });
  })
  .catch((err) => {
    console.error("--- Connection Failed! ---");
    console.error("Check if the remote machine is on and port 27017 is open.");
    console.error("Error Details:", err.message);
  });
