const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/register", (req, res) => {
  const userIdFromCookie = req.cookies["user_id"];
  const user = users[userIdFromCookie]
  const templateVars = {
    user
  }
  res.render('user_registration',templateVars);
  })

  app.get("/login", (req, res) => {
    const userIdFromCookie = req.cookies["user_id"];
    const user = users[userIdFromCookie]
    const templateVars = {
      user
    }
    res.render('user_login',templateVars);
    })

 

app.get("/urls", (req, res) => {
  
  const userIdFromCookie = req.cookies["user_id"];
  const user = users[userIdFromCookie]
  const templateVars = {
    user,
    urls: urlDatabase,
  }
  res.render('urls_index', templateVars)
})

app.get("/urls/new", (req, res) => {
  
  
  const userIdFromCookie = req.cookies["user_id"];
  const user = users[userIdFromCookie]

  const templateVars = {
    user
  }
  res.render('urls_new', templateVars)
})

app.get("/urls/:id", (req, res) => {
  const userIdFromCookie = req.cookies["user_id"]
  const id = req.params.id;
  const user = users[userIdFromCookie]
  const templateVars = {
    user,
    id,
    longURL: urlDatabase[req.params.id]
  }
  res.render('urls_show', templateVars)
})

app.get("/url/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
})


////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const id = generateUid();
  const email = req.body.email;
  const password = req.body.password;
  if(!email || !password){
    return res.status(400).send("Please include email and password")
  }
  for(let userfromDB in users){
    if(users[userfromDB].email === email){
  
      return res.status(400).send("User already exists")
    }
  }

 
  const user ={
    id,
    email,
    password
  }
 users[id] = user
console.log(users)
 res.cookie("user_id",id)
 res.redirect(`/urls`)
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  

  for(let userfromDB in users){
    if(users[userfromDB].email !== email){
    return res.status(403).send("user not found")
    } else if(users[userfromDB].password !== password){
      return res.status(403).send("Incorrect password")
    } else {
      res.cookie("user_id",users[userfromDB].id)
     // console.log(users[userfromDB].id)
      return res.redirect("/urls")
    }
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls")
})

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id]
  res.redirect('/urls')
})

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls")
})

app.post("/urls/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls")
})



const generateRandomString = function () {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}
const generateUid =  function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(8).substring(1,5)
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



