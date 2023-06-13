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
  const id = req.params.id;
  id = longURL;
  console.log("longURL:", longURL);
  res.redirect(longURL);
})

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World<b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${newID}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});