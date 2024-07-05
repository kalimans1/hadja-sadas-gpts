// @ts-check

const chalk = require("chalk");

/**
 * @param {unknown[]} authLog
 */
const log = (...authLog) => {
  console.log(...[`[${chalk.green("+")}]`, ...authLog]);
};

/**
 * @param {unknown[]} authLog
 */
const warn = (...authLog) => {
  console.log(...[`[${chalk.red("-")}]`, ...authLog]);
};

/**
 * @param {unknown[]} authLog
 */
const error = (...authLog) => {
  console.log(...[`[${chalk.red("!")}]`, ...authLog]);
};

module.exports = {
  log,
  warn,
  error,
};
