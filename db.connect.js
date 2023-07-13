const dotenv = require("dotenv");
var mongoose = require("mongoose");

 dotenv.config({path: ".src/.env"});

//  const database = process.env.DATABASE;
//  const folder = process.env.DB_FOLDER;

// const dbConnect = () => {
//   const mongoURI= database;

//   mongoose.connect(mongoURI, {
//      useNewUrlParser: true,
//      useUnifiedTopology: true,
//      // useFindAndModify: false,
//      // useCreateIndex: true,
//      connectTimeoutMS: 15000,
//    });
//    let db = mongoose.connection;
//    db.on("error", console.log.bind(console, "connection error"));
//    db.once("open", function () {
//      console.log("MONGODB CONNECTED TO : "+folder);
//   });
// };

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

module.exports = connectDB;
// module.exports = dbConnect;