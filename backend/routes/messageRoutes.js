const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

/*
=========================
GET CONVERSATION
=========================
*/

router.get("/:sender/:receiver", async (req, res) => {

  const { sender, receiver } = req.params;

  try {

    const messages = await Message.find({

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

    }).sort({

      createdAt: 1,

    });

    res.json(messages);

  }

  catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

});

/*
=========================
DELETE MESSAGE
=========================
*/

router.delete("/:id", async (req, res) => {

  try {

    const message = await Message.findByIdAndUpdate(

      req.params.id,

      {

        deleted: true,

        text: "",

        image: "",

      },

      {

        returnDocument: "after",

      }

    );

    res.json(message);

  }

  catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

});

module.exports = router;