const winston = require("winston");
require("winston-daily-rotate-file");

const createLogger = winston.createLogger();

const successLogger = createLogger;
successLogger.add(
  new winston.transports.DailyRotateFile({
    name: "access-file",
    level: "info",
    filename: "./logs/access.log",
    json: false,
    datePattern: "yyyy-MM-dd-",
    prepend: true,
  })
);

const errorLogger = createLogger;
errorLogger.add(
  new winston.transports.DailyRotateFile({
    name: "error-file",
    level: "error",
    filename: "./logs/error.log",
    json: false,
    datePattern: "yyyy-MM-dd-",
    prepend: true,
  })
);

module.exports = {
  successLogger,
  errorLogger,
};
