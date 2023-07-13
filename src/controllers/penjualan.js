const mongoose = require("mongoose");
const jual = require("../models/penjualan");
const ObjectId = mongoose.Types.ObjectId;
const Axios = require("axios");
const { response } = require("express");
const gudang = require("../models/gudang");
const barang = require("../models/barang");
const pembeli = require("../models/pembeli");
const akun = require("../models/akun");

class PenjualanController {

    static addPenjualan(req, res, next){
        let data = req.body

        jual.create({
            noNota : data.noNota,
            idKaryawan : data.idKaryawan,
            idPembeli : data.idPembeli,
            idBarang : data.idBarang,
            jumlahBeli : data.jumlahBeli,
            alamatKirim : data.alamatKirim,
            hargaTotal : data.hargaTotal,
            tglKirim : data.tglKirim,
            handleBy : data.handleBy
        }).then((response)=>{
            const barangId = response.idBarang
            const jumlah = response.jumlahBeli
            if(response.hargaTotal === 0){
                return barang.findById({
                    _id : barangId
                }).then((tool)=>{
                    const harga = tool.hargaJual;
                    return jual.findByIdAndUpdate({
                        _id : response._id
                    },{
                        $inc : {
                            hargaTotal : harga * jumlah
                        }
                    })
                })
            }
        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil mengirim data penjualan"
            })
        }).catch(next)
    }

    static allPenjualan(req, res, next){
        
        jual.find({
        }).then((response)=>{
            let final = response.map((data)=>{
                return barang.findById({_id : data.idBarang}).then((resBarang)=>{
                    const barangFinal = {_id : resBarang._id, jenis : resBarang.jenis, merk : resBarang.merk, harga : resBarang.hargaJual}
                    return pembeli.findById({_id : data.idPembeli}).then((resPembeli)=>{
                        const pembeliFinal = {_id : resPembeli._id, nama : resPembeli.nama, tlpn : resPembeli.tlpn}
                        return akun.findById({_id : data.idKaryawan}).then((resKaryawan)=>{
                            const karyawanFinal = {_id : resKaryawan._id, nama : resKaryawan.nama, tlpn : resKaryawan.tlpn}
                            return {
                                _id : data._id,
                                noNota : data.noNota,
                                karyawan : karyawanFinal,
                                pembeli : pembeliFinal,
                                barang : barangFinal,
                                nomorSuratJalan : data.nomorSuratJalan,
                                jumlahBeli : data.jumlahBeli,
                                alamatKirim : data.alamatKirim,
                                hargaTotal : data.hargaTotal,
                                statusKirim : data.statusKirim,
                                handleBy : data.handleBy,
                            }
                        })
                    })  
                })
            })
            return Promise.all(final);
        }).then((finalResult)=>{
            res.status(200).json({
                data : finalResult,
                message: "Berhasil memuat semua data penjualan"
            })
        }).catch(next)

    }

    static checkPengiriman(req, res, next){
        let data = req.body

        jual.findByIdAndUpdate({
            _id : data._id
        },{
            nomorSuratJalan : data.nomorSuratJalan
        }).then((response)=>{
            if(!data.nomorSuratJalan) {
                throw{
                    status : 403,
                    message : "Nomor surat jalan harus di isi!"
                }
            } else if(response.statusKirim === "canceled") {
                throw{
                    status : 403,
                    message : "Pesanan ini sudah di cancel!"
                }
            } else if(response.statusKirim === "finished") {
                throw{
                    status : 403,
                    message : "Pesanan ini sudah selesai!"
                }
            } else if(response.statusKirim === "deliver") {
                throw{
                    status : 403,
                    message : "Pesanan ini sudah dalam pengiriman!"
                }
            } else if(!response.statusKirim) {
                throw{
                    status : 400,
                    message : "Error, data tidak ditemukan!"
                }
            } else {
                return jual.findByIdAndUpdate({
                    _id : response._id
                },{
                    tglKirim : Date.now(),
                    statusKirim : "deliver"
                })
            }
        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil mengupdate status penjualan dengan nomor surat jalan : " + data.nomorSuratJalan
            })
        }).catch(next)

    }

    static checkCancelPenjualan(req, res, next) {
        let data = req.body

        jual.findById({
            _id : data._id
        }).then((response)=>{
            if(response.statusKirim === "deliver" ) {
                throw{
                    status : 403,
                    message : "Pesanan ini sudah dalam proses pengiriman!"
                }
            } else if (response.statusKirim === "finished" ) {
                throw {
                    status : 403,
                    message : "Pesanan ini sudah di kirim dan sudah selesai!"
                }
            } else if (response.statusKirim === "canceled" ) {
                throw {
                    status : 403,
                    message : "Pesanan ini sudah di cancel!"
                }
            } else if(!response.statusKirim) {
                throw{
                    status : 400,
                    message : "Error, data tidak ditemukan!"
                }
            } else {
                return jual.findByIdAndUpdate({
                    _id : data._id
                },{statusKirim : "canceled"})
            }
        }).then((r)=>{
            res.status(200).json({
                message : "Berhasil cancel pesanan ini!"
            })
        }).catch(next)

    }

    static checkSelesaiPenjualan(req, res, next) {
        let data = req.body

        jual.findById({
            _id : data._id
        }).then((response)=>{
            if(response.statusKirim === "on-process" ) {
                throw{
                    status : 403,
                    message : "Pesanan ini masih di proses!"
                }
            } else if(response.statusKirim === "cancel" ) {
                throw {
                    status : 403,
                    message : "Pesanan ini telah di cancel!"
                }
            } else if(response.statusKirim === "finished") {
                throw{
                    status : 403,
                    message : "Pesanan ini sudah selesai!"
                }
            } else if(!response.statusKirim) {
                throw{
                    status : 400,
                    message : "Error, data tidak ditemukan!"
                }
            } else {
                return jual.findByIdAndUpdate({
                    _id : data._id
                },{tanggalTerima : Date.now(), statusKirim : "finished"})
            }
        }).then((response2)=>{
            const barangId = response2.idBarang
            const totalTerjual = response2.jumlahBeli
            console.log(response2)
            if(!response2){
                throw{
                    status : 400,
                    message : "error, data tidak ada!"
                }
            } else {
                return gudang.updateOne({ 
                    idBarang : barangId
                },{
                    $inc : {
                        jumlahBarang : - totalTerjual
                    }
                })
            }
        }).then((r)=>{
            res.status(200).json({
                message : "Berhasil checkmark barang yang masuk!"
            })
        }).catch(next)

    }

}

module.exports = PenjualanController;