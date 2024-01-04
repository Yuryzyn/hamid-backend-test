const mongoose = require("mongoose");

const BarangSchema = new mongoose.Schema({

    jenis: {
        type: String,
        require: [true, "Jenis barang harus di isi!"],

    },
    merk: {
        type: String,
        require: [true, "Merk harus di isi!"],

    },
    hargaBeli: {
        type: Number,
        require: [true, "Harga beli harus di isi!"],

    },
    hargaJual: {
        type: Number,
        require: [true, "Harga jual harus di isi!"],

    },
    fotoBarang: {
        type: String,
        default: "tidak ada foto",

    },


}, {
    versionKey: false
});

const barang = mongoose.model("barang", BarangSchema);

module.exports = barang;