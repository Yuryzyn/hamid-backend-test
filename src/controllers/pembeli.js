const mongoose = require("mongoose");
const pembeli = require("./../models/pembeli");
const ObjectId = mongoose.Types.ObjectId;
const Axios = require("axios");

class PembeliController {
    
    static addPembeli(req, res, next){
        let {nama,tlpn,nik,alamat,editBy} = req.body

        pembeli.create({
            nama,
            tlpn,
            nik,
            alamat,
        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil mengirim data pembeli"
            })
        }).catch(next)

    }

    static findAllPembeli(req, res, next){

        pembeli.find ({}).then((response)=>{
            res.status(200).json({
                data : response,
                message: "Berhasil memuat database pembeli"
            })
        }).catch(next)
    }

    static findPembeli(req, res, next){

        let _id = req.body
        pembeli.find ({
            _id
        }).then((response)=>{
            if(response.length!=0){
                res.status(200).json({
                    data: response,
                    message: "FindByIdPembeli"
                })
                console.log("FindByIdPembeli>>>")
            }else{
                throw { 
                    status: 400, 
                    message: "Data pembeli tidak ditemukan!"
                }
            }

        }).catch(next)
    }

    static editPembeli (req, res, next){
        let data = req.body

        pembeli.findOneAndUpdate({
            _id : data._id
        },{
            nama : data.nama,
            tlpn : data.tlpn,
            nik  : data.nik,
            alamat : data.alamat,

        }).then((r)=>{
            res.status(200).json({
                message: "Berhasil edit data pembeli"
            })
        }).catch(next)

    }
}

module.exports = PembeliController;