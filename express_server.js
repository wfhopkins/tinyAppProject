const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

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

app.use(cookieParser());
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// Search users by email function 
  function getUserByEmail(email) {
  let emailFound = false;
  for (const user in users) {
    if(users[user].email === email) {
      emailFound = true;
      break;
    }
  }
  return emailFound;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get("/", (req,res) => {
  res.send("Hello!");
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  console.log("urlDatabase", urlDatabase);
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  console.log("templateVars:", templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  console.log("urlDatabase[req.params.id]: ", urlDatabase[req.params.id]);
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World<b></body></html>\n");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: null,
    email: req.body.email,
    password: req.body.password
  };
  res.render("urls_register", templateVars)
});

app.post("/register", (req, res) => {
  const userID = Math.random().toString(36).substring(2, 8);
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400);
    res.send("Please include an Email and Password.");
    return;
  }
  
  const emailFound = getUserByEmail(email);

  if (emailFound) {
    res.status(400);
    res.send("This email is already in use");
    return;
  }
  const newUser = {
    id: userID,
    email: email,
    password: password
} 
  users[userID] = newUser;
  res.cookie("user_id", userID);
  console.log("Users: ", users);
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const newID = generateRandomString();
  let longURL = req.body.longURL;
  if (!longURL.startsWith("http")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[newID] = longURL;
  res.redirect(`/urls/${newID}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});