const mongoose = require("mongoose");
const barangKeluar = require("../models/barangKeluar.js");
const penjualan = require("../models/penjualan.js");
const barang = require("../models/barang.js")
const gudang = require("../models/gudang.js")
const pembeli = require("../models/pembeli.js")

class BarangKeluarController {

    static findNoNota(req, res, next) {
        penjualan.distinct("noNota", {
            statusKirim: { $in: ["on-process", "half-deliver"] },
        })
            .then(async (noNotaList) => {
                if (noNotaList.length === 0) {
                    throw {
                        status: 404,
                        message: "NoNota dengan status on-process atau half-deliver tidak ditemukan atau sudah selesai dikirim.",
                    };
                }

                const validNoNotaList = [];

                const promises = noNotaList.map(async (noNota) => {
                    const penjualanData = await penjualan.findOne({ noNota });

                    const isBarangAvailableInGudang = await Promise.all(penjualanData.penjualanItems.map(async (item) => {
                        const gudangData = await gudang.findOne({ idBarang: item.idBarang });
                        return gudangData !== null;
                    }));

                    if (isBarangAvailableInGudang.every((isAvailable) => isAvailable)) {
                        validNoNotaList.push(noNota);
                    }
                });

                await Promise.all(promises);

                if (validNoNotaList.length === 0) {
                    throw {
                        status: 404,
                        message: "Tidak ada NoNota dengan status on-process atau half-deliver yang memiliki barang di gudang.",
                    };
                }

                res.status(200).json({
                    data: validNoNotaList,
                    message: "Berhasil menemukan semua NoNota dengan status on-process atau half-deliver yang memiliki barang di gudang.",
                });
            })
            .catch(next);
    }

    static checkMarkstatusKirim(req, res, next) {
        const { _id } = req.body;
        const statusKirim = "finished"

        barangKeluar.findById({ _id: _id }).then((response) => {
            if (!response) {
                throw {
                    status: 404,
                    message: "database error, hubungi super-admin!",
                };
            } else if (response.statusKirim === "finished") {
                throw {
                    status: 403,
                    message: "pengiriman ini sudah di kirim!",
                };
            } else if (response.statusKirim === "deliver") {
                return barangKeluar.updateOne({ _id: _id }, { statusKirim: statusKirim }).exec();

            } else {
                throw {
                    status: 404,
                    message: "status error, hubungi super-admin!",
                };
            }
        }).then(() => {
            res.status(200).json({
                message: "status pengiriman berhasil di update, barang terkirim!",
            });
        }).catch(next)
    }

    static CalculateWithNota(req, res, next) {
        const { noNota } = req.body;
        let penjualanData;

        penjualan.find({
            noNota, statusKirim:
                { $in: ["on-process", "half-deliver", "bermasalah"] }
        })
            .then((data) => {
                if (data.length === 0) {
                    throw {
                        status: 404,
                        message: "Data dengan noNota tersebut tidak ditemukan atau sudah selesai dikirim.",
                    };
                }
                penjualanData = data[0];

                return barangKeluar.find({ noNota });
            })
            .then(async (barangKeluarData) => {

                if (barangKeluarData.length === 0) {
                    const penjualanItems = penjualanData.penjualanItems;
                    const barangKeluarItems = penjualanItems.map((item) => {
                        const idBarang = item.idBarang;
                        const jumlahBeli = item.jumlahBeli;
                        const jumlahKeluarTotal = barangKeluarData.reduce((total, keluarItem) => {
                            if (keluarItem.idBarang === idBarang) {
                                return total + keluarItem.jumlahKeluar;
                            }
                            return total;
                        }, 0);

                        const sisaJumlah = jumlahBeli - jumlahKeluarTotal;

                        return {
                            idBarang: idBarang,
                            jumlahKeluar: jumlahKeluarTotal,
                            barangBelumDikirim: {
                                idBarang: idBarang,
                                sisaJumlah: sisaJumlah,
                            },
                        };
                    });

                    res.status(200).json({
                        data: {
                            noNota: penjualanData.noNota,
                            barangKeluarItems: barangKeluarItems,
                            alamatKirim: penjualanData.alamatKirim,
                            tglKirim: penjualanData.tglKirim
                        },
                        message: "Data dengan noNota tersebut belum dikirim.",
                    });
                } else {
                    const penjualanItems = penjualanData.penjualanItems;

                    const groupedData = {};

                    barangKeluarData.forEach(item => {
                        item.barangKeluarItems.forEach(subItem => {
                            const idBarang = subItem.idBarang;
                            const jumlahKeluar = subItem.jumlahKeluar;

                            if (!groupedData[idBarang]) {
                                groupedData[idBarang] = {
                                    idBarang,
                                    jumlahKeluar: 0
                                };
                            }
                            groupedData[idBarang].jumlahKeluar += jumlahKeluar;
                        })
                    });

                    const barangKeluarItems = Object.values(groupedData);

                    const jumlahBarangDikirim = {};

                    barangKeluarItems.forEach((item) => {
                        const idBarang = item.idBarang;
                        const jumlahKeluar = item.jumlahKeluar;

                        if (!jumlahBarangDikirim[idBarang]) {
                            jumlahBarangDikirim[idBarang] = jumlahKeluar;
                        } else {
                            jumlahBarangDikirim[idBarang] += jumlahKeluar;
                        }
                    });

                    let isAllDelivered = true;

                    penjualanItems.forEach((item) => {
                        const idBarang = item.idBarang;
                        const jumlahBeli = item.jumlahBeli;

                        if (!jumlahBarangDikirim[idBarang] || jumlahBarangDikirim[idBarang] !== jumlahBeli) {
                            isAllDelivered = false;
                        }
                    });

                    if (isAllDelivered) {
                        throw {
                            status: 400,
                            message: "Data dengan noNota tersebut sudah di kirim.",
                        };
                    } else {
                        const barangBelumDikirim = [];
                        penjualanItems.forEach((item) => {

                            const idBarang = item.idBarang;
                            const jumlahBeli = item.jumlahBeli;
                            if (jumlahBarangDikirim[idBarang] && jumlahBarangDikirim[idBarang] !== jumlahBeli) {
                                const sisaJumlah = jumlahBeli - jumlahBarangDikirim[idBarang];
                                barangBelumDikirim.push({
                                    idBarang: idBarang,
                                    sisaJumlah: sisaJumlah,
                                });
                            }
                        });

                        const promises = barangKeluarItems.map(async (item) => {
                            const detailBarang = await barang.findById(item.idBarang);
                            const barangBelumDikirimItem = barangBelumDikirim.find(
                                (barang) => barang.idBarang.toString() === item.idBarang.toString()
                            );
                            return {
                                idBarang: detailBarang._id,
                                detailBarang: {
                                    _id: detailBarang._id,
                                    jenis: detailBarang.jenis,
                                    merk: detailBarang.merk,
                                    hargaBeli: detailBarang.hargaBeli,
                                    hargaJual: detailBarang.hargaJual,
                                    fotoBarang: detailBarang.fotoBarang,
                                },
                                jumlahKeluar: item.jumlahKeluar,
                                barangBelumDikirim: barangBelumDikirimItem,
                            };
                        });

                        const barangKeluarItemsWithDetails = await Promise.all(promises);

                        res.status(200).json({
                            data: {
                                noNota: penjualanData.noNota,
                                barangKeluarItems: barangKeluarItemsWithDetails,
                            },
                            message: "Data barang keluar berhasil ditemukan.",
                        });
                    }
                }
            }).catch(next);
    }

    static createBarangKeluar(req, res, next) {
        const { noNota, nomorSuratJalan, barangKeluarItems, idKurir, tanggalKeluar, alamatKirim } = req.body;

        penjualan.findOne({ noNota: noNota })
            .then((penjualanData) => {
                if (!penjualanData) {
                    return res.status(404).json({
                        message: "NoNota tidak ditemukan dalam database Penjualan.",
                    });
                }

                const totalBarangKeluarItems = barangKeluarItems.reduce((total, item) => total + item.jumlahKeluar, 0);

                if (totalBarangKeluarItems > 1000) {
                    return res.status(400).json({
                        message: "Total barang yang dikirim tidak boleh lebih dari 1000.",
                    });
                }

                const dataKeluarPromise = barangKeluar.find({ noNota: penjualanData.noNota });
                const statusKirim = nomorSuratJalan ? "deliver" : "on-process";

                return Promise.all([dataKeluarPromise])
                    .then(([barangKeluarData]) => {
                        let dataKeluar = 0;
                        if (barangKeluarData) {
                            barangKeluarData.forEach((item) => {
                                item.barangKeluarItems.forEach((barangKeluarItem) => {
                                    dataKeluar += barangKeluarItem.jumlahKeluar;
                                });
                            });
                        }

                        const dataKeluarFinal = totalBarangKeluarItems + dataKeluar;

                        const newBarangKeluar = new barangKeluar({
                            noNota: noNota,
                            barangKeluarItems: barangKeluarItems,
                            idKurir: idKurir,
                            nomorSuratJalan: nomorSuratJalan,
                            tanggalKeluar: tanggalKeluar,
                            alamatKirim: alamatKirim,
                            statusKirim: statusKirim
                        });

                        return newBarangKeluar.save().then((savedBarangKeluar) => {
                            if (statusKirim === "deliver") {

                                barangKeluarItems.forEach((barangKeluarItem) => {
                                    console.log(barangKeluarItem)
                                    const idBarang = barangKeluarItem.idBarang;
                                    const jumlahKeluar = barangKeluarItem.jumlahKeluar;

                                    // Temukan dan kurangi jumlah barang di model gudang dengan idBarang yang sama
                                    // Contoh: Kurangi jumlah barang di GudangModel dengan idBarang === idBarang
                                    console.log(jumlahKeluar)
                                    return gudang.updateOne(
                                        { idBarang: idBarang },
                                        { $inc: { jumlahBarang: -jumlahKeluar } }
                                    ).exec();
                                });

                                const totalPenjualanItems = penjualanData.penjualanItems.reduce((total, item) => total + item.jumlahBeli, 0);

                                if (totalPenjualanItems === dataKeluarFinal) {
                                    return penjualan.updateOne({ noNota: noNota }, { statusKirim: "deliver" }).then(() => {
                                        res.status(200).json({
                                            message: "Data Barang Keluar telah berhasil dibuat.",
                                            data: savedBarangKeluar,
                                        });
                                    });
                                } else {
                                    return penjualan.updateOne({ noNota: noNota }, { statusKirim: "half-deliver" }).then(() => {
                                        res.status(200).json({
                                            message: "Data Barang Keluar telah berhasil dibuat.",
                                            data: savedBarangKeluar,
                                        });
                                    });
                                }

                            } else {
                                res.status(200).json({
                                    message: "Data Barang Keluar telah berhasil dibuat.",
                                    data: savedBarangKeluar,
                                });
                            }

                        });
                    });
            })
            .catch(next);
    }

    static allBarangKeluar(req, res, next) {
        barangKeluar.find().populate({
            path: 'barangKeluarItems.idBarang',
            model: 'barang',
        }).populate({
            path: 'idKurir',
            model: 'kurir',
        }).then((barangKeluarData) => {
            if (!barangKeluarData) {
                return res.status(404).json({
                    message: 'Data barang keluar tidak ditemukan.',
                });
            }

            // Membuat array promise untuk mendapatkan detail penjualan dan pembeli
            const promises = barangKeluarData.map(async (barangKeluar) => {
                const penjualanData = await penjualan.findOne({ noNota: barangKeluar.noNota });
                if (penjualanData) {
                    // Tambahkan data penjualan ke formattedBarang
                    const formattedBarang = {
                        _id: barangKeluar._id,
                        noNota: barangKeluar.noNota,
                        barangKeluarItems: barangKeluar.barangKeluarItems.map((item) => {
                            // console.log('item.idBarang._id:', item.idBarang._id);
                            const idBarang = item.idBarang._id;
                            const jumlahRusakItem = barangKeluar.telahRusakItems.find(rusakItem => rusakItem.idBarang.toString() === idBarang.toString());
                            // console.log('jumlahRusakItem:', jumlahRusakItem);

                            const detailBarang = {
                                _id: item.idBarang._id,
                                jenis: item.idBarang.jenis,
                                merk: item.idBarang.merk,
                                hargaBeli: item.idBarang.hargaBeli,
                                hargaJual: item.idBarang.hargaJual,
                                fotoBarang: item.idBarang.fotoBarang,
                            };

                            return {
                                idBarang: item.idBarang._id,
                                detailBarang,
                                jumlahKeluar: item.jumlahKeluar,
                                jumlahRusak: jumlahRusakItem ? jumlahRusakItem.jumlahRusak : 0,
                                // jumlahTotal: jumlahKeluar + jumlahRusak,
                                _id: item._id,
                            };
                        }),
                        kurir: {
                            _id: barangKeluar.idKurir._id,
                            namaKurir: barangKeluar.idKurir.namaKurir,
                            tlpnKurir: barangKeluar.idKurir.tlpnKurir,
                            alamatKurir: barangKeluar.idKurir.alamatKurir,
                            nopolKendaraan: barangKeluar.idKurir.nopolKendaraan,
                            tipeKendaraan: barangKeluar.idKurir.tipeKendaraan,
                        },
                        nomorSuratJalan: barangKeluar.nomorSuratJalan,
                        tanggalKeluar: barangKeluar.tanggalKeluar,
                        alamatKirim: barangKeluar.alamatKirim,
                        statusKirim: barangKeluar.statusKirim,
                        create: barangKeluar.create,
                        update: barangKeluar.update,
                        detailPenjualan: {
                            noNota: penjualanData.noNota,
                            idKaryawan: penjualanData.idKaryawan,
                            idPembeli: penjualanData.idPembeli,
                            alamatKirim: penjualanData.alamatKirim,
                            hargaTotal: penjualanData.hargaTotal,
                            tglJual: penjualanData.tglJual,
                            statusKirim: penjualanData.statusKirim,
                        },
                        detailPembeli: null, // Placeholder untuk detailPembeli
                    };

                    // Mencari detailPembeli berdasarkan idPembeli
                    return pembeli.findOne({ _id: penjualanData.idPembeli })
                        .then((pembeliData) => {
                            if (pembeliData) {
                                formattedBarang.detailPembeli = {
                                    _id: pembeliData._id,
                                    nama: pembeliData.nama,
                                    tlpn: pembeliData.tlpn,
                                    nik: pembeliData.nik,
                                    alamat: pembeliData.alamat,
                                };
                            }
                            return formattedBarang;
                        });
                }
                return null;
            });

            // Jalankan semua promise sekaligus
            return Promise.all(promises.filter(Boolean));
        })
            .then((formattedBarangKeluarWithDetails) => {
                return res.status(200).json({
                    data: formattedBarangKeluarWithDetails,
                    message: 'Data barang keluar berhasil ditemukan.',
                });
            })
            .catch(next);
    }



}

module.exports = BarangKeluarController;