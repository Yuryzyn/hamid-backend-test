const mongoose = require("mongoose");
const { hashPass } = require("../helpers/hash");

const AkunSchema = new mongoose.Schema({

    nama: {
        type: String,
        require: [true, "Nama karyawan harus di isi!"],

    },
    tlpn: {
        type: String,
        require: [true, "Nomor telpon karyawan harus di isi!"],

    },
    nik: {
        type: String,
        require: [true, "NIK karyawan harus di isi!"],

    },
    alamat: {
        type: String,
        require: [true, "Alamat karyawan harus di isi!"],

    },
    status: {
        type: String,
        default: "nonaktif",

    },
    role: {
        type: Number,
        require: [true, "Role harus di isi!"],
    },
    username: {
        type: String,
        required: false,

    },
    password: {
        type: String,
        default: "1234",

    },

}, {
    versionKey: false,
});

AkunSchema.pre("save", function (next) {
    let newPass = hashPass(this.password);
    this.password = newPass;
    next();
});

const login = mongoose.model("akun", AkunSchema);

module.exports = login;