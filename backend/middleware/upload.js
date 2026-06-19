const multer = require("multer");

const cloudinary =
require("../config/cloudinary");

const {
  CloudinaryStorage,
} = require(
  "multer-storage-cloudinary"
);

const storage =
new CloudinaryStorage({

  cloudinary,

  params: {

    folder: "ChatSphere",

    allowed_formats: [
      "jpg",
      "png",
      "jpeg",
      "gif",
      "webp",
    ],

  },

});

module.exports =
multer({
  storage,
});