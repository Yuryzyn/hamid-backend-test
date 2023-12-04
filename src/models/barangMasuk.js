const mongoose = require("mongoose");

const BarangMasukSchema = new mongoose.Schema({

    idBarang : {
        type : String,
        require : [true,"ID Barang yang di retur harus di isi!"],
    },  
    keterangan : {
        type : String,
        require : [true,"Keterangan retur harus di isi!"],
    },
    jumlahMasuk : {
        type : Number,
        require : [true,"Jumlah barang retur harus di isi!"],
    },
    totalHargaBeli : {
        type : Number,
        default : 0,
    },
    idKurir: {
        type : String,
        required : true,
    },
    nomorSuratJalan : {
        type : String,
        required : true,
    },
    tanggalTerima : {
        type : Date,
        default : Date.now,
    },
    statusTerima : {
        type : String,
        default : "belum diterima",
    },
    
},{
    versionKey : false,
    timestamps : {
        createdAt : "create",
        updatedAt : "update"
    }
});

const barangMasuk = mongoose.model("masuk", BarangMasukSchema);

module.exports = barangMasuk;