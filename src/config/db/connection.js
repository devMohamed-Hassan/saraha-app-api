import mongoose from "mongoose";
import chalk from "chalk";

const dbConnection = async () => {
  await mongoose
    .connect(process.env.ATLAS_URI)
    .then(() => {
      console.log(chalk.green.bold("✓ Database Connected Successfully"));
    })
    .catch(() => {
      console.error(chalk.red.bold("✗ Database Connection Failed: "));
    });
};

export default dbConnection;
