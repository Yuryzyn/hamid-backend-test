const multer = require("multer");
const dotenv = require("dotenv");

var fotobarang = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./fotoBarang");
  },
  filename: function (req, file, cb) {
    let filename = "barang-" + Date.now() + ".jpg";

    if (!req.body.foto) {
      req.body.foto = process.env.SERVER2 + "/fotoBarang/" + filename;
      // req.body.foto = "http://localhost:9000/fotoBarang/" + filename;
    }

    cb(null, filename);
  },
});

var upload = multer({ storage : fotobarang });

module.exports = { upload };