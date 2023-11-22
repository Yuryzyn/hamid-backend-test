const mongoose = require("mongoose");

const BarangReturSchema = new mongoose.Schema({
  noNota: {
    type: String,
    required: true,
  },
  barangReturItems: [
    {
      idBarang: {
        type: String,
        required: true,
      },
      jumlahKeluar: {
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
    default: "belum ada surat jalan",
  },
  statusKirim: {
    type: String,
    default: "on-process",
    // "deliver", "finished", "sended-back", "undone"
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