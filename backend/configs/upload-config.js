"use strict";

const path = require("path");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "upload/");
  },
  filename: function (req, file, callback) {
    let extension = path.extname(file.originalname);
    let basename = path.basename(file.originalname, extension);
    callback(null, basename + "-" + Date.now() + extension);
  },
});

exports.uploadCfg = () => {
  return multer({
    limits: { fieldSize: 25 * 1024 * 1024, fieldSize: 25 * 1024 * 1024 },
    storage,
  });
};
