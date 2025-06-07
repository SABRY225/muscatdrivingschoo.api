const express = require("express");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const router = require("./routes");
const dotenv = require("dotenv");
const { clientError, serverError } = require("./middlewares/error");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Notifications = require("./firebaseConfig");

dotenv.config();
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


app.set("port", process.env.PORT || 5007);
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,POST,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type , Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use([
  express.json(),
  cookieParser(),
  compression(),
  express.urlencoded({ extended: false }),
]);

app.use(multer({ storage: fileStorage }).any());


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use('/images', express.static(path.join(__dirname,'images')));

app.use("/api/v1", router);

app.use(clientError);
app.use(serverError);

module.exports = app;
