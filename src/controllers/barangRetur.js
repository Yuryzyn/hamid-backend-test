const retur = require("../models/barangRetur");
const rusak = require("../models/barangRusak");
const barang = require("../models/barang");
const gudang = require("../models/gudang")

class BarangReturController {

    static async addRetur(req, res, next) {
        const data = req.body;

        retur.create(data)
            .then((retur) => {
                res.status(200).json({ retur, message: "Data berhasil disimpan" });
            })
            .catch(next);
    }

    static async calculateRetur(req, res, next) {
        try {
            const gudangItems = await gudang.find({ jumlahRusak: { $gt: 0 } });

            const promises = gudangItems.map(async (gudangItem) => {
                const returItems = await retur.find({
                    "barangReturItems.idBarang": gudangItem.idBarang
                });

                // console.log("returItems:", returItems)
                let totalRetur = 0;

                returItems.forEach((returItem) => {
                    returItem.barangReturItems.forEach((barangReturItem) => {
                        if (barangReturItem.idBarang === gudangItem.idBarang) {
                            totalRetur += barangReturItem.jumlahRetur;
                        }
                    });
                });

                gudangItem.jumlahRusak -= totalRetur;

                if (gudangItem.jumlahRusak > 0) {
                    return {
                        idBarang: gudangItem.idBarang,
                        jumlahRusak: gudangItem.jumlahRusak
                    };
                } else if (gudangItem.jumlahRusak < 0) {
                    return { idBarang: gudangItem.idBarang, error: "data ini bermasalah!" };
                } else {
                    return null;
                }
            });

            const result = await Promise.all(promises);

            // Filter hasil yang tidak null
            const filteredResult = result.filter(item => item !== null);

            const detailPromises = filteredResult.map(async (item) => {
                const barangDetail = await barang.findOne({ _id: item.idBarang });

                return {
                    idBarang: item.idBarang,
                    jumlahRusak: item.jumlahRusak,
                    detailBarang: barangDetail
                };
            });

            const finalResult = await Promise.all(detailPromises);

            res.status(200).json({ data: finalResult, message: "Data barang yang bisa di retur berhasil di muat!" });
        } catch (error) {
            next(error);
        }
    }

    static findAllBarangReturWithDetail(req, res, next) {
        retur.find({})
            .then((returItems) => {
                const promises = returItems.map((returItem) => {
                    const detailPromises = returItem.barangReturItems.map((barangReturItem) => {
                        return barang.findOne({ _id: barangReturItem.idBarang })
                            .then((barangDetail) => {
                                return {
                                    idBarang: barangReturItem.idBarang,
                                    jumlahRetur: barangReturItem.jumlahRetur,
                                    detailBarang: barangDetail
                                };
                            });
                    });

                    return Promise.all(detailPromises)
                        .then((barangDetails) => {
                            return {
                                _id: returItem._id,
                                idKurir: returItem.idKurir,
                                nomorSuratJalan: returItem.nomorSuratJalan,
                                statusRetur: returItem.statusRetur,
                                tanggalRetur: returItem.tanggalRetur,
                                barangReturItems: barangDetails
                            };
                        });
                });

                return Promise.all(promises);
            })
            .then((result) => {
                res.status(200).json(result);
            })
            .catch(next);
    }

    static statusBarangRetur(req, res, next) {
        const _id = req.body; // Sesuaikan dengan parameter yang Anda gunakan di route
        let returItemsInc

        retur.findById(_id)
            .then(async (returItem) => {
                returItemsInc = returItem
                // console.log(returItem)
                if (!returItem) {
                    throw new Error("Barang retur tidak ditemukan");
                }

                if (returItem.statusRetur === "finished") {
                    throw new Error("Barang sudah selesai di retur");
                }

                if (returItem.statusRetur === "deliver") {
                    const promises = returItem.barangReturItems.map(async (barangReturItem) => {
                        return gudang.findOneAndUpdate(
                            { idBarang: barangReturItem.idBarang },
                            { $inc: { jumlahBarang: +barangReturItem.jumlahRetur, jumlahRusak: -barangReturItem.jumlahRetur } }
                        ).exec();
                    });
                    return Promise.all(promises).then(() => {
                        return retur.findByIdAndUpdate(_id, { statusRetur: "finished" }).exec();
                    }).exec();
                }
            })
            .then((updatedRetur) => {
                res.status(200).json({ message: "data ini telah di konfirmasi berhasil di retur!", data: updatedRetur });
            })
            .catch(next);
    }

}

module.exports = BarangReturController;