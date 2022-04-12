const express = require("express");
const app = express();
const cors = require("cors");
const moongose = require("mongoose");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static("public"));

moongose.connect(process.env.MONGO_URI);

const Schema = mongoose.Schema;
const usersDataSchema = new Schema({ user_name: String });
const exerciseDataSchema = new Schema({
  description: String,
  duration: Number,
  date: Date
});

const User = mongoose.model("user", usersDataSchema);
cosnt Exercise = mongoose.model("exercise", exerciseDataSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, resp) => {});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
