const mongoose = require("mongoose");

const barangRusakSchema = new mongoose.Schema({

    idBarang: {
        type: String,
        require: [true, "ID Barang yang rusak harus di isi!"],
    },
    idKirim: {
        type: String,
        required: true
    },
    keteranganRusak: {
        type: String,
        require: [true, "Keterangan barang rusak harus di isi!"],
    },
    jumlahRusak: {
        type: Number,
        require: [true, "Jumlah barang rusak harus di isi!"],
    },
    statusRusak: {
        type: String,
        default: "belum di cek", // bisa retur, tidak bisa retur, belum di cek
    },

}, {
    versionKey: false,
    timestamps: {
        createdAt: "create",
        updatedAt: "update"
    }
});

const barangRusak = mongoose.model("rusak", barangRusakSchema);

module.exports = barangRusak;