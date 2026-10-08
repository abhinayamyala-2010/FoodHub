const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync("./foodhub.db");

console.log("SQLite Database Connected!");

module.exports = db;
