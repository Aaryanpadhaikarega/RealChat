const express = require("express");

const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

const router = express.Router();

/*
==========================
SEND FRIEND REQUEST
==========================
*/

router.post("/request", async (req, res) => {

  try {

    const { sender, receiver } = req.body;

    // Cannot add yourself
    if (sender === receiver) {

      return res.status(400).json({
        message: "You cannot add yourself",
      });

    }

    // Check if already friends
    const alreadyFriends = await FriendRequest.findOne({

      status: "accepted",

      $or: [

        {
          sender,
          receiver,
        },

        {
          sender: receiver,
          receiver: sender,
        },

      ],

    });

    if (alreadyFriends) {

      return res.status(400).json({

        message: "Already friends",

      });

    }

    // Check if request already exists
    const existing = await FriendRequest.findOne({

      $or: [

        {
          sender,
          receiver,
        },

        {
          sender: receiver,
          receiver: sender,
        },

      ],

    });

    if (existing) {

      return res.status(400).json({

        message: "Request already exists",

      });

    }

    await FriendRequest.create({

      sender,
      receiver,

    });

    res.json({

      message: "Friend request sent",

    });

  }

  catch (err) {

    res.status(500).json({

      message: err.message,

    });

  }

});


/*
==========================
GET PENDING REQUESTS
==========================
*/

router.get("/requests/:username", async (req, res) => {

  try {

    const requests = await FriendRequest.find({

      receiver: req.params.username,
      status: "pending",

    });

    res.json(requests);

  }

  catch (err) {

    res.status(500).json({

      message: err.message,

    });

  }

});


/*
==========================
ACCEPT REQUEST
==========================
*/

router.post("/accept", async (req, res) => {

  try {

    const { id } = req.body;

    const request = await FriendRequest.findByIdAndUpdate(

      id,

      {
        status: "accepted",
      },

      {
        returnDocument: "after",
      }

    );

    res.json(request);

  }

  catch (err) {

    res.status(500).json({

      message: err.message,

    });

  }

});


/*
==========================
REJECT REQUEST
==========================
*/

router.post("/reject", async (req, res) => {

  try {

    const { id } = req.body;

    await FriendRequest.findByIdAndDelete(id);

    res.json({

      message: "Rejected",

    });

  }

  catch (err) {

    res.status(500).json({

      message: err.message,

    });

  }

});


/*
==========================
GET FRIENDS
==========================
*/

router.get("/:username", async (req, res) => {

  try {

    const username = req.params.username;

    const accepted = await FriendRequest.find({

      status: "accepted",

      $or: [

        {
          sender: username,
        },

        {
          receiver: username,
        },

      ],

    });

    const friendNames = accepted.map((friend) =>

      friend.sender === username

        ? friend.receiver

        : friend.sender

    );

    const friends = await User.find({

      username: {

        $in: friendNames,

      },

    }).select("-password");

    res.json(friends);

  }

  catch (err) {

    res.status(500).json({

      message: err.message,

    });

  }

});

module.exports = router;

