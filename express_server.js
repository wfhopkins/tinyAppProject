const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const getUserByEmail = require("./helpers")
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


//return the urls associated with a user id
function urlsForUser(userID) {
  const userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}

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
    password: "1234",
  },
  user2ID: {
    id: "user2ID",
    email: "b@b.com",
    password: "5678",
  },
};

// LANDING PAGE GET
app.get("/", (req,res) => {
  const userID = req.session.user_id
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});

// U/:ID GET
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  let longURL = urlDatabase[shortURL].longURL
  if (!longURL) {
    return res.send("There is no URL with that id").status(404);
  } 
  res.redirect(longURL);
});

// URLs/NEW GET
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id
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
  const userID = req.session.user_id
  if (!userID) {
    return res.send("You must be logged in to access URLs").status(403);
    }

  const shortURL = req.params.id
  const user = users[userID];

  // if (!urlDatabase[shortURL]) {
  //   return res.send("URL does not exist").status(404);
  // }
  // const userUrls = urlsForUser(userID)
  // if (userUrls !== userID) {
  //   return res.send("You do not own this URL").status(403);
  // }
  const templateVars = {
    user,
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

// URLs GET
app.get("/urls", (req, res) => {
  const userID = req.session.user_id
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
  const userID= req.session.user_id
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null,
  };
  res.render("urls_register", templateVars)
});

// REGISTER POST
app.post("/register", (req, res) => {
  const userID = Math.random().toString(36).substring(2, 8);
  const email = req.body.email;
  const password = req.body.password;
  const emailFound = getUserByEmail();
  const hashedPassword = bcrypt.hashSync(password, 10)

  // no email or password
  if (email === "" || password === "") {
    return res.send("Please include an Email and Password.").status(400);
  }
  
  // email in use
  if (emailFound) {
    return res.send("This email is already in use").status(400);
  }

  // set session cookie
  users[userID] = {
    id: userID,
    email: email, 
    password: hashedPassword
  }
  req.session.user_id = userID;
  res.redirect("/urls");
});

// LOGIN GET
app.get("/login", (req, res) => {
  const userID = req.session.user_id
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null
  }
  res.render("urls_login", templateVars);
});

// LOGIN POST
app.post("/login", (req, res) => {
  const email = req.body.email;
  const userFound = getUserByEmail();
  const password = req.body.password;
  
  if (!email || !password) {
    return res.send("Please include an Email and Password.").status(400);
  }
  const loginUser = users[userFound];
  if (loginUser) {
    if (bcrypt.compareSync(password, loginUser.password)) {
      req.session.user_id = loginUser.id;
      return res.redirect('/urls');
    } else {
     return res.send("Passwords do not match").status(400);
    }
  } else {
    return res.send("No user with that email").status(403);
    }
  });

// URLs/:ID/DELETE POST
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id
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

// URLs/:ID/EDIT POST
app.post("/urls/:id/edit", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.send("You must be logged in to access URLs").status(403);
    return;
  }
  const shortURL = req.params.id;
  const myUrls = urlsForUser(userID);
  if (myUrls[shortURL].userID !== userID) {
    res.send("This URL does not belong to you").status(403);
    return;
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
  }
  res.redirect(`/urls/${newShortUrl}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});