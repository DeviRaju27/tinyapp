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
  //const templateVars = { id: req.params.id , longURL : urlDatabase['id'] }
  res.render('urls_new')
})

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id , longURL : urlDatabase[req.params.id] }
  res.render('urls_show', templateVars)
})

// app.get("/urls/:shortURL", (req, res) => { 
//   res.redirect(urlDatabase[req.params.shortURL].longURL)
// })

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/url/:shortURL", (req, res) => {
  console.log(urlDatabase)
  res.redirect(urlDatabase[req.params.shortURL]);
  //res.send("okay")
})

app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


const generateRandomString =  function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



