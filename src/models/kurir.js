const mongoose = require("mongoose");

const KurirSchema = new mongoose.Schema({

    namaKurir: {
        type: String,
        require: [true, "Nama pembeli harus di isi!"],

    },
    tlpnKurir: {
        type: String,
        require: [true, "Nomor telpon pembeli harus di isi!"],

    },
    alamatKurir: {
        type: String,
        require: [true, "Alamat harus di isi!"],

    },
    nopolKendaraan: {
        type: String,
        require: [true, "Alamat harus di isi!"],

    },
    tipeKendaraan: {
        type: String,
        require: [true, "Alamat harus di isi!"],

    },

}, {
    versionKey: false,
    timestamps: {
        createdAt: "create",
        updatedAt: "update"
    }
});

const kurir = mongoose.model("kurir", KurirSchema);

module.exports = kurir;