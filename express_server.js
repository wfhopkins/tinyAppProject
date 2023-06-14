const express = require("express");
const app = express();
const PORT = 8080;

function generateRandomString() {
  let newID = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength = characters.length;
  for (let i = 0; i < 6; i++){
    newID += characters.charAt(Math.floor(Math.random() * charsLength));
  }
  return newID;
};

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req,res) => {
  res.send("Hello!");
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  let longURL = urlDatabase[shortURL]
  console.log("urlDatabase", urlDatabase);
  res.redirect(longURL);
})

app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],  
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
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

app.post("/login", (req, res) => {
  console.log("req.params" ,req.params)
  console.log("req.body", req.body)
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls")
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls")
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls")
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