const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

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
const findUserByEmail = (email) => {
  for (const userId in users) {
    const userFromDb = users[userId];

    if (userFromDb.email === email) {
      // we found our user!!
      return userFromDb;
    }
  }

  return null;
};
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
  const userIdFromCookie = req.cookies["user_id"];
  
  if(userIdFromCookie){
     return res.redirect("/urls")
  }
  const user = users[userIdFromCookie]
  const templateVars = {
    user
  }
  res.render('user_registration', templateVars);

  })

  app.get("/login", (req, res) => {
    const userIdFromCookie = req.cookies["user_id"];
   if(userIdFromCookie){
    return res.redirect("/urls")
   }
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
app.post("/register", (req, res) => {
  const id = generateUid();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Please include email and password")
  }
  for (let userfromDB in users) {
    if (users[userfromDB].email === email) {


      return res.status(400).send("User already exists")
    }
  }
  const user = {
    id,
    email,
    password
  }
  users[id] = user

  res.cookie("user_id", id)
  res.redirect(`/urls`)
});
///////////////Login Route

app.get("/urls/new", (req, res) => {
  
  const userIdFromCookie = req.cookies["user_id"];

  if(!userIdFromCookie){
  return res.redirect("/login")
  }

  const user = users[userIdFromCookie]
  const templateVars = {
    user
  }
  res.render('user_login', templateVars);
})
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('please include email AND password');
  }
  const userFromDb = findUserByEmail(email);

  if (!userFromDb) {
    return res.status(400).send('no user with that email found');
  }
  if (userFromDb.password !== password) {
    return res.status(400).send('wrong password');
  }
  res.cookie("user_id", userFromDb.id)
  res.redirect("/urls")
  return
})
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/login")
})


/////////URLS Route

app.get("/urls", (req, res) => {
  console.log("user db", users)
  console.log("url db", urlDatabase)
  const userIdFromCookie = req.cookies["user_id"];
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


  // const userIdFromCookie = req.cookies["user_id"];
  // const user = users[userIdFromCookie]
  // const templateVars = {
  //   user,
  //   users,
  //   urlDatabase
  // }
  // if (!userIdFromCookie) {
  //   res.statusCode = 401;
  // }
  
  // res.render('urls_index', templateVars)

})
app.get("/urls/new", (req, res) => {


  const userIdFromCookie = req.cookies["user_id"];
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
  const userIdFromCookie = req.cookies["user_id"]
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
 
  const id = req.params.id; //12
 if(!userIdFromCookie){
  return res.redirect("/login") 
 }
  for(const url in urlDatabase){
   if(url === id){
    const userIdFromCookie = req.cookies["user_id"];
    const user = users[userIdFromCookie]
    const templateVars = {
      user,
      id,
      longURL: urlDatabase[url]
    }
    return res.render('urls_show', templateVars)
   } 
  } 
  return res.status(401).send("not a valid url")
})
// redirect to long url

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userIdFromCookie = req.cookies["user_id"];
  const longUrlFromUser = req.body.longURL

  const newUrl = {
    longUrl: longUrlFromUser,
    userID: userIdFromCookie
  }

  urlDatabase[shortURL] = newUrl;

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
      return res.redirect("/urls")
    }
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/login")
})


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


app.post("/urls/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls")
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


