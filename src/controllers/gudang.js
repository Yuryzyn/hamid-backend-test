const mongoose = require("mongoose");
const gudang = require("./../models/gudang");
const ObjectId = mongoose.Types.ObjectId;
const Axios = require("axios");
const { response } = require("express");
const barang = require("../models/barang");
const { create } = require("../models/penjualan.js");
const { promises } = require("dns");

class GudangController {
    
    static addStockGudang (req, res, next) {
        let data = req.body

        gudang.find({idBarang : data.idBarang})
        .then((response) => {
            if (response.length === 0){
                return gudang.create({
                    idBarang : data.idBarang,
                    jumlahBarang : data.jumlahBarang,
                })
            } else {
                return gudang.updateOne({idBarang : data.idBarang},{
                    $inc:{jumlahBarang: +data.jumlahBarang}
                })
            }
        }).then((r) => {
            res.status(200).json({
                message: "Berhasil update database stok gudang"
            })
        }).catch(next)

    }

    static findAllStockGudang(req, res, next){

        gudang.find({
        }).then((response)=>{
            let final = response.map((data)=>{
                return barang.findById({
                    _id : data.idBarang
                }).then((response2)=>{
                    const barangFinal = response2
                    
                    return {
                        _id : data._id,
                        Barang : barangFinal,
                        jumlahBarang : data.jumlahBarang,
                        jumlahRusak : data.jumlahRusak,
                        rusakNonRetur : data.rusakNonRetur,
                        handleBy : data.handleBy,
                        create : data.create,
                        update : data.update
                    }
                })
            })
            return Promise.all(final);
        }).then((response)=>{
            res.status(200).json({
                data : response,
                message: "Berhasil memuat semua data gudang"
            })
        })
        .catch(next)
    }

    // static findBarang(req, res){

    //     let _id = req.body
    //     barang.find ({
    //         _id
    //     }).then((response)=>{
    //         if(response.length!=0){
    //             res.status(200).json({
    //                 data: response,
    //                 message: "FindByIdBarang"
    //             })
    //             console.log("FindByIdBarang>>>")
    //         }else{
    //             res.json({
    //                 message:"Data tidak ditemukan"
    //             })
    //             console.log("FindByIdBarang???")  
    //         }

    //     }).catch((response)=>{
    //         res.status(400).json({
    //             message: "Koneksi gagal"
    //         })
    //         console.log("FindByIdBarang!!!")
    //     })
    // }

    static editStockGudang (req, res, next){
        let {idBarang, jumlahBarang } = req.body

        gudang.findOneAndUpdate({
            idBarang
        },{
            jumlahBarang,
            
        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil edit data stok barang"
            })
        }).catch(next)
    }

    static editStockRusak (req, res, next){
        let {idBarang, jumlahRusak } = req.body

        gudang.findOneAndUpdate({
            idBarang
        },{
            jumlahRusak,
            
        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil edit data stok barang rusak"
            })
        }).catch(next)

    }
}

module.exports = GudangController;