const mongoose = require("mongoose");
const jual = require("../models/penjualan.js");
const gudang = require("../models/gudang");
const barang = require("../models/barang");
const masuk = require("../models/barangMasuk.js")
const keluar = require("../models/barangKeluar.js")

class dashboardController {
  static getLaporanPenjualan(req, res, next) {
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
      if (waktu === "harian") {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
      } else if (waktu === "bulanan") {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      } else if (waktu === "tahunan") {
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
  }

  static laporanBarangMasuk(req, res, next) {

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let startMonth = currentMonth;
    let startYear = currentYear;


    // Jika kita berada di bulan Januari, kita perlu melihat ke tahun sebelumnya
    if (currentMonth <= 5) {
      startMonth += 12 - 6;  // Geser 6 bulan ke belakang dari bulan Januari
      startYear--;  // Geser ke tahun sebelumnya
    } else {
      startMonth -= 6;  // Geser 6 bulan ke belakang
    }

    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);  // Akhir bulan sekarang

    // Query untuk mencari BarangMasuk
    const queryBarangMasuk = masuk.find({
      tanggalTerima: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Eksekusi keduanya secara konkuren menggunakan Promise.all
    return Promise.all([queryBarangMasuk])
      .then(([barangMasukResult]) => {
        if (barangMasukResult.length === 0) {
          return res.status(404).json({
            message: 'Tidak ada data yang sesuai untuk 6 bulan terakhir.'
          });
        }

        // Membuat objek untuk mengagregasi jumlah barang berdasarkan idBarang dan bulan
        const aggregatedData = {};

        barangMasukResult.forEach((masukItem) => {
          const idBarang = masukItem.idBarang.toString();
          const bulanKey = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(masukItem.tanggalTerima);

          if (!aggregatedData[idBarang]) {
            aggregatedData[idBarang] = {};
          }

          if (!aggregatedData[idBarang][bulanKey]) {
            aggregatedData[idBarang][bulanKey] = {
              jumlahBarang: 0,
              namaBarang: '',
              jenisBarang: '',
              namaBulan: bulanKey
            };
          }

          aggregatedData[idBarang][bulanKey].jumlahBarang += masukItem.jumlahMasuk;
        });

        // Mengumpulkan semua unique IDs dari BarangMasuk collection
        const uniqueBarangIds = Array.from(new Set(barangMasukResult.map(item => item.idBarang)));

        // Query untuk mencari Barang
        return barang.find({ _id: { $in: uniqueBarangIds } })
          .then((barangResult) => {
            // Merging data from BarangMasuk and Barang based on the ID
            const mergedResult = [];

            for (const idBarang in aggregatedData) {
              if (Object.prototype.hasOwnProperty.call(aggregatedData, idBarang)) {
                const barangItem = barangResult.find((barang) => barang._id.toString() === idBarang);

                for (const bulanKey in aggregatedData[idBarang]) {
                  if (Object.prototype.hasOwnProperty.call(aggregatedData[idBarang], bulanKey)) {
                    const aggregatedItem = aggregatedData[idBarang][bulanKey];

                    mergedResult.push({
                      namaBarang: barangItem.merk,
                      jenisBarang: barangItem.jenis,
                      jumlahBarang: aggregatedItem.jumlahBarang,
                      namaBulan: bulanKey
                    });
                  }
                }
              }
            }

            return res.status(200).json({
              data: mergedResult,
              message: 'Berhasil menghasilkan laporan barang masuk untuk 6 bulan terakhir.'
            });
          });
      })
      .catch((error) => {
        console.error('error:', error);
        return res.status(500).json({
          error: 'Gagal menghasilkan laporan barang masuk untuk 6 bulan terakhir.',
          message: error.message
        });
      });
  }


  static laporanBarangKeluar(req, res, next) {

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let startMonth = currentMonth;
    let startYear = currentYear;


    // Jika kita berada di bulan Januari, kita perlu melihat ke tahun sebelumnya
    if (currentMonth <= 5) {
      startMonth += 12 - 6;  // Geser 6 bulan ke belakang dari bulan Januari
      startYear--;  // Geser ke tahun sebelumnya
    } else {
      startMonth -= 6;  // Geser 6 bulan ke belakang
    }

    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);  // Akhir bulan sekarang

    // Query untuk mencari BarangKeluar
    return keluar.find({
      tanggalKeluar: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .then((barangKeluarResult) => {
        if (barangKeluarResult.length === 0) {
          return res.status(404).json({
            message: 'Tidak ada data yang sesuai untuk 6 bulan terakhir.'
          });
        }

        // Menggabungkan barangKeluarItems untuk setiap idBarang dan bulan
        const combinedBarangKeluar = {};

        barangKeluarResult.forEach((item) => {
          const bulanKey = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(item.tanggalKeluar);
          item.barangKeluarItems.forEach((barang) => {
            const key = `${barang.idBarang}-${bulanKey}`;

            if (combinedBarangKeluar[key]) {
              combinedBarangKeluar[key].jumlahKeluar += barang.jumlahKeluar;
            } else {
              combinedBarangKeluar[key] = {
                idBarang: barang.idBarang,
                bulan: bulanKey,
                jumlahKeluar: barang.jumlahKeluar
              };
            }
          });
        });

        // Query untuk mencari Barang
        const uniqueBarangIds = Array.from(new Set(Object.keys(combinedBarangKeluar).map(key => combinedBarangKeluar[key].idBarang)));

        return barang.find({ _id: { $in: uniqueBarangIds } })
          .then((barangResult) => {
            // Merging data from BarangKeluar and Barang based on the ID
            const mergedResult = Object.values(combinedBarangKeluar).map((keluarItem) => {
              const barangItem = barangResult.find((barang) => barang._id.toString() === keluarItem.idBarang.toString());
              return {
                namaBarang: barangItem.merk,
                jenisBarang: barangItem.jenis,
                jumlahBarang: keluarItem.jumlahKeluar,
                namaBulan: keluarItem.bulan
              };
            });

            return res.status(200).json({
              data: mergedResult,
              message: 'Berhasil menghasilkan laporan barang keluar untuk 6 bulan terakhir.'
            });
          });
      })
      .catch((error) => {
        console.error('error:', error);
        return res.status(500).json({
          error: 'Gagal menghasilkan laporan barang keluar untuk 6 bulan terakhir.',
          message: error.message
        });
      });
  }
}

module.exports = dashboardController;