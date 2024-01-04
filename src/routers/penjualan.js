const Router = require("express").Router();
const jual = require("../controllers/penjualan.js");
const dashboard = require("../controllers/dashboard.js")
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

Router.post("/report", jwtAuthenticate, dashboard.getLaporanPenjualan)

module.exports = Router;