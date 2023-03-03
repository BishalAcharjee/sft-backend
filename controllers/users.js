const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/userModel");
// const VerificationToken = require("../models/verificationTokenModel");
const jwt = require("jsonwebtoken");
const path = require("path");

const signUpController = async (req, res) => {
  console.log({ ...req.body });
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 11);
  const user = new User({
    name,
    email,
    password: hashedPassword,
    role,
  });
  user.save((err, user) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const { password, ...rest } = user._doc;
      res.status(200).send({
        status: 200,
        msg: "Signup Successful. Please login to continue!",
        data: {
          ...rest,
        },
      });
    }
  });
};

const loginController = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, "  ", password);
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(401).send({ msg: "Authentication Failed3!" });
    } else {
      const match = await bcrypt.compare(password, user.password);
      console.log(user.email);

      if (match) {
        const payload = {
          name: user.name,
          email: user.email,
          _id: user._id,
        };

        console.log(user.email);
        const accessToken = jwt.sign({ ...payload }, process.env.TOKEN_SECRET, {
          expiresIn: "30d",
        });

        console.log(user.email);
        const { password, ...rest } = user._doc;

        res.status(200).json({
          ...rest,
          accessToken: accessToken,
          msg: "Login Successful!",
          status: 200,
        });
      } else {
        res.status(401).send({ msg: "Authentication Failed!4" });
      }
    }
  } catch (err) {
    res.status(401).send({ msg: "Authentication Failed!5" });
  }
};

const deleteAccountController = (req, res) => {
  const query = { email: req.body?.email };
  User.findOne(query, async (err, data) => {
    console.log(data);
    if (err) {
      res.status(400).json(err);
    } else if (!data) {
      res.status(404).json({
        status: 404,
        message: "User Not Exist!.",
      });
    } else {
      try {
        const match = await bcrypt.compare(req.body?.password, data?.password);

        if (match) {
          User.deleteOne(query, (err, data) => {
            if (err) {
              res.status(400).json(err);
            } else {
              if (data?.deletedCount) {
                res.status(200).json({
                  status: 200,
                  msg: "Delete Successful.",
                  deletedCount: 1,
                });
              } else {
                res.status(424).json({
                  status: 424,
                  msg: "Unsuccessful! User not found.",
                  deletedCount: 0,
                });
              }
            }
          });
        } else {
          res.status(401).json({
            status: 401,
            msg: "Wrong Password.",
            deletedCount: 0,
          });
        }
      } catch (err) {
        res.status(400).json(err);
      }
    }
  });
};

const updateAccountController = (req, res) => {
  const id = req.params.id;
  if (id === req.userID) {
    User.findByIdAndUpdate(
      { _id: id },
      { $set: req.body },
      {
        useFindAndModify: false,
        new: true, // to return the updated document
      },

      (err, user) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send(user);
        }
      }
    );
  } else {
    res.status(401).json({
      status: 401,
      msg: "Access Denied!",
    });
  }
};

module.exports = {
  signUpController,
  deleteAccountController,
  loginController,
  updateAccountController,
};
