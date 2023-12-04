const Router = require("express").Router();
const jual = require("../controllers/penjualan.js");
const { jwtAuthenticate } = require("../middlewares/auth.js");

Router.post(
    "/add",
    jwtAuthenticate,
    jual.addPenjualan
);
Router.get(
    "/all",
    jwtAuthenticate,
    jual.allPenjualan
);
Router.post(
    "/status",
    jwtAuthenticate,
    jual.checkPengiriman
);

module.exports = Router;