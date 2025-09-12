import dotenv from "dotenv";
dotenv.config();

import { welcome } from "./utils/welcome.js";
import authRouter from "./modules/authModule/auth.controller.js";
import userRouter from "./modules/userModule/user.controller.js";
import messageRouter from "./modules/messageModule/message.controller.js";
import dbConnection from "./config/db/connection.js";

import cors from "cors";
import chalk from "chalk";
import morgan from "morgan";

const bootstrap = async (app, express) => {
  const PORT = process.env.PORT || 5000;
  app.use(express.json());
  app.use(cors());

  // Error handler for invalid JSON
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({
        errMsg: "Invalid JSON format",
        status: 400,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    }
    next(err);
  });

  // Morgan
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  app.use(
    morgan((tokens, req, res) => {
      const status = tokens.status(req, res);
      const statusColor =
        status >= 500
          ? chalk.red
          : status >= 400
          ? chalk.yellow
          : status >= 300
          ? chalk.cyan
          : chalk.green;

      return [
        chalk.cyan(tokens.method(req, res)),
        chalk.yellow(tokens.url(req, res)),
        statusColor(status),
        chalk.magenta(tokens["response-time"](req, res) + " ms"),
        chalk.gray(tokens.res(req, res, "content-length") || "0") + " bytes",
      ].join(" ");
    })
  );

  await dbConnection();

  // Routes
  app.get("/", welcome);
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);
  app.use("/public/uploads", express.static("./public/uploads"));

  // Global error handler middleware
  app.use((err, req, res, next) => {
    let statusCode = err.cause || err.statusCode || 500;
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      statusCode = 401;
    }
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      errMsg: err.message || "Something went wrong",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  app.listen(PORT, () => {
    console.log(
      chalk.green.bold("✓ Server running") +
        " on " +
        chalk.cyan.underline(
          `${process.env.HOST || "http://localhost"}:${PORT}`
        )
    );
  });
};

export default bootstrap;
