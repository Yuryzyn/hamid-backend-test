const { timeStamp } = require("console");
const mongoose = require("mongoose");

const gudangSchema = new mongoose.Schema({

    idBarang : {
        type : String,
        require : [true,"ID Barang harus di isi!"],

    },
    jumlahBarang : {
        type : Number,
        default : 0,

    },
    jumlahRusak : {
        type : Number,
        Default : 0,

    },
    
},{
    versionKey : false,
    timestamps : {
        createdAt : "create",
        updatedAt : "update"
    }
});

const gudang = mongoose.model("gudang", gudangSchema);

module.exports = gudang;