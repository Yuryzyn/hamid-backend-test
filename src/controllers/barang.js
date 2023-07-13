const mongoose = require("mongoose");
const barang = require("./../models/barang");
// const { deleteAkun, findAkun } = require("./login")
const ObjectId = mongoose.Types.ObjectId;
const Axios = require("axios");
const { response } = require("express");

class BarangController {
    
    static addBarang(req, res, next){
        let {jenis, merk, hargaBeli, hargaJual, handleBy}= req.body
        
        barang.find({jenis, merk})
        .then((response)=>{
            if(response.length === 0){
                barang.create({
                    jenis,
                    merk,
                    hargaBeli,
                    hargaJual,
                    fotoBarang : req.body.foto,
                    handleBy,
                }).then((r)=>{
                    res.status(200).json({
                        message: "Berhasil mengirim data barang",
                    })
                })
            } else {
                throw { status: 400, message: "Jenis dan Merk barang yang di tulis sudah terdaftar!" };
            }
        }).catch(next)

    }

    static findAllBarang(req, res, next){

        barang.find ({}).then((response)=>{
            res.status(200).json({
                data : response,
                message: "Berhasil memuat database barang"
            })
        })
        .catch(next)
    }

    static editBarang (req, res, next){
        let data = req.body

        barang.findOneAndUpdate({
            _id : data._id
        },{
            jenis : data.jenis,
            merk : data.merk,
            hargaBeli : data.hargaBeli,
            hargaJual : data.hargaJual,
            fotoBarang : req.body.foto,
            handleBy,
            
        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil edit data barang"
            })
        }).catch(next)

    }
}

module.exports = BarangController;