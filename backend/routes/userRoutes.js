const express = require("express");
const User = require("../models/User");
const Message = require("../models/Message");

const router = express.Router();
console.log("✅ userRoutes loaded");
/*
==========================
SEARCH USERS
==========================
*/

router.get("/search/:query", async (req, res) => {

  try {

    const users = await User.find({

      username: {

        $regex: req.params.query,

        $options: "i",

      },

    }).select("-password");

    res.json(users);

  }

  catch (err) {

    res.status(500).json({

      message: err.message,

    });

  }

});


/*
==========================
GET USERS + LAST MESSAGE
==========================
*/

router.get("/:username", async (req, res) => {

  try {

    const currentUser = req.params.username;

    const users = await User.find({

      username: {

        $ne: currentUser,

      },

    }).select("-password");

    const usersWithLastMessage = await Promise.all(

      users.map(async (user) => {

        const lastMessage = await Message.findOne({

          $or: [

            {
              sender: currentUser,
              receiver: user.username,
            },

            {
              sender: user.username,
              receiver: currentUser,
            },

          ],

        }).sort({

          createdAt: -1,

        });

        return {

          ...user._doc,

          lastMessage: lastMessage
            ? lastMessage.text
            : "",

          lastMessageTime: lastMessage
            ? lastMessage.createdAt
            : null,

        };

      })

    );

    res.json(usersWithLastMessage);

  }

  catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

});

module.exports = router;