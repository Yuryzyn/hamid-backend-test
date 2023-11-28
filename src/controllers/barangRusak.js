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

        // Step 1: Find idKirim in BarangKeluar
        sended.findById({ _id : idKirim })
            .then((barangKeluar) => {
                if (!barangKeluar) {
                    // If idKirim not found in BarangKeluar, search in BarangRetur
                    return retur.findById({ _id : idKirim });
                }
                return barangKeluar;
            })
            .then((pengiriman) => {
                // Step 2: Check if idBarang and jumlahRusak are valid
                
                const items = pengiriman.barangKeluarItems || pengiriman.barangReturItems;
                const matchingItem = items.find((item) => item.idBarang === idBarang);

                if (!matchingItem || jumlahRusak > matchingItem.jumlahKeluar) {
                    throw new Error("Invalid idBarang or jumlahRusak");
                }

                // Step 3: Create BarangRusak
                return rusak.create({
                    idBarang: idBarang,
                    idKirim: idKirim,
                    keteranganRusak: keteranganRusak,
                    jumlahRusak: jumlahRusak,
                });
            })
            
            .then(() => {
                // Step 4: Update statusKirim in BarangKeluar or BarangRetur
                return sended.findByIdAndUpdate(
                    { _id: idKirim },
                    { $set: { statusKirim: "bermasalah" } },
                    { new: true }
                );
            })
            .then((pengiriman) => {
                // console.log(pengiriman)
                // Step 5: Update statusKirim in Penjualan
                if (pengiriman instanceof sended) {
                    return jual.findOneAndUpdate(
                        { noNota: pengiriman.noNota },
                        { $set: { statusKirim: "half-deliver" } },
                        { new: true }
                    );
                } else {
                    return null; // If pengiriman is from BarangRetur, no need to update Penjualan
                }
            })
            .then(() => {
                res.status(201).json({ message: "Barang rusak berhasil ditambahkan" });
            })
            .catch((error) => {
                next(error);
            });
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