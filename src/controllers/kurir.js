const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Axios = require("axios");
const { response } = require("express");
const kurir = require('../models/kurir');

class KurirController {

    static addKurir(req, res, next){
        let {nama, tlpn, alamat, nopol, tipe} = req.body

        kurir.create({
            namaKurir : nama,
            tlpnKurir : tlpn,
            alamatKurir : alamat,
            nopolKendaraan : nopol,
            tipeKendaraan : tipe
        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil mengirim data kurir"
            })
        }).catch(next)
    }

    static editKurir(req, res, next){
        let data = req.body
        
        kurir.findOneAndUpdate({
            _id : data._id
        },{
            namaKurir : data.nama,
            tlpnKurir : data.tlpn,
            alamatKurir : data.alamat,
            nopolKendaraan : data.nopol,
            tipeKendaraan : data.tipe

        }).then((r)=>{
            res.status(200).json({
                oldData : r,
                newData : data,
                message: "Berhasil edit data kurir"
            })
        }).catch(next)
    }

    static findOneKurir(req, res, next){
        let data = req.body

        kurir.findById({
            _id : data._id
        }).then((response) =>{
            if (!response){
                res.status(404).json({
                    message: "Kurir dengan id " + data._id + " tidak dapat ditemukan"
                })
            } else {
                res.status(200).json({
                    data : response,
                    message: "Kurir berhasil ditemukan"
                })
            }
        }).catch(next)
    }

    static findAllKurir(req, res, next){

        kurir.find ({}).then((response)=>{
            res.status(200).json({
                data : response,
                message: "Berhasil memuat database kurir"
            })
        }).catch(next)
    }
}

module.exports = KurirController;