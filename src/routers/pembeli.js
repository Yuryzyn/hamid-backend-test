const Router = require("express").Router();
const pembeli = require("./../controllers/pembeli");
const { jwtAuthenticate } = require("../middlewares/auth");

Router.post(
    "/add",
    jwtAuthenticate,
    pembeli.addPembeli
);

Router.get(
    "/all",
    jwtAuthenticate,
    pembeli.findAllPembeli
);

Router.post(
    "/edit",
    jwtAuthenticate,
    pembeli.editPembeli
);

Router.post(
    "/find",
    jwtAuthenticate,
    pembeli.findPembeli
);

module.exports = Router;