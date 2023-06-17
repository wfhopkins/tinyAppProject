const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {getUserByEmail, generateRandomString, urlsForUser} = require("./helpers");
const app = express();
const PORT = 8080;


// Configuration
app.set("view engine", "ejs");

// Installed middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["ragingCorgi"],
  //Cookie options
  maxAge: 24 * 60 * 60 * 1000 // 24hrs
}));


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

// LANDING PAGE GET
app.get("/", (req,res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// U/:ID GET
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  let longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    return res.send("There is no URL with that id").status(404);
  }
  res.redirect(longURL);
});

// URLs/NEW GET
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  }
  const user = users[userID];
  const templateVars = {
    user,
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

// URLs/:ID GET
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.send("You must be logged in to access URLs").status(403);
  }
  const shortURL = req.params.id;
  const user = users[userID];
  const templateVars = {
    user,
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

// URLs GET
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!userID) {
    return res.send("You must Login or Register to view URLs").status(403);
  } else {
    const userUrls = urlsForUser(userID);
    const templateVars = {
      user,
      urls: userUrls,
    };
    res.render("urls_index", templateVars);
  }
});

// REGISTER GET
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null,
  };
  res.render("urls_register", templateVars);
});

// REGISTER POST
app.post("/register", (req, res) => {
  const userID = Math.random().toString(36).substring(2, 8);
  const email = req.body.email;
  const password = req.body.password;
  const emailFound = getUserByEmail(email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);

  // no email or password
  if (email === "" || password === "") {
    return res.send("Please include an Email and Password.").status(400);
  }
  
  // email in use
  if (emailFound) {
    return res.send("This Email is unavailable").status(400);
  }

  // set session cookie
  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});

// LOGIN GET
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null
  };
  res.render("urls_login", templateVars);
});

// LOGIN POST
app.post("/login", (req, res) => {
  const email = req.body.email;
  const userFound = getUserByEmail(email, users);
  const password = req.body.password;
  
  if (!email || !password) {
    return res.send("Please include an Email and Password.").status(400);
  }
  if (userFound) {
    const loginUser = users[userFound];
    if (bcrypt.compareSync(password, loginUser.password)) {
      req.session.user_id = loginUser.id;
      return res.redirect('/urls');
    } else {
      return res.send("Incorrect Email or Password").status(400);
    }
  } else {
    return res.send("Incorrect Email or Password").status(403);
  }
});

// URLs/:ID/DELETE POST
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.send("You must be logged in to access URLs").status(403);
  }
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.send("The URL does not exist").status(403);
  }
  const myUrls = urlsForUser(userID);
  if (myUrls[shortURL].userID !== userID) {
    return res.send("This URL does not belong to you").status(403);
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// LOGOUT POST
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// URLs/:ID POST
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.send("You must be logged in to access URLs").status(403);
  }
  const shortURL = req.params.id;
  const myUrls = urlsForUser(userID);
  if (myUrls[shortURL].userID !== userID) {
    return res.send("This URL does not belong to you").status(403);
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

// URLs POST
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.send("You must be logged in to shorten URLs").status(403);
  }
  const newShortUrl = generateRandomString();
  let longURL = req.body.longURL;
  if (!longURL.startsWith("http")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[newShortUrl] = {
    longURL: longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${newShortUrl}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});