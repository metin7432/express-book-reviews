const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  return userswithsamename.length > 0;
};

function getBooks() {
  return new Promise((resolve, reject) => resolve(books));
}

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const bks = await getBooks();
    res.send(JSON.stringify(bks, null, 4));
  } catch (e) {
    console.error(e);
    res.json({ message: e });
  }
});

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "unable to register user" });
});

function getBookByIsbn(isbn) {
  return new Promise((resolve, reject) => {
    if (isbn > 0 && isbn < 11) {
      let foundBook = books[isbn];
      resolve(books[isbn]);
      return res.send(JSON.stringify({ foundBook }, null, 4));
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });
}
// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  // isbn variable req
  const isbn = parseInt(req.params.isbn);

  getBookByIsbn(isbn).then(
    (result) => res.send(JSON.stringify(result, null, 4)),
    (error) => res.status(error.status).json({ message: error.message }),
  );
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  let author = req.params.author.toLowerCase();

  getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) =>
      books.filter(
        (book) =>
          book.author.toLowerCase() === author ||
          book.author.toLowerCase().includes(author),
      ),
    )
    .then((authorFound) => res.send(JSON.stringify(authorFound, null, 4)));
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let title = req.params.title.toLowerCase();

  getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) =>
      books.filter(
        (book) =>
          book.title.toLowerCase() === title ||
          book.title.toLowerCase().includes(title),
      ),
    )
    .then((titleFound) => res.send(JSON.stringify(titleFound, null, 4)));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  // isbn variable req
  const isbn = parseInt(req.params.isbn);

  getBookByIsbn(isbn).then(
    (result) => res.send(JSON.stringify(result.reviews, null, 4)),
    (error) => res.status(error.status).json({ message: error.message }),
  );
});

module.exports.general = public_users;
