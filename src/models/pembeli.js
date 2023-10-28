const mongoose = require("mongoose");

const PembeliSchema = new mongoose.Schema({

    nama : {
        type : String,
        require : [true,"Nama pembeli harus di isi!"],

    },
    tlpn : {
        type : String,
        require : [true,"Nomor telpon pembeli harus di isi!"],

    },
    nik : {
        type : String,
        require : [true,"NIK pembeli harus di isi!"],

    },
    alamat : {
        type : String,
        require : [true,"Alamat harus di isi!"],

    },
    
},{
    versionKey : false,
    timestamps : {
        createdAt : "create",
        updatedAt : "update"
    }
});

const pembeli = mongoose.model("pembeli", PembeliSchema);

module.exports = pembeli;