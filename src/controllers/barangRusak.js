const mongoose = require("mongoose");
const retur = require("./../models/barangRusak");
const ObjectId = mongoose.Types.ObjectId;
const Axios = require("axios");
const { response } = require("express");
const stock = require("../models/gudang");

class BarangRusakController {

    static addBarangRetur(req, res, next){
        let {idBarang, keteranganRusak,jumlahRusak,handleBy} = req.body
        
        stock.findOne({
            idBarang
        }).then((stokRes)=>{
            if (stokRes.jumlahBarang < jumlahRusak){
                throw {
                    message : "tidak ada stok barang yang tersisa di gudang, pastikan input data barang rusak dengan benar!"
                }
            } else {
                return retur.create({
                    idBarang,
                    keteranganRusak,
                    jumlahRusak,
                })
            }
        }).then((response)=>{
            let nextStep = response.map((data)=>{
                return stock.findOneAndUpdate({
                    idBarang : data.idBarang
                },{
                    $inc:{
                        jumlahBarang : -data.jumlahRusak,
                        jumlahRusak : +data.jumlahRusak,
                    },
                })
            })
            return Promise.all(nextStep);
        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil mengirim data barang retur"
            })
        }).catch(next)

    }

    static findAllBarangRetur(req, res, next){

        retur.find ({}).then((response)=>{
            res.status(200).json({
                data : response,
                message: "Berhasil memuat database barang retur"
            })
        })
        .catch(next)
    }

    static editBarangRetur(req, res, next){
        let data = req.body

        retur.findOneAndUpdate({
            _id : data._id
        },{
            keteranganRusak : data.keteranganRusak,
            // jumlahRusak : data.jumlahRusak, update jumlah data ndak tau gan..
            handleBy : data.handleBy,
            
        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil edit data retur"
            })
        }).catch(next)

    }

    static checkRetur(req, res, next){
        let data = req.body

        retur.findById({
            _id : data._id
        })
        .then((response)=>{
            if (response.statusRetur === "sudah retur"){
                throw {
                    message : "Laporan barang ini sudah di retur!"
                }
            } else {
                return retur.findByIdAndUpdate({_id : data._id},{
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