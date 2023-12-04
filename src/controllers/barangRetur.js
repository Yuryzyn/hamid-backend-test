const retur = require("../models/barangRetur");
const rusak = require("../models/barangRusak");
const barang = require("../models/barang");
const gudang = require("../models/gudang")

class BarangReturController {

    static addRetur (req, res, next) {
        let data = req.body

        retur.create()
    }

    static calculateRetur (req, res, next) {
        
        gudang.find({ jumlahRusak: { $gt: 0 } })
            .then(async (gudangItems) => {
                const result = [];

                for (const gudangItem of gudangItems) {
                    const { idBarang, jumlahRusak } = gudangItem;

                    const returItem = await retur.findOne({
                        "barangReturItems.idBarang": idBarang,
                        "statusRetur": "deliver"
                    });

                    if (returItem) {
                        const { jumlahRetur } = returItem.barangReturItems.find(item => item.idBarang === idBarang);
                        const updatedJumlahRusak = jumlahRusak - jumlahRetur;

                        result.push({
                            idBarang,
                            jumlahRusak: updatedJumlahRusak
                        });

                        // Update jumlahRusak di database gudang
                        // await gudang.updateOne({ idBarang }, { jumlahRusak: updatedJumlahRusak });
                    }
                }

                // Fetch details barang from database barang
                const barangDetails = await barang.find({ idBarang: { $in: result.map(item => item.idBarang) } });

                res.status(200).json({
                    result,
                    barangDetails
                });
            })
            .catch(next);
    }
}

module.exports = BarangReturController;