const express = require("express");
const mongoose = require("mongoose"); /*MangoDB server*/
const cors = require("cors"); /* To allow communication between the frontend and backend servers */
const app = express();

/*Used for logs*/
const logger = require("./logger");
/*info - noting something that happened
warn -noting susicipous behavior like failed login attempts 
error - something fail to work */
/*Writes to central.log and outputs it live on console*/

// checks the cors is working
const allowedOrigins = [
  "http://10.0.2.6:4200",
  "http://localhost:4200",
  "http://127.0.0.1:4200",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json()); /* To read what is sent from FRONTEND */

/* For the MangoDB server*/
// The format for the fields for user in database for registration and login
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  dob: { type: String, required: true },
  password: { type: String, required: true }, // Hashed from frontend
  deviceModel: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

async function registerUser(userData) {
  //Unpacking what we received from the frontend
  const { username, email, dob, password, deviceModel } = userData;

  // Check if username or email exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new Error("User or Email already exists");
  }

  const newUser = new User({ username, email, dob, password, deviceModel });
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
  const { action, username, password, email, dob, deviceModel } = req.body;

  logger.info(
    `Auth request received from frontend. Action: ${action}, Username: ${username}`,
  );

  try {
    // these call the functions above for login or registeration
    if (action === "register") {
      logger.info(
        `Sending register request to DB check. Username: ${username}, Email: ${email}`,
      );
      const result = await registerUser({
        username,
        email,
        dob,
        password,
        deviceModel,
      });

      logger.info(`DB register check passed. User registered: ${username}`);
      logger.info(
        `Sending register success response to frontend. Username: ${username}`,
      );

      return res.status(201).json(result); //any error in the function will be sent to the FRONTEND
    }

    if (action === "login") {
      logger.info(`Sending login request to DB check. Username: ${username}`);
      const result = await loginUser(username, password);

      logger.info(`DB login check passed. Username: ${username}`);
      logger.info(
        `Sending login success response to frontend. Username: ${username}`,
      );

      return res.status(200).json(result); //any error in the function will be sent to the FRONTEND
    }

    logger.warn(`Invalid auth action received: ${action}`);

    res.status(400).json({ error: "Action must be 'login' or 'register'" });
  } catch (error) {
    // Sends the "throw new Error" message back to your frontend

    logger.error(
      `Auth failed. Action: ${action}, Username: ${username}, Error: ${error.message}`,
    );
    logger.info(`Sending error response to frontend. Username: ${username}`);

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
    logger.info("--- Database Connection Established ---");
    logger.info(`Connected to MongoDB at: ${REMOTE_IP}`);

    // Start the server only after the DB is connected
    const PORT = 3000;
    const HOST = "0.0.0.0";
    app.listen(PORT, HOST, () => {
      logger.info(`Server is running on http://10.0.2.5:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("--- Connection Failed! ---");
    logger.error("Check if the remote machine is on and port 27017 is open.");
    logger.error(`Error Details: ${err.message}`);
  });
