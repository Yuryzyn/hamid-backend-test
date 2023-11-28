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
                    console.log(updatedItems)
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