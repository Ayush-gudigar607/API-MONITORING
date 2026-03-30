import winston from "winston"
import config from './index.js'

/**
 * winston logger congiogaration
 * Provides logging
 */

const logger=winston.createLogger({
    level:config.node_env =="production" ? 'info':'debug',
    format:winston.format.combine(
        winston.format.timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
        winston.format.errors({stack:true}),
        winston.format.splat(), //for string interpolation like logger.info("User %s logged in",username)
        winston.format.json() //logs in json format with timestamp, level, message and stack trace
    ),

    defaultMeta:{service:"api-monitoring"}, //default meta data for all logs like service name, version etc
    transports:[
        new winston.transports.File({filename:'logs/err.log',level:"error"}), //error logs added here
        new winston.transports.File({filename:'logs/combine.log'}) //without error logs are added here 
    ]
})

if(config.node_env !== 'production')
{
    //if not production print in the console if it is error add in red color (colorize) and print it in simple formate like debug:log or error:log
    logger.add(new winston.transports.Console({
        format:winston.format.combine(
            winston.format.colorize(), //colorize the log level (error in red, info in green etc)
            winston.format.simple() //print in simple format like debug:log or error:log without timestamp and stack trace (for development purpose only
        )
    }))
}



export default logger


// production code

// import winston from "winston";
// import fs from "fs";
// import path from "path";
// import config from "./index.js";

// // Ensure logs directory exists
// const logDir = "logs";
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir);
// }

// /**
//  * Custom log format for console (dev)
//  */
// const consoleFormat = winston.format.combine(
//   winston.format.colorize(),
//   winston.format.timestamp({ format: "HH:mm:ss" }),
//   winston.format.printf(({ timestamp, level, message, stack }) => {
//     return `${timestamp} ${level}: ${stack || message}`;
//   })
// );

// /**
//  * File format (production)
//  */
// const fileFormat = winston.format.combine(
//   winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
//   winston.format.errors({ stack: true }),
//   winston.format.splat(),
//   winston.format.json()
// );

// /**
//  * Create logger
//  */
// const logger = winston.createLogger({
//   level: config.node_env === "production" ? "info" : "debug",

//   defaultMeta: {
//     service: "api-monitoring",
//   },

//   format: fileFormat,

//   transports: [
//     // Error logs
//     new winston.transports.File({
//       filename: path.join(logDir, "error.log"),
//       level: "error",
//       handleExceptions: true,
//       maxsize: 5 * 1024 * 1024, // 5MB
//       maxFiles: 5,
//     }),

//     // All logs
//     new winston.transports.File({
//       filename: path.join(logDir, "combined.log"),
//       handleExceptions: true,
//       maxsize: 5 * 1024 * 1024,
//       maxFiles: 5,
//     }),
//   ],

//   // Catch unhandled exceptions
//   exceptionHandlers: [
//     new winston.transports.File({
//       filename: path.join(logDir, "exceptions.log"),
//     }),
//   ],

//   // Catch unhandled promise rejections
//   rejectionHandlers: [
//     new winston.transports.File({
//       filename: path.join(logDir, "rejections.log"),
//     }),
//   ],

//   exitOnError: false, // Do not crash on handled exceptions
// });

// /**
//  * Add console logging in development
//  */
// if (config.node_env !== "production") {
//   logger.add(
//     new winston.transports.Console({
//       format: consoleFormat,
//     })
//   );
// }

// export default logger;