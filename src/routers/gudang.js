const Router = require("express").Router();
const { upload } = require("../middlewares/photo");
const { jwtAuthenticate } = require("../middlewares/auth");

Router.use(jwtAuthenticate);

const gudang = require("./../controllers/gudang");
Router.post("/add-stock", gudang.addStockGudang);
Router.get("/all-stock", gudang.findAllStockGudang);
Router.post("/edit-stock", gudang.editStockGudang);

const rusak = require("./../controllers/barangRusak");
Router.post("/add-rusak", rusak.addBarangRusak);
Router.get("/all-rusak", rusak.findAllBarangRusak);
Router.post("/edit-rusak", rusak.editBarangRusak);
Router.post("/status-rusak", rusak.statusRusak);
Router.get("/find-sended-for-rusak", rusak.findPengiriman);

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
Router.post("/checkmark-finished",keluar.checkMarkstatusKirim);

const retur = require("../controllers/barangRetur");
Router.get("/selection-retur", retur.calculateRetur);

const kurir = require("../controllers/kurir");
Router.post("/add-kurir",kurir.addKurir);
Router.post("/edit-kurir",kurir.editKurir);
Router.post("/find-id-kurir",kurir.findOneKurir);
Router.get("/all-kurir",kurir.findAllKurir);

module.exports = Router;