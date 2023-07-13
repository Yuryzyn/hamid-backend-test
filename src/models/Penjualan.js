const mongoose = require("mongoose");

const PenjualanSchema = new mongoose.Schema({

    noNota : {
        type : String,
        require : [true,"nomor nota harus di isi!"],

    },
    idKaryawan : {
        type : String,
        require : [true,"id karyawan harus di isi!"],

    },
    idPembeli : {
        type : String,
        require : [true,"id pembeli harus di isi!"],

    },
    idBarang : {
        type : String,
        require : [true,"id barang harus di isi!"],

    },
    jumlahBeli : {
        type : Number,
        require : [true,"jumlah beli harus di isi!"],

    },
    alamatKirim : {
        type : String,
        require : [true,"alamat kirim harus di isi!"],

    },
    nomorSuratJalan : {
        type : String,
        default : "belum ada surat jalan",
    },
    hargaTotal : {
        type : Number,
        default : 0,

    },
    tglKirim : {
        type : Date,
        require : false,
    },
    tglTerima : {
        type : Date,
        require : false,
    },
    statusKirim : {
        type : String,
        default : "on-process"
    },
    handleBy : {
        type : String,
        default : "",

    }
    
},{
    versionKey : false,
    timestamps : {
        createdAt : "create",
        updatedAt : "update"
    }
});

const Jual = mongoose.model("penjualan", PenjualanSchema);

module.exports = Jual;