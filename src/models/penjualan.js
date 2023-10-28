const mongoose = require("mongoose");

const PenjualanItemSchema = new mongoose.Schema({
  idBarang: {
    type: String,
    required: true,
  },
  jumlahBeli: {
    type: Number,
    required: true,
  },
});

const PenjualanSchema = new mongoose.Schema(
  {
    penjualanItems: [PenjualanItemSchema], // Array of PenjualanItems
    noNota: {
      type: String,
      required: [true, "nomor nota harus di isi!"],
    },
    idKaryawan: {
      type: String,
      required: [true, "id karyawan harus di isi!"],
    },
    idPembeli: {
      type: String,
      required: [true, "id pembeli harus di isi!"],
    },
    alamatKirim: {
      type: String,
      required: [true, "alamat kirim harus di isi!"],
    },
    hargaTotal: {
      type: Number,
      default: 0,
    },
    tglKirim: {
      type: Date,
      required: false,
    },
    tglTerima: {
      type: Date,
      required: false,
    },
    statusKirim: {
      type: String,
      default: "on-process",
      // {"on-process", "deliver", "finished", "canceled", "half-deliver"}
    },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "create",
      updatedAt: "update",
    },
  }
);

const Jual = mongoose.model("penjualan", PenjualanSchema);

module.exports = Jual;
