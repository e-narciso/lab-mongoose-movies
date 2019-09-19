const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/signup", (req, res, next) => {
  res.render("user-views/signup");
});

router.post("/signup", (req, res, next) => {
  let adminPrivilege = false;

  if (req.user) {
    // check if someone is logged in
    if (req.user.isAdmin) {
      adminPrivilege = req.body.role ? req.body.role : false;
    }
  }

  const username = req.body.theUsername;
  const password = req.body.thePassword;

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  User.create({
    username: username,
    password: hash,
    isAdmin: adminPrivilege
  })
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      next(err);
    });
});

router.get("/login", (req, res, next) => {
  res.render("user-views/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

router.post("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

router.get("/secret", (req, res, next) => {
  if (req.user) {
    res.render("user-views/secret", { user: req.user });
  } else {
    res.redirect("/");
  }
});

router.get("/account", (req, res, next) => {
  res.render("user-views/profile");
});

router.post("/user/update/:id", (req, res, next) => {
  if (!req.user) {
    req.flash("error", "Please login to your account");
    res.redirect("/login");
  }
  let id = req.user.id;

  let oldPass = req.body.theOldPassword;
  let newPass = req.body.theNewPassword;

  if (!bcrypt.compareSync(oldPass, user.password)) {
    req.flash("error", "Passwords do not match");
    res.redirect("/account");
  } else if (oldPass === "" && newPass === "") {
    req.user.password = req.user.password;
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPass, salt);

  User.findByIdAndUpdate(id, {
    username: req.body.theUsername,
    password: hash,
    image: req.body.theImage
  })
    .then(result => {
      res.redirect("/account");
    })
    .catch(err => {
      next(err);
    });
});

router.post("/account/delete-my-account", (req, res, next) => {
  User.findByIdAndRemove(req.user._id)
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
