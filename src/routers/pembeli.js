const Router = require("express").Router();
const pembeli = require("./../controllers/pembeli");
const { jwtAuthenticate } = require("../middlewares/auth");

Router.use(jwtAuthenticate);
Router.post("/add",pembeli.addPembeli);
Router.get("/all",pembeli.findAllPembeli);
Router.post("/edit",pembeli.editPembeli);
Router.post("/find",pembeli.findPembeli);

module.exports = Router;