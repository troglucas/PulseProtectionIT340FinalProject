const winston = require("winston"); /*Used for logs*/

const logger = winston.createLogger({
  /*Creates this formatt info
   timestamp, info, message*/
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    }),
  ),
  transports: [
    /*Writes to central.log and outputs it live on console*/
    new winston.transports.File({ filename: "central.log" }),
    new winston.transports.Console(),
  ],
});

module.exports = logger;
