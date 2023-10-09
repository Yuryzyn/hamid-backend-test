const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./src/routers/index");
const helmet = require("helmet");
const path = require('path');

const app = express();
const server = require("http").Server(app);

dotenv.config({path: "./src/.env"});
const PORT = process.env.PORT;

// require("./db.connect")();
connectDB = require("./db.connect");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: "PHP 7.4.11" }));

app.use("/fotoBarang", express.static(path.join(__dirname,'./fotoBarang')));

app.use("/", router);

app.use(require("./src/middlewares/error"));

connectDB().then(() => {
  app.listen(PORT, () => {
      console.log(`Port : ${PORT}`);
  })
})
// server.listen(PORT, () => {
//   console.log("PORT : "+PORT);
// });
