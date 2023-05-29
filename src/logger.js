import winston from "winston";
import util from "util";

const {
  format,
  createLogger,
  transports,
  config: {
    npm: { levels },
  },
} = winston;

// Custom formatter to replicate console.log behaviour
const combineMessageAndSplat = () => {
  return {
    transform: (info) => {
      //combine message and args if any
      info.message = util.format(
        info.message,
        ...(info[Symbol.for("splat")] || [])
      );
      return info;
    },
  };
};

/******* Define Transports *******/
/**
 * Default Winston Logging Levels -
 * (Lower value has higher priority)
 *   error: 0
 *   warn: 1
 *   info: 2
 *   http: 3
 *   verbose: 4
 *   debug: 5
 *   silly: 6
 */

// The console transport logs EVERYTHING! Ideal for local development conditions.
const consoleTransport = new transports.Console({
  // log data if it's level is higher or equal to this level
  level: "silly",
  // handle exceptions thrown in the transports
  handleExceptions: true,
  // output logs in json format
  json: true,
  // format the output
  format: format.combine(
    // include stack trace if available
    format.errors({ stack: true }),
    // format errors just like console.log
    combineMessageAndSplat(),
    // include timestamp in the output
    format.timestamp({ format: "HH:mm:ss.SSS" }),
    // colorize the output based on log level
    format.colorize(),
    // format the final output as a string with format: timestamp level: message stack-trace (if available)
    format.printf(
      ({ level, message, timestamp, stack }) =>
        `${timestamp} ${level}: ${message} ${stack || ""}`
    )
  ),
});

// The file transport logs all debug level or higher data.
// Ideal for production logging and integrating with APM & Monitering tools
const fileTransport = new transports.File({
  level: "debug",
  // the file to log to
  filename: "./logs/app.log",
  handleExceptions: true,
  json: true,
  colorize: false,
});

// Create the logger
const logger = createLogger({
  // use  the default npm log levels provided by winston
  levels: levels,
  // add a default meta data to all logs, this is useful if you have multiple apps logging to the same file
  defaultMeta: {
    environment: process.env.NODE_ENV || "local",
  },
  // use the defined transports
  transports: [fileTransport, consoleTransport],
  // Define a format to log the data. If the transports don't have a format defined, this format will be used.
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    // use a json formatter to pretty print json messages
    format.json({ space: 2, replacer: null }),
    format.prettyPrint()
  ),
});

export default logger;
