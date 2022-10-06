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
//users[user].id === urlDatabase[url].userID
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
app.get("/register", (req, res) => {
  const userIdFromCookie = req.cookies["user_id"];
  const user = users[userIdFromCookie]
  const templateVars = {
    user
  }
  res.render('user_registration', templateVars);
})

app.get("/login", (req, res) => {
  const userIdFromCookie = req.cookies["user_id"];
  const user = users[userIdFromCookie]
  const templateVars = {
    user
  }
  res.render('user_login', templateVars);
})


app.get("/urls", (req, res) => {

  const userIdFromCookie = req.cookies["user_id"];
  const user = users[userIdFromCookie]
  const templateVars = {
    user,
    users,
    urlDatabase
  }

  if(!userIdFromCookie){
    res.statusCode = 401;
  }

  console.log("user db",users)
  console.log("url db",urlDatabase)
   res.render('urls_index', templateVars)
 
})
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('please include email AND password');
  }
  const userFromDb = findUserByEmail(email);
  //console.log("user from db id",userFromDb.password)
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

app.get("/urls/new", (req, res) => {


  const userIdFromCookie = req.cookies["user_id"];
  if(userIdFromCookie){
    const user = users[userIdFromCookie]

    const templateVars = {
      user
    }
    return res.render('urls_new', templateVars)
  }
 return res.redirect('/login')
})

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

  const id = req.params.shortURL;
   return  res.redirect(urlDatabase[id].longUrl)
})


////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userIdFromCookie = req.cookies["user_id"];
  const longUrlFromUser = req.body.longURL

  const newUrl = {
  longUrl : longUrlFromUser,
  userID : userIdFromCookie
  }

   urlDatabase[shortURL] = newUrl;

  res.redirect(`/urls/${shortURL}`);
});

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

// app.post("/login", (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;


// //console.log(email)

//   for (const userfromDB in users) {
//     console.log("inside for loop" ,users[userfromDB].email , email)
//     if (users[userfromDB].email === email) {
//       res.cookie("user_id", users[userfromDB].id)
//       res.render("/urls")
//       return
//     } 
//     else {
//         res.status(403).send("user not found")
//     }

//     //   if(users[userfromDB].password !== password) {
//     //    return res.status(403).send("Incorrect password") 
//     // } 
      
    
//   }
  
// })

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



const generateRandomString = function () {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}
const generateUid = function () {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(8).substring(1, 5)
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



