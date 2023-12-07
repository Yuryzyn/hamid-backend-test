const mongoose = require("mongoose");
const jual = require("../models/penjualan.js");
const gudang = require("../models/gudang");
const barang = require("../models/barang");

class dashboardController {
    static getLaporanPenjualan (req, res, next) {
        const { waktu, startDate: requestedStartDate, endDate: requestedEndDate } = req.body;
  const currentDate = new Date();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  let startDate, endDate;

  if (requestedStartDate && requestedEndDate) {
    startDate = new Date(requestedStartDate);
    endDate = new Date(requestedEndDate);
  } else {
  if (waktu === "perhari") {
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
  } else if (waktu === "perbulan") {
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  } else if (waktu === "pertahun") {
    startDate = new Date(currentDate.getFullYear(), 0, 1);
    endDate = new Date(currentDate.getFullYear() + 1, 0, 1);
  } else if (/^\d{4}$/.test(waktu)) {
    // Jika format tahun (contoh: "2021")
    startDate = new Date(`${waktu}-01-01`);
    endDate = new Date(`${parseInt(waktu) + 1}-01-01`);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(waktu)) {
    // Jika format tanggal (contoh: "2023-12-07")
    startDate = new Date(waktu);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
  } else if (/^[a-zA-Z]+$/.test(waktu)) {
    // Jika format bulan (contoh: "Desember")
    const monthIndex = monthNames.indexOf(waktu);
    if (monthIndex !== -1) {
      startDate = new Date(currentDate.getFullYear(), monthIndex, 1);
      endDate = new Date(currentDate.getFullYear(), monthIndex + 1, 1);
    } else {
      return res.status(400).json({ error: "Nama bulan tidak valid" });
    }
  } else {
    return res.status(400).json({ error: "Format waktu tidak valid" });
  }
}

  let penjualanData;
  let barangDataArray; // Inisialisasi array untuk menyimpan data barang

  jual.find({
    tglJual: {
      $gte: startDate,
      $lt: endDate,
    },
  })
    .then((foundPenjualanData) => {
      penjualanData = foundPenjualanData;
      const promises = [];

      penjualanData.forEach((penjualan) => {
        penjualan.penjualanItems.forEach((item) => {
          const promise = barang.findOne({ _id: item.idBarang })
            .then((barangData) => {
              if (barangData) {
                return barangData; // Mengembalikan seluruh data barang
              }
              return null;
            })
            .catch(next);

          promises.push(promise);
        });
      });

      return Promise.all(promises);
    })
    .then((foundBarangDataArray) => {
      // Mengisi array barangDataArray dengan data barang yang valid
      barangDataArray = foundBarangDataArray.filter((barang) => barang !== null);

      const keuntunganPerItemArray = [];
      const totalHargaBeli = penjualanData.reduce((acc, cur) => {
        cur.penjualanItems.forEach((item) => {
          const barangData = barangDataArray.find((barang) => barang._id.toString() === item.idBarang.toString());
          if (barangData) {
            const keuntunganPerItem = item.jumlahBeli * (barangData.hargaJual - barangData.hargaBeli);
            keuntunganPerItemArray.push(keuntunganPerItem);
            acc += item.jumlahBeli * barangData.hargaBeli;
          }
        });
        return acc;
      }, 0);

      const keuntunganTotal = keuntunganPerItemArray.reduce((acc, cur) => acc + cur, 0);

      res.json({
        waktu: waktu,
        keuntunganTotal,
        totalHargaPenjualan: penjualanData.reduce((acc, cur) => acc + cur.hargaTotal, 0),
        totalHargaBeli,
      });
    })
    .catch(next);

};

}

module.exports = dashboardController;