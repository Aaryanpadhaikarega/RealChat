const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const User = require("../models/User");

const router = express.Router();

/*
=========================
MULTER CONFIG
=========================
*/

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, "uploads/");

  },

  filename: function (req, file, cb) {

    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );

  },

});

const upload = multer({
  storage,
});

/*
=========================
REGISTER
=========================
*/

router.post(
  "/register",
  upload.single("avatar"),
  async (req, res) => {

    try {

      const {
        username,
        email,
        password,
      } = req.body;

      const userExists =
        await User.findOne({

          email: email.toLowerCase(),

        });

      if (userExists) {

        return res.status(400).json({

          message: "User already exists",

        });

      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const avatar = req.file
        ? `/uploads/${req.file.filename}`
        : "";

      await User.create({

        username,

        email: email.toLowerCase(),

        password: hashedPassword,

        avatar,

      });

      res.status(201).json({

        message: "Registration Successful",

      });

    }

    catch (error) {

      console.log(error);

      res.status(500).json({

        message: error.message,

      });

    }

  }
);

/*
=========================
LOGIN
=========================
*/

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({

      email: email.toLowerCase(),

    });

    if (!user) {

      return res.status(400).json({

        message: "Invalid Credentials",

      });

    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {

      return res.status(400).json({

        message: "Invalid Credentials",

      });

    }

    const token = jwt.sign(

      {
        id: user._id,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      }

    );

    res.json({

      token,

      user: {

        _id: user._id,

        username: user.username,

        email: user.email,

        avatar: user.avatar,

      },

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      message: error.message,

    });

  }

});

module.exports = router;