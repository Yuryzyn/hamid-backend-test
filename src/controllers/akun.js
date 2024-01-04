const { response, request } = require("express")
const Axios = require("axios");
const mongoose = require("mongoose");
const { generateTokenWOExp, generateTokenWithExp } = require("../helpers/token.js");
const { checkPass, hashPass } = require("../helpers/hash.js");
const ObjectId = mongoose.Types.ObjectId;
const akun = require("../models/akun.js");

class Controller {

    static tambahKaryawan(req, res, next) {

        let { nama, tlpn, nik, alamat, role } = req.body
        akun.create({
            nama,
            tlpn,
            nik,
            alamat,
            role
        }).then((r) => {
            res.status(200).json({
                message: "Berhasil Mengirim Data karyawan"
            })
        }).catch(next)

    }

    static findAllKaryawan(req, res, next) {

        akun.find({}).then((response) => {
            res.status(200).json({
                data: response,
                message: "Berhasil memuat database karyawan"
            })

        }).catch(next)

    }

    static editKaryawan(req, res, next) {
        let { _id, nama, tlpn, nik, alamat } = req.body

        akun.findByIdAndUpdate({
            _id
        }, {
            nama,
            tlpn,
            nik,
            alamat,

        }).then((response) => {
            res.status(200).json({
                message: "Berhasil edit data karyawan"
            })
        }).catch(next)

    }

    static tambahAkun(req, res, next) {
        let { _id, username, password } = req.body
        let newPass = hashPass(password);

        akun.findById({ _id }).then(async (response) => {
            if (response.status == "nonaktif") {
                throw {
                    status: 403,
                    message: "Tidak dapat mendaftarkan akun karna status " + response.nama + " adalah nonaktif!"
                }
            } else if (response.username == true) {
                throw {
                    status: 403,
                    message: "Tidak dapat mendaftarkan akun karna " + response.nama + " sudah memiliki akun!"
                }
            }
            else {
                return akun.findByIdAndUpdate({
                    _id
                }, {
                    username,
                    password: newPass,
                })
            }
        }).then((response) => {
            res.status(200).json({ message: "Akun berhasil didaftarkan" });
        }).catch(next);
    }

    static loginKaryawan(req, res, next) {
        let { username, password } = req.body;
        akun.findOne({ username })
            .then(async (response) => {
                if (!response) {
                    throw { status: 400, message: "Username salah atau Akun anda tidak terdaftar!" };
                } else {
                    if (response.status === "aktif") {
                        if (response && checkPass(password, response.password)) {
                            // console.log(response)
                            try {
                                let token = {
                                    username: response.username,
                                    nama: response.nama,
                                    role: response.role,
                                };
                                let tokenHashed = await generateTokenWithExp(token);
                                res.status(200).json({
                                    username: response.username,
                                    nama: response.nama,
                                    role: response.role,
                                    token: tokenHashed,
                                });
                            } catch (err) {
                                console.log(err);
                            }
                        } else {
                            throw { status: 400, message: "Password anda salah!" };
                        }
                    } else {
                        throw { status: 400, message: "Maaf status anda tidak aktif!" };
                    }
                }
            })
            .catch(next);
    }

    // static findAkun(req, res, next){
    //     let _id = req.body;

    //     akun.findById({
    //         _id
    //     }).then((response) => {
    //         res.status(200).json({ data: response });
    //     }).catch(next);

    // }

    static resetUsernamePassword(req, res, next) {

        let { idKaryawan, username, password } = req.body
        let newPass = hashPass(password);

        akun.findByIdAndUpdate({
            _id: idKaryawan
        }, {
            username,
            password: newPass,

        }).then((response) => {
            res.status(200).json({ message: "Password berhasil diubah" });
        }).catch(next);

    }

    static refreshLogin(req, res, next) {
        akun.findOne({ username: req.decoded.username })
            .then(async (response) => {
                if (response) {
                    try {
                        let token = {
                            username: response.username,
                            role: response.role,
                        };
                        let tokenHashed = await generateTokenWithExp(token);
                        res.status(200).json({
                            nama: response.nama,
                            role: response.role,
                            token: tokenHashed,
                        });
                    } catch (err) {
                        console.log(err);
                    }
                } else {
                    throw { status: 403, message: "Token bermasalah" };
                }
            })
            .catch(next);
    }

    static aktifkanAkun(req, res, next) {
        let { _id, status, role } = req.body;

        if (role < 3 && status == "nonaktif") {
            throw {
                message: "status tidak dapat di rubah, akun ini adalah administrator!",
            };
        } else {
            akun.findOneAndUpdate(
                {
                    _id
                }, {
                status
            }).then((response) => {
                res.status(200).json({
                    status: 200,
                    message: "Akun berhasil di " + status + "kan!",
                });
            }).catch(next);
        }
    }
}

module.exports = Controller;