const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
 
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render('urls_index', templateVars)
})

app.get("/urls/new", (req, res) => {
  res.render('urls_new')
})

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id , longURL : urlDatabase[req.params.id] }
  res.render('urls_show', templateVars)
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/url/:shortURL", (req, res) => {
  console.log(urlDatabase)
  res.redirect(urlDatabase[req.params.shortURL]);
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req,res) => {
  const id = req.params.id;
  delete urlDatabase[id]
  res.redirect('/urls')
})

app.post("/urls/:id/edit", (req,res) => {
  const id = req.params.id;
  urlDatabase[id] =  req.body.longURL;
  res.redirect(`/urls/${id}`)
})


const generateRandomString =  function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



