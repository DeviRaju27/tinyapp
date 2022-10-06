const express = require("express");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers');
var cookieSession = require('cookie-session')
const app = express();
const PORT = 8080;
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['myKey'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))



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
////fUNCTION TO CHECK EXISTING USER
// const getUserByEmail = (email, database) => {
//   for (const user in database) {
//     const userFromDb = database[user];

//     if (userFromDb.email === email) {
//       return userFromDb;
//     }
//   }
//   return null;
// };

// const ggetUserByEmail = (email, database) => {
//   for (let user in database) {
//     if (database[user].email === email) {
//       return database[user];
//     }
//   }
//   return undefined;
// };
////////Function for short URL
const generateRandomString = function () {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

///////Function for User ID
const generateUid = function () {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(8).substring(1, 5)
}

/////////////Register Route
app.get("/register", (req, res) => {
  const userIdFromCookie = req.session.user_id;
  
  if(userIdFromCookie){
     return res.redirect("/urls")
  }
  const user = users[userIdFromCookie]
  const templateVars = {
    user
  }
  res.render('user_registration', templateVars);

  })
  app.post("/register", (req, res) => {
    const id = generateUid();
    const email = req.body.email;
    const password = bcrypt.hashSync(req.body.password, 10);
    if (!email || !password) {
      return res.status(400).send("Please include email and password")
    }

    const userFromDb = getUserByEmail(email, users);
    if(userFromDb){
      return res.status(400).send("User already exists")
    }
    const user = {
      id,
      email,
      password 
    }
    users[id] = user
  
   
    req.session.user_id = id;
    res.redirect(`/urls`)
  });
///////////////Login Route
app.get("/login", (req, res) => {
  const userIdFromCookie = req.session.user_id;
 if(userIdFromCookie){
  return res.redirect("/urls")
 }
  const user = users[userIdFromCookie]
  const templateVars = {
    user
  }
  res.render('user_login',templateVars);
  })


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
  console.log(userFromDb.password)
  console.log(password)

  //if (userFromDb.password !== password) {
  if (!bcrypt.compareSync(password, userFromDb.password, )) {
    return res.status(400).send('wrong password');
  }
 
  req.session.user_id = userFromDb.id;
  res.redirect("/urls")
  return
})
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/login")
})


/////////URLS Route

app.get("/urls", (req, res) => {
  console.log("user db", users)
  console.log("url db", urlDatabase)
  const userIdFromCookie = req.session.user_id;
  if (userIdFromCookie) {
    const user = users[userIdFromCookie]

    const templateVars = {
    user,
    users,
    urlDatabase
  }
    return res.render('urls_index', templateVars)
  }
  return res.redirect('/login')

})
app.get("/urls/new", (req, res) => {


  const userIdFromCookie = req.session.user_id
  if (userIdFromCookie) {
    const user = users[userIdFromCookie]

    const templateVars = {
      user
    }
    return res.render('urls_new', templateVars)
  }
  return res.redirect('/login')
})

// get page with tiny url data
app.get("/urls/:id", (req, res) => {  
  const userIdFromCookie = req.session.user_id;
  const id = req.params.id;
  const user = users[userIdFromCookie]
  const templateVars = {
    user,
    id,
    longURL: urlDatabase[id].longUrl
  }
  res.render('urls_show', templateVars)
})

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404);
   
    return;
  }
  res.redirect(urlDatabase[req.params.shortURL].longUrl);
})


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userIdFromCookie = req.session.user_id;
  const longUrlFromUser = req.body.longURL

  const newUrl = {
    longUrl: longUrlFromUser,
    userID: userIdFromCookie
  }

  urlDatabase[shortURL] = newUrl;

  res.redirect(`/urls/${shortURL}`);
});
  

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id]
  res.redirect('/urls')
})

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  urlDatabase[id].longUrl = req.body.longURL;
  res.redirect("/urls")
})






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


