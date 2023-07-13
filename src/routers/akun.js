const Router = require("express").Router();
const akun = require("../controllers/akun");
const { jwtAuthenticate } = require("../middlewares/auth");


Router.post(
    "/login", 
    akun.loginKaryawan,
);
Router.post(
    "/add-karyawan",
    jwtAuthenticate,
    akun.tambahKaryawan,
);
Router.patch(
    "/patch-karyawan", 
    jwtAuthenticate, 
    akun.editKaryawan,
);
Router.get(
    "/all-karyawan",
    jwtAuthenticate, 
    akun.findAllKaryawan,
);
Router.patch(
    "/add-account", 
    jwtAuthenticate,
    akun.tambahAkun
);
Router.get(
    "/refresh", 
    jwtAuthenticate, 
    akun.refreshLogin
);
Router.patch(
    "/update-account", 
    jwtAuthenticate, 
    akun.resetUsernamePassword
);
Router.patch(
    "/update-status", 
    jwtAuthenticate,
    akun.aktifkanAkun
);

module.exports = Router;