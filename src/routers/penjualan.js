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
    "/deliver",
    jwtAuthenticate,
    jual.checkPengiriman
);
Router.post(
    "/finished",
    jwtAuthenticate,
    jual.checkSelesaiPenjualan
);
Router.post(
    "/cancel",
    jwtAuthenticate,
    jual.checkCancelPenjualan
);

module.exports = Router;