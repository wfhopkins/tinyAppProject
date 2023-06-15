const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;

//Function used to generate unique 6 char userID
function generateRandomString() {
  // method to create a random alphanum from lowercase + nums from index 2 - <5
  // const id = Math.random().toString(36).substring(2, 5);
  let newID = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength = characters.length;
  for (let i = 0; i < 6; i++) {
    newID += characters.charAt(Math.floor(Math.random() * charsLength));
  }
  return newID;
}
// Configuration
app.set("view engine", "ejs");

// Installed middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["chicken"],
  //Cookie options
  maxAge: 24 * 60 * 60 * 1000 // 24hrs
}));


// Search users by email function 
function getUserByEmail(email) {
  for (const userID in users) {
    if(users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
}

// Databases for short + long URLS
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user_id",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user_id",
  },
};

// Database of registered users
const users = {
  userID: {
    id: "userID",
    email: "a@a.com",
    password: "1234",
  },
  user2ID: {
    id: "user2ID",
    email: "b@b.com",
    password: "5678",
  },
};

// GET request for landing page
app.get("/", (req,res) => {
  const userID = req.cookies["user_id"];
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});

// GET request for entering a shortURL in the search and redirecting to long
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  let longURL = urlDatabase[shortURL].longURL
  if (!longURL) {
    return res.send("There is no URL with that id").status(404);
  } 
  res.redirect(longURL);
});

// GET request for Create new URL page
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.redirect("/login");
  }
  const user = users[userID];
  const templateVars = {
    user,
    // user: user,
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

// GET request for passing a short url and directing to the edit page
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[userID].longURL,
  };
  res.render("urls_show", templateVars);
});

// GET request for urls home page
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//GET request for Register
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null,
  };
  res.render("urls_register", templateVars)
});

// POST request for Register
app.post("/register", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    return res.send("Please include an Email and Password.").status(400);
  }
  
  const emailFound = getUserByEmail(email); //function code at top of page
  if (emailFound) {
    return res.send("This email is already in use").status(400);
  }
  const userID = Math.random().toString(36).substring(2, 8);
  // Added Salt and Hashing for PW
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt)
  const newUser = {
    id: userID,
    email: email,
    password: hashedPassword
} 
  users[userID] = newUser;
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// GET request for Login
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null
  }
  res.render("urls_login", templateVars);
});

// POST request for Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.send("Please include an Email and Password.").status(400); 
  }
  const userFound = getUserByEmail(email); //function code at top of page
  if (!userFound) {
    return res.send("No user with that email").status(403);
  }

  if (!bcrypt.compareSync(password, userFound.password)) {
    return res.send("Passwords do not match").status(400);
  }

  // if (userFound.password !== password) {
  //   return res.send("Incorrect username or password").status(403);
  // }

  // res.cookie("user_id", userFound.id);
  req.session.user_id = userFound.id;
  res.redirect("/urls");
});

// POST request for deleting a url from the database
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// POST request for Loging out and clearing cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  // req.session = null;
  res.redirect("/login");
});

// POST request for editing the long url assoicated with a short one
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[id].longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

// POST request to create and return a new key/valuie pair of short/longurl
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.send("You must be logged in to shorten URLs").status(403);
  }
  const newID = generateRandomString();
  let longURL = req.body.longURL;
  if (!longURL.startsWith("http")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[newID].longURL = longURL;
  console.log("urlDatabase", urlDatabase);
  res.redirect(`/urls/${newID}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});