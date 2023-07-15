const Router = require("express").Router();
const jual = require("../controllers/penjualan");
const { jwtAuthenticate } = require("../middlewares/auth");

Router.use(jwtAuthenticate);
Router.post("/add",jual.addPenjualan);
Router.get("/all",jual.allPenjualan);
Router.post("/deliver",jual.checkPengiriman);
Router.post("/finished",jual.checkSelesaiPenjualan);
Router.post("/cancel",jual.checkCancelPenjualan);

module.exports = Router;