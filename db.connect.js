const dotenv = require("dotenv");
var mongoose = require("mongoose");

const database = process.env.mongoURI;

dotenv.config({path: ".src/.env"});

const mongoURI= database;
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
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

module.exports = connectDB;
// module.exports = dbConnect;