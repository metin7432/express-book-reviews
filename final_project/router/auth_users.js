const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [

];

const isValid = (username) => {
  //write code to check is the username is valid
  // Filter the users array
  // //returns boolean
  let userwiththesamename = users.filter((user) => user.username === username);
  return userwiththesamename.length > 0;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter(
    (user) => user.username === username && user.password === password,
  );
  return validusers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 },
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  let reviews = books[isbn].reviews;
  let reqReview = req.query.review;
  console.log(reqReview);
  console.log(username);
  console.log(reviews);

  if (!reqReview) {
    return res.status(400).json({ message: "Please provide a review" });
  }
  if (!reviews) {
    reviews = {};
  }
  // Check if the review exists and update the review
  if (reviews[username]) {
    if (reviews[username] === reqReview) {
      return res.json({ message: "Same review Update" });
    }
    reviews[username] = reqReview;
    return res.json({ message: `Review update to ${reqReview}` });
  }

  reviews[username] = reqReview;
  return res.status(201).json({ message: `Review Added to ${reqReview}` });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  let reviews = books[isbn].reviews;

  if (reviews) {
    delete reviews[username];
    return res.json({ message: "review deleted successfully" });
  }

  return res.status(404).json({ message: "review not found" });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
