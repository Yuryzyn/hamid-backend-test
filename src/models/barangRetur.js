const mongoose = require("mongoose");

const BarangReturSchema = new mongoose.Schema({
  barangReturItems: [
    {
      idBarang: {
        type: String,
        required: true,
      },
      jumlahRetur: {
        type: Number,
        required: true,
      },
    },
  ],
  idKurir: {
    type: String,
    required : true,
  },
  nomorSuratJalan: {
    type: String,
    required : true,
  },
  statusRetur: {
    type: String,
    default: "deliver",
    // deliver,finished
  },
  tanggalRetur : {
    type : Date,
    default : Date.now,
  },
},{
    versionKey : false,
    timestamps : {
        createdAt : "create",
        updatedAt : "update"
    }
});

const BarangRetur = mongoose.model("retur", BarangReturSchema);

module.exports = BarangRetur;