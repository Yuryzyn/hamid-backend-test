const Router = require("express").Router();
const { upload } = require("../middlewares/photo");
const { jwtAuthenticate } = require("../middlewares/auth");

Router.use(jwtAuthenticate);

const gudang = require("./../controllers/gudang");
Router.post("/add-stock", gudang.addStockGudang);
Router.get("/all-stock", gudang.findAllStockGudang);
Router.post("/edit-stock", gudang.editStockGudang);

const retur = require("./../controllers/barangRusak");
Router.post("/add-retur", retur.addBarangRetur);
Router.get("/all-retur", retur.findAllBarangRetur);
Router.post("/edit-retur", retur.editBarangRetur);
Router.post("/done-retur", retur.checkRetur);

const barang = require("./../controllers/barang");
Router.post("/add-item",upload.single("fotoBarang"), barang.addBarang);
Router.get("/all-item", barang.findAllBarang);
Router.post("/edit-item",upload.single("fotoBarang"), barang.editBarang);

const masuk = require("./../controllers/barangMasuk");
Router.post("/add-restock",masuk.addBarangMasuk);
Router.get("/all-restock", masuk.daftarBarangMasuk);
Router.post("/edit-restock", masuk.editDataBarangMasuk);
Router.post("/done-restock", masuk.checkMarkBarangBaru);

const keluar = require("../controllers/barangKeluar");
Router.get("/find-nota",keluar.findNoNota);
Router.post("/calculate-nota",keluar.CalculateWithNota)
Router.post("/add-deliver", keluar.createBarangKeluar);
Router.get("/all-deliver",keluar.allBarangKeluar);

module.exports = Router;