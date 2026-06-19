const express = require("express");

const upload =
require("../middleware/upload");

const router = express.Router();

router.post(

  "/",

  upload.single("image"),

  (req, res) => {

    res.json({

      image:
      req.file.path,

    });

  }

);

module.exports = router;