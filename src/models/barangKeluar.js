const mongoose = require("mongoose");

const BarangKeluarSchema = new mongoose.Schema({
  noNota: {
    type: String,
    required: true,
  },
  tanggalKeluar: {
    type: Date,
    default: Date.now,
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
  telahRusakItems: [
    {
      idBarang: {
        type: String,
        default: null,
      },
      jumlahRusak: {
        type: Number,
        default: null,
      },
    },
  ],
  idKurir: {
    type: String,
    required: true,
  },
  nomorSuratJalan: {
    type: String,
    required: true,
  },
  alamatKirim: {
    type: String,
    required: true,
  },
  statusKirim: {
    type: String,
    default: "on-process",
    // "deliver", "finished", "bermasalah"
  },
}, {
  versionKey: false,
  timestamps: {
    createdAt: "create",
    updatedAt: "update"
  }
});

const BarangKeluar = mongoose.model("keluar", BarangKeluarSchema);

module.exports = BarangKeluar;
