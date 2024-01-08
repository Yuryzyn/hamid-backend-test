const dotenv = require("dotenv");
var mongoose = require("mongoose");

 dotenv.config({path: "./src/.env"});

 const database = process.env.DATABASE2;
 let folder

 if (database === process.env.DATABASE){
  folder = process.env.DB_FOLDER;
 } else if (database === process.env.DATABASE2){
  folder = process.env.DB_FOLDER2;
 }

const dbConnect = () => {
  const mongoURI= database;

   mongoose.connect(mongoURI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     // useFindAndModify: falseZ,
     // useCreateIndex: true,
     connectTimeoutMS: 15000,
   });
   let db = mongoose.connection;
   db.on("error", console.log.bind(console, "database connection error"));
   db.once("open", function () {
     console.log("MONGODB CONNECTED TO : "+folder);
  });
};

module.exports = dbConnect;