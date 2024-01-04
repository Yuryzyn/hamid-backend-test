const mongoose = require("mongoose");
const masuk = require("./../models/barangMasuk");
const ObjectId = mongoose.Types.ObjectId;
const Axios = require("axios");
const { response } = require("express");
const gudang = require("../models/gudang");
const barang = require("../models/barang");
const { timeStamp } = require("console");

class barangMasukController {

    static addBarangMasuk(req, res, next) {
        let data = req.body

        gudang.findOne({
            idBarang: data.idBarang
        }).then(async (response1) => {
            if (!response1) {
                return gudang.create({
                    idBarang: data.idBarang,
                    jumlahBarang: 0,
                    jumlahRusak: 0,
                    handleBy: data.handleBy,
                }).then((reNew) => {
                    return masuk.create({
                        idBarang: reNew.idBarang,
                        keterangan: data.keterangan,
                        jumlahMasuk: data.jumlahMasuk,
                        totalHargaBeli: data.totalHargaBeli,
                        tanggalTerima: data.tanggalTerima,
                        idKurir: data.idKurir,
                        nomorSuratJalan: data.nomorSuratJalan,
                    })
                })
            } else {
                return masuk.create({
                    idBarang: data.idBarang,
                    keterangan: data.keterangan,
                    jumlahMasuk: data.jumlahMasuk,
                    totalHargaBeli: data.totalHargaBeli,
                    tanggalTerima: data.tanggalTerima,
                    idKurir: data.idKurir,
                    nomorSuratJalan: data.nomorSuratJalan,
                })
            }
        }).then((response3) => {
            const Barangasuk = response3.jumlahMasuk
            if (!response3.totalHargaBeli) {
                barang.findById({
                    _id: response3.idBarang
                }).then((tool) => {
                    const totalHarga = tool.hargaBeli;
                    return masuk.findByIdAndUpdate({ _id: response3._id }, { $inc: { totalHargaBeli: totalHarga * Barangasuk } })
                })
            }
        }).then((r) => {
            res.status(200).json({
                Message: "Berhasil menambah data barang masuk!"
            })
        }).catch(next)

    }

    static editDataBarangMasuk(req, res, next) {
        let { _id, idBarang, keterangan, jumlahMasuk, tanggalTerima, nomorSuratJalan, idKurir } = req.body

        masuk.findByIdAndUpdate({
            _id: _id
        }, {
            idBarang,
            keterangan,
            jumlahMasuk,
            tanggalTerima,
            idKurir,
            nomorSuratJalan,
        }
        ).then((response) => {
            res.status(200).json({
                Message: "Berhasil ubah data barang masuk!"
            })
        }).catch(next)

    }

    static daftarBarangMasuk(req, res, next) {

        masuk.find({}).then((response) => {
            res.status(200).json({
                data: response,
                message: "Berhasil memuat database barang masuk!"
            })
        })
            .catch(next)
    }

    static checkMarkBarangBaru(req, res, next) {
        let data = req.body

        masuk.findById({
            _id: data._id
        }).then((response1) => {
            if (response1.statusTerima === "sudah diterima") {
                throw {
                    status: 403,
                    message: "Pengiriman dengan nomor surat jalan " + response1.nomorSuratJalan + " sudah di terima!"
                }
            } else {
                return masuk.findByIdAndUpdate({
                    _id: data._id
                }, {
                    statusTerima: "sudah diterima",
                    tanggalTerima: Date.now()
                })
            }
        }).then((response2) => {
            // console.log(response2)
            if (response.jumlahMasuk = 0) {
                throw {
                    status: 400,
                    message: "barang ghoib!"
                }
            } else {
                // console.log(response2)
                return gudang.findOneAndUpdate({

                    idBarang: response2.idBarang
                }, {
                    $inc: {
                        jumlahBarang: +response2.jumlahMasuk
                    }
                })
            }
        }).then((r) => {
            res.status(200).json({
                message: "Berhasil memuat database barang masuk!"
            })
        }).catch(next)

    }

}

module.exports = barangMasukController;