const multer = require("multer");
const dotenv = require("dotenv");

var fotoBarang = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "fotoBarang");
  },
  filename: function (req, file, cb) {
    let filename = "barang-" + Date.now() + ".jpg";

    if (!req.body.foto) {
      req.body.foto = process.env.SERVER + "/fotobarang/" + filename;
    }

    cb(null, filename);
  },
});

var upload = multer({ storage : fotoBarang });

module.exports = { upload };