const express = require("express");
const mongoose = require("mongoose"); /*MangoDB server*/
const cors = require("cors"); /* To allow communication between the frontend and backend servers */
const nodemailer = require("nodemailer"); /* For sending emails to users */
const crypto = require("crypto"); /* For hashing muti auth token */
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
  deviceModel: { type: String },
  deviceDescription: { type: String },
});

const User = mongoose.model("User", userSchema);

const mfaCodes = new Map(); // Map to store MFA codes for users its like a dictionary
function generateMfaCode() {
  return crypto.randomInt(10000, 100000).toString(); // Generate a random 5-digit code
}

// Set up nodemailer transporter (using Mailtrap for testing)
const emailTransporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "308321c35f6d8f",
    pass: "9d980a7a4812d9",
  },
});

//Actually sends the email to the user with the code
async function sendMfaEmail(toEmail, code) {
  await emailTransporter.sendMail({
    from: '"Pulse Protection" <no-reply@pulse.local>',
    to: toEmail,
    subject: "Your Pulse Protection login code",
    text: `Your login code is ${code}. It expires in 5 minutes.`,
  });
}

//Used to hasd the mfa code
function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

async function registerUser(userData) {
  //Unpacking what we received from the frontend
  const { username, email, dob, password, deviceModel } = userData;

  // Check if username or email exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new Error("User or Email already exists");
  }
  //Go to get device description from the API and add it to the database
  let deviceDescription = "No description found";
  //Tries to get description from api
  try {
    deviceDescription = await lookupDeviceDescription(deviceModel);
  } catch (error) {
    logger.error(
      `Device description lookup failed for model: ${deviceModel}. Error: ${error.message}`,
    );
  }

  const newUser = new User({
    username,
    email,
    dob,
    password,
    deviceModel,
    deviceDescription,
  });
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

  return { username: user.username, email: user.email };
}

// actually enters here
app.post(["/auth", "/api/auth"], async (req, res) => {
  //unpacks it from the frontend
  const { action, username, password, email, dob, deviceModel, code } =
    req.body;

  logger.info(
    `Auth request received from frontend. Action: ${action}, Username: ${username}`,
  );

  try {
    // these call the functions above for login or registeration or  verifyMfa
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
      const user = await loginUser(username, password);

      //Generate Code and store it in the map with the username as the key
      const mfacode = generateMfaCode();
      // Generates the code but makes it expire in 5 min
      mfaCodes.set(username, {
        codeHash: hashCode(mfacode),
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes from now,
        attempts: 0,
      });

      await sendMfaEmail(user.email, mfacode); //Sends the email to the user with the code

      logger.info(`DB login check passed. Username: ${username}`);

      return res.status(200).json({
        mfaRequired: true,
        message:
          "A 5 digit code has been sent to your email. Please enter it to complete login.",
        username: user.username,
      });
    } //any error in the function will be sent to the FRONTEND

    //MFA code vefication
    if (action === "verifyMfa") {
      const savedCode = mfaCodes.get(username);

      if (!savedCode) {
        throw new Error("No MFA code found. Please login again.");
      }

      if (Date.now() > savedCode.expiresAt) {
        mfaCodes.delete(username);
        throw new Error("MFA code expired. Please login again.");
      }

      if (savedCode.attempts >= 5) {
        mfaCodes.delete(username);
        throw new Error("Too many incorrect attempts. Please login again.");
      }

      if (savedCode.codeHash !== hashCode(code)) {
        savedCode.attempts += 1;
        throw new Error("Invalid MFA code.");
      }

      mfaCodes.delete(username); // Code is valid, remove it from the map

      logger.info(`MFA verification successful. Username: ${username}`);
      return res
        .status(200)
        .json({ message: "Login successful!", user: username });
    }

    logger.warn(`Invalid auth action received: ${action}`);

    res
      .status(400)
      .json({ error: "Action must be 'login' or 'register' or 'verifyMfa'" });
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

//API Call for description of device model

async function lookupDeviceDescription(deviceModel) {
  if (!deviceModel) {
    return "No device model provided";
  }

  //does a search for the devicemodel and takes 1 result
  const query = `
    SELECT ?item ?itemLabel ?itemDescription WHERE {
      ?item rdfs:label "${deviceModel}"@en.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 1
  `;
  //API URL
  const url =
    "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=" +
    encodeURIComponent(deviceModel) +
    "&language=en&format=json";

  //fetches the data from the API
  const response = await fetch(url);

  const data = await response.json();
  //search to get the description
  const result = data.search?.[0];

  //if it's empty
  if (!result || !result.description) {
    return "No description found";
  }

  return result.description;
}
