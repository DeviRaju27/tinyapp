const express = require("express");
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser } = require('./helpers');
let cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieSession({
  name: 'session',
  keys: ['myKey'],
  maxAge: 60 * 60 * 1000
}));
const urlDatabase = {
  b2xVn2: {
    longUrl: "http://www.lighthouselabs.ca",
    userID: "4234",
  },
  Bsm5xK: {
    longUrl: "http://www.google.com",
    userID: "4574",
  }
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

const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};
///////Function for User ID
const generateUid = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(8).substring(1, 5);
};
///Any route
app.get("/", (req, res) => {

  //if not logged in
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  res.redirect('/urls');
});
/////////////Register Route
app.get("/register", (req, res) => {
  const userIdFromCookie = req.session.user_id;

  if (userIdFromCookie) {
    return res.redirect("/urls");
  }
  const user = users[userIdFromCookie];
  const templateVars = {
    user
  };
  res.render('user_registration', templateVars);

});
app.post("/register", (req, res) => {
  const id = generateUid();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (!email || !password) {
    return res.status(400).send("Please include email and password");
  }
  const userFromDb = getUserByEmail(email, users);
  if (userFromDb) {
    return res.status(400).send("User already exists");
  }
  const user = {
    id,
    email,
    password
  };
  users[id] = user;
  req.session.user_id = id;
  res.redirect(`/urls`);
});
///////////////Login Route
app.get("/login", (req, res) => {
  const userIdFromCookie = req.session.user_id;
  if (userIdFromCookie) {
    return res.redirect("/urls");
  }
  const user = users[userIdFromCookie];
  const templateVars = {
    user
  };
  res.render('user_login', templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('please include email AND password');
  }
  const userFromDb = getUserByEmail(email, users);
  if (!userFromDb) {
    return res.status(400).send('no user with that email found');
  }
  if (!bcrypt.compareSync(password, userFromDb.password,)) {
    return res.status(400).send('wrong password');
  }
  req.session.user_id = userFromDb.id;
  res.redirect("/urls");
  return;
});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


/////////URLS Route
app.get("/urls", (req, res) => {

  const userIdFromCookie = req.session.user_id;
  const urlsDbForUser = urlsForUser(userIdFromCookie, urlDatabase);
  if (userIdFromCookie) {
    const user = users[userIdFromCookie];
    const templateVars = {
      user,
      users,
      urlsDbForUser
    };
    return res.render('urls_index', templateVars);
  }
  return res.redirect('/login');
});

app.get("/urls/new", (req, res) => {
  const userIdFromCookie = req.session.user_id;
  if (userIdFromCookie) {
    const user = users[userIdFromCookie];

    const templateVars = {
      user
    };
    return res.render('urls_new', templateVars);
  }
  return res.redirect('/login');
});

// Route for short URL page
app.get("/urls/:id", (req, res) => {
  const userIdFromCookie = req.session.user_id;
  const id = req.params.id;
  const user = users[userIdFromCookie];
  if (!userIdFromCookie) {
    return res.status(404).send("please login to access this page");
  }
  if (!urlDatabase[id]) {
    return res.status(404).send("Invalid short URL");
  }
  const urlsDbForUser = urlsForUser(userIdFromCookie, urlDatabase);
  if (urlsDbForUser[id] === undefined) {
    return res.status(404).send("you don't have permission to access this page");
  }
  const templateVars = {
    user,
    id,
    longURL: urlsDbForUser[id].longUrl
  };
  res.render('urls_show', templateVars);
});

// Route to redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404);
  }
  res.redirect(urlDatabase[req.params.shortURL].longUrl);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userIdFromCookie = req.session.user_id;
  const longUrlFromUser = req.body.longURL;

  const newUrl = {
    longUrl: longUrlFromUser,
    userID: userIdFromCookie
  };
  urlDatabase[shortURL] = newUrl;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userIdFromCookie = req.session.user_id;
  if (!userIdFromCookie) {
    return res.status(404).send("please login to access this page");
  }
  if (!urlDatabase[id]) {
    return res.status(404).send("Invalid short URL");
  }
  const urlsDbForUser = urlsForUser(userIdFromCookie, urlDatabase);
  if (urlsDbForUser[id] === undefined) {
    return res.status(404).send("you don't have permission to access this page");
  }
  urlDatabase[id].longUrl = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userIdFromCookie = req.session.user_id;
  if (!userIdFromCookie) {
    return res.status(404).send("please login to access this page");
  }
  if (!urlDatabase[id]) {
    return res.status(404).send("Invalid short URL");
  }
  const urlsDbForUser = urlsForUser(userIdFromCookie, urlDatabase);
  if (urlsDbForUser[id] === undefined) {
    return res.status(404).send("you don't have permission to access this page");
  }
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


