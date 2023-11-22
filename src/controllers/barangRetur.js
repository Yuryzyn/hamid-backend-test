const retur = require("../models/barangRetur");
const rusak = require("../models/barangRusak");

class BarangReturController {

    static addRetur (req, res, next) {
        let data = req.body

        retur.create()
    }
}