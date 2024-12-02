const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  }),
);

app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if a user is logged in and has valid access token.
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"];

    // Verify jwt token
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        // Proceed to the next middleware
        next();
      } else {
        return res.status(403).json({ message: "User is not authenticated" });
      }
    });
  } else {
    res.status(403).json({ message: "User is not logged in" });
  }
});

const PORT = 8080;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
