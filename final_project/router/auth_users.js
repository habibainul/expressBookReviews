const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    if ( users.filter(u => u.username === username).length >  0) {
        return false;
    }
    return true;
}

const authenticatedUser = (username,password)=>{ 
    if ( users.filter(u => u.username === username &&
                         u.password === password).length >  0) {
        return true;
    }
    return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password =  req.body.password;
  
    if ( !username || !password ){
        return res.status(400).json(({ errorMessage: "Please provide username and password"}))
    }

    if (authenticatedUser(username, password)) {
          let accessToken = jwt.sign({
              data: password }, 'access', {expiresIn: 60 * 60});
          req.session.authorization = {
              accessToken, username
          } 
          return res.status(200).send("Login Successfull");
    } else {
        return res.status(208).send("failed to Login with user "+ username +" and password *****");
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbnReq = req.params.isbn;
  const bookReq = books[isbnReq];
  console.log("bookReq "+ bookReq)
  if (!req.query.review){
    return res.status(400).json({ errorMessage : " No review provided"})
  }


  if (!bookReq) {
      return res.status(400).json({ errorMessage : "There is no book by isbn "+ isbnReq})
  }
  
  const username = req.session.authorization.username;
  console.log("username "+ username)
  const reviewAlready = Object.keys(bookReq.reviews).includes(username);
  console.log("reviewAlready "+ reviewAlready)
  if (reviewAlready) {
     bookReq.reviews[username].review = req.query.review;
  } else {
    bookReq.reviews[username] = { 
        review: req.query.review };
  }

  return res.send(bookReq);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const book = books[req.params.isbn];
    if (!book) {
        return req.status(404).json({ errorMessage : "book not found for isbn "+ req.params.isbn});
    }
    const username = req.session.authorization.username;
    const reviewAlready = book.reviews[username];
    if (reviewAlready) {
        delete book.reviews[username];
        return res.send(book);
    } else {
        return res.status(404).json({ errorMessage: "no review for user "+ username })
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
