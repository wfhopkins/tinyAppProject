const bcrypt = require("bcryptjs");

// DATABASE FOR URLs
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userID2",
  },
};

// REGISTERED USERS
const users = {
  userID: {
    id: "userID",
    email: "a@a.com",
    password: bcrypt.hashSync("1234", 10),
  },
  user2ID: {
    id: "user2ID",
    email: "b@b.com",
    password: bcrypt.hashSync("5678", 10),
  },
};


module.exports = { urlDatabase, users };