const retur = require("../models/barangRetur");
const rusak = require("../models/barangRusak");
const barang = require("../models/barang");
const gudang = require("../models/gudang")

class BarangReturController {

    static addRetur(req, res, next) {
        let data = req.body;
        const { idBarang, jumlahRetur } = data;

        // Langkah 1: Cari di dalam database barang
        barang.findOne({ idBarang })
            .then((barangItem) => {
                if (!barangItem) {
                    throw new Error("Barang tidak ditemukan");
                }

                if (barangItem.jumlahRusak === 0) {
                    throw new Error("Jumlah barang rusak sudah nol");
                }

                // Langkah 2: Cari di dalam database barang retur
                return retur.findOne({ "barangReturItems.idBarang": idBarang });
            })
            .then((returItem) => {
                if (returItem) {
                    // Langkah 3: Kurangi jumlahRetur dengan jumlahRusak
                    const barangReturItem = returItem.barangReturItems.find(item => item.idBarang === idBarang);
                    const remainingRetur = barangReturItem.jumlahRetur - jumlahRetur;

                    // Langkah 4: Handle kondisi pengurangan
                    if (remainingRetur === 0) {
                        throw new Error("Retur sudah dikirimkan");
                    } else if (remainingRetur < 0) {
                        throw new Error("Error database");
                    } else {
                        barangReturItem.jumlahRetur = remainingRetur;

                        // Simpan perubahan
                        return returItem.save();
                    }
                } else {
                    // Langkah 5: Create barangRetur jika tidak ditemukan
                    return retur.create(data);
                }
            })
            .then((result) => {
                res.status(201).json({data : result, message : "Data barang kirim retur berhasil di buat!"});
            })
            .catch((error) => {
                res.status(500).json({ error: error.message });
            });
    }


    static calculateRetur(req, res, next) {
        let data = req.body;
    
        gudang.find({ jumlahRusak: { $gt: 0 } })
            .then((gudangItems) => {
                const promises = gudangItems.map((gudangItem) => {
                    return retur.find({
                        "barangReturItems.idBarang": gudangItem.idBarang,
                        statusRetur: { $in: ["deliver", "delivered"] }
                    })
                        .then((returItems) => {
                            const totalRetur = returItems.reduce((acc, returItem) => {
                                const barangReturItem = returItem.barangReturItems.find(item => item.idBarang === gudangItem.idBarang);
                                if (barangReturItem) {
                                    return acc + barangReturItem.jumlahRetur;
                                }
                                return acc;
                            }, 0);
    
                            gudangItem.jumlahRusak -= totalRetur;
    
                            if (gudangItem.jumlahRusak > 0) {
                                return {
                                    idBarang: gudangItem.idBarang,
                                    jumlahRusak: gudangItem.jumlahRusak
                                };
                            } else if (gudangItem.jumlahRusak < 0){
                                return gudangItem = "data ini bermasalah!";
                            }
                            else {
                                return null;
                            }
                        });
                });
    
                return Promise.all(promises);
            })
            .then((result) => {
                // Filter hasil yang tidak null
                const filteredResult = result.filter(item => item !== null);
    
                const detailPromises = filteredResult.map((item) => {
                    return barang.findOne({ _id: item.idBarang })
                        .then((barangDetail) => {
                            return {
                                idBarang: item.idBarang,
                                jumlahRusak: item.jumlahRusak,
                                detailBarang: barangDetail
                            };
                        });
                });
    
                return Promise.all(detailPromises);
            })
            .then((finalResult) => {
                res.status(200).json({data: finalResult, message: "Data barang yang bisa di retur berhasil di muat!"});
            })
            .catch(next);
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
                                _id:returItem._id,
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

        retur.findById(_id)
            .then((returItem) => {
                if (!returItem) {
                    throw new Error("Barang retur tidak ditemukan");
                }

                if (returItem.statusRetur === "finished") {
                    throw new Error("Barang sudah selesai di retur");
                }

                if (returItem.statusRetur === "deliver") {
                    const promises = returItem.barangReturItems.map((barangReturItem) => {
                        return gudang.findOne({ idBarang: barangReturItem.idBarang })
                            .then((gudangItem) => {
                                if (!gudangItem) {
                                    throw new Error(`Barang dengan id ${barangReturItem.idBarang} tidak ditemukan di gudang`);
                                }

                                gudangItem.jumlahBarang += barangReturItem.jumlahRetur;
                                gudangItem.jumlahRusak -= barangReturItem.jumlahRetur;

                                return Promise.all([gudangItem.save(), barang.findOneAndUpdate({ idBarang: barangReturItem.idBarang }, { $inc: { jumlahBarang: barangReturItem.jumlahRetur } })]);
                            });
                    });

                    return Promise.all(promises);
                }
            })
            .then(() => {
                return retur.findByIdAndUpdate(_id, { statusRetur: "finished" }, { new: true });
            })
            .then((updatedRetur) => {
                res.status(200).json({message: "data ini telah di konfirmasi berhasil di retur!", data: updatedRetur});
            })
            .catch(next);
    }

}

module.exports = BarangReturController;