const mongoose = require("mongoose");

const barangRusakSchema = new mongoose.Schema({

    idBarang : {
        type : String,
        require : [true,"ID Barang yang di retur harus di isi!"],

    },  
    keteranganRusak : {
        type : String,
        require : [true,"Keterangan retur harus di isi!"],

    },
    jumlahRusak : {
        type : Number,
        require : [true,"Jumlah barang retur harus di isi!"],
        
    },
    statusRetur : {
        type : String,
        default : "belum retur",

    },
    
},{
    versionKey : false,
    timestamps : {
        createdAt : "create",
        updatedAt : "update"
    }
});

const barangRusak = mongoose.model("retur", barangRusakSchema);

module.exports = barangRusak;