const mongoose = require("mongoose");
const rusak = require("./../models/barangRusak");
const ObjectId = mongoose.Types.ObjectId;
const Axios = require("axios");
const { response } = require("express");
const stock = require("../models/gudang");
const sended = require("../models/barangKeluar");
const retur = require("../models/barangRetur");
const jual = require("../models/penjualan");
const { send } = require("process");

class BarangRusakController {

    static addBarangRusak(req, res, next) {
        let { idBarang, idKirim, keteranganRusak, jumlahRusak } = req.body;

        // Langkah 1: Cari idKirim dari database barangKeluar
        sended.findById({ _id: idKirim })
            .then((barangKeluar) => {
                // Jika idKirim tidak ditemukan, cari di database barangRetur
                if (!barangKeluar) {
                    return retur.findOne({ idKirim });
                }
                return Promise.resolve(barangKeluar);
            })
            .then((dataKirim) => {
                // console.log(dataKirim)
                // Langkah 2: Pastikan idBarang ada pada barangKeluarItems atau barangReturItems
                let items;
                if (dataKirim.barangKeluarItems) {
                    items = dataKirim.barangKeluarItems;
                } else {
                    items = dataKirim.barangReturItems;
                }

                const selectedBarang = items.find((item) => item.idBarang === idBarang);

                // Jika idBarang tidak ditemukan atau jumlahRusak melebihi jumlah barang
                if (!selectedBarang || jumlahRusak > selectedBarang.jumlahKeluar) {
                    throw new Error("Id Barang tidak ditemukan atau jumlah rusak melebihi jumlah barang");
                }

                // Langkah 3: Create barang rusak
                const newBarangRusak = new rusak({
                    idBarang,
                    idKirim,
                    keteranganRusak,
                    jumlahRusak,
                });

                return newBarangRusak.save();
            })
            .then(() => {
                // Langkah 4: Ubah statusKirim di data barangKeluar/barangRetur menjadi undone
                return sended.findByIdAndUpdate({ _id: idKirim }, { $set: { statusKirim: "bermasalah" } });
            })
            .then((dataKirim) => {
                // console.log(dataKirim)
                // Langkah 6: Jika idKirim berasal dari barangKeluar, kurangi jumlahKeluar dengan jumlahRusak
                if (dataKirim instanceof sended) {
                    const updatedItems = dataKirim.barangKeluarItems.map((item) => {
                        if (item.idBarang === idBarang) {
                            item.jumlahKeluar -= jumlahRusak;
                        }
                        return item;
                    });
                    // console.log(updatedItems)
                    return sended.findByIdAndUpdate({ _id: idKirim }, { $set: { barangKeluarItems: updatedItems } });
                }
                return Promise.resolve(dataKirim);
            })
            .then((dataKirim) => {
                // Langkah 5: Jika idKirim berasal dari barangKeluar, ubah statusKirim di data penjualan menjadi half-deliver
                if (dataKirim instanceof sended) {
                    return jual.findOneAndUpdate(
                        { noNota: dataKirim.noNota },
                        { $set: { statusKirim: "half-deliver" } }
                    );
                }
                return Promise.resolve(null);
            })
            .then(() => {
                // Langkah 7: Tambahkan data barangRusak ke dalam telahRusakItems di dalam data barangKeluar
                return sended.findByIdAndUpdate(
                    { _id: idKirim },
                    { $push: { telahRusakItems: { idBarang, jumlahRusak } } }
                );
            })
            .then(() => {
                res.status(201).json({ message: "Barang rusak berhasil ditambahkan" });
            })
            .catch(next);
    }

    static findAllBarangRusak(req, res, next) {
        rusak.find()
            .populate({
                path: 'idBarang',
                model: 'barang' // Gantilah sesuai dengan model barang yang Anda miliki
            })
            .populate({
                path: 'idKirim',
                model: 'keluar' // Gantilah sesuai dengan model barangKeluar yang Anda miliki
            })
            .then((barangRusakList) => {
                const formattedList = barangRusakList.map((barangRusak) => {
                    const detailBarang = barangRusak.idBarang;
                    const detailKirim = barangRusak.idKirim ? barangRusak.idKirim : null;

                    return {
                        _id: barangRusak._id,
                        idBarang: barangRusak.idBarang._id,
                        detailBarang: {
                            _id: detailBarang._id,
                            jenis: detailBarang.jenis,
                            merk: detailBarang.merk,
                            hargaBeli: detailBarang.hargaBeli,
                            hargaJual: detailBarang.hargaJual,
                            fotoBarang: detailBarang.fotoBarang
                        },
                        idKirim: barangRusak.idKirim ? barangRusak.idKirim._id : null,
                        detailKirim: detailKirim ? {
                            _id: detailKirim._id,
                            noNota: detailKirim.noNota,
                            barangKeluarItems: detailKirim.barangKeluarItems.map((item) => ({
                                idBarang: item.idBarang._id,
                                jumlahKeluar: item.jumlahKeluar,
                                _id: item._id
                            })),
                            kurir: detailKirim.kurir,
                            nomorSuratJalan: detailKirim.nomorSuratJalan,
                            statusKirim: detailKirim.statusKirim,
                        } : null,
                        keteranganRusak: barangRusak.keteranganRusak,
                        jumlahRusak: barangRusak.jumlahRusak,
                        statusRusak: barangRusak.statusRusak,
                    };
                });
                res.status(200).json(formattedList);
            })
            .catch((error) => {
                next(error);
            });
    }

    static editBarangRusak(req, res, next) {
        let data = req.body

        rusak.findOneAndUpdate({
            _id: data._id
        }, {
            keteranganRusak: data.keteranganRusak,
            // jumlahRusak : data.jumlahRusak, update jumlah data ndak tau gan..

        }).then((r) => {
            res.status(200).json({
                message: "Berhasil edit data rusak"
            })
        }).catch(next)

    }

    static statusRusak(req, res, next) {
        let data = req.body

        rusak.findById({
            _id: data._id
        })
            .then((response) => {
                if (response.statusRusak === "tidak bisa retur") {
                    throw {
                        message: "status laporan barang tidak bisa ubah, barang tidak bisa di retur!",
                        status: 403
                    }
                } else if (response.statusRusak === "bisa retur") {
                    throw {
                        message: "status laporan barang tidak bisa ubah, barang bisa di retur!",
                        status: 403
                    }
                } else {
                    return rusak.findByIdAndUpdate({ _id: data._id }, {
                        statusRusak: data.statusRusak
                    }).then((r) => {
                        if (data.statusRusak === "bisa retur") {
                            return stock.findOneAndUpdate({
                                idBarang: r.idBarang
                            }, {
                                $inc: {
                                    jumlahRusak: +r.jumlahRusak,
                                },
                            });
                        } else if (data.statusRusak === "tidak bisa retur") {
                            return stock.findOneAndUpdate({
                                idBarang: r.idBarang
                            }, {
                                $inc: {
                                    rusakNonRetur: +r.jumlahRusak,
                                },
                            });
                        } else {
                            throw {
                                message: "status tidak terdaftar atau fitur belum ada!",
                                status: 404
                            };
                        }
                    });
                }
            }).then((r) => {
                res.status(200).json({
                    message: "Berhasil update status retur"
                })
            })
            .catch(next)
    }

    static findPengiriman(req, res, next) {

        sended.find({ statusKirim: "finished" }).then((response) => {
            if (!response) {
                throw {
                    message: "tidak ada pengiriman yang telah terkirim, pastikan mendaftarkan barang dari pengiriman yang telah terkirim!",
                    status: 404
                }
            } else {
                return res.status(200).json({
                    data: response,
                    message: "Berhasil menampilkan daftar pengiriman yang sesuai untuk di retur!"
                })
            }
        }).catch(next)
    }

    // static findPengiriman(req, res, next) {
    //     const noNotaSended = req.query.noNota; // Ambil nomor nota dari query parameter atau sesuaikan dengan cara Anda mengambilnya
    
    //     sended.find({ statusKirim: "finished", noNota: noNotaSended })
    //         .then((response) => {
    //             if (!response || response.length === 0) {
    //                 throw {
    //                     message: "Tidak ada pengiriman yang telah terkirim, pastikan mendaftarkan barang dari pengiriman yang telah terkirim!",
    //                     status: 404
    //                 };
    //             } else {
    //                 // Lakukan pencarian di database 'jual'
    //                 jual.findOne({ noNota: noNotaSended, statusKirim: "delivered" })
    //                     .then((jualResponse) => {
    //                         if (jualResponse) {
    //                             // Jika ditemukan data di 'jual' dengan statusKirim 'delivered', berarti jangan tampilkan data sended
    //                             return res.status(200).json({
    //                                 data: [],
    //                                 message: "Tidak menampilkan data sended karena terdapat pengiriman yang sudah terkirim di database 'jual'."
    //                             });
    //                         } else {
    //                             // Tampilkan data sended karena tidak ditemukan pengiriman terkirim di database 'jual'
    //                             return res.status(200).json({
    //                                 data: response,
    //                                 message: "Berhasil menampilkan daftar pengiriman yang sesuai untuk di retur!"
    //                             });
    //                         }
    //                     })
    //                     .catch(next);
    //             }
    //         })
    //         .catch(next);
    // }

}

module.exports = BarangRusakController;