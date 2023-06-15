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
  for (const userID in users) {
    if(users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
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
  const userID = req.cookies["user_id"];
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
    // user: user,
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});


app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render("urls_register", templateVars)
});

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

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"]
  if (userID) {
    return res.redirect("/urls")
  }
  const templateVars = {
    user: null
  }
  res.render("urls_login", templateVars);
});

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

  if (userFound.password !== password) {
    return res.send("Incorrect username or password").status(403);
  }
  res.cookie("user_id", userFound.id);
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
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