const mongoose = require("mongoose");

const BarangKeluarSchema = new mongoose.Schema({
  noNota: {
    type: String,
    required: true,
  },
  barangKeluarItems: [
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
  nomorSuratJalan: {
    type: String,
    default: "belum ada surat jalan",
  },
  statusKirim: {
    type: String,
    default: "on-process",
    // "deliver", "finished"
  },
},{
    versionKey : false,
    timestamps : {
        createdAt : "create",
        updatedAt : "update"
    }
});

const BarangKeluar = mongoose.model("keluar", BarangKeluarSchema);

module.exports = BarangKeluar;
