const mongoose = require("mongoose");
const rusak = require("./../models/barangRusak");
const ObjectId = mongoose.Types.ObjectId;
const Axios = require("axios");
const { response } = require("express");
const stock = require("../models/gudang");
const sended = require("../models/barangKeluar");
const retur = require("../models/barangRetur");
const jual = require("../models/penjualan");

class BarangRusakController {

    static addBarangRusak(req, res, next) {
        let { idBarang, idKirim, keteranganRusak, jumlahRusak } = req.body;

        // Langkah 1: Cari idKirim dari database barangKeluar
        sended.findOne({ idKirim: idKirim })
            .then((barangKeluarData) => {
                if (!barangKeluarData) {
                    // Jika idKirim tidak ditemukan, cari di database barangRetur
                    return retur.findOne({ idKirim: idKirim });
                }
                return barangKeluarData;
            })
            .then((data) => {
                if (!data) {
                    throw new Error("ID Kirim tidak ditemukan");
                }

                // Langkah 2: Pastikan idBarang ada pada barangKeluarItems atau barangReturItems
                const itemData = data.barangKeluarItems || data.barangReturItems;
                const foundItem = itemData.find(item => item.idBarang === idBarang);

                if (!foundItem) {
                    throw new Error("ID Barang tidak ditemukan");
                }

                // Pastikan jumlah barangRusak tidak lebih dari jumlah sesuai dari idBarang dari idKirim
                if (jumlahRusak > foundItem.jumlahKeluar) {
                    throw new Error("Jumlah barang rusak melebihi jumlah barang keluar");
                }

                // Langkah 3: Create barang rusak sesuai dengan input yang sudah di masukkan
                return rusak.create({
                    idBarang: idBarang,
                    idKirim: idKirim,
                    keteranganRusak: keteranganRusak,
                    jumlahRusak: jumlahRusak,
                    statusRetur: "belum retur", // Default status
                });
            })
            .then((createdRusak) => {
                // Langkah 4: Ubah statusKirim pada data barangKeluar atau barangRetur menjadi undone
                return sended.findOneAndUpdate({ idKirim: idKirim }, { statusKirim: "bermasalah" }, { new: true });
            })
            .then((updatedData) => {
                if (updatedData) {
                    // Langkah 5: Jika idKirim berasal dari barangKeluar, ubah statusKirim pada data penjualan menjadi half-deliver
                    return jual.findOneAndUpdate({ noNota: updatedData.noNota }, { statusKirim: "half-deliver" }, { new: true });
                }
                return null;
            })
            .then((updatedPenjualan) => {
                if (updatedPenjualan) {
                    // Langkah 6: Kurangi jumlahKeluar dengan jumlahRusak sesuai idBarang di dalam barangKeluarItems
                    const itemToUpdate = updatedPenjualan.penjualanItems.find(item => item.idBarang === idBarang);
                    itemToUpdate.jumlahBeli -= jumlahRusak;
                    return updatedPenjualan.save();
                }
                return null;
            })
            .then(() => {
                // Langkah 7: Tambahkan data barangRusak ke dalam telahRusakItems di dalam data barangKeluar
                return sended.findOneAndUpdate(
                    { idKirim: idKirim },
                    { $push: { telahRusakItems: { idBarang: idBarang, jumlahRusak: jumlahRusak } } },
                    { new: true }
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
                        statusRetur: barangRusak.statusRetur,
                    };
                });
                res.status(200).json(formattedList);
            })
            .catch((error) => {
                next(error);
            });
    }

    static editBarangRusak (req, res, next){
        let data = req.body

        rusak.findOneAndUpdate({
            _id : data._id
        },{
            keteranganRusak : data.keteranganRusak,
            // jumlahRusak : data.jumlahRusak, update jumlah data ndak tau gan..
            
        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil edit data rusak"
            })
        }).catch(next)

    }

    static checkRetur(req, res, next){
        let data = req.body

        rusak.findById({
            _id : data._id
        })
        .then((response)=>{
            if (response.statusRetur === "sudah retur"){
                throw {
                    message : "Laporan barang ini sudah di retur!"
                }
            } else {
                return rusak.findByIdAndUpdate({_id : data._id},{
                    statusRetur : "sudah retur"
                })
            }
        }).then ((response2)=>{
            let counting = response2.map((data)=>{
                return stock.findOneAndUpdate({
                    idBarang : data.idBarang
                },{
                    $inc:{
                        jumlahRusak : -data.jumlahRusak,
                        jumlahBarang : +data.jumlahRusak,
                    },
                })
            })
            return Promise.all(counting);
        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil update status retur"
            })
        })
        .catch(next)
    }

}

module.exports = BarangRusakController;