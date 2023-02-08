const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password =  req.body.password;

  if ( !username || !password ){
      return res.status(400).json(({ errorMessage: "Please provide username and password"}))
  }

  if (isValid(username)) {
      console.log("User Validated, registering the user")
      users.push({username,password});
      return res.send("registeration successfull, Please login with "+ username);
  } 
   return res.status(400).json({ errorMessage: "User already exists, try another username" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    getAllBooksPromise()
    .then(books => { return res.send(books)})
    .catch(error => {return res.status(404).json({errorMessage : "Failed to get all books due to "+error})});
});


function getAllBooksPromise() {
    return new Promise((resv) =>{
        resv(JSON.stringify(books, null, 4))
    });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    getBookByIsbnPromise(isbn)
    .then( book => res.send(book))
    .catch(error => res.status(404).json({ errorMessage : error}))
});

function getBookByIsbnPromise(isbn) {
    return new Promise((resolve, reject) =>{
        const book = books[isbn];
        if (book) {
            resolve(book);
        }else {
            reject("unable to find book for "+ isbn);
        }
    });
}
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const wribookAuthor = req.params.author;
    allBooksByAuthorAsync(wribookAuthor)
    .then(booklist => {
       return res.send(booklist);
    })
    .catch(err => {
        return res.status(404).json({errorMessage: err});
    });
});

function allBooksByAuthorAsync(author) {
    return new Promise((resolve, reject) => {
        const bookList = Object.values(books).filter(bok => bok.author == author);
        if (bookList.length > 0) {
            resolve(bookList);
        }else {
            reject("Book for "+author+" do not exist");
        }
    });
}

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const reqTitle = req.params.title;
    allBooksByTitleAsync(reqTitle)
    .then(booklist => {
       return res.send(booklist);
    })
    .catch(err => {
        return res.status(404).json({errorMessage: err});
    });
});

function allBooksByTitleAsync(title) {
    return new Promise((resolve, reject) => {
        const bookList = Object.values(books).filter(bok => bok.title == title);
        if (bookList.length > 0) {
            resolve(bookList);
        }else {
            reject("Book by title "+title+" do not exist");
        }
    });
}

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.send(book.reviews);
    } 
    return res.status(404).message("Unable to find any books");
});

module.exports.general = public_users;
